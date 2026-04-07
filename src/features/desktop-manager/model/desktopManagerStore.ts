import { createContext } from 'react';
import type {
  AppId,
  DesktopBounds,
  WindowInstance,
  WindowRect,
  WindowResizeDirection,
} from '../../../shared/types/desktop';

export interface DesktopManagerValue {
  windows: WindowInstance[];
  desktopBounds: DesktopBounds;
  isStartMenuOpen: boolean;
  openApp: (appId: AppId) => void;
  focusApp: (appId: AppId) => void;
  closeApp: (appId: AppId) => void;
  minimizeApp: (appId: AppId) => void;
  toggleFromTaskbar: (appId: AppId) => void;
  moveApp: (appId: AppId, nextX: number, nextY: number) => void;
  resizeApp: (
    appId: AppId,
    direction: WindowResizeDirection,
    originRect: WindowRect,
    deltaX: number,
    deltaY: number,
  ) => void;
  setStartMenuOpen: (value: boolean) => void;
  setDesktopBounds: (bounds: DesktopBounds) => void;
}

export const DesktopManagerStore = createContext<DesktopManagerValue | null>(null);
