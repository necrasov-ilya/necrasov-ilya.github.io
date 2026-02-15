import { formatBytes, listValues } from "../../shared/format.js";
import { runDetector } from "./detectors.js";

const SUMMARY_LOCALIZATION_MAP = {
  granted: "разрешено",
  denied: "запрещено",
  prompt: "запрос",
  unsupported: "недоступно",
  dark: "темная",
  light: "светлая",
  "no-preference": "без предпочтений",
  more: "повышенный",
  less: "пониженный",
  direct: "прямой переход",
  true: "Да",
  false: "Нет",
};

const formatSummaryValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Н/Д";
  }

  const normalized = String(value);
  if (normalized in SUMMARY_LOCALIZATION_MAP) {
    return SUMMARY_LOCALIZATION_MAP[normalized];
  }

  return normalized;
};

export const hashValue = (value) => {
  const text = String(value ?? "");
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36).toUpperCase().padStart(10, "0").slice(0, 10);
};

const getBrowserNameAndVersion = (ua) => {
  const patterns = [
    { name: "Microsoft Edge", regex: /edg\/([\d.]+)/i },
    { name: "Opera", regex: /opr\/([\d.]+)/i },
    { name: "Chrome", regex: /chrome\/([\d.]+)/i },
    { name: "Firefox", regex: /firefox\/([\d.]+)/i },
    { name: "Safari", regex: /version\/([\d.]+).*safari/i },
  ];

  for (const item of patterns) {
    const match = ua.match(item.regex);
    if (match) {
      return {
        name: item.name,
        version: match[1] || "unknown",
      };
    }
  }

  return {
    name: "Неизвестно",
    version: "Н/Д",
  };
};

const getEngineName = (ua) => {
  if (/applewebkit/i.test(ua) && /chrome\//i.test(ua)) {
    return "Blink";
  }

  if (/applewebkit/i.test(ua) && /safari\//i.test(ua) && !/chrome\//i.test(ua)) {
    return "WebKit";
  }

  if (/gecko\//i.test(ua) && /firefox\//i.test(ua)) {
    return "Gecko";
  }

  return "Неизвестно";
};

const getOsName = (ua, platform) => {
  if (/windows/i.test(ua)) {
    return "Windows";
  }

  if (/mac os x/i.test(ua)) {
    return "macOS";
  }

  if (/android/i.test(ua)) {
    return "Android";
  }

  if (/iphone|ipad|ipod/i.test(ua)) {
    return "iOS";
  }

  if (/linux/i.test(platform)) {
    return "Linux";
  }

  return "Неизвестно";
};

const getConnectionSnapshot = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (!connection) {
    return {
      type: "недоступно",
      effectiveType: "недоступно",
      downlink: "недоступно",
      rtt: "недоступно",
      saveData: "недоступно",
    };
  }

  return {
    type: connection.type,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
};

const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 60;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return "Н/Д";
    }

    ctx.fillStyle = "#f60";
    ctx.fillRect(10, 10, 100, 40);
    ctx.fillStyle = "#069";
    ctx.font = "16px Arial";
    ctx.fillText("Necrasov Fingerprint", 14, 35);
    ctx.strokeStyle = "#c92455";
    ctx.beginPath();
    ctx.arc(200, 30, 18, 0, Math.PI * 2);
    ctx.stroke();

    return hashValue(canvas.toDataURL());
  } catch {
    return "Н/Д";
  }
};

const getWebGLInfo = () => {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        vendor: "недоступно",
        renderer: "недоступно",
        version: "недоступно",
        shadingLanguageVersion: "недоступно",
      };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);

    return {
      vendor,
      renderer,
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
    };
  } catch {
    return {
      vendor: "Н/Д",
      renderer: "Н/Д",
      version: "Н/Д",
      shadingLanguageVersion: "Н/Д",
    };
  }
};

const getStorageAvailability = () => {
  const checkStorage = (name) => {
    try {
      const storage = window[name];
      const key = "__fingerprint_test__";
      storage.setItem(key, "1");
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  return {
    localStorage: checkStorage("localStorage"),
    sessionStorage: checkStorage("sessionStorage"),
  };
};

const getSuspicion = ({ ua, webdriver, pluginsLength, languages, hasTouch }) => {
  let score = 0;
  const reasons = [];

  if (/headless|phantom|selenium|puppeteer|bot|crawler|spider/i.test(ua)) {
    score += 2;
    reasons.push("bot-подобный user agent");
  }

  if (webdriver) {
    score += 2;
    reasons.push("флаг navigator.webdriver");
  }

  if (pluginsLength === 0) {
    score += 1;
    reasons.push("нет плагинов");
  }

  if (!languages || languages.length === 0) {
    score += 1;
    reasons.push("пустой список языков");
  }

  if (hasTouch && /windows nt/i.test(ua) && /desktop/i.test(ua)) {
    score += 1;
    reasons.push("странная комбинация touch/ua");
  }

  if (score <= 0) {
    return {
      level: "none",
      text: "Подозрительные паттерны не обнаружены.",
      score: 0,
    };
  }

  if (score <= 2) {
    return {
      level: "low",
      text: `Незначительные сигналы: ${reasons.join(", ")}.`,
      score,
    };
  }

  if (score <= 4) {
    return {
      level: "medium",
      text: `Несколько сигналов: ${reasons.join(", ")}.`,
      score,
    };
  }

  return {
    level: "high",
    text: `Сильные признаки автоматизации: ${reasons.join(", ")}.`,
    score,
  };
};

const getPermissionSnapshot = async () => {
  if (!navigator.permissions || !navigator.permissions.query) {
    return [];
  }

  const names = [
    "geolocation",
    "notifications",
    "camera",
    "microphone",
    "clipboard-read",
    "clipboard-write",
    "midi",
    "persistent-storage",
    "push",
    "background-sync",
    "accelerometer",
    "gyroscope",
    "magnetometer",
    "display-capture",
    "speaker-selection",
    "window-management",
    "local-fonts",
    "idle-detection",
  ];

  return Promise.all(
    names.map(async (name) => {
      try {
        const permission = await navigator.permissions.query({ name });
        return [name, permission.state];
      } catch {
        return [name, "недоступно"];
      }
    }),
  );
};

const getStorageSnapshot = async () => {
  const availability = getStorageAvailability();
  const payload = {
    quota: null,
    usage: null,
    persisted: "Н/Д",
    localStorage: availability.localStorage,
    sessionStorage: availability.sessionStorage,
  };

  if (!navigator.storage) {
    return payload;
  }

  try {
    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      payload.quota = estimate.quota;
      payload.usage = estimate.usage;
    }

    if (navigator.storage.persisted) {
      payload.persisted = await navigator.storage.persisted();
    }
  } catch {
    return payload;
  }

  return payload;
};

const getBatterySnapshot = async () => {
  if (!navigator.getBattery) {
    return {
      level: "недоступно",
      charging: "недоступно",
      chargingTime: "недоступно",
      dischargingTime: "недоступно",
    };
  }

  try {
    const battery = await navigator.getBattery();
    return {
      level: `${Math.round((battery.level ?? 0) * 100)}%`,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch {
    return {
      level: "Н/Д",
      charging: "Н/Д",
      chargingTime: "Н/Д",
      dischargingTime: "Н/Д",
    };
  }
};

const getMediaDevicesSnapshot = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return {
      audioInputs: "недоступно",
      audioOutputs: "недоступно",
      videoInputs: "недоступно",
      summary: "недоступно",
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter((item) => item.kind === "audioinput").length;
    const audioOutputs = devices.filter((item) => item.kind === "audiooutput").length;
    const videoInputs = devices.filter((item) => item.kind === "videoinput").length;

    return {
      audioInputs,
      audioOutputs,
      videoInputs,
      summary: `${devices.length} devices`,
    };
  } catch {
    return {
      audioInputs: "Н/Д",
      audioOutputs: "Н/Д",
      videoInputs: "Н/Д",
      summary: "Н/Д",
    };
  }
};

const getUADataSnapshot = async () => {
  const fallback = {
    brands: "недоступно",
    mobile: "недоступно",
    platform: "недоступно",
    architecture: "недоступно",
    bitness: "недоступно",
    uaFullVersion: "недоступно",
    platformVersion: "недоступно",
    model: "недоступно",
    wow64: "недоступно",
  };

  if (!navigator.userAgentData) {
    return fallback;
  }

  try {
    const brands = Array.isArray(navigator.userAgentData.brands)
      ? navigator.userAgentData.brands.map((item) => `${item.brand} ${item.version}`).join(", ")
      : "N/A";

    const payload = {
      brands,
      mobile: navigator.userAgentData.mobile,
      platform: navigator.userAgentData.platform,
      architecture: "Н/Д",
      bitness: "Н/Д",
      uaFullVersion: "Н/Д",
      platformVersion: "Н/Д",
      model: "Н/Д",
      wow64: "Н/Д",
    };

    if (navigator.userAgentData.getHighEntropyValues) {
      const highEntropy = await navigator.userAgentData.getHighEntropyValues([
        "architecture",
        "bitness",
        "uaFullVersion",
        "platformVersion",
        "model",
        "wow64",
      ]);

      payload.architecture = highEntropy.architecture;
      payload.bitness = highEntropy.bitness;
      payload.uaFullVersion = highEntropy.uaFullVersion;
      payload.platformVersion = highEntropy.platformVersion;
      payload.model = highEntropy.model;
      payload.wow64 = highEntropy.wow64;
    }

    return payload;
  } catch {
    return fallback;
  }
};

const getAudioFingerprint = async () => {
  const Context = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Context) {
    return "Н/Д";
  }

  try {
    const context = new Context(1, 44100, 44100);
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 12000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await context.startRendering();
    const channel = buffer.getChannelData(0);
    const sample = Array.from(channel.slice(4500, 5500))
      .map((num) => num.toFixed(5))
      .join("|");
    return hashValue(sample);
  } catch {
    return "N/A";
  }
};

const buildPermissionStats = (permissionSnapshot) =>
  permissionSnapshot.reduce(
    (acc, [, state]) => {
      if (state in acc) {
        acc[state] += 1;
      } else {
        acc.unsupported += 1;
      }
      return acc;
    },
    {
      granted: 0,
      denied: 0,
      prompt: 0,
      unsupported: 0,
    },
  );

const buildDeviceId = ({
  ua,
  intlOptions,
  canvasFingerprint,
  audioFingerprint,
  webgl,
  uaDataSnapshot,
}) => {
  const tokenSource = [
    ua,
    navigator.platform,
    navigator.language,
    listValues(navigator.languages),
    intlOptions.timeZone,
    window.screen.width,
    window.screen.height,
    window.devicePixelRatio,
    canvasFingerprint,
    audioFingerprint,
    webgl.vendor,
    webgl.renderer,
    uaDataSnapshot.brands,
  ].join("|");

  const token = hashValue(tokenSource);
  return `N|${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 10)}K`;
};

export const collectPassportData = async (featureCatalog) => {
  const ua = navigator.userAgent || "";
  const browser = getBrowserNameAndVersion(ua);
  const engineName = getEngineName(ua);
  const osName = getOsName(ua, navigator.platform);

  const connection = getConnectionSnapshot();
  const webgl = getWebGLInfo();
  const canvasFingerprint = getCanvasFingerprint();

  const featureResults = featureCatalog.map((feature) => ({
    name: feature.name,
    icon: feature.icon,
    supported: runDetector(feature.detector),
  }));

  const [
    permissionSnapshot,
    storageSnapshot,
    batterySnapshot,
    mediaSnapshot,
    uaDataSnapshot,
    audioFingerprint,
  ] = await Promise.all([
    getPermissionSnapshot(),
    getStorageSnapshot(),
    getBatterySnapshot(),
    getMediaDevicesSnapshot(),
    getUADataSnapshot(),
    getAudioFingerprint(),
  ]);

  const supportedCount = featureResults.filter((item) => item.supported).length;
  const totalFeatures = featureResults.length;
  const percent = Math.round((supportedCount / Math.max(totalFeatures, 1)) * 100);

  const suspicion = getSuspicion({
    ua,
    webdriver: navigator.webdriver,
    pluginsLength: navigator.plugins ? navigator.plugins.length : 0,
    languages: navigator.languages,
    hasTouch: (navigator.maxTouchPoints || 0) > 0,
  });

  const intlOptions = Intl.DateTimeFormat().resolvedOptions();
  const plugins = Array.from(navigator.plugins || []).map((item) => item.name);

  const browserDetails = [
    ["Браузер", `${browser.name} ${browser.version}`],
    ["Движок", engineName],
    ["ОС (оценка)", osName],
    ["User Agent", ua],
    ["UA бренды", uaDataSnapshot.brands],
    ["UA платформа", uaDataSnapshot.platform],
    ["UA mobile", uaDataSnapshot.mobile],
    ["UA архитектура", uaDataSnapshot.architecture],
    ["UA разрядность", uaDataSnapshot.bitness],
    ["UA полная версия", uaDataSnapshot.uaFullVersion],
    ["UA версия платформы", uaDataSnapshot.platformVersion],
    ["UA модель", uaDataSnapshot.model],
    ["UA WOW64", uaDataSnapshot.wow64],
    ["Язык", navigator.language],
    ["Языки", listValues(navigator.languages, 12)],
    ["Вендор", navigator.vendor],
    ["Версия приложения", navigator.appVersion],
    ["Продукт", navigator.product],
    ["Product Sub", navigator.productSub],
    ["Do Not Track", navigator.doNotTrack || "не задан"],
    ["Global Privacy Control (GPC)", navigator.globalPrivacyControl],
    ["Cookies включены", navigator.cookieEnabled],
    ["PDF Viewer включен", navigator.pdfViewerEnabled],
    [
      "Java включена",
      typeof navigator.javaEnabled === "function" ? navigator.javaEnabled() : "Н/Д",
    ],
    ["WebDriver", navigator.webdriver],
    ["Количество плагинов", navigator.plugins ? navigator.plugins.length : 0],
    ["Плагины", listValues(plugins, 12)],
    ["Количество MIME-типов", navigator.mimeTypes ? navigator.mimeTypes.length : 0],
    ["Онлайн", navigator.onLine],
    ["Тип соединения", connection.type],
    ["Эффективный тип", connection.effectiveType],
    ["Downlink (Mbps)", connection.downlink],
    ["RTT (мс)", connection.rtt],
    ["Экономия трафика", connection.saveData],
    ["Потоки CPU", navigator.hardwareConcurrency],
    ["Память устройства (ГБ)", navigator.deviceMemory],
    ["Макс. точек касания", navigator.maxTouchPoints],
    ["Canvas-фингерпринт", canvasFingerprint],
    ["Audio-фингерпринт", audioFingerprint],
    ["WebGL вендор", webgl.vendor],
    ["WebGL рендерер", webgl.renderer],
    ["WebGL версия", webgl.version],
    ["WebGL SL версия", webgl.shadingLanguageVersion],
    ["Cross-Origin Isolated", window.crossOriginIsolated],
    ["Источник перехода", document.referrer || "прямой переход"],
    ["Длина истории", history.length],
  ];

  const viewport = window.visualViewport
    ? `${Math.round(window.visualViewport.width)} x ${Math.round(window.visualViewport.height)}`
    : "Н/Д";

  const prefersContrast = window.matchMedia("(prefers-contrast: more)").matches
    ? "more"
    : window.matchMedia("(prefers-contrast: less)").matches
      ? "less"
      : "no-preference";

  const systemDetails = [
    ["Операционная система", osName],
    ["Платформа", navigator.platform],
    ["Ядра CPU", navigator.hardwareConcurrency],
    ["Память устройства (ГБ)", navigator.deviceMemory],
    ["Экран", `${window.screen.width} x ${window.screen.height}`],
    ["Доступный экран", `${window.screen.availWidth} x ${window.screen.availHeight}`],
    ["Viewport", `${window.innerWidth} x ${window.innerHeight}`],
    ["VisualViewport", viewport],
    ["Плотность пикселей", window.devicePixelRatio],
    ["Глубина цвета", window.screen.colorDepth],
    ["Глубина пикселя", window.screen.pixelDepth],
    ["Ориентация", window.screen.orientation ? window.screen.orientation.type : "Н/Д"],
    ["Угол ориентации", window.screen.orientation ? window.screen.orientation.angle : "Н/Д"],
    ["Часовой пояс", intlOptions.timeZone],
    ["Смещение по UTC (мин)", -new Date().getTimezoneOffset()],
    ["Локаль", intlOptions.locale],
    ["Календарь", intlOptions.calendar],
    ["Система счисления", intlOptions.numberingSystem],
    ["Формат часов", intlOptions.hourCycle],
    [
      "Цветовая схема",
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    ],
    ["Снижение анимаций", window.matchMedia("(prefers-reduced-motion: reduce)").matches],
    ["Контраст", prefersContrast],
    ["Принудительные цвета", window.matchMedia("(forced-colors: active)").matches],
    ["Квота хранилища", storageSnapshot.quota],
    ["Использование хранилища", storageSnapshot.usage],
    ["Постоянное хранилище", storageSnapshot.persisted],
    ["localStorage доступно", storageSnapshot.localStorage],
    ["sessionStorage доступно", storageSnapshot.sessionStorage],
    ["IndexedDB доступно", "indexedDB" in window],
    ["Cache API доступно", "caches" in window],
    ["Медиаустройства", mediaSnapshot.summary],
    ["Аудиовходы", mediaSnapshot.audioInputs],
    ["Аудиовыходы", mediaSnapshot.audioOutputs],
    ["Видеовходы", mediaSnapshot.videoInputs],
    ["Уровень батареи", batterySnapshot.level],
    ["Зарядка", batterySnapshot.charging],
    ["Время до полной зарядки", batterySnapshot.chargingTime],
    ["Время до разрядки", batterySnapshot.dischargingTime],
    ["Оценка подозрительности", suspicion.score],
    ["Текущее время", new Date().toLocaleTimeString()],
    ["Текущая дата", new Date().toLocaleDateString()],
  ];

  const permissionEntries = permissionSnapshot.map(([name, state]) => [
    `Разрешение: ${name}`,
    state,
  ]);
  const permissionStats = buildPermissionStats(permissionSnapshot);

  const deviceId = buildDeviceId({
    ua,
    intlOptions,
    canvasFingerprint,
    audioFingerprint,
    webgl,
    uaDataSnapshot,
  });

  const storageUsageText = `${formatBytes(storageSnapshot.usage)} / ${formatBytes(storageSnapshot.quota)}`;
  const storageModeText = `P:${formatSummaryValue(storageSnapshot.persisted)} L:${formatSummaryValue(storageSnapshot.localStorage)} S:${formatSummaryValue(storageSnapshot.sessionStorage)}`;

  return {
    deviceId,
    featureResults,
    featureMetrics: {
      supportedCount,
      totalFeatures,
      percent,
    },
    suspicion,
    browserDetails,
    systemDetails,
    permissionEntries,
    overview: {
      core: `${browser.name} ${browser.version} | ${osName} | C${formatSummaryValue(navigator.hardwareConcurrency)} M${formatSummaryValue(navigator.deviceMemory)}`,
      render: `${formatSummaryValue(webgl.renderer)} | DPR ${formatSummaryValue(window.devicePixelRatio)} | ${window.screen.width}x${window.screen.height}`,
      locale: `${formatSummaryValue(intlOptions.locale)} | ${formatSummaryValue(intlOptions.timeZone)} | ${listValues(navigator.languages, 3)}`,
      privacy: `DNT:${navigator.doNotTrack || "не задан"} GPC:${formatSummaryValue(navigator.globalPrivacyControl)} WD:${formatSummaryValue(navigator.webdriver)}`,
      permissions: `Выд:${permissionStats.granted} Зап:${permissionStats.prompt} Запр:${permissionStats.denied} Н/Д:${permissionStats.unsupported}`,
      isolation: `COI:${formatSummaryValue(window.crossOriginIsolated)} SC:${formatSummaryValue(window.isSecureContext)}`,
      storage: `${storageUsageText} | ${storageModeText}`,
      media: `Мик:${formatSummaryValue(mediaSnapshot.audioInputs)} Кам:${formatSummaryValue(mediaSnapshot.videoInputs)} Выход:${formatSummaryValue(mediaSnapshot.audioOutputs)}`,
      battery:
        batterySnapshot.level === "недоступно"
          ? "Battery API недоступен"
          : `${formatSummaryValue(batterySnapshot.level)} | Зарядка:${formatSummaryValue(batterySnapshot.charging)}`,
    },
  };
};
