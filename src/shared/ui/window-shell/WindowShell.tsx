import { motion } from 'framer-motion';
import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { isCompactViewport } from '../../../features/desktop-manager/lib/window-geometry';
import { useDesktopManager } from '../../../features/desktop-manager/model/useDesktopManager';
import type {
  AppDefinition,
  WindowInstance,
  WindowRect,
  WindowResizeDirection,
} from '../../types/desktop';
import { AppIcon } from '../app-icon/AppIcon';
import './WindowShell.css';

interface WindowShellProps {
  app: AppDefinition;
  windowState: WindowInstance;
  isFocused: boolean;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (
    direction: WindowResizeDirection,
    originRect: WindowRect,
    deltaX: number,
    deltaY: number,
  ) => void;
  onMinimize: () => void;
  onClose: () => void;
  children: ReactNode;
}

const SNAP_THRESHOLD = -12;
const SNAP_SAFE_Y = 24;
const SNAP_DURATION = 320;

const ENTER_ANIMATION = { opacity: 0, scale: 0.985, y: 18, filter: 'blur(4px)' };
const IDLE_ANIMATION = { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' };
const EXIT_ANIMATION = { opacity: 0, scale: 0.985, y: 18, filter: 'blur(4px)' };
const WINDOW_TRANSITION = { duration: 0.2, ease: [0.18, 0.78, 0.22, 1] as const };

const resizeHandles: Array<{ direction: WindowResizeDirection; className: string; cursor: string }> = [
  { direction: 'north', className: 'window-resize-handle--north', cursor: 'ns-resize' },
  { direction: 'south', className: 'window-resize-handle--south', cursor: 'ns-resize' },
  { direction: 'east', className: 'window-resize-handle--east', cursor: 'ew-resize' },
  { direction: 'west', className: 'window-resize-handle--west', cursor: 'ew-resize' },
  { direction: 'north-east', className: 'window-resize-handle--north-east', cursor: 'nesw-resize' },
  { direction: 'north-west', className: 'window-resize-handle--north-west', cursor: 'nwse-resize' },
  { direction: 'south-east', className: 'window-resize-handle--south-east', cursor: 'nwse-resize' },
  { direction: 'south-west', className: 'window-resize-handle--south-west', cursor: 'nesw-resize' },
];

function lockInteraction(cursor: string) {
  const root = document.documentElement;
  const body = document.body;
  const previousUserSelect = root.style.userSelect;
  const previousCursor = body.style.cursor;

  root.style.userSelect = 'none';
  body.style.cursor = cursor;

  return () => {
    root.style.userSelect = previousUserSelect;
    body.style.cursor = previousCursor;
  };
}

export function WindowShell({
  app,
  windowState,
  isFocused,
  onFocus,
  onMove,
  onResize,
  onMinimize,
  onClose,
  children,
}: WindowShellProps) {
  const { desktopBounds } = useDesktopManager();
  const isCompact = isCompactViewport(desktopBounds);
  const shellRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    el.style.left = `${windowState.x}px`;
    el.style.top = `${windowState.y}px`;
    el.style.width = `${windowState.width}px`;
    el.style.height = `${windowState.height}px`;
    el.style.zIndex = String(windowState.zIndex);
  }, [windowState.x, windowState.y, windowState.width, windowState.height, windowState.zIndex]);

  function handleShellPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (isCompact) {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest('.window-header, .window-resize-handle')) {
      return;
    }

    onFocus();
  }

  function registerPointerDrag(
    event: ReactPointerEvent<HTMLElement>,
    cursor: string,
    onPointerMoveFrame: (moveEvent: PointerEvent) => void,
    onEnd?: () => void,
  ) {
    event.preventDefault();
    const pointerId = event.pointerId;
    const releaseInteractionLock = lockInteraction(cursor);

    function handlePointerMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      moveEvent.preventDefault();
      onPointerMoveFrame(moveEvent);
    }

    function handlePointerUp(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) {
        return;
      }

      releaseInteractionLock();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      onEnd?.();
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }

  function handleHeaderPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as HTMLElement).closest('[data-window-action]')) {
      return;
    }

    if (isCompact) {
      return;
    }

    onFocus();

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = windowState.x;
    const originY = windowState.y;
    let lastX = originX;
    let lastY = originY;

    registerPointerDrag(
      event,
      'grabbing',
      (moveEvent) => {
        lastX = originX + moveEvent.clientX - startX;
        lastY = originY + moveEvent.clientY - startY;
        onMove(lastX, lastY);
      },
      () => {
        if (lastY < SNAP_THRESHOLD) {
          const element = shellRef.current;
          if (element) {
            element.style.transition = `top ${SNAP_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            onMove(lastX, SNAP_SAFE_Y);
            window.setTimeout(() => {
              if (shellRef.current) {
                shellRef.current.style.transition = '';
              }
            }, SNAP_DURATION + 40);
          } else {
            onMove(lastX, SNAP_SAFE_Y);
          }
        }
      },
    );
  }

  function handleResizePointerDown(
    direction: WindowResizeDirection,
    cursor: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    onFocus();

    if (isCompact) {
      return;
    }

    const originRect: WindowRect = {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height,
    };
    const startX = event.clientX;
    const startY = event.clientY;

    registerPointerDrag(event, cursor, (moveEvent) => {
      onResize(
        direction,
        originRect,
        moveEvent.clientX - startX,
        moveEvent.clientY - startY,
      );
    });
  }

  return (
    <motion.section
      animate={IDLE_ANIMATION}
      className={`window-shell ${isFocused ? 'is-focused' : ''}`}
      data-app-id={app.id}
      data-hero-lock="true"
      exit={EXIT_ANIMATION}
      initial={ENTER_ANIMATION}
      onPointerDown={handleShellPointerDown}
      ref={shellRef}
      transition={WINDOW_TRANSITION}
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
            aria-label={`Свернуть ${app.title}`}
            className="window-actions__minimize"
            data-window-action="minimize"
            onClick={onMinimize}
            type="button"
          >
            <span />
          </button>
          <button
            aria-label={`Закрыть ${app.title}`}
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

      {!isCompact &&
        resizeHandles.map((handle) => (
          <button
            aria-label={`Изменить размер окна ${app.title}`}
            className={`window-resize-handle ${handle.className}`}
            key={handle.direction}
            onPointerDown={(event) =>
              handleResizePointerDown(handle.direction, handle.cursor, event)
            }
            tabIndex={-1}
            type="button"
          />
        ))}
    </motion.section>
  );
}
