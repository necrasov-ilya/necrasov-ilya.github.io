import { useEffect, useRef } from 'react';
import { applicationCatalog } from '../../entities/application/model/apps';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import { useDesktopClock } from '../../shared/lib/clock';
import { DesktopIcons } from '../desktop-icons/DesktopIcons';
import './Desktop.css';
import { StartMenu } from '../start-menu/StartMenu';
import { Taskbar } from '../taskbar/Taskbar';
import { WindowStack } from '../window-stack/WindowStack';

export function DesktopSurface() {
  const {
    windows,
    isStartMenuOpen,
    openApp,
    setStartMenuOpen,
    toggleFromTaskbar,
    setDesktopBounds,
  } = useDesktopManager();
  const { time } = useDesktopClock();
  const shellRef = useRef<HTMLElement | null>(null);

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

  return (
    <section className="desktop-shell" ref={shellRef}>
      <div aria-hidden="true" className="desktop-grid" />
      <div aria-hidden="true" className="desktop-vignette" />
      <div aria-hidden="true" className="desktop-glow desktop-glow--one" />
      <div aria-hidden="true" className="desktop-glow desktop-glow--two" />

      <div className="desktop-brand">
        <img alt="NKSv outline logo" src="/media/hero/logo/logo-nksv-outline.svg" />
        <span>custom workstation / build frontend-ml</span>
      </div>

      <DesktopIcons apps={applicationCatalog} onOpen={openApp} windows={windows} />
      <StartMenu
        apps={applicationCatalog}
        isOpen={isStartMenuOpen}
        onOpen={openApp}
        windows={windows}
      />
      <WindowStack />
      <Taskbar
        apps={applicationCatalog}
        isStartMenuOpen={isStartMenuOpen}
        onToggleStart={() => setStartMenuOpen(!isStartMenuOpen)}
        onToggleWindow={toggleFromTaskbar}
        time={time}
        windows={windows}
      />
    </section>
  );
}
