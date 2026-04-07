import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { isCompactViewport } from '../../../features/desktop-manager/lib/window-geometry';
import { useDesktopManager } from '../../../features/desktop-manager/model/useDesktopManager';
import type { AppDefinition, WindowInstance } from '../../types/desktop';
import { AppIcon } from '../app-icon/AppIcon';
import './WindowShell.css';

interface WindowShellProps {
  app: AppDefinition;
  windowState: WindowInstance;
  isFocused: boolean;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onMinimize: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function WindowShell({
  app,
  windowState,
  isFocused,
  onFocus,
  onMove,
  onMinimize,
  onClose,
  children,
}: WindowShellProps) {
  const { desktopBounds } = useDesktopManager();

  function handleHeaderPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as HTMLElement).closest('[data-window-action]')) {
      return;
    }

    onFocus();

    if (isCompactViewport(desktopBounds)) {
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = windowState.x;
    const originY = windowState.y;

    function handlePointerMove(moveEvent: PointerEvent) {
      onMove(originX + moveEvent.clientX - startX, originY + moveEvent.clientY - startY);
    }

    function handlePointerUp() {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }

  return (
    <section
      className={`window-shell ${isFocused ? 'is-focused' : ''}`}
      data-hero-lock="true"
      onPointerDown={onFocus}
      style={{
        left: `${windowState.x}px`,
        top: `${windowState.y}px`,
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        zIndex: windowState.zIndex,
      }}
    >
      <header className="window-header" onPointerDown={handleHeaderPointerDown}>
        <div className="window-title">
          <span className="window-title__icon" style={{ color: app.tint }}>
            <AppIcon icon={app.icon} size={16} />
          </span>
          <div>
            <strong>{app.title}</strong>
            <span>{app.subtitle}</span>
          </div>
        </div>
        <div className="window-actions">
          <button
            aria-label={`Minimize ${app.title}`}
            className="window-actions__minimize"
            data-window-action="minimize"
            onClick={onMinimize}
            type="button"
          >
            <span />
          </button>
          <button
            aria-label={`Close ${app.title}`}
            className="window-actions__close"
            data-window-action="close"
            onClick={onClose}
            type="button"
          >
            <span />
          </button>
        </div>
      </header>
      <div className="window-body">{children}</div>
    </section>
  );
}
