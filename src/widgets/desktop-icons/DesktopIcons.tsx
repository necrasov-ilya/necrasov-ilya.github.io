import type { AppDefinition, AppId, WindowInstance } from '../../shared/types/desktop';
import { AppIcon } from '../../shared/ui/app-icon/AppIcon';
import './DesktopIcons.css';

interface DesktopIconsProps {
  apps: AppDefinition[];
  windows: WindowInstance[];
  onOpen: (appId: AppId) => void;
}

export function DesktopIcons({ apps, windows, onOpen }: DesktopIconsProps) {
  return (
    <div className="desktop-icons">
      {apps.map((app) => {
        const isOpen = windows.some((windowState) => windowState.appId === app.id);

        return (
          <button
            className={`desktop-icon ${app.id === 'portfolio' ? 'desktop-icon--featured' : ''} ${
              isOpen ? 'is-open' : ''
            }`}
            key={app.id}
            onClick={() => onOpen(app.id)}
            type="button"
          >
            <span
              className={`desktop-icon__badge ${
                app.id === 'portfolio' ? 'desktop-icon__badge--featured' : ''
              }`}
              style={{ color: app.tint }}
            >
              {app.id === 'portfolio' ? (
                <img alt="" src="/media/hero/logo/logo-nksv-mark-filled.svg" />
              ) : (
                <AppIcon icon={app.icon} size={18} />
              )}
            </span>
            <strong>{app.shortTitle}</strong>
            <span>{app.launchLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
