import { profile } from '../../entities/application/model/profile';
import type { AppDefinition, AppId, WindowInstance } from '../../shared/types/desktop';
import { AppIcon } from '../../shared/ui/app-icon/AppIcon';
import './StartMenu.css';

interface StartMenuProps {
  apps: AppDefinition[];
  isOpen: boolean;
  windows: WindowInstance[];
  onOpen: (appId: AppId) => void;
}

export function StartMenu({ apps, isOpen, windows, onOpen }: StartMenuProps) {
  return (
    <aside className={`start-menu ${isOpen ? 'is-open' : ''}`}>
      <div className="start-menu__profile">
        <img alt="NKSV" src="/media/hero/logo/logo-nksv-mark-outlined.svg" />
        <div>
          <strong>{profile.name}</strong>
          <span>{profile.headline}</span>
        </div>
      </div>

      <div className="start-menu__apps">
        {apps.map((app) => {
          const isOpenNow = windows.some((windowState) => windowState.appId === app.id);

          return (
            <button className="start-menu__item" key={app.id} onClick={() => onOpen(app.id)} type="button">
              <span className="start-menu__item-icon" style={{ color: app.tint }}>
                <AppIcon icon={app.icon} size={18} />
              </span>
              <div>
                <strong>{app.title}</strong>
                <span>{app.subtitle}</span>
              </div>
              <em>{isOpenNow ? 'open' : 'launch'}</em>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
