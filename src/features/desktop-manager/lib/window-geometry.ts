import { getApplication } from '../../../entities/application/model/apps';
import type {
  AppId,
  DesktopBounds,
  WindowInstance,
  WindowRect,
  WindowResizeDirection,
} from '../../../shared/types/desktop';

const DESKTOP_MARGIN = 24;
const MOBILE_MARGIN = 12;
const TASKBAR_CLEARANCE = 86;
const COMPACT_BREAKPOINT = 940;
const COMPACT_HEIGHT = 620;
const DRAG_KEEP_X = 60;
const DRAG_KEEP_Y = 48;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

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

function getWindowConstraints(appId: AppId, bounds: DesktopBounds) {
  const app = getApplication(appId);

  if (isCompactViewport(bounds)) {
    const maxWidth = Math.max(320, bounds.width - MOBILE_MARGIN * 2);
    const maxHeight = Math.max(360, bounds.height - TASKBAR_CLEARANCE - MOBILE_MARGIN);

    return {
      minWidth: maxWidth,
      minHeight: maxHeight,
      maxWidth,
      maxHeight,
      margin: MOBILE_MARGIN,
    };
  }

  return {
    minWidth: Math.min(app.minSize.width, bounds.width - DESKTOP_MARGIN * 2),
    minHeight: Math.min(
      app.minSize.height,
      bounds.height - TASKBAR_CLEARANCE - DESKTOP_MARGIN,
    ),
    maxWidth: bounds.width - DESKTOP_MARGIN * 2,
    maxHeight: bounds.height - TASKBAR_CLEARANCE - DESKTOP_MARGIN,
    margin: DESKTOP_MARGIN,
  };
}

export function clampWindowRect(rect: WindowRect, bounds: DesktopBounds, appId: AppId): WindowRect {
  const constraints = getWindowConstraints(appId, bounds);

  if (isCompactViewport(bounds)) {
    return {
      x: MOBILE_MARGIN,
      y: MOBILE_MARGIN,
      width: constraints.maxWidth,
      height: constraints.maxHeight,
    };
  }

  const width = clamp(rect.width, constraints.minWidth, constraints.maxWidth);
  const height = clamp(rect.height, constraints.minHeight, constraints.maxHeight);
  const maxX = bounds.width - width - constraints.margin;
  const maxY = bounds.height - height - TASKBAR_CLEARANCE;

  return {
    x: clamp(rect.x, constraints.margin, Math.max(constraints.margin, maxX)),
    y: clamp(rect.y, constraints.margin, Math.max(constraints.margin, maxY)),
    width,
    height,
  };
}

export function clampDragRect(
  rect: WindowRect,
  bounds: DesktopBounds,
  appId: AppId,
): WindowRect {
  if (isCompactViewport(bounds)) {
    return clampWindowRect(rect, bounds, appId);
  }

  const { width, height } = rect;
  const availableWidth = bounds.width - DESKTOP_MARGIN * 2;
  const availableHeight = bounds.height - TASKBAR_CLEARANCE - DESKTOP_MARGIN;

  if (width >= availableWidth || height >= availableHeight) {
    return clampWindowRect(rect, bounds, appId);
  }

  const minX = DRAG_KEEP_X - width;
  const maxX = bounds.width - DRAG_KEEP_X;
  const maxY = bounds.height - TASKBAR_CLEARANCE - DRAG_KEEP_Y;

  return {
    x: clamp(rect.x, minX, maxX),
    y: Math.min(rect.y, maxY),
    width,
    height,
  };
}

function getSizedRect(appId: AppId, bounds: DesktopBounds) {
  const app = getApplication(appId);
  const constraints = getWindowConstraints(appId, bounds);

  return {
    width: clamp(app.defaultSize.width, constraints.minWidth, constraints.maxWidth),
    height: clamp(app.defaultSize.height, constraints.minHeight, constraints.maxHeight),
  };
}

export function createWindowRect(
  appId: AppId,
  openCount: number,
  bounds: DesktopBounds,
): WindowRect {
  const size = getSizedRect(appId, bounds);

  if (isCompactViewport(bounds)) {
    return clampWindowRect(
      {
        x: MOBILE_MARGIN,
        y: MOBILE_MARGIN,
        width: size.width,
        height: size.height,
      },
      bounds,
      appId,
    );
  }

  const cascadeStep = openCount % 4;
  const offsetX = 24 * cascadeStep;
  const offsetY = 18 * cascadeStep;

  return clampWindowRect(
    {
      x: (bounds.width - size.width) / 2 + offsetX,
      y: (bounds.height - size.height) / 2 - 42 + offsetY,
      width: size.width,
      height: size.height,
    },
    bounds,
    appId,
  );
}

export function fitWindowToBounds(
  windowState: WindowInstance,
  bounds: DesktopBounds,
): WindowInstance {
  return {
    ...windowState,
    ...clampWindowRect(windowState, bounds, windowState.appId),
  };
}

export function resizeWindowRect(
  originRect: WindowRect,
  appId: AppId,
  bounds: DesktopBounds,
  direction: WindowResizeDirection,
  deltaX: number,
  deltaY: number,
): WindowRect {
  if (isCompactViewport(bounds)) {
    return clampWindowRect(originRect, bounds, appId);
  }

  const constraints = getWindowConstraints(appId, bounds);

  let left = originRect.x;
  let top = originRect.y;
  let right = originRect.x + originRect.width;
  let bottom = originRect.y + originRect.height;

  if (direction.includes('east')) {
    right = originRect.x + originRect.width + deltaX;
    right = clamp(right, left + constraints.minWidth, left + constraints.maxWidth);
    right = Math.min(right, bounds.width - constraints.margin);
  }

  if (direction.includes('west')) {
    left = originRect.x + deltaX;
    left = clamp(left, right - constraints.maxWidth, right - constraints.minWidth);
    left = Math.max(left, constraints.margin);
  }

  if (direction.includes('south')) {
    bottom = originRect.y + originRect.height + deltaY;
    bottom = clamp(bottom, top + constraints.minHeight, top + constraints.maxHeight);
    bottom = Math.min(bottom, bounds.height - TASKBAR_CLEARANCE);
  }

  if (direction.includes('north')) {
    top = originRect.y + deltaY;
    top = clamp(top, bottom - constraints.maxHeight, bottom - constraints.minHeight);
    top = Math.max(top, constraints.margin);
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}
