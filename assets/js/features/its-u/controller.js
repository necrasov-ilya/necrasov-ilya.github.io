import { FEATURE_CATALOG } from "./feature-catalog.js";
import { collectPassportData } from "./collectors.js";
import { initPassportTabs, renderDetails, renderFeatureBlocks } from "./renderer.js";

const SUSPICION_LABELS = {
  none: "нет",
  low: "низкий",
  medium: "средний",
  high: "высокий",
};

const setTextIfExists = (id, value) => {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
};

const setOverview = (overview) => {
  setTextIfExists("overview-core", overview.core);
  setTextIfExists("overview-render", overview.render);
  setTextIfExists("overview-locale", overview.locale);
  setTextIfExists("overview-privacy", overview.privacy);
  setTextIfExists("overview-perms", overview.permissions);
  setTextIfExists("overview-isolation", overview.isolation);
  setTextIfExists("overview-storage", overview.storage);
  setTextIfExists("overview-media", overview.media);
  setTextIfExists("overview-battery", overview.battery);
};

const setSuspicion = (suspicion) => {
  const levelNode = document.getElementById("ua-suspicion");
  const summaryNode = document.getElementById("ua-summary");

  if (levelNode) {
    levelNode.textContent = SUSPICION_LABELS[suspicion.level] || suspicion.level;

    ["is-none", "is-low", "is-medium", "is-high"].forEach((className) => {
      levelNode.classList.remove(className);
    });

    levelNode.classList.add(`is-${suspicion.level}`);
  }

  if (summaryNode) {
    summaryNode.textContent = suspicion.text;
  }
};

export const initItsUPassport = async () => {
  const tabButtons = Array.from(document.querySelectorAll(".window-tab"));
  const tabPanels = Array.from(document.querySelectorAll(".window-panel"));

  if (tabButtons.length === 0 || tabPanels.length === 0) {
    return;
  }

  const tabLoader = document.getElementById("tab-loader");
  const windowBody = document.getElementById("window-body");

  const { switchTab } = initPassportTabs({
    tabButtons,
    tabPanels,
    tabLoader,
    windowBody,
  });

  const data = await collectPassportData(FEATURE_CATALOG);

  setTextIfExists("device-id", data.deviceId);

  const progressNode = document.getElementById("feature-progress");
  if (progressNode) {
    progressNode.style.width = `${data.featureMetrics.percent}%`;
  }

  setTextIfExists("feature-percent", `${data.featureMetrics.percent}%`);
  setTextIfExists(
    "feature-count",
    `${data.featureMetrics.supportedCount} / ${data.featureMetrics.totalFeatures} возможностей`,
  );

  setSuspicion(data.suspicion);
  setOverview(data.overview);

  renderDetails(document.getElementById("browser-details"), data.browserDetails);
  renderDetails(document.getElementById("system-details"), [
    ...data.systemDetails,
    ...data.permissionEntries,
  ]);
  renderFeatureBlocks(document.getElementById("feature-list"), data.featureResults);

  switchTab("overview", false);
};
