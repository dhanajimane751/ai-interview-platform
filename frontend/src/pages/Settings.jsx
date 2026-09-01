import { useEffect, useState } from "react";
import {
    Sun,
    Moon,
    Monitor,
    Volume2,
    Palette,
    MousePointer2,
    Zap,
    LayoutGrid,
    Play,
    Check,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import {
    usePreferences,
    THEME_PRESETS,
    CURSOR_STYLES,
} from "../context/PreferencesContext";

function Settings() {
    const { themePref, setTheme } = useTheme();
    const { prefs, updatePref } = usePreferences();

    const [voices, setVoices] = useState([]);
    const [testingVoice, setTestingVoice] = useState(false);

    /*
     * Only allow selected English male voices.
     * Browser/OS decides which of these are actually available.
     */
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();

            const allowedVoicePatterns = [
                "Google UK English Male",
                "Microsoft David",
                "Microsoft Mark",
                "Microsoft Guy",
                "Daniel",
                "Alex",
            ];

            const filtered = allVoices.filter((voice) => {
                const name = voice.name.toLowerCase();
                const lang = voice.lang.toLowerCase();

                const isEnglish =
                    lang === "en-gb" ||
                    lang === "en-us" ||
                    lang.startsWith("en-gb-") ||
                    lang.startsWith("en-us-");

                const isAllowed = allowedVoicePatterns.some((pattern) =>
                    name.includes(pattern.toLowerCase())
                );

                return isEnglish && isAllowed;
            });

            const uniqueVoices = filtered.filter(
                (voice, index, array) =>
                    index ===
                    array.findIndex(
                        (v) =>
                            v.name === voice.name &&
                            v.lang === voice.lang
                    )
            );

            uniqueVoices.sort((a, b) => {
                const aDefault = a.name
                    .toLowerCase()
                    .includes("google uk english male");

                const bDefault = b.name
                    .toLowerCase()
                    .includes("google uk english male");

                if (aDefault) return -1;
                if (bDefault) return 1;

                return a.name.localeCompare(b.name);
            });

            setVoices(uniqueVoices.slice(0, 5));
        };

        loadVoices();

        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    /*
     * If the saved voice no longer exists on the device,
     * automatically use Google UK English Male if available,
     * otherwise use the first available voice.
     */
    useEffect(() => {
        if (!voices.length) return;

        const currentExists = voices.some(
            (voice) => voice.name === prefs.preferredVoice
        );

        if (currentExists) return;

        const googleUK = voices.find((voice) =>
            voice.name
                .toLowerCase()
                .includes("google uk english male")
        );

        const fallback = googleUK || voices[0];

        if (fallback) {
            updatePref("preferredVoice", fallback.name);
        }
    }, [voices]);

    const testVoice = () => {
        if (!prefs.preferredVoice) return;

        window.speechSynthesis.cancel();

        const selectedVoice = voices.find(
            (voice) => voice.name === prefs.preferredVoice
        );

        const utterance = new SpeechSynthesisUtterance(
            "Hello, I'm your AI interviewer. Let's get started with your interview."
        );

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setTestingVoice(true);
        utterance.onend = () => setTestingVoice(false);
        utterance.onerror = () => setTestingVoice(false);

        setTestingVoice(true);
        window.speechSynthesis.speak(utterance);
    };

    const themeOptions = [
        {
            value: "light",
            label: "Light",
            description: "Bright interface",
            Icon: Sun,
        },
        {
            value: "dark",
            label: "Dark",
            description: "Easy on the eyes",
            Icon: Moon,
        },
        {
            value: "system",
            label: "System",
            description: "Follow your device",
            Icon: Monitor,
        },
    ];

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                {/* Header */}
                <div className="mb-7 sm:mb-9">
                    <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                        Settings
                    </h1>

                    <p className="text-sm sm:text-base text-ink-muted mt-1.5">
                        Personalize your MockAI experience.
                    </p>
                </div>

                {/* ================= APPEARANCE ================= */}
                <section className="card rounded-2xl p-4 sm:p-6 mb-5">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                            <Palette
                                size={17}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Appearance
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                                Choose how MockAI looks on your device.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {themeOptions.map(
                            ({ value, label, description, Icon }) => {
                                const active =
                                    themePref === value;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setTheme(value)}
                                        className={`relative text-left rounded-xl border p-4 transition ${
                                            active
                                                ? "border-signal bg-signal/10"
                                                : "border-base-700 hover:border-base-600 bg-base-900/30"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                        active
                                                            ? "bg-signal/15 text-signal"
                                                            : "bg-base-800 text-ink-muted"
                                                    }`}
                                                >
                                                    <Icon size={17} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-ink">
                                                        {label}
                                                    </p>

                                                    <p className="text-xs text-ink-muted mt-0.5">
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>

                                            {active && (
                                                <div className="w-5 h-5 rounded-full bg-signal flex items-center justify-center shrink-0">
                                                    <Check
                                                        size={12}
                                                        className="text-white"
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                {/* ================= INTERVIEWER VOICE ================= */}
                <section className="card rounded-2xl p-4 sm:p-6 mb-5">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                            <Volume2
                                size={17}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Interviewer voice
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                                Only supported English male voices are shown.
                            </p>
                        </div>
                    </div>

                    {voices.length > 0 ? (
                        <>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                <select
                                    value={prefs.preferredVoice || ""}
                                    onChange={(e) =>
                                        updatePref(
                                            "preferredVoice",
                                            e.target.value
                                        )
                                    }
                                    className="w-full min-w-0 flex-1 bg-base-800 border border-base-700 rounded-xl px-3.5 py-3 text-sm text-ink outline-none focus:border-signal transition"
                                >
                                    {voices.map((voice) => (
                                        <option
                                            key={`${voice.name}-${voice.lang}`}
                                            value={voice.name}
                                        >
                                            {voice.name}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={testVoice}
                                    disabled={testingVoice}
                                    className="sm:w-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-signal text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Play size={15} />

                                    {testingVoice
                                        ? "Playing..."
                                        : "Test voice"}
                                </button>
                            </div>

                            <div className="mt-3 rounded-xl bg-base-800/60 border border-base-700/70 px-3.5 py-3">
                                <p className="text-xs text-ink-muted leading-relaxed">
                                    Voice availability depends on your
                                    browser and operating system. Google UK
                                    English Male is preferred whenever it is
                                    available.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border border-base-700 bg-base-800/50 px-4 py-4">
                            <p className="text-sm text-ink-muted">
                                No supported English male voices were found
                                on this device.
                            </p>
                        </div>
                    )}
                </section>

                {/* ================= THEME PRESET ================= */}
                <section className="card rounded-2xl p-4 sm:p-6 mb-5">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                            <Palette
                                size={17}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Theme style
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                                Pick a visual style for the interview
                                experience.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(THEME_PRESETS).map(
                            ([key, preset]) => {
                                const active =
                                    prefs.themePreset === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() =>
                                            updatePref(
                                                "themePreset",
                                                key
                                            )
                                        }
                                        className={`relative min-w-0 text-left rounded-xl border p-3.5 transition ${
                                            active
                                                ? "border-signal ring-1 ring-signal/40"
                                                : "border-base-700 hover:border-base-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-3">
                                            <span
                                                className="w-5 h-5 rounded-full border border-black/10"
                                                style={{
                                                    background:
                                                        preset.dark.bg,
                                                }}
                                            />

                                            <span
                                                className="w-5 h-5 rounded-full border border-black/10"
                                                style={{
                                                    background:
                                                        preset.dark.surface,
                                                }}
                                            />

                                            <span
                                                className="w-5 h-5 rounded-full border border-black/10"
                                                style={{
                                                    background:
                                                        preset.dark.accent,
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-ink break-words">
                                                    {preset.name}
                                                </p>

                                                <p className="text-xs text-ink-muted mt-1 leading-relaxed break-words">
                                                    {preset.desc}
                                                </p>
                                            </div>

                                            {active && (
                                                <Check
                                                    size={16}
                                                    className="text-signal shrink-0 mt-0.5"
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                {/* ================= CURSOR ================= */}
                <section className="card rounded-2xl p-4 sm:p-6 mb-5">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                            <MousePointer2
                                size={17}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Cursor style
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                                Choose your preferred cursor appearance.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {Object.entries(CURSOR_STYLES).map(
                            ([key, style]) => {
                                const active =
                                    prefs.cursorStyle === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() =>
                                            updatePref(
                                                "cursorStyle",
                                                key
                                            )
                                        }
                                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                                            active
                                                ? "border-signal bg-signal/10"
                                                : "border-base-700 hover:border-base-600"
                                        }`}
                                    >
                                        <span className="text-sm text-ink text-left">
                                            {style.name}
                                        </span>

                                        {active && (
                                            <Check
                                                size={16}
                                                className="text-signal shrink-0"
                                            />
                                        )}
                                    </button>
                                );
                            }
                        )}
                    </div>
                </section>

                {/* ================= BEHAVIOR ================= */}
                <section className="card rounded-2xl p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-signal/10 flex items-center justify-center shrink-0">
                            <Zap
                                size={17}
                                className="text-signal"
                            />
                        </div>

                        <div>
                            <h2 className="font-display text-base sm:text-lg font-semibold text-ink">
                                Behavior
                            </h2>

                            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                                Adjust the interface to match your workflow.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Reduce motion */}
                        <label className="flex items-center justify-between gap-4 rounded-xl border border-base-700/70 px-4 py-4 cursor-pointer hover:border-base-600 transition">
                            <div className="flex items-start gap-3 min-w-0">
                                <Zap
                                    size={17}
                                    className="text-ink-muted shrink-0 mt-0.5"
                                />

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">
                                        Reduce motion
                                    </p>

                                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                                        Minimize animations across the app.
                                    </p>
                                </div>
                            </div>

                            <input
                                type="checkbox"
                                checked={Boolean(
                                    prefs.reduceMotion
                                )}
                                onChange={(e) =>
                                    updatePref(
                                        "reduceMotion",
                                        e.target.checked
                                    )
                                }
                                className="w-4 h-4 accent-[#FF6A3D] shrink-0"
                            />
                        </label>

                        {/* Compact layout */}
                        <label className="flex items-center justify-between gap-4 rounded-xl border border-base-700/70 px-4 py-4 cursor-pointer hover:border-base-600 transition">
                            <div className="flex items-start gap-3 min-w-0">
                                <LayoutGrid
                                    size={17}
                                    className="text-ink-muted shrink-0 mt-0.5"
                                />

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-ink">
                                        Compact layout
                                    </p>

                                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                                        Use tighter spacing on cards and
                                        lists.
                                    </p>
                                </div>
                            </div>

                            <input
                                type="checkbox"
                                checked={Boolean(
                                    prefs.compactLayout
                                )}
                                onChange={(e) =>
                                    updatePref(
                                        "compactLayout",
                                        e.target.checked
                                    )
                                }
                                className="w-4 h-4 accent-[#FF6A3D] shrink-0"
                            />
                        </label>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Settings;