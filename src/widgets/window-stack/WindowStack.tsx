import { AnimatePresence } from 'framer-motion';
import { applicationCatalog } from '../../entities/application/model/apps';
import { isCompactViewport } from '../../features/desktop-manager/lib/window-geometry';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import { AppContent } from '../apps/AppContent';
import { WindowShell } from '../../shared/ui/window-shell/WindowShell';

export function WindowStack() {
  const { windows, desktopBounds, focusApp, moveApp, resizeApp, minimizeApp, closeApp } =
    useDesktopManager();
  const isCompactDesktop = isCompactViewport(desktopBounds);
  const topWindow = Math.max(...windows.map((item) => item.zIndex), 0);
  const visibleWindows = windows
    .filter((windowState) => !windowState.isMinimized)
    .sort((left, right) => left.zIndex - right.zIndex);

  return (
    <AnimatePresence>
      {visibleWindows.map((windowState) => {
        const app = applicationCatalog.find((item) => item.id === windowState.appId)!;

        return (
          <WindowShell
            app={app}
            isFocused={!isCompactDesktop && windowState.zIndex === topWindow}
            key={windowState.appId}
            onClose={() => closeApp(windowState.appId)}
            onFocus={() => {
              if (!isCompactDesktop) {
                focusApp(windowState.appId);
              }
            }}
            onMinimize={() => minimizeApp(windowState.appId)}
            onMove={(nextX, nextY) => moveApp(windowState.appId, nextX, nextY)}
            onResize={(direction, originRect, deltaX, deltaY) =>
              resizeApp(windowState.appId, direction, originRect, deltaX, deltaY)
            }
            windowState={windowState}
          >
            <AppContent appId={windowState.appId} />
          </WindowShell>
        );
      })}
    </AnimatePresence>
  );
}
