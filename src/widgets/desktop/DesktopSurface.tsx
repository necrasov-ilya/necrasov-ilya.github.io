import { useCallback, useEffect, useRef } from 'react';
import { applicationCatalog } from '../../entities/application/model/apps';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import { useDesktopClock } from '../../shared/lib/clock';
import { useMediaQuery } from '../../shared/lib/useMediaQuery';
import type { AppId } from '../../shared/types/desktop';
import { DesktopIcons } from '../desktop-icons/DesktopIcons';
import './Desktop.css';
import { StartMenu } from '../start-menu/StartMenu';
import { Taskbar } from '../taskbar/Taskbar';
import { WindowStack } from '../window-stack/WindowStack';

interface DesktopSurfaceProps {
  entryAppId?: AppId | null;
  onEntryAppHandled?: () => void;
}

export function DesktopSurface({
  entryAppId = null,
  onEntryAppHandled,
}: DesktopSurfaceProps) {
  const {
    windows,
    isStartMenuOpen,
    openApp,
    focusApp,
    minimizeApp,
    setStartMenuOpen,
    toggleFromTaskbar,
    setDesktopBounds,
  } = useDesktopManager();
  const { time } = useDesktopClock();
  const shellRef = useRef<HTMLElement | null>(null);
  const isCompactDesktop = useMediaQuery('(max-width: 940px), (max-height: 620px)');

  const scrollToWindow = useCallback(
    (appId: AppId) => {
      if (!isCompactDesktop) {
        return;
      }

      let attempts = 0;

      const tryScroll = () => {
        const shell = shellRef.current;
        const target = shellRef.current?.querySelector<HTMLElement>(
          `.window-shell[data-app-id="${appId}"]`,
        );

        if (shell && target) {
          const shellRect = shell.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const nextTop = shell.scrollTop + (targetRect.top - shellRect.top) - 16;

          shell.scrollTo({
            top: Math.max(0, nextTop),
            behavior: 'smooth',
          });
          return;
        }

        if (attempts >= 6) {
          return;
        }

        attempts += 1;
        window.requestAnimationFrame(tryScroll);
      };

      window.requestAnimationFrame(tryScroll);
    },
    [isCompactDesktop],
  );

  const handleOpenApp = useCallback(
    (appId: AppId) => {
      setStartMenuOpen(false);
      const existingWindow = windows.find((windowState) => windowState.appId === appId);

      if (existingWindow) {
        if (!isCompactDesktop || existingWindow.isMinimized) {
          focusApp(appId);
        }
      } else {
        openApp(appId);
      }

      scrollToWindow(appId);
    },
    [focusApp, isCompactDesktop, openApp, scrollToWindow, setStartMenuOpen, windows],
  );

  const handleToggleWindow = useCallback(
    (appId: AppId) => {
      if (isCompactDesktop) {
        setStartMenuOpen(false);

        const existingWindow = windows.find((windowState) => windowState.appId === appId);

        if (!existingWindow) {
          openApp(appId);
        } else if (!existingWindow.isMinimized) {
          minimizeApp(appId);
        } else {
          focusApp(appId);
        }
      } else {
        toggleFromTaskbar(appId);
      }

      scrollToWindow(appId);
    },
    [
      focusApp,
      isCompactDesktop,
      minimizeApp,
      openApp,
      scrollToWindow,
      setStartMenuOpen,
      toggleFromTaskbar,
      windows,
    ],
  );

  useEffect(() => {
    if (!shellRef.current) {
      return undefined;
    }

    const element = shellRef.current;

    const updateBounds = () => {
      const rect = element.getBoundingClientRect();

      setDesktopBounds({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [setDesktopBounds]);

  useEffect(() => {
    if (!entryAppId) {
      return;
    }

    const existingWindow = windows.find((windowState) => windowState.appId === entryAppId);

    if (existingWindow && !isCompactDesktop) {
      focusApp(entryAppId);
    } else if (!existingWindow) {
      openApp(entryAppId);
    }

    scrollToWindow(entryAppId);
    onEntryAppHandled?.();
  }, [
    entryAppId,
    focusApp,
    isCompactDesktop,
    onEntryAppHandled,
    openApp,
    scrollToWindow,
    windows,
  ]);

  useEffect(() => {
    if (!isCompactDesktop || !shellRef.current) {
      return undefined;
    }

    const shell = shellRef.current;
    let touchStartY = 0;
    let isPulling = false;
    let reloadTriggered = false;

    function onTouchStart(event: TouchEvent) {
      if (shell.scrollTop <= 0) {
        touchStartY = event.touches[0].clientY;
        isPulling = true;
        reloadTriggered = false;
      } else {
        isPulling = false;
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (!isPulling || reloadTriggered) {
        return;
      }

      const pullDistance = event.touches[0].clientY - touchStartY;

      if (pullDistance > 90) {
        reloadTriggered = true;
        isPulling = false;
        window.location.reload();
      }
    }

    function onTouchEnd() {
      isPulling = false;
    }

    shell.addEventListener('touchstart', onTouchStart, { passive: true });
    shell.addEventListener('touchmove', onTouchMove, { passive: true });
    shell.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      shell.removeEventListener('touchstart', onTouchStart);
      shell.removeEventListener('touchmove', onTouchMove);
      shell.removeEventListener('touchend', onTouchEnd);
    };
  }, [isCompactDesktop]);

  return (
    <section className="desktop-shell" ref={shellRef}>
      <div aria-hidden="true" className="desktop-grid" />
      <div aria-hidden="true" className="desktop-vignette" />
      <div aria-hidden="true" className="desktop-glow desktop-glow--one" />
      <div aria-hidden="true" className="desktop-glow desktop-glow--two" />

      <DesktopIcons apps={applicationCatalog} onOpen={handleOpenApp} windows={windows} />
      <div className={`desktop-windows ${isCompactDesktop ? 'desktop-windows--compact' : ''}`}>
        <WindowStack />
      </div>

      <div className="desktop-chrome">
        <StartMenu
          apps={applicationCatalog}
          isOpen={isStartMenuOpen}
          onOpen={handleOpenApp}
          onOpenPortfolio={() => handleOpenApp('portfolio')}
          windows={windows}
        />
        <Taskbar
          apps={applicationCatalog}
          isStartMenuOpen={isStartMenuOpen}
          onToggleStart={() => setStartMenuOpen(!isStartMenuOpen)}
          onToggleWindow={handleToggleWindow}
          time={time}
          windows={windows}
        />
      </div>
    </section>
  );
}
