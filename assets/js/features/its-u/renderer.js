import { escapeHtml, formatBytes } from "../../shared/format.js";

const LOCALIZATION_MAP = {
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

const BYTE_FIELDS = new Set(["Квота хранилища", "Использование хранилища"]);

export const formatPassportValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Н/Д";
  }

  if (typeof value === "string" && value in LOCALIZATION_MAP) {
    return LOCALIZATION_MAP[value];
  }

  if (typeof value === "boolean") {
    return value ? "Да" : "Нет";
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return "Н/Д";
    }

    return String(value);
  }

  return String(value);
};

export const formatPassportBytes = (value) => {
  if (typeof value === "number") {
    return formatBytes(value);
  }

  return formatPassportValue(value);
};

export const initPassportTabs = ({ tabButtons, tabPanels, tabLoader, windowBody }) => {
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

  return {
    switchTab,
  };
};

export const renderDetails = (root, entries) => {
  if (!root) {
    return;
  }

  root.innerHTML = entries
    .map(([key, value]) => {
      const printableValue = BYTE_FIELDS.has(key)
        ? formatPassportBytes(value)
        : formatPassportValue(value);
      return `<div class="detail-row"><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(printableValue)}</dd></div>`;
    })
    .join("");
};

export const renderFeatureBlocks = (root, entries) => {
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
          <p class="feature-name">${escapeHtml(item.name)}</p>
        </article>
      `,
    )
    .join("");
};
