import { applicationCatalog } from '../../entities/application/model/apps';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import { WindowShell } from '../../shared/ui/window-shell/WindowShell';
import { AppContent } from '../apps/AppContent';

export function WindowStack() {
  const { windows, focusApp, moveApp, minimizeApp, closeApp } = useDesktopManager();
  const topWindow = Math.max(...windows.map((item) => item.zIndex), 0);

  return (
    <>
      {windows
        .filter((windowState) => !windowState.isMinimized)
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((windowState) => {
          const app = applicationCatalog.find((item) => item.id === windowState.appId)!;

          return (
            <WindowShell
              app={app}
              isFocused={windowState.zIndex === topWindow}
              key={windowState.appId}
              onClose={() => closeApp(windowState.appId)}
              onFocus={() => focusApp(windowState.appId)}
              onMinimize={() => minimizeApp(windowState.appId)}
              onMove={(nextX, nextY) => moveApp(windowState.appId, nextX, nextY)}
              windowState={windowState}
            >
              <AppContent appId={windowState.appId} />
            </WindowShell>
          );
        })}
    </>
  );
}
