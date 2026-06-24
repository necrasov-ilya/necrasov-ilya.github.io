export type AppId =
  | 'portfolio'
  | 'projects'
  | 'blog'
  | 'system'
  | 'contact'
  | 'neon-xo'
  | 'signal-hunt';

export type AppIconKey =
  | 'profile'
  | 'briefcase'
  | 'article'
  | 'system'
  | 'mail'
  | 'gamepad'
  | 'target';

export type WindowResizeDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'north-east'
  | 'north-west'
  | 'south-east'
  | 'south-west';

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
  minSize: {
    width: number;
    height: number;
  };
  launchLabel: string;
}
