import {
  useCallback,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  clampDragRect,
  createWindowRect,
  fitWindowToBounds,
  getInitialDesktopBounds,
  resizeWindowRect,
} from '../lib/window-geometry';
import type {
  AppId,
  DesktopBounds,
  WindowInstance,
  WindowRect,
  WindowResizeDirection,
} from '../../../shared/types/desktop';
import { DesktopManagerStore } from './desktopManagerStore';

function getNextZIndex(zIndexRef: MutableRefObject<number>) {
  zIndexRef.current += 1;
  return zIndexRef.current;
}

export function DesktopManagerProvider({ children }: { children: ReactNode }) {
  const nextZIndexRef = useRef(20);
  const [desktopBounds, setDesktopBoundsState] = useState<DesktopBounds>(() =>
    getInitialDesktopBounds(),
  );
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);

  const setDesktopBounds = useCallback((bounds: DesktopBounds) => {
    setDesktopBoundsState((current) => {
      if (current.width === bounds.width && current.height === bounds.height) {
        return current;
      }

      setWindows((openWindows) =>
        openWindows.map((windowState) => fitWindowToBounds(windowState, bounds)),
      );

      return bounds;
    });
  }, []);

  function focusApp(appId: AppId) {
    setWindows((current) => {
      const existing = current.find((windowState) => windowState.appId === appId);

      if (!existing) {
        return current;
      }

      const topWindow = current
        .filter((windowState) => !windowState.isMinimized)
        .sort((left, right) => right.zIndex - left.zIndex)[0];

      if (topWindow?.appId === appId && !existing.isMinimized) {
        return current;
      }

      return current.map((windowState) =>
        windowState.appId === appId
          ? { ...windowState, isMinimized: false, zIndex: getNextZIndex(nextZIndexRef) }
          : windowState,
      );
    });
  }

  function openApp(appId: AppId) {
    setStartMenuOpen(false);

    setWindows((current) => {
      const existing = current.find((windowState) => windowState.appId === appId);

      if (existing) {
        return current.map((windowState) =>
          windowState.appId === appId
            ? {
                ...windowState,
                isMinimized: false,
                zIndex: getNextZIndex(nextZIndexRef),
              }
            : windowState,
        );
      }

      return [
        ...current,
        {
          appId,
          isMinimized: false,
          zIndex: getNextZIndex(nextZIndexRef),
          ...createWindowRect(appId, current.length, desktopBounds),
        },
      ];
    });
  }

  function closeApp(appId: AppId) {
    setWindows((current) => current.filter((windowState) => windowState.appId !== appId));
  }

  function minimizeApp(appId: AppId) {
    setWindows((current) =>
      current.map((windowState) =>
        windowState.appId === appId ? { ...windowState, isMinimized: true } : windowState,
      ),
    );
  }

  function toggleFromTaskbar(appId: AppId) {
    const existing = windows.find((windowState) => windowState.appId === appId);

    if (!existing) {
      openApp(appId);
      return;
    }

    const focusedWindow = windows
      .filter((windowState) => !windowState.isMinimized)
      .sort((left, right) => right.zIndex - left.zIndex)[0];

    if (!existing.isMinimized && focusedWindow?.appId === appId) {
      minimizeApp(appId);
      return;
    }

    focusApp(appId);
  }

  function moveApp(appId: AppId, nextX: number, nextY: number) {
    setWindows((current) =>
      current.map((windowState) => {
        if (windowState.appId !== appId) {
          return windowState;
        }

        return {
          ...windowState,
          ...clampDragRect(
            {
              x: nextX,
              y: nextY,
              width: windowState.width,
              height: windowState.height,
            },
            desktopBounds,
            appId,
          ),
        };
      }),
    );
  }

  function resizeApp(
    appId: AppId,
    direction: WindowResizeDirection,
    originRect: WindowRect,
    deltaX: number,
    deltaY: number,
  ) {
    setWindows((current) =>
      current.map((windowState) =>
        windowState.appId === appId
          ? {
              ...windowState,
              ...resizeWindowRect(originRect, appId, desktopBounds, direction, deltaX, deltaY),
            }
          : windowState,
      ),
    );
  }

  function resetDesktop() {
    nextZIndexRef.current = 20;
    setStartMenuOpen(false);
    setWindows([]);
  }

  return (
    <DesktopManagerStore.Provider
      value={{
        windows,
        desktopBounds,
        isStartMenuOpen,
        openApp,
        focusApp,
        closeApp,
        minimizeApp,
        toggleFromTaskbar,
        moveApp,
        resizeApp,
        resetDesktop,
        setStartMenuOpen,
        setDesktopBounds,
      }}
    >
      {children}
    </DesktopManagerStore.Provider>
  );
}
