(() => {
  const tabButtons = Array.from(document.querySelectorAll(".window-tab"));
  const tabPanels = Array.from(document.querySelectorAll(".window-panel"));

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

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tabTarget || "overview");
    });
  });

  const featureChecks = [
    { name: "CSS Grid", test: () => typeof CSS !== "undefined" && CSS.supports("display", "grid") },
    { name: "CSS Subgrid", test: () => typeof CSS !== "undefined" && CSS.supports("grid-template-rows", "subgrid") },
    { name: "Container Queries", test: () => typeof CSS !== "undefined" && CSS.supports("container-type", "inline-size") },
    { name: "WebGL", test: () => typeof WebGLRenderingContext !== "undefined" },
    { name: "WebGPU", test: () => typeof navigator.gpu !== "undefined" },
    { name: "Service Worker", test: () => "serviceWorker" in navigator },
    { name: "Notifications", test: () => "Notification" in window },
    { name: "Web Share", test: () => "share" in navigator },
    { name: "Clipboard API", test: () => "clipboard" in navigator },
    { name: "Local Storage", test: () => "localStorage" in window },
    { name: "Session Storage", test: () => "sessionStorage" in window },
    { name: "WebRTC", test: () => "RTCPeerConnection" in window },
    { name: "WebSocket", test: () => "WebSocket" in window },
    { name: "Geolocation", test: () => "geolocation" in navigator },
    { name: "Fetch API", test: () => "fetch" in window },
    { name: "ResizeObserver", test: () => "ResizeObserver" in window },
    { name: "IntersectionObserver", test: () => "IntersectionObserver" in window },
    { name: "Web Animations", test: () => "animate" in Element.prototype },
    { name: "MediaDevices", test: () => "mediaDevices" in navigator },
  ];

  const safeTest = (check) => {
    try {
      return Boolean(check.test());
    } catch (error) {
      return false;
    }
  };

  const featureResults = featureChecks.map((check) => ({
    name: check.name,
    supported: safeTest(check),
  }));

  const getBrowserName = (ua) => {
    if (/edg\//i.test(ua)) return "Microsoft Edge";
    if (/opr\//i.test(ua)) return "Opera";
    if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
    if (/firefox\//i.test(ua)) return "Firefox";
    if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return "Safari";
    return "Unknown";
  };

  const getEngineName = (ua) => {
    if (/applewebkit/i.test(ua) && /chrome\//i.test(ua)) return "Blink";
    if (/applewebkit/i.test(ua) && /safari\//i.test(ua) && !/chrome\//i.test(ua)) return "WebKit";
    if (/gecko\//i.test(ua) && /firefox\//i.test(ua)) return "Gecko";
    return "Unknown";
  };

  const getOsName = (ua, platform) => {
    if (/windows/i.test(ua)) return "Windows";
    if (/mac os x/i.test(ua)) return "macOS";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    if (/linux/i.test(platform)) return "Linux";
    return "Unknown";
  };

  const hashValue = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash).toString(36).toUpperCase().slice(0, 10);
  };

  const calcSuspicion = () => {
    const ua = navigator.userAgent || "";
    let score = 0;

    if (/headless|phantom|selenium|puppeteer|bot|crawler|spider/i.test(ua)) {
      score += 2;
    }

    if (navigator.webdriver) {
      score += 2;
    }

    if (Array.isArray(navigator.plugins) && navigator.plugins.length === 0) {
      score += 1;
    }

    if (score <= 0) {
      return { level: "none", text: "No suspicious patterns detected." };
    }

    if (score <= 2) {
      return { level: "low", text: "Minor automation signals were observed." };
    }

    if (score <= 3) {
      return { level: "medium", text: "Multiple automation-like traits were found." };
    }

    return { level: "high", text: "Strong automation indicators detected." };
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    return String(value);
  };

  const renderDetails = (root, entries) => {
    if (!root) {
      return;
    }

    root.innerHTML = entries
      .map(([key, value]) => `<dt>${key}</dt><dd>${formatValue(value)}</dd>`)
      .join("");
  };

  const renderFeatures = (root, entries) => {
    if (!root) {
      return;
    }

    root.innerHTML = entries
      .map(
        (item) => `
          <li>
            <span>${item.name}</span>
            <span class="feature-state ${item.supported ? "supported" : "unsupported"}">${item.supported ? "Supported" : "Unsupported"}</span>
          </li>
        `,
      )
      .join("");
  };

  const supportedCount = featureResults.filter((item) => item.supported).length;
  const totalFeatures = featureResults.length;
  const percent = Math.round((supportedCount / totalFeatures) * 100);

  const deviceTokenSource = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    window.screen.width,
    window.screen.height,
  ].join("|");

  const deviceId = `N|${hashValue(deviceTokenSource).slice(0, 4)}-${hashValue(deviceTokenSource).slice(4, 8)}-${hashValue(deviceTokenSource).slice(8, 10)}K`;
  const suspicion = calcSuspicion();

  const browserInfo = [
    ["Browser", getBrowserName(navigator.userAgent)],
    ["Engine", getEngineName(navigator.userAgent)],
    ["User Agent", navigator.userAgent],
    ["Language", navigator.language],
    ["Cookies Enabled", navigator.cookieEnabled],
    ["Online", navigator.onLine],
  ];

  const systemInfo = [
    ["Operating System", getOsName(navigator.userAgent, navigator.platform)],
    ["Platform", navigator.platform],
    ["Device Memory (GB)", navigator.deviceMemory],
    ["CPU Cores", navigator.hardwareConcurrency],
    ["Screen", `${window.screen.width} x ${window.screen.height}`],
    ["Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone],
  ];

  const deviceIdEl = document.getElementById("device-id");
  const featureProgressEl = document.getElementById("feature-progress");
  const featurePercentEl = document.getElementById("feature-percent");
  const featureCountEl = document.getElementById("feature-count");
  const uaSuspicionEl = document.getElementById("ua-suspicion");
  const uaSummaryEl = document.getElementById("ua-summary");

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
    featureCountEl.textContent = `${supportedCount} / ${totalFeatures} features`;
  }

  if (uaSuspicionEl) {
    uaSuspicionEl.textContent = suspicion.level;
    uaSuspicionEl.classList.add(`is-${suspicion.level}`);
  }

  if (uaSummaryEl) {
    uaSummaryEl.textContent = suspicion.text;
  }

  renderDetails(document.getElementById("browser-details"), browserInfo);
  renderDetails(document.getElementById("system-details"), systemInfo);
  renderFeatures(document.getElementById("feature-list"), featureResults);
})();
