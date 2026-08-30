import React, { createContext, useContext, useEffect, useState } from "react";

const PreferencesContext = createContext();

const defaults = {
  reduceMotion: false,
  compactLayout: false,
  preferredVoice: "",
  themePreset: "midnight",
  cursorStyle: "default",
};

export const THEME_PRESETS = {
  studio: {
    name: "Studio",
    desc: "Warm graphite, signal orange",
    dark: { bg: "#141416", surface: "#1c1d20", surface2: "#202124", border: "#2e2f33", borderStrong: "#3a3b40", ink: "#edebe6", inkMuted: "#8b8d93", accent: "#FF6A3D", accentHover: "#FF7F57" },
    light: { bg: "#f7f5f1", surface: "#ffffff", surface2: "#fbfaf8", border: "#e4e1da", borderStrong: "#d3cfc6", ink: "#17181a", inkMuted: "#6b6d72", accent: "#FF6A3D", accentHover: "#FF7F57" },
  },
  midnight: {
    name: "Midnight",
    desc: "Deep violet-black, neon indigo",
    dark: { bg: "#050510", surface: "#0f0f24", surface2: "#141433", border: "#2a2a5c", borderStrong: "#3d3d7a", ink: "#e8e8ff", inkMuted: "#8688b8", accent: "#818CF8", accentHover: "#A5B4FC" },
    light: { bg: "#eef0ff", surface: "#ffffff", surface2: "#f5f6ff", border: "#d2d6f7", borderStrong: "#b0b6ef", ink: "#0a0a2e", inkMuted: "#54577e", accent: "#4F46E5", accentHover: "#6366F1" },
  },
  mono: {
    name: "Mono",
    desc: "Pure black & white, no color",
    dark: { bg: "#000000", surface: "#0d0d0d", surface2: "#151515", border: "#292929", borderStrong: "#404040", ink: "#ffffff", inkMuted: "#8a8a8a", accent: "#ffffff", accentHover: "#d4d4d4" },
    light: { bg: "#ffffff", surface: "#fafafa", surface2: "#f2f2f2", border: "#e0e0e0", borderStrong: "#c4c4c4", ink: "#000000", inkMuted: "#666666", accent: "#000000", accentHover: "#333333" },
  },
  citrus: {
    name: "Citrus",
    desc: "Cream paper, bold lime",
    dark: { bg: "#1a1a12", surface: "#242419", surface2: "#2b2b1e", border: "#3d3d28", borderStrong: "#525234", ink: "#f5f5e8", inkMuted: "#a3a382", accent: "#C4E538", accentHover: "#D4F454" },
    light: { bg: "#fdfbf0", surface: "#ffffff", surface2: "#faf8ec", border: "#e8e4c8", borderStrong: "#d4cea0", ink: "#1f1f0a", inkMuted: "#6b6b45", accent: "#7A9A00", accentHover: "#94BC00" },
  },
};

export const CURSOR_STYLES = {
  default: { name: "Default", value: "auto" },
  pointer: { name: "Pointer everywhere", value: "pointer" },
  crosshair: { name: "Crosshair", value: "crosshair" },
  none: { name: "Hidden (custom dot)", value: "none" },
};

function applyPalette(presetKey, mode) {
  const preset = THEME_PRESETS[presetKey] || THEME_PRESETS.studio;
  const p = preset[mode] || preset.dark;
  const root = document.documentElement.style;
  root.setProperty("--bg", p.bg);
  root.setProperty("--surface", p.surface);
  root.setProperty("--surface-2", p.surface2);
  root.setProperty("--border", p.border);
  root.setProperty("--border-strong", p.borderStrong);
  root.setProperty("--ink", p.ink);
  root.setProperty("--ink-muted", p.inkMuted);
  root.setProperty("--accent", p.accent);
  root.setProperty("--accent-hover", p.accentHover);
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("uiPrefs");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  // Apply palette immediately on every prefs change AND on mount
  useEffect(() => {
    localStorage.setItem("uiPrefs", JSON.stringify(prefs));
    document.documentElement.classList.toggle("reduce-motion", prefs.reduceMotion);
    document.documentElement.classList.toggle("compact", prefs.compactLayout);

    const cursor = CURSOR_STYLES[prefs.cursorStyle] || CURSOR_STYLES.default;
    document.body.style.cursor = cursor.value;

    const mode = document.documentElement.getAttribute("data-theme") || "dark";
    applyPalette(prefs.themePreset, mode);
  }, [prefs]);

  // Watch for dark/light toggle and re-apply the current preset's matching variant
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const mode = document.documentElement.getAttribute("data-theme") || "dark";
      applyPalette(prefs.themePreset, mode);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Run once immediately in case data-theme was already set before this mounted
    const mode = document.documentElement.getAttribute("data-theme") || "dark";
    applyPalette(prefs.themePreset, mode);

    return () => observer.disconnect();
  }, [prefs.themePreset]);

  const updatePref = (key, value) => setPrefs((prev) => ({ ...prev, [key]: value }));

  return (
    <PreferencesContext.Provider value={{ prefs, updatePref }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}