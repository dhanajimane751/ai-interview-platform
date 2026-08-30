
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  Volume2,
  Wifi,
  MonitorCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

const CHECKS = [
  {
    id: "browser",
    label: "Browser compatibility",
    Icon: MonitorCheck,
  },
  {
    id: "camera",
    label: "Camera access",
    Icon: Camera,
  },
  {
    id: "mic",
    label: "Microphone access",
    Icon: Mic,
  },
  {
    id: "speaker",
    label: "Speaker output",
    Icon: Volume2,
  },
  {
    id: "network",
    label: "Network connection",
    Icon: Wifi,
  },
  {
    id: "proctor",
    label: "Proctoring engine",
    Icon: ShieldCheck,
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function SystemCheck() {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [statuses, setStatuses] = useState(
    Object.fromEntries(
      CHECKS.map((check) => [check.id, "pending"])
    )
  );

  const [currentStep, setCurrentStep] = useState(-1);
  const [micLevel, setMicLevel] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const pageRef = useRef(null);

  const setStatus = (id, status) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const monitorMicLevel = (stream) => {
    const ctx = new (window.AudioContext ||
      window.webkitAudioContext)();

    audioContextRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;

    source.connect(analyser);

    const data = new Uint8Array(
      analyser.frequencyBinCount
    );

    const update = () => {
      analyser.getByteFrequencyData(data);

      const average =
        data.reduce((a, b) => a + b, 0) / data.length;

      setMicLevel(average);

      ctx._rafId = requestAnimationFrame(update);
    };

    update();
  };

  const runChecksSequentially = useCallback(async () => {
    setCurrentStep(0);
    setStatus("browser", "running");

    await wait(1100);

    const supported =
      "speechSynthesis" in window &&
      "MediaRecorder" in window;

    setStatus(
      "browser",
      supported ? "pass" : "fail"
    );

    await wait(600);

    setCurrentStep(1);
    setStatus("camera", "running");

    await wait(900);

    let stream = null;

    try {
      stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setStatus("camera", "pass");
    } catch {
      setStatus("camera", "fail");
    }

    await wait(600);

    setCurrentStep(2);
    setStatus("mic", "running");

    await wait(900);

    if (
      stream &&
      stream.getAudioTracks().length > 0
    ) {
      setStatus("mic", "pass");
      monitorMicLevel(stream);
    } else {
      setStatus("mic", "fail");
    }

    await wait(600);

    setCurrentStep(3);
    setStatus("speaker", "running");

    await wait(1000);

    try {
      const ctx = new (window.AudioContext ||
        window.webkitAudioContext)();

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

    await wait(600);

    setCurrentStep(4);
    setStatus("network", "running");

    await wait(800);

    try {
      const start = performance.now();

      await fetch("/api/health", {
        cache: "no-store",
      });

      const latency = performance.now() - start;

      setStatus(
        "network",
        latency < 2000 ? "pass" : "fail"
      );
    } catch {
      setStatus("network", "fail");
    }

    await wait(600);

    setCurrentStep(5);
    setStatus("proctor", "running");

    await wait(900);

    try {
      const response = await fetch(
        "/models/tiny_face_detector_model-weights_manifest.json",
        {
          cache: "no-store",
        }
      );

      setStatus(
        "proctor",
        response.ok ? "pass" : "fail"
      );
    } catch {
      setStatus("proctor", "fail");
    }

    await wait(700);

    setAllDone(true);
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      return;
    }

    try {
      const element =
        pageRef.current || document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      // Browser may require a user gesture.
    }
  }, []);

  useEffect(() => {
    runChecksSequentially();

    // Best effort fullscreen attempt.
    enterFullscreen();

    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    const handleFirstInteraction = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    window.addEventListener(
      "pointerdown",
      handleFirstInteraction,
      { once: true }
    );

    window.addEventListener(
      "keydown",
      handleFirstInteraction,
      { once: true }
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      window.removeEventListener(
        "pointerdown",
        handleFirstInteraction
      );

      window.removeEventListener(
        "keydown",
        handleFirstInteraction
      );

      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;

      if (audioContextRef.current) {
        if (audioContextRef.current._rafId) {
          cancelAnimationFrame(
            audioContextRef.current._rafId
          );
        }

        audioContextRef.current
          .close()
          .catch(() => {});

        audioContextRef.current = null;
      }
    };
  }, [runChecksSequentially, enterFullscreen]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {}
    } else {
      await enterFullscreen();
    }
  };

  const failedChecks = Object.values(statuses).filter(
    (status) => status === "fail"
  ).length;

  const passedChecks = Object.values(statuses).filter(
    (status) => status === "pass"
  ).length;

  const canProceed =
    allDone && failedChecks === 0;

  const progress =
    (passedChecks / CHECKS.length) * 100;

  const handleProceed = () => {
    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    if (audioContextRef.current) {
      if (audioContextRef.current._rafId) {
        cancelAnimationFrame(
          audioContextRef.current._rafId
        );
      }

      audioContextRef.current
        .close()
        .catch(() => {});
    }

    navigate(`/interview/${interviewId}`, {
      state: location.state,
    });
  };

  return (
    <div
      ref={pageRef}
      className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-base-950 text-ink"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-signal/[0.025] blur-[110px]" />
      </div>

      {/* Safe responsive shell */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}
        <header className="flex flex-shrink-0 items-center justify-between gap-4 pb-4 sm:pb-5">

          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-signal" />

              <span className="text-xs font-bold tracking-[0.16em] text-signal">
                MOCKAI
              </span>
            </div>

            <h1
              className="font-display font-semibold tracking-tight"
              style={{
                fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)",
              }}
            >
              Get ready for your interview
            </h1>

            <p
              className="mt-1 text-ink-muted"
              style={{
                fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
              }}
            >
              We'll quickly check your interview environment.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-ink-muted transition hover:border-base-600 hover:bg-base-800 hover:text-ink sm:h-11 sm:w-11"
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
          >
            {isFullscreen ? (
              <Minimize2 size={17} />
            ) : (
              <Maximize2 size={17} />
            )}
          </button>
        </header>

        {/* ================= MAIN ================= */}
        <main className="min-h-0 flex-1">

          <div
            className="
              grid
              h-full
              min-h-0
              grid-cols-1
              gap-4
              lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]
              xl:grid-cols-[380px_minmax(0,1fr)]
            "
          >

            {/* ================= CAMERA ================= */}
            <section className="flex min-h-0 flex-col">

              {/* Camera card */}
              <div className="rounded-2xl border border-base-700 bg-base-900 p-3.5 shadow-xl shadow-black/10 sm:p-4">

                <div className="mb-3 flex items-center justify-between">

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Camera preview
                    </p>

                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      Make sure you are clearly visible
                    </p>
                  </div>

                  {statuses.camera === "pass" && (
                    <div className="ml-3 flex flex-shrink-0 items-center gap-1.5 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-semibold text-mint">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      Ready
                    </div>
                  )}

                  {statuses.camera === "running" && (
                    <div className="ml-3 flex flex-shrink-0 items-center gap-1.5 rounded-full bg-signal/10 px-2.5 py-1 text-[10px] font-semibold text-signal">
                      <Loader2
                        size={11}
                        className="animate-spin"
                      />
                      Checking
                    </div>
                  )}

                  {statuses.camera === "fail" && (
                    <div className="ml-3 flex-shrink-0 rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-semibold text-danger">
                      Failed
                    </div>
                  )}
                </div>

                {/* Camera */}
                <div className="relative aspect-video overflow-hidden rounded-xl border border-base-700 bg-black">

                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  {/* Loading state */}
                  {statuses.camera !== "pass" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-950/80 backdrop-blur-sm">

                      {statuses.camera === "fail" ? (
                        <div className="px-6 text-center">
                          <XCircle
                            size={28}
                            className="mx-auto mb-3 text-danger"
                          />

                          <p className="text-sm font-semibold">
                            Camera access denied
                          </p>

                          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                            Allow camera permission and retry.
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Loader2
                            size={28}
                            className="mx-auto mb-3 animate-spin text-signal"
                          />

                          <p className="text-sm font-semibold">
                            Connecting camera
                          </p>

                          <p className="mt-1.5 text-xs text-ink-muted">
                            Please allow access when prompted.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Camera / Mic badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">

                    <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />

                      <span className="text-[10px] font-medium text-white">
                        Camera
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-signal transition-transform duration-100"
                        style={{
                          transform: `scale(${
                            1 + micLevel / 150
                          })`,
                        }}
                      />

                      <span className="text-[10px] font-medium text-white">
                        Mic
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camera note */}
                <div className="mt-3 flex items-start gap-2">
                  <ShieldCheck
                    size={14}
                    className="mt-0.5 flex-shrink-0 text-mint"
                  />

                  <p className="text-xs leading-relaxed text-ink-muted">
                    Sit somewhere quiet and make sure your face is well lit.
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-3 rounded-2xl border border-base-700 bg-base-900 p-4">

                <p className="text-xs font-semibold">
                  Quick tips
                </p>

                <div className="mt-3 space-y-2.5">
                  <Tip text="Keep your face centered in the frame" />
                  <Tip text="Use a quiet, well-lit room" />
                  <Tip text="Keep a stable internet connection" />
                </div>
              </div>
            </section>

            {/* ================= CHECKS ================= */}
            <section className="flex min-h-0 flex-col rounded-2xl border border-base-700 bg-base-900">

              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-base-800 px-4 py-4 sm:px-5">

                <div>
                  <h2 className="text-base font-semibold sm:text-lg">
                    System check
                  </h2>

                  <p className="mt-1 text-xs text-ink-muted">
                    Verifying everything required for your interview
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-semibold">
                    {passedChecks}
                    <span className="text-sm text-ink-muted">
                      /{CHECKS.length}
                    </span>
                  </p>

                  <p className="text-[9px] text-ink-muted">
                    passed
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex-shrink-0 px-4 pt-4 sm:px-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-base-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${progress}%`,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className="h-full rounded-full bg-signal"
                  />
                </div>
              </div>

              {/* Rows */}
              <div className="min-h-0 flex-1 overflow-hidden px-2 py-2 sm:px-3">

                <div className="divide-y divide-base-800">
                  {CHECKS.map((check, index) => (
                    <CheckRow
                      key={check.id}
                      check={check}
                      status={statuses[check.id]}
                      visible={
                        currentStep >= index
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 px-4 pb-4 sm:px-5">

                <div
                  className={`rounded-xl border p-3.5 ${
                    canProceed
                      ? "border-mint/20 bg-mint/5"
                      : failedChecks > 0 && allDone
                      ? "border-danger/20 bg-danger/5"
                      : "border-base-800 bg-base-950/60"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                        canProceed
                          ? "bg-mint/10 text-mint"
                          : failedChecks > 0 && allDone
                          ? "bg-danger/10 text-danger"
                          : "bg-signal/10 text-signal"
                      }`}
                    >
                      {canProceed ? (
                        <CheckCircle2 size={18} />
                      ) : failedChecks > 0 &&
                        allDone ? (
                        <XCircle size={18} />
                      ) : (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold">
                        {canProceed
                          ? "You're ready to begin"
                          : failedChecks > 0 && allDone
                          ? "Something needs your attention"
                          : "Checking your setup"}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-ink-muted">
                        {canProceed
                          ? "All required systems are working."
                          : failedChecks > 0 && allDone
                          ? "Fix the failed check before continuing."
                          : "This will only take a moment."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="flex-shrink-0 pt-3">

          <AnimatePresence mode="wait">

            {!allDone ? (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2.5 py-2 text-xs text-ink-muted"
              >
                <Loader2
                  size={14}
                  className="animate-spin text-signal"
                />

                <span>
                  Checking your setup...
                </span>
              </motion.div>
            ) : canProceed ? (
              <motion.button
                key="ready"
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  y: -1,
                }}
                whileTap={{
                  scale: 0.99,
                }}
                onClick={handleProceed}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-signal px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-signal/10 transition hover:brightness-110 sm:text-base"
              >
                Everything is ready

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </motion.button>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <XCircle
                    size={18}
                    className="flex-shrink-0 text-danger"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-danger">
                      {failedChecks} check
                      {failedChecks > 1
                        ? "s"
                        : ""}{" "}
                      failed
                    </p>

                    <p className="truncate text-[10px] text-ink-muted">
                      Fix the issue and retry.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="ml-3 flex-shrink-0 rounded-lg border border-base-700 bg-base-900 px-4 py-2 text-xs font-semibold transition hover:bg-base-800"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="py-1.5 text-center text-[9px] text-ink-muted">
            Secure setup · Camera and microphone are only used during your interview
          </p>
        </footer>
      </div>
    </div>
  );
}

function CheckRow({
  check,
  status,
  visible,
}) {
  const { label, Icon } = check;

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -8,
      }}
      animate={
        visible
          ? {
              opacity: 1,
              x: 0,
            }
          : {
              opacity: 0,
              x: -8,
            }
      }
      transition={{
        duration: 0.3,
      }}
      className="flex items-center justify-between px-2.5 py-3.5"
    >
      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
            status === "pass"
              ? "bg-mint/10 text-mint"
              : status === "fail"
              ? "bg-danger/10 text-danger"
              : status === "running"
              ? "bg-signal/10 text-signal"
              : "bg-base-800 text-ink-muted"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-ink-muted sm:text-[11px]">
            {status === "pass"
              ? "Verified successfully"
              : status === "fail"
              ? "Action required"
              : status === "running"
              ? "Checking..."
              : "Waiting"}
          </p>
        </div>
      </div>

      <div className="ml-3 flex h-7 w-7 flex-shrink-0 items-center justify-center">

        {status === "running" && (
          <Loader2
            size={17}
            className="animate-spin text-signal"
          />
        )}

        {status === "pass" && (
          <CheckCircle2
            size={19}
            className="text-mint"
          />
        )}

        {status === "fail" && (
          <XCircle
            size={19}
            className="text-danger"
          />
        )}

        {status === "pending" && (
          <span className="h-2 w-2 rounded-full bg-base-700" />
        )}
      </div>
    </motion.div>
  );
}

function Tip({ text }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-mint/10">
        <CheckCircle2
          size={11}
          className="text-mint"
        />
      </div>

      <span className="text-xs text-ink-muted">
        {text}
      </span>
    </div>
  );
}

export default SystemCheck;
