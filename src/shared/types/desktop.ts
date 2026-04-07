export type AppId =
  | 'about'
  | 'projects'
  | 'lab'
  | 'gallery'
  | 'contact'
  | 'neon-xo'
  | 'signal-hunt';

export type AppIconKey =
  | 'profile'
  | 'briefcase'
  | 'brain'
  | 'gallery'
  | 'mail'
  | 'gamepad'
  | 'target';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopBounds {
  width: number;
  height: number;
}

export interface WindowInstance extends WindowRect {
  appId: AppId;
  isMinimized: boolean;
  zIndex: number;
}

export interface AppDefinition {
  id: AppId;
  icon: AppIconKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  tint: string;
  defaultSize: {
    width: number;
    height: number;
  };
  launchLabel: string;
}
