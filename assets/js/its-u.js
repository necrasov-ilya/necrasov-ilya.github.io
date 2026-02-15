
(() => {
  const tabButtons = Array.from(document.querySelectorAll(".window-tab"));
  const tabPanels = Array.from(document.querySelectorAll(".window-panel"));
  const tabLoader = document.getElementById("tab-loader");
  const windowBody = document.getElementById("window-body");

  const setActiveTab = (target) => {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tabTarget === target;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
    });
  };

  const switchTab = (target, withLoader = true) => {
    if (!withLoader || !tabLoader) {
      setActiveTab(target);
      if (windowBody) {
        windowBody.scrollTop = 0;
      }
      return;
    }

    tabLoader.hidden = false;
    window.setTimeout(() => {
      setActiveTab(target);
      tabLoader.hidden = true;
      if (windowBody) {
        windowBody.scrollTop = 0;
      }
    }, 320);
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tabTarget || "overview";
      if (button.classList.contains("is-active")) {
        return;
      }
      switchTab(target, true);
    });
  });

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Н/Д";
    }
    const localizationMap = {
      granted: "разрешено",
      denied: "запрещено",
      prompt: "запрос",
      unsupported: "недоступно",
      "не задан": "не задан",
      dark: "темная",
      light: "светлая",
      "no-preference": "без предпочтений",
      more: "повышенный",
      less: "пониженный",
      direct: "прямой переход",
    };
    if (typeof value === "string" && value in localizationMap) {
      return localizationMap[value];
    }
    if (typeof value === "boolean") {
      return value ? "Да" : "Нет";
    }
    return String(value);
  };

  const formatBytes = (bytes) => {
    if (typeof bytes !== "number" || Number.isNaN(bytes)) {
      return "Н/Д";
    }
    if (bytes === 0) {
      return "0 B";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const amount = bytes / (1024 ** power);
    return `${amount.toFixed(power === 0 ? 0 : 2)} ${units[power]}`;
  };

  const listValues = (value, max = 8) => {
    if (!Array.isArray(value) || !value.length) {
      return "Н/Д";
    }
    const trimmed = value.slice(0, max).join(", ");
    const extra = value.length > max ? ` (+${value.length - max})` : "";
    return `${trimmed}${extra}`;
  };

  const safeTest = (check) => {
    try {
      return Boolean(check.test());
    } catch (error) {
      return false;
    }
  };

  const hashValue = (value) => {
    const text = String(value ?? "");
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
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
        return { name: item.name, version: match[1] || "unknown" };
      }
    }
    return { name: "Неизвестно", version: "Н/Д" };
  };

  const getEngineName = (ua) => {
    if (/applewebkit/i.test(ua) && /chrome\//i.test(ua)) return "Blink";
    if (/applewebkit/i.test(ua) && /safari\//i.test(ua) && !/chrome\//i.test(ua)) return "WebKit";
    if (/gecko\//i.test(ua) && /firefox\//i.test(ua)) return "Gecko";
    return "Неизвестно";
  };

  const getOsName = (ua, platform) => {
    if (/windows/i.test(ua)) return "Windows";
    if (/mac os x/i.test(ua)) return "macOS";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (/linux/i.test(platform)) return "Linux";
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
    } catch (error) {
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
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

      return {
        vendor,
        renderer,
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      };
    } catch (error) {
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
      } catch (error) {
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
      return { level: "none", text: "Подозрительные паттерны не обнаружены.", score: 0 };
    }
    if (score <= 2) {
      return { level: "low", text: `Незначительные сигналы: ${reasons.join(", ")}.`, score };
    }
    if (score <= 4) {
      return { level: "medium", text: `Несколько сигналов: ${reasons.join(", ")}.`, score };
    }
    return { level: "high", text: `Сильные признаки автоматизации: ${reasons.join(", ")}.`, score };
  };
  const getFeatureChecks = () => [
    { name: "CSS Grid", icon: "grid_view", test: () => typeof CSS !== "undefined" && CSS.supports("display", "grid") },
    { name: "CSS Subgrid", icon: "grid_3x3", test: () => typeof CSS !== "undefined" && CSS.supports("grid-template-columns", "subgrid") },
    { name: "CSS :has()", icon: "rule", test: () => typeof CSS !== "undefined" && CSS.supports("selector(:has(*))") },
    { name: "Container Queries", icon: "crop_5_4", test: () => typeof CSS !== "undefined" && CSS.supports("container-type", "inline-size") },
    { name: "CSS Nesting", icon: "account_tree", test: () => typeof CSS !== "undefined" && CSS.supports("selector(&)") },
    { name: "color-mix()", icon: "palette", test: () => typeof CSS !== "undefined" && CSS.supports("color", "color-mix(in srgb, red 50%, blue)") },
    { name: "Backdrop Filter", icon: "blur_on", test: () => typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "blur(1px)") },
    { name: "View Transitions", icon: "swap_horiz", test: () => "startViewTransition" in document },
    { name: "Popover API", icon: "tooltip", test: () => "showPopover" in HTMLElement.prototype },
    { name: "Dialog Element", icon: "open_in_new", test: () => "HTMLDialogElement" in window },
    { name: "Web Animations", icon: "animation", test: () => "animate" in Element.prototype },
    { name: "IntersectionObserver", icon: "radar", test: () => "IntersectionObserver" in window },
    { name: "ResizeObserver", icon: "fit_screen", test: () => "ResizeObserver" in window },
    { name: "MutationObserver", icon: "change_history", test: () => "MutationObserver" in window },
    { name: "PerformanceObserver", icon: "monitoring", test: () => "PerformanceObserver" in window },
    { name: "Fetch API", icon: "cloud_download", test: () => "fetch" in window },
    { name: "WebSocket", icon: "router", test: () => "WebSocket" in window },
    { name: "EventSource", icon: "stream", test: () => "EventSource" in window },
    { name: "BroadcastChannel", icon: "campaign", test: () => "BroadcastChannel" in window },
    { name: "Navigator.sendBeacon", icon: "satellite_alt", test: () => "sendBeacon" in navigator },
    { name: "WebTransport", icon: "lan", test: () => "WebTransport" in window },
    { name: "WebRTC", icon: "videocam", test: () => "RTCPeerConnection" in window },
    { name: "Service Worker", icon: "construction", test: () => "serviceWorker" in navigator },
    { name: "Push API", icon: "notifications", test: () => "PushManager" in window },
    { name: "Background Sync", icon: "sync", test: () => "SyncManager" in window },
    { name: "Cache API", icon: "folder", test: () => "caches" in window },
    { name: "IndexedDB", icon: "database", test: () => "indexedDB" in window },
    { name: "StorageManager", icon: "storage", test: () => Boolean(navigator.storage && navigator.storage.estimate) },
    { name: "Cookie Store", icon: "cookie", test: () => "cookieStore" in window },
    { name: "Web Locks", icon: "lock", test: () => "locks" in navigator },
    { name: "localStorage", icon: "save", test: () => "localStorage" in window },
    { name: "sessionStorage", icon: "save_as", test: () => "sessionStorage" in window },
    { name: "File API", icon: "description", test: () => "FileReader" in window && "Blob" in window },
    { name: "File System Access", icon: "folder_open", test: () => "showOpenFilePicker" in window },
    { name: "Clipboard API", icon: "content_paste", test: () => Boolean(navigator.clipboard) },
    { name: "Clipboard Write", icon: "edit_note", test: () => Boolean(navigator.clipboard && navigator.clipboard.writeText) },
    { name: "Clipboard Read", icon: "preview", test: () => Boolean(navigator.clipboard && navigator.clipboard.readText) },
    { name: "Canvas 2D", icon: "draw", test: () => Boolean(document.createElement("canvas").getContext("2d")) },
    { name: "OffscreenCanvas", icon: "picture_in_picture", test: () => "OffscreenCanvas" in window },
    { name: "WebGL", icon: "view_in_ar", test: () => Boolean(document.createElement("canvas").getContext("webgl")) },
    { name: "WebGL2", icon: "deployed_code", test: () => Boolean(document.createElement("canvas").getContext("webgl2")) },
    { name: "WebGPU", icon: "memory", test: () => "gpu" in navigator },
    { name: "WebCodecs", icon: "movie", test: () => "VideoEncoder" in window || "VideoDecoder" in window },
    { name: "ImageBitmap", icon: "imagesmode", test: () => "createImageBitmap" in window },
    { name: "MediaDevices", icon: "perm_camera_mic", test: () => Boolean(navigator.mediaDevices) },
    { name: "MediaRecorder", icon: "fiber_manual_record", test: () => "MediaRecorder" in window },
    { name: "AudioContext", icon: "graphic_eq", test: () => "AudioContext" in window || "webkitAudioContext" in window },
    { name: "Picture-in-Picture", icon: "picture_in_picture", test: () => "pictureInPictureEnabled" in document },
    { name: "Document PiP", icon: "tab", test: () => "documentPictureInPicture" in window },
    { name: "Screen Capture", icon: "screen_share", test: () => Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) },
    { name: "Fullscreen", icon: "fullscreen", test: () => "fullscreenEnabled" in document },
    { name: "Pointer Lock", icon: "ads_click", test: () => "pointerLockElement" in document },
    { name: "Geolocation", icon: "location_on", test: () => "geolocation" in navigator },
    { name: "Device Orientation", icon: "screen_rotation", test: () => "DeviceOrientationEvent" in window },
    { name: "Device Motion", icon: "screen_rotation_alt", test: () => "DeviceMotionEvent" in window },
    { name: "Vibration", icon: "vibration", test: () => "vibrate" in navigator },
    { name: "Gamepad", icon: "sports_esports", test: () => "getGamepads" in navigator },
    { name: "Battery", icon: "battery_charging_full", test: () => "getBattery" in navigator },
    { name: "Network Information", icon: "network_check", test: () => "connection" in navigator },
    { name: "Wake Lock", icon: "light_mode", test: () => "wakeLock" in navigator },
    { name: "Bluetooth", icon: "bluetooth", test: () => "bluetooth" in navigator },
    { name: "WebUSB", icon: "usb", test: () => "usb" in navigator },
    { name: "WebHID", icon: "gamepad", test: () => "hid" in navigator },
    { name: "Web Serial", icon: "developer_board", test: () => "serial" in navigator },
    { name: "Web NFC", icon: "nfc", test: () => "NDEFReader" in window },
    { name: "Virtual Keyboard", icon: "keyboard", test: () => "virtualKeyboard" in navigator },
    { name: "Contacts Picker", icon: "contacts", test: () => Boolean(navigator.contacts && navigator.contacts.select) },
    { name: "Permissions API", icon: "admin_panel_settings", test: () => "permissions" in navigator },
    { name: "Credential Management", icon: "password", test: () => "credentials" in navigator },
    { name: "WebAuthn", icon: "fingerprint", test: () => "PublicKeyCredential" in window },
    { name: "Payment Request", icon: "payments", test: () => "PaymentRequest" in window },
    { name: "Trusted Types", icon: "verified_user", test: () => "trustedTypes" in window },
    { name: "SharedArrayBuffer", icon: "layers", test: () => "SharedArrayBuffer" in window },
    { name: "Web Workers", icon: "work", test: () => "Worker" in window },
    { name: "Shared Worker", icon: "group_work", test: () => "SharedWorker" in window },
    { name: "Atomics", icon: "hub", test: () => "Atomics" in window },
    { name: "Notifications", icon: "notifications_active", test: () => "Notification" in window },
    { name: "Speech Synthesis", icon: "record_voice_over", test: () => "speechSynthesis" in window },
    { name: "Speech Recognition", icon: "mic", test: () => "SpeechRecognition" in window || "webkitSpeechRecognition" in window },
    { name: "EyeDropper", icon: "eyedropper", test: () => "EyeDropper" in window },
    { name: "Idle Detection", icon: "bedtime", test: () => "IdleDetector" in window },
    { name: "CompressionStream", icon: "compress", test: () => "CompressionStream" in window },
    { name: "DecompressionStream", icon: "unfold_more", test: () => "DecompressionStream" in window },
    { name: "URLPattern", icon: "link", test: () => "URLPattern" in window },
    { name: "Navigation API", icon: "route", test: () => "navigation" in window },
    { name: "Scheduler.postTask", icon: "task", test: () => Boolean(window.scheduler && typeof window.scheduler.postTask === "function") },
    { name: "Launch Queue", icon: "rocket_launch", test: () => "launchQueue" in window },
    { name: "Visual Viewport", icon: "fullscreen_exit", test: () => "visualViewport" in window },
    { name: "Sanitizer API", icon: "cleaning_services", test: () => "Sanitizer" in window },
  ];
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

    const result = await Promise.all(
      names.map(async (name) => {
        try {
          const permission = await navigator.permissions.query({ name });
          return [name, permission.state];
        } catch (error) {
          return [name, "недоступно"];
        }
      }),
    );
    return result;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      const sample = Array.from(channel.slice(4500, 5500)).map((num) => num.toFixed(5)).join("|");
      return hashValue(sample);
    } catch (error) {
      return "N/A";
    }
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const renderDetails = (root, entries) => {
    if (!root) {
      return;
    }
    root.innerHTML = entries
      .map(
        ([key, value]) =>
          `<div class="detail-row"><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(formatValue(value))}</dd></div>`,
      )
      .join("");
  };

  const renderFeatureBlocks = (root, entries) => {
    if (!root) {
      return;
    }
    root.innerHTML = entries
      .map(
        (item) => `
          <article class="feature-block ${item.supported ? "is-supported" : ""}">
            <div class="feature-top">
              <span class="material-symbols-outlined" aria-hidden="true">${item.icon}</span>
              <span class="feature-state ${item.supported ? "supported" : "unsupported"}">${item.supported ? "Поддерживается" : "Нет"}</span>
            </div>
            <p class="feature-name">${item.name}</p>
          </article>
        `,
      )
      .join("");
  };
  const initPassport = async () => {
    const ua = navigator.userAgent || "";
    const browser = getBrowserNameAndVersion(ua);
    const connection = getConnectionSnapshot();
    const webgl = getWebGLInfo();
    const canvasFingerprint = getCanvasFingerprint();
    const featureChecks = getFeatureChecks();
    const featureResults = featureChecks.map((check) => ({
      name: check.name,
      icon: check.icon,
      supported: safeTest(check),
    }));

    const [permissionSnapshot, storageSnapshot, batterySnapshot, mediaSnapshot, uaDataSnapshot, audioFingerprint] = await Promise.all([
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
    const permissionEntries = permissionSnapshot.map(([name, state]) => [`Разрешение: ${name}`, state]);

    const deviceTokenSource = [
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

    const token = hashValue(deviceTokenSource);
    const deviceId = `N|${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 10)}K`;

    const browserInfo = [
      ["Браузер", `${browser.name} ${browser.version}`],
      ["Движок", getEngineName(ua)],
      ["ОС (оценка)", getOsName(ua, navigator.platform)],
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
      ["Java включена", typeof navigator.javaEnabled === "function" ? navigator.javaEnabled() : "Н/Д"],
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

    const systemInfo = [
      ["Операционная система", getOsName(ua, navigator.platform)],
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
      ["Цветовая схема", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"],
      ["Снижение анимаций", window.matchMedia("(prefers-reduced-motion: reduce)").matches],
      ["Контраст", prefersContrast],
      ["Принудительные цвета", window.matchMedia("(forced-colors: active)").matches],
      ["Квота хранилища", formatBytes(storageSnapshot.quota)],
      ["Использование хранилища", formatBytes(storageSnapshot.usage)],
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

    const deviceIdEl = document.getElementById("device-id");
    const featureProgressEl = document.getElementById("feature-progress");
    const featurePercentEl = document.getElementById("feature-percent");
    const featureCountEl = document.getElementById("feature-count");
    const uaSuspicionEl = document.getElementById("ua-suspicion");
    const uaSummaryEl = document.getElementById("ua-summary");
    const overviewCoreEl = document.getElementById("overview-core");
    const overviewRenderEl = document.getElementById("overview-render");
    const overviewLocaleEl = document.getElementById("overview-locale");
    const overviewPrivacyEl = document.getElementById("overview-privacy");
    const overviewPermsEl = document.getElementById("overview-perms");
    const overviewIsolationEl = document.getElementById("overview-isolation");
    const overviewStorageEl = document.getElementById("overview-storage");
    const overviewMediaEl = document.getElementById("overview-media");
    const overviewBatteryEl = document.getElementById("overview-battery");

    const permissionStats = permissionSnapshot.reduce(
      (acc, [, state]) => {
        if (state in acc) {
          acc[state] += 1;
        } else {
          acc.unsupported += 1;
        }
        return acc;
      },
      { granted: 0, denied: 0, prompt: 0, unsupported: 0 },
    );

    const storageUsageText =
      typeof storageSnapshot.usage === "number" && typeof storageSnapshot.quota === "number"
        ? `${formatBytes(storageSnapshot.usage)} / ${formatBytes(storageSnapshot.quota)}`
        : `${formatBytes(storageSnapshot.usage)} / ${formatBytes(storageSnapshot.quota)}`;
    const storageModeText = `P:${formatValue(storageSnapshot.persisted)} L:${formatValue(storageSnapshot.localStorage)} S:${formatValue(storageSnapshot.sessionStorage)}`;
    const mediaSummaryText = `Мик:${formatValue(mediaSnapshot.audioInputs)} Кам:${formatValue(mediaSnapshot.videoInputs)} Выход:${formatValue(mediaSnapshot.audioOutputs)}`;
    const batterySummaryText =
      batterySnapshot.level === "недоступно"
        ? "Battery API недоступен"
        : `${formatValue(batterySnapshot.level)} | Зарядка:${formatValue(batterySnapshot.charging)}`;
    const isolationText = `COI:${formatValue(window.crossOriginIsolated)} SC:${formatValue(window.isSecureContext)}`;
    const privacyProfileText = `DNT:${navigator.doNotTrack || "не задан"} GPC:${formatValue(navigator.globalPrivacyControl)} WD:${formatValue(navigator.webdriver)}`;
    const permissionSummaryText = `Выд:${permissionStats.granted} Зап:${permissionStats.prompt} Запр:${permissionStats.denied} Н/Д:${permissionStats.unsupported}`;
    const coreSummaryText = `${browser.name} ${browser.version} | ${getOsName(ua, navigator.platform)} | C${formatValue(navigator.hardwareConcurrency)} M${formatValue(navigator.deviceMemory)}`;
    const renderSummaryText = `${formatValue(webgl.renderer)} | DPR ${formatValue(window.devicePixelRatio)} | ${window.screen.width}x${window.screen.height}`;
    const localeSummaryText = `${formatValue(intlOptions.locale)} | ${formatValue(intlOptions.timeZone)} | ${listValues(navigator.languages, 3)}`;

    if (deviceIdEl) {
      deviceIdEl.textContent = deviceId;
    }
    if (featureProgressEl) {
      featureProgressEl.style.width = `${percent}%`;
    }
    if (featurePercentEl) {
      featurePercentEl.textContent = `${percent}%`;
    }
    if (featureCountEl) {
      featureCountEl.textContent = `${supportedCount} / ${totalFeatures} возможностей`;
    }
    if (uaSuspicionEl) {
      const suspicionLabels = {
        none: "нет",
        low: "низкий",
        medium: "средний",
        high: "высокий",
      };
      uaSuspicionEl.textContent = suspicionLabels[suspicion.level] || suspicion.level;
      uaSuspicionEl.classList.add(`is-${suspicion.level}`);
    }
    if (uaSummaryEl) {
      uaSummaryEl.textContent = suspicion.text;
    }
    if (overviewCoreEl) {
      overviewCoreEl.textContent = coreSummaryText;
    }
    if (overviewRenderEl) {
      overviewRenderEl.textContent = renderSummaryText;
    }
    if (overviewLocaleEl) {
      overviewLocaleEl.textContent = localeSummaryText;
    }
    if (overviewPrivacyEl) {
      overviewPrivacyEl.textContent = privacyProfileText;
    }
    if (overviewPermsEl) {
      overviewPermsEl.textContent = permissionSummaryText;
    }
    if (overviewIsolationEl) {
      overviewIsolationEl.textContent = isolationText;
    }
    if (overviewStorageEl) {
      overviewStorageEl.textContent = `${storageUsageText} | ${storageModeText}`;
    }
    if (overviewMediaEl) {
      overviewMediaEl.textContent = mediaSummaryText;
    }
    if (overviewBatteryEl) {
      overviewBatteryEl.textContent = batterySummaryText;
    }

    renderDetails(document.getElementById("browser-details"), browserInfo);
    renderDetails(document.getElementById("system-details"), [...systemInfo, ...permissionEntries]);
    renderFeatureBlocks(document.getElementById("feature-list"), featureResults);
    switchTab("overview", false);
  };

  initPassport();
})();

