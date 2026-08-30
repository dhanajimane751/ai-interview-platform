import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Mic, Volume2, Wifi, MonitorCheck, ShieldCheck,
  CheckCircle2, XCircle, Loader2, ArrowRight,
} from "lucide-react";

const CHECKS = [
  { id: "browser", label: "Browser compatibility", Icon: MonitorCheck },
  { id: "camera", label: "Camera access", Icon: Camera },
  { id: "mic", label: "Microphone access", Icon: Mic },
  { id: "speaker", label: "Speaker output", Icon: Volume2 },
  { id: "network", label: "Network connection", Icon: Wifi },
  { id: "proctor", label: "Proctoring engine", Icon: ShieldCheck },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function SystemCheck() {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState(
    Object.fromEntries(CHECKS.map((c) => [c.id, "pending"]))
  );
  const [currentStep, setCurrentStep] = useState(-1);
  const [micLevel, setMicLevel] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const setStatus = (id, status) => setStatuses((prev) => ({ ...prev, [id]: status }));

  const runChecksSequentially = useCallback(async () => {
    setCurrentStep(0);
    setStatus("browser", "running");
    await wait(1100);
    const supported = "speechSynthesis" in window && "MediaRecorder" in window;
    setStatus("browser", supported ? "pass" : "fail");
    await wait(700);

    setCurrentStep(1);
    setStatus("camera", "running");
    await wait(900);
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("camera", "pass");
    } catch {
      setStatus("camera", "fail");
    }
    await wait(700);

    setCurrentStep(2);
    setStatus("mic", "running");
    await wait(900);
    if (stream && stream.getAudioTracks().length > 0) {
      setStatus("mic", "pass");
      monitorMicLevel(stream);
    } else {
      setStatus("mic", "fail");
    }
    await wait(700);

    setCurrentStep(3);
    setStatus("speaker", "running");
    await wait(1000);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      setStatus("speaker", "pass");
    } catch {
      setStatus("speaker", "fail");
    }
    await wait(700);

    setCurrentStep(4);
    setStatus("network", "running");
    await wait(800);
    try {
      const start = performance.now();
      await fetch("/api/health", { cache: "no-store" });
      const latency = performance.now() - start;
      setStatus("network", latency < 2000 ? "pass" : "fail");
    } catch {
      setStatus("network", "fail");
    }
    await wait(700);

    setCurrentStep(5);
    setStatus("proctor", "running");
    await wait(900);
    try {
      const res = await fetch("/models/tiny_face_detector_model-weights_manifest.json", { cache: "no-store" });
      setStatus("proctor", res.ok ? "pass" : "fail");
    } catch {
      setStatus("proctor", "fail");
    }
    await wait(800);

    setAllDone(true);
  }, []);

  useEffect(() => {
    runChecksSequentially();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (audioContextRef.current) {
        if (audioContextRef.current._rafId) cancelAnimationFrame(audioContextRef.current._rafId);
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [runChecksSequentially]);

  const monitorMicLevel = (stream) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setMicLevel(avg);
      ctx._rafId = requestAnimationFrame(update);
    };
    update();
  };

  const failedChecks = Object.values(statuses).filter((s) => s === "fail").length;
  const canProceed = allDone && failedChecks === 0;

  const handleProceed = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current) {
      if (audioContextRef.current._rafId) cancelAnimationFrame(audioContextRef.current._rafId);
      audioContextRef.current.close().catch(() => {});
    }
    navigate(`/interview/${interviewId}`, { state: location.state });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-semibold text-ink mb-1.5">System check</h1>
          <p className="text-ink-muted text-base">Confirming your setup before the interview starts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Camera preview — fixed size, nothing inside it moves the layout */}
          <div className="card rounded-xl overflow-hidden aspect-video bg-base-900 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {statuses.camera !== "pass" && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-950/70">
                {statuses.camera === "fail" ? (
                  <p className="text-danger text-sm px-6 text-center">
                    Camera access denied. Check browser permissions.
                  </p>
                ) : (
                  <Loader2 size={28} className="animate-spin text-ink-muted" />
                )}
              </div>
            )}

            {/* Fixed badge row — always present, contents fade not slide, no reflow */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between pointer-events-none">
              <div
                className={`flex items-center gap-1.5 bg-base-950/70 px-3 py-1.5 rounded-full transition-opacity duration-300 ${
                  statuses.camera === "pass" ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                <span className="text-xs text-ink-muted">Camera live</span>
              </div>

              <div
                className={`flex items-center gap-1.5 bg-base-950/70 px-3 py-1.5 rounded-full transition-opacity duration-300 ${
                  statuses.mic === "pass" ? "opacity-100" : "opacity-0"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full bg-mint transition-transform duration-100"
                  style={{ transform: `scale(${1 + micLevel / 150})` }}
                />
                <span className="text-xs text-ink-muted">Mic live</span>
              </div>
            </div>
          </div>

          {/* Checklist — fixed height container, rows fade in place, no height animation */}
          <div className="card rounded-xl p-5 flex flex-col justify-center" style={{ minHeight: 280 }}>
            <div>
              {CHECKS.map((check, i) => (
                <ChecklistRow
                  key={check.id}
                  check={check}
                  status={statuses[check.id]}
                  visible={currentStep >= i}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ minHeight: 56 }}>
          <AnimatePresence mode="wait">
            {!allDone ? (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-ink-muted text-sm"
              >
                Running diagnostics — step {Math.max(currentStep + 1, 1)} of {CHECKS.length}...
              </motion.p>
            ) : canProceed ? (
              <motion.button
                key="ready"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleProceed}
                className="w-full btn-signal text-white rounded-lg py-4 text-base font-medium flex items-center justify-center gap-2"
              >
                Everything looks good — Enter interview <ArrowRight size={18} />
              </motion.button>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-danger text-sm mb-3">
                  {failedChecks} check{failedChecks > 1 ? "s" : ""} failed. Fix the issue and retry.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="border border-base-700 hover:border-base-600 text-ink rounded-lg px-6 py-2.5 text-sm font-medium transition"
                >
                  Retry checks
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({ check, status, visible }) {
  const { label, Icon } = check;

  return (
    <div style={{ height: 56 }} className="flex items-center">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              status === "pass"
                ? "bg-mint/10 text-mint"
                : status === "fail"
                ? "bg-danger/10 text-danger"
                : "bg-base-800 text-ink-muted"
            }`}
          >
            <Icon size={16} />
          </div>
          <span className="text-base text-ink font-medium">{label}</span>
        </div>

        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {status === "running" && <Loader2 size={18} className="animate-spin text-ink-muted" />}
          {status === "pass" && <CheckCircle2 size={18} className="text-mint" />}
          {status === "fail" && <XCircle size={18} className="text-danger" />}
        </div>
      </motion.div>
    </div>
  );
}

export default SystemCheck;