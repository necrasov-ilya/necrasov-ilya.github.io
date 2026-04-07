import { getApplication } from '../../../entities/application/model/apps';
import type { AppId, DesktopBounds, WindowInstance, WindowRect } from '../../../shared/types/desktop';

const DESKTOP_MARGIN = 24;
const MOBILE_MARGIN = 12;
const TASKBAR_CLEARANCE = 86;
const COMPACT_BREAKPOINT = 940;
const COMPACT_HEIGHT = 620;

export function getInitialDesktopBounds(): DesktopBounds {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      height: 720,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function isCompactViewport(bounds: DesktopBounds) {
  return bounds.width <= COMPACT_BREAKPOINT || bounds.height <= COMPACT_HEIGHT;
}

export function clampWindowRect(rect: WindowRect, bounds: DesktopBounds): WindowRect {
  if (isCompactViewport(bounds)) {
    return {
      x: MOBILE_MARGIN,
      y: MOBILE_MARGIN,
      width: Math.max(320, bounds.width - MOBILE_MARGIN * 2),
      height: Math.max(360, bounds.height - TASKBAR_CLEARANCE - MOBILE_MARGIN),
    };
  }

  const maxX = bounds.width - rect.width - DESKTOP_MARGIN;
  const maxY = bounds.height - rect.height - TASKBAR_CLEARANCE;

  return {
    ...rect,
    x: Math.min(Math.max(DESKTOP_MARGIN, rect.x), Math.max(DESKTOP_MARGIN, maxX)),
    y: Math.min(Math.max(DESKTOP_MARGIN, rect.y), Math.max(DESKTOP_MARGIN, maxY)),
  };
}

function getSizedRect(appId: AppId, bounds: DesktopBounds) {
  const app = getApplication(appId);

  if (isCompactViewport(bounds)) {
    return {
      width: Math.max(320, bounds.width - MOBILE_MARGIN * 2),
      height: Math.max(360, bounds.height - TASKBAR_CLEARANCE - MOBILE_MARGIN),
    };
  }

  return {
    width: Math.min(app.defaultSize.width, bounds.width - DESKTOP_MARGIN * 2),
    height: Math.min(
      app.defaultSize.height,
      bounds.height - TASKBAR_CLEARANCE - DESKTOP_MARGIN,
    ),
  };
}

export function createWindowRect(
  appId: AppId,
  openCount: number,
  bounds: DesktopBounds,
): WindowRect {
  const size = getSizedRect(appId, bounds);

  if (isCompactViewport(bounds)) {
    return clampWindowRect({
      x: MOBILE_MARGIN,
      y: MOBILE_MARGIN,
      width: size.width,
      height: size.height,
    }, bounds);
  }

  const cascadeStep = openCount % 4;
  const offsetX = appId === 'about' ? 0 : 24 * cascadeStep;
  const offsetY = appId === 'about' ? 0 : 18 * cascadeStep;

  return clampWindowRect({
    x: (bounds.width - size.width) / 2 + offsetX,
    y: (bounds.height - size.height) / 2 - 42 + offsetY,
    width: size.width,
    height: size.height,
  }, bounds);
}

export function fitWindowToBounds(
  windowState: WindowInstance,
  bounds: DesktopBounds,
): WindowInstance {
  const size = getSizedRect(windowState.appId, bounds);

  return {
    ...windowState,
    ...clampWindowRect({
      ...windowState,
      width: Math.min(windowState.width, size.width),
      height: Math.min(windowState.height, size.height),
    }, bounds),
    width: Math.min(windowState.width, size.width),
    height: Math.min(windowState.height, size.height),
  };
}
