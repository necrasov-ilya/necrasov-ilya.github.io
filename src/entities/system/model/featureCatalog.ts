import type { SystemFeatureItem } from './types';

export interface SystemFeatureDescriptor extends Omit<SystemFeatureItem, 'supported'> {
  detector: () => boolean;
}

function supportsDeclaration(property: string, value: string) {
  return typeof CSS !== 'undefined' && CSS.supports(property, value);
}

function supportsRule(rule: string) {
  return typeof CSS !== 'undefined' && CSS.supports(rule);
}

export const systemFeatureCatalog: SystemFeatureDescriptor[] = [
  {
    id: 'css-grid',
    label: 'CSS Grid',
    detector: () => supportsDeclaration('display', 'grid'),
  },
  {
    id: 'css-has',
    label: 'CSS :has()',
    detector: () => supportsRule('selector(:has(*))'),
  },
  {
    id: 'container-queries',
    label: 'Container Queries',
    detector: () => supportsDeclaration('container-type', 'inline-size'),
  },
  {
    id: 'backdrop-filter',
    label: 'Backdrop Filter',
    detector: () =>
      supportsDeclaration('backdrop-filter', 'blur(8px)') ||
      supportsDeclaration('-webkit-backdrop-filter', 'blur(8px)'),
  },
  {
    id: 'view-transitions',
    label: 'View Transitions',
    detector: () => 'startViewTransition' in document,
  },
  {
    id: 'popover',
    label: 'Popover API',
    detector: () => typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype,
  },
  {
    id: 'resize-observer',
    label: 'ResizeObserver',
    detector: () => 'ResizeObserver' in window,
  },
  {
    id: 'service-worker',
    label: 'Service Worker',
    detector: () => 'serviceWorker' in navigator,
  },
  {
    id: 'indexed-db',
    label: 'IndexedDB',
    detector: () => 'indexedDB' in window,
  },
  {
    id: 'cache-api',
    label: 'Cache API',
    detector: () => 'caches' in window,
  },
  {
    id: 'clipboard',
    label: 'Clipboard API',
    detector: () => 'clipboard' in navigator,
  },
  {
    id: 'webauthn',
    label: 'WebAuthn',
    detector: () => 'credentials' in navigator && 'PublicKeyCredential' in window,
  },
  {
    id: 'media-devices',
    label: 'Media Devices',
    detector: () => 'mediaDevices' in navigator,
  },
  {
    id: 'webgl',
    label: 'WebGL',
    detector: () => {
      try {
        return Boolean(document.createElement('canvas').getContext('webgl'));
      } catch {
        return false;
      }
    },
  },
  {
    id: 'webgl2',
    label: 'WebGL2',
    detector: () => {
      try {
        return Boolean(document.createElement('canvas').getContext('webgl2'));
      } catch {
        return false;
      }
    },
  },
  {
    id: 'webgpu',
    label: 'WebGPU',
    detector: () => 'gpu' in navigator,
  },
  {
    id: 'picture-in-picture',
    label: 'Picture in Picture',
    detector: () => 'pictureInPictureEnabled' in document,
  },
  {
    id: 'screen-capture',
    label: 'Screen Capture',
    detector: () =>
      'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices,
  },
  {
    id: 'battery',
    label: 'Battery API',
    detector: () => 'getBattery' in navigator,
  },
  {
    id: 'network-info',
    label: 'Network Information',
    detector: () => 'connection' in navigator,
  },
  {
    id: 'bluetooth',
    label: 'Web Bluetooth',
    detector: () => 'bluetooth' in navigator,
  },
  {
    id: 'serial',
    label: 'Web Serial',
    detector: () => 'serial' in navigator,
  },
  {
    id: 'gamepad',
    label: 'Gamepad API',
    detector: () => 'getGamepads' in navigator,
  },
  {
    id: 'speech-synthesis',
    label: 'Speech Synthesis',
    detector: () => 'speechSynthesis' in window,
  },
];
