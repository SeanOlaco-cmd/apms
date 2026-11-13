// Display preferences. Stored per device (localStorage), not per account —
// so they apply the moment the page loads, even on the login screen.
const KEY = "apms_settings";

export const DEFAULT_SETTINGS = {
  theme: "light",          // "light" | "dark" | "system"
  animations: true,
  textSize: "default",     // "small" | "default" | "large"
  density: "comfortable",  // "comfortable" | "compact"
  autoLogout: 0,           // minutes of inactivity, 0 = never
};

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

function resolveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveTheme(settings.theme));
  root.setAttribute("data-animations", settings.animations ? "on" : "off");
  root.setAttribute("data-density", settings.density);
  root.style.fontSize =
    settings.textSize === "small" ? "14px" : settings.textSize === "large" ? "18px" : "16px";
}