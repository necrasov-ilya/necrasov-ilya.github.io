import type { AppDefinition, AppId, WindowInstance } from '../../shared/types/desktop';
import { AppIcon } from '../../shared/ui/app-icon/AppIcon';
import './Taskbar.css';

interface TaskbarProps {
  apps: AppDefinition[];
  isStartMenuOpen: boolean;
  time: string;
  windows: WindowInstance[];
  onToggleStart: () => void;
  onToggleWindow: (appId: AppId) => void;
}

export function Taskbar({
  apps,
  isStartMenuOpen,
  time,
  windows,
  onToggleStart,
  onToggleWindow,
}: TaskbarProps) {
  const activeId = windows
    .filter((windowState) => !windowState.isMinimized)
    .sort((left, right) => right.zIndex - left.zIndex)[0]?.appId;
  const openWindows = windows.map((windowState) => ({
    app: apps.find((app) => app.id === windowState.appId)!,
    windowState,
  }));

  return (
    <footer className="taskbar">
      <div className="taskbar__left">
        <button
          className={`start-button ${isStartMenuOpen ? 'is-active' : ''}`}
          onClick={onToggleStart}
          type="button"
        >
          <img alt="" src="/media/hero/logo/logo-nksv-mark-filled.svg" />
          <span>Пуск</span>
        </button>

        <div className="taskbar__apps">
          {openWindows.map(({ app, windowState }) => (
            <button
              className={`taskbar-app ${
                activeId === app.id
                  ? 'is-active'
                  : windowState.isMinimized
                    ? 'is-minimized'
                    : 'is-open'
              }`}
              key={app.id}
              onClick={() => onToggleWindow(app.id)}
              type="button"
            >
              <AppIcon icon={app.icon} size={16} />
              <span>{app.shortTitle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="taskbar__right">
        <div className="taskbar-clock">
          <strong>{time}</strong>
        </div>
      </div>
    </footer>
  );
}
