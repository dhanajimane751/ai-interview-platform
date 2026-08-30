import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { Sun, Moon, Monitor, Zap, LayoutGrid, Volume2, Palette, MousePointer2 } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_PRESETS, CURSOR_STYLES } from "../context/PreferencesContext";

function Settings() {
    const { themePref, setTheme } = useTheme();
    const { prefs, updatePref } = usePreferences();
    const [voices, setVoices] = useState([]);

    useEffect(() => {
        const load = () => setVoices(window.speechSynthesis.getVoices());
        load();
        window.speechSynthesis.onvoiceschanged = load;
    }, []);

    const themeOptions = [
        { value: "light", label: "Light", Icon: Sun },
        { value: "dark", label: "Dark", Icon: Moon },
        { value: "system", label: "System", Icon: Monitor },
    ];

    return (
        <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
            <h1 className="font-display text-2xl font-semibold text-ink mb-1">Settings</h1>
            <p className="text-ink-muted text-sm mb-8">Customize how MockAI looks and behaves.</p>

            {/* Theme */}
            <div className="card rounded-xl p-5 mb-4">
                <h2 className="font-display text-sm font-semibold text-ink mb-3">Appearance</h2>
                <div className="grid grid-cols-3 gap-2">
                    {themeOptions.map(({ value, label, Icon }) => (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`flex flex-col items-center gap-2 py-4 rounded-lg border transition ${themePref === value
                                ? "border-signal bg-signal/10 text-signal"
                                : "border-base-700 text-ink-muted hover:border-base-600"
                                }`}
                        >
                            <Icon size={18} />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Interview voice */}
            <div className="card rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Volume2 size={16} className="text-ink-muted" />
                    <h2 className="font-display text-sm font-semibold text-ink">Interviewer voice</h2>
                </div>
                <div className="flex gap-2">
                    <select
                        value={prefs.preferredVoice}
                        onChange={(e) => updatePref("preferredVoice", e.target.value)}
                        className="flex-1 bg-base-800 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-signal transition"
                    >
                        <option value="">Auto (best available)</option>
                        {voices.map((v, i) => (
                            <option key={i} value={v.name}>
                                {v.name} ({v.lang})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(
                                "Hello, I'll be your interviewer today. Let's get started."
                            );
                            const chosen = voices.find((v) => v.name === prefs.preferredVoice);
                            if (chosen) utterance.voice = chosen;
                            window.speechSynthesis.speak(utterance);
                        }}
                        className="btn-signal text-white text-sm px-4 py-2.5 rounded-lg font-medium whitespace-nowrap"
                    >
                        Test
                    </button>
                </div>
                <p className="text-ink-muted text-xs mt-2">
                    Available voices depend on your device and browser.
                </p>
            </div>
            {/* Theme preset */}
            <div className="card rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Palette size={16} className="text-ink-muted" />
                    <h2 className="font-display text-sm font-semibold text-ink">Theme</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                        <button
                            key={key}
                            onClick={() => updatePref("themePreset", key)}
                            className={`rounded-lg border p-3 text-left transition ${prefs.themePreset === key
                                ? "border-signal ring-1 ring-signal"
                                : "border-base-700 hover:border-base-600"
                                }`}
                        >
                            <div className="flex gap-1 mb-2">
                                <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: preset.dark.bg }} />
                                <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: preset.dark.surface }} />
                                <span className="w-4 h-4 rounded-full" style={{ background: preset.dark.accent }} />
                            </div>
                            <p className="text-xs font-medium text-ink">{preset.name}</p>
                            <p className="text-[10px] text-ink-muted mt-0.5">{preset.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cursor style */}
            <div className="card rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <MousePointer2 size={16} className="text-ink-muted" />
                    <h2 className="font-display text-sm font-semibold text-ink">Cursor style</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CURSOR_STYLES).map(([key, style]) => (
                        <button
                            key={key}
                            onClick={() => updatePref("cursorStyle", key)}
                            className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left transition ${prefs.cursorStyle === key
                                ? "border-signal bg-signal/10 text-signal"
                                : "border-base-700 text-ink-muted hover:border-base-600"
                                }`}
                        >
                            {style.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Behavior toggles */}
            <div className="card rounded-xl p-5 space-y-4">
                <h2 className="font-display text-sm font-semibold text-ink mb-1">Behavior</h2>

                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                        <Zap size={16} className="text-ink-muted" />
                        <div>
                            <p className="text-sm text-ink">Reduce motion</p>
                            <p className="text-xs text-ink-muted">Minimize animations across the app</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={prefs.reduceMotion}
                        onChange={(e) => updatePref("reduceMotion", e.target.checked)}
                        className="w-4 h-4 accent-[#FF6A3D]"
                    />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5">
                        <LayoutGrid size={16} className="text-ink-muted" />
                        <div>
                            <p className="text-sm text-ink">Compact layout</p>
                            <p className="text-xs text-ink-muted">Tighter spacing on cards and lists</p>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={prefs.compactLayout}
                        onChange={(e) => updatePref("compactLayout", e.target.checked)}
                        className="w-4 h-4 accent-[#FF6A3D]"
                    />
                </label>
            </div>
        </div>
    );
}

export default Settings;