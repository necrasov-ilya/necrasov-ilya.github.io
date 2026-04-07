import { systemFeatureCatalog } from './featureCatalog';
import type {
  SystemDetailEntry,
  SystemFeatureItem,
  SystemSnapshot,
  SystemSuspicion,
} from './types';

type BatteryManagerLike = {
  level?: number;
  charging?: boolean;
};

type ConnectionLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

type ExtendedNavigator = Navigator & {
  bluetooth?: unknown;
  connection?: ConnectionLike;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManagerLike>;
  globalPrivacyControl?: boolean;
  pdfViewerEnabled?: boolean;
  serial?: unknown;
};

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36).toUpperCase().padStart(10, '0').slice(0, 10);
}

function formatMaybe(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return 'Н/Д';
  }

  if (typeof value === 'boolean') {
    return value ? 'Да' : 'Нет';
  }

  return String(value);
}

function formatBytes(value: number | null | undefined) {
  if (!value || value < 0) {
    return 'Н/Д';
  }

  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  let amount = value;
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  return `${amount.toFixed(amount >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getBrowserName(userAgent: string) {
  const patterns = [
    { name: 'Microsoft Edge', regex: /edg\/([\d.]+)/i },
    { name: 'Opera', regex: /opr\/([\d.]+)/i },
    { name: 'Chrome', regex: /chrome\/([\d.]+)/i },
    { name: 'Firefox', regex: /firefox\/([\d.]+)/i },
    { name: 'Safari', regex: /version\/([\d.]+).*safari/i },
  ];

  for (const pattern of patterns) {
    const match = userAgent.match(pattern.regex);

    if (match) {
      return `${pattern.name} ${match[1] ?? ''}`.trim();
    }
  }

  return 'Неизвестный браузер';
}

function getEngineName(userAgent: string) {
  if (/applewebkit/i.test(userAgent) && /chrome\//i.test(userAgent)) {
    return 'Blink';
  }

  if (/applewebkit/i.test(userAgent) && /safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) {
    return 'WebKit';
  }

  if (/gecko\//i.test(userAgent) && /firefox\//i.test(userAgent)) {
    return 'Gecko';
  }

  return 'Неизвестно';
}

function getOsName(userAgent: string, platform: string) {
  if (/windows/i.test(userAgent)) {
    return 'Windows';
  }

  if (/mac os x/i.test(userAgent)) {
    return 'macOS';
  }

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return 'iOS';
  }

  if (/linux/i.test(platform)) {
    return 'Linux';
  }

  return 'Неизвестно';
}

function getSuspicion(navigatorState: ExtendedNavigator): SystemSuspicion {
  const reasons: string[] = [];
  let score = 0;

  if (/headless|selenium|puppeteer|bot|crawler|spider/i.test(navigatorState.userAgent)) {
    score += 2;
    reasons.push('bot-подобный user agent');
  }

  if (navigatorState.webdriver) {
    score += 2;
    reasons.push('включён navigator.webdriver');
  }

  if ((navigatorState.plugins?.length ?? 0) === 0) {
    score += 1;
    reasons.push('пустой список плагинов');
  }

  if ((navigatorState.languages?.length ?? 0) === 0) {
    score += 1;
    reasons.push('нет языков интерфейса');
  }

  if (score <= 1) {
    return {
      label: 'Низкий',
      summary: reasons.length > 0 ? reasons.join(', ') : 'Нормальный клиентский профиль без лишних сигналов.',
      tone: 'safe',
    };
  }

  if (score <= 3) {
    return {
      label: 'Средний',
      summary: reasons.join(', '),
      tone: 'warn',
    };
  }

  return {
    label: 'Высокий',
    summary: reasons.join(', '),
    tone: 'danger',
  };
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;

    const context = canvas.getContext('2d');

    if (!context) {
      return 'Н/Д';
    }

    context.fillStyle = '#c92455';
    context.fillRect(12, 12, 84, 30);
    context.fillStyle = '#0a0a11';
    context.font = '16px monospace';
    context.fillText('nksv', 18, 32);
    context.strokeStyle = '#7de7d5';
    context.strokeRect(118, 12, 40, 30);

    return hashValue(canvas.toDataURL());
  } catch {
    return 'Н/Д';
  }
}

function getWebGLSummary() {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');

    if (!context || !('getParameter' in context)) {
      return 'Н/Д';
    }

    const gl = context as WebGLRenderingContext;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    return formatMaybe(renderer);
  } catch {
    return 'Н/Д';
  }
}

async function getStorageSummary() {
  if (!navigator.storage?.estimate) {
    return 'Н/Д';
  }

  try {
    const estimate = await navigator.storage.estimate();
    return `${formatBytes(estimate.usage)} / ${formatBytes(estimate.quota)}`;
  } catch {
    return 'Н/Д';
  }
}

async function getBatterySummary(navigatorState: ExtendedNavigator) {
  if (!navigatorState.getBattery) {
    return 'Н/Д';
  }

  try {
    const battery = await navigatorState.getBattery();
    return `${Math.round((battery.level ?? 0) * 100)}% · ${battery.charging ? 'заряжается' : 'без зарядки'}`;
  } catch {
    return 'Н/Д';
  }
}

async function getMediaSummary() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return 'Н/Д';
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((item) => item.kind === 'videoinput').length;
    const microphones = devices.filter((item) => item.kind === 'audioinput').length;
    const outputs = devices.filter((item) => item.kind === 'audiooutput').length;

    return `${cameras} камер · ${microphones} микрофонов · ${outputs} выходов`;
  } catch {
    return 'Н/Д';
  }
}

function buildDeviceId(params: {
  userAgent: string;
  language: string;
  timeZone: string;
  screen: string;
  renderer: string;
  fingerprint: string;
}) {
  const token = hashValue(
    [
      params.userAgent,
      params.language,
      params.timeZone,
      params.screen,
      params.renderer,
      params.fingerprint,
    ].join('|'),
  );

  return `N|${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 10)}K`;
}

export async function collectSystemSnapshot(): Promise<SystemSnapshot> {
  const navigatorState = navigator as ExtendedNavigator;
  const userAgent = navigatorState.userAgent ?? '';
  const browser = getBrowserName(userAgent);
  const engine = getEngineName(userAgent);
  const os = getOsName(userAgent, navigatorState.platform ?? '');
  const renderer = getWebGLSummary();
  const fingerprint = getCanvasFingerprint();
  const connection = navigatorState.connection;
  const languages = navigatorState.languages?.join(', ') ?? navigatorState.language ?? 'Н/Д';
  const supportFeatures: SystemFeatureItem[] = systemFeatureCatalog.map((feature) => ({
    id: feature.id,
    label: feature.label,
    supported: feature.detector(),
  }));
  const supportedFeatures = supportFeatures.filter((feature) => feature.supported);
  const missingFeatures = supportFeatures.filter((feature) => !feature.supported);
  const supportPercent = Math.round(
    (supportedFeatures.length / Math.max(supportFeatures.length, 1)) * 100,
  );
  const suspicion = getSuspicion(navigatorState);
  const resolvedLocale = Intl.DateTimeFormat().resolvedOptions();
  const screenLabel = `${window.screen.width} × ${window.screen.height}`;
  const viewportLabel = `${window.innerWidth} × ${window.innerHeight}`;
  const [storageSummary, batterySummary, mediaSummary] = await Promise.all([
    getStorageSummary(),
    getBatterySummary(navigatorState),
    getMediaSummary(),
  ]);
  const deviceId = buildDeviceId({
    userAgent,
    language: navigatorState.language,
    timeZone: resolvedLocale.timeZone ?? 'UTC',
    screen: screenLabel,
    renderer,
    fingerprint,
  });

  const overview: SystemDetailEntry[] = [
    { label: 'Браузер', value: browser },
    { label: 'Рендер', value: renderer },
    { label: 'Локаль', value: `${resolvedLocale.locale} · ${resolvedLocale.timeZone}` },
    { label: 'Экран', value: `${screenLabel} · DPR ${formatMaybe(window.devicePixelRatio)}` },
    { label: 'Соединение', value: connection?.effectiveType ? `${connection.effectiveType} · ${formatMaybe(connection.downlink)} Мбит/с` : 'Н/Д' },
    { label: 'Медиа', value: mediaSummary },
  ];

  const browserDetails: SystemDetailEntry[] = [
    { label: 'Браузер', value: browser },
    { label: 'Движок', value: engine },
    { label: 'ОС', value: os },
    { label: 'User Agent', value: userAgent || 'Н/Д' },
    { label: 'Языки', value: languages },
    { label: 'Vendor', value: navigatorState.vendor || 'Н/Д' },
    { label: 'Cookies', value: formatMaybe(navigatorState.cookieEnabled) },
    { label: 'PDF Viewer', value: formatMaybe(navigatorState.pdfViewerEnabled) },
    { label: 'Do Not Track', value: navigatorState.doNotTrack || 'не задан' },
    { label: 'Global Privacy Control', value: formatMaybe(navigatorState.globalPrivacyControl) },
    { label: 'WebDriver', value: formatMaybe(navigatorState.webdriver) },
    { label: 'Плагины', value: formatMaybe(navigatorState.plugins?.length) },
    { label: 'Canvas ID', value: fingerprint },
    { label: 'Подозрительность UA', value: `${suspicion.label} · ${suspicion.summary}` },
  ];

  const systemDetails: SystemDetailEntry[] = [
    { label: 'ID устройства', value: deviceId },
    { label: 'Платформа', value: navigatorState.platform || 'Н/Д' },
    { label: 'Экран', value: screenLabel },
    { label: 'Viewport', value: viewportLabel },
    { label: 'Память устройства', value: navigatorState.deviceMemory ? `${navigatorState.deviceMemory} ГБ` : 'Н/Д' },
    { label: 'Потоки CPU', value: formatMaybe(navigatorState.hardwareConcurrency) },
    { label: 'Точки касания', value: formatMaybe(navigatorState.maxTouchPoints) },
    { label: 'Хранилище', value: storageSummary },
    { label: 'Battery API', value: batterySummary },
    { label: 'Медиаустройства', value: mediaSummary },
    { label: 'Сеть', value: connection ? `${formatMaybe(connection.effectiveType)} · RTT ${formatMaybe(connection.rtt)} мс` : 'Н/Д' },
    { label: 'Текущая дата', value: new Date().toLocaleDateString('ru-RU') },
    { label: 'Текущее время', value: new Date().toLocaleTimeString('ru-RU') },
  ];

  return {
    deviceId,
    supportPercent,
    supportedCount: supportedFeatures.length,
    totalFeatures: supportFeatures.length,
    suspicion,
    overview,
    browser: browserDetails,
    system: systemDetails,
    supportedFeatures,
    missingFeatures,
  };
}
