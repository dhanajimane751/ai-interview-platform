import {
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  Mic,
  Camera,
  ShieldCheck,
} from "lucide-react";

import WebcamPanel from "../components/interview/WebcamPanel";
import AnswerControls from "../components/interview/AnswerControls";
import WarningOverlay from "../components/interview/WarningOverlay";
import InterviewerAvatar from "../components/interview/InterviewerAvatar";

import axiosInstance from "../api/axiosInstance";
import useTextToSpeech from "../hooks/useTextToSpeech";
import useProctoring from "../hooks/useProctoring";

const cleanSpeechText = (text = "") => {
  return text
    .replace(
      /```[\s\S]*?```/g,
      " code "
    )
    .replace(
      /!==/g,
      " not equal strictly "
    )
    .replace(
      /===/g,
      " triple equals "
    )
    .replace(
      />=/g,
      " greater than or equal to "
    )
    .replace(
      /<=/g,
      " less than or equal to "
    )
    .replace(
      /=>/g,
      " arrow "
    )
    .replace(
      /==/g,
      " equals "
    )
    .replace(
      /!=/g,
      " not equal "
    )
    .replace(
      /&&/g,
      " and "
    )
    .replace(
      /\|\|/g,
      " or "
    )
    .replace(
      /\+\+/g,
      " increment "
    )
    .replace(
      /--/g,
      " decrement "
    )
    .replace(
      /[()[\]{}]/g,
      " "
    )
    .replace(
      /`/g,
      ""
    )
    .replace(
      /\*\*/g,
      ""
    )
    .replace(
      /\*/g,
      ""
    )
    .replace(
      /[_~]/g,
      ""
    )
    .replace(
      /#+/g,
      ""
    )
    .replace(
      /<[^>]*>/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

function InterviewRoom() {
  const { interviewId } =
    useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [question, setQuestion] =
    useState(
      location.state?.firstQuestion ||
        ""
    );

  const [mediaStream, setMediaStream] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(
      !location.state
        ?.firstQuestion
    );

  const [error, setError] =
    useState("");

  const [questionCount, setQuestionCount] =
    useState(1);

  const [elapsed, setElapsed] =
    useState(0);

  const [hasStarted, setHasStarted] =
    useState(false);

  const MAX_QUESTIONS = 6;

  const {
    speak,
    isSpeaking,
  } = useTextToSpeech();

  const {
    warnings,
    tabSwitchCount,
    isFullscreen,
    enterFullscreen,
    clearLatestWarning,
    addWarning,
    getProctoringEvents,
  } = useProctoring();

  const loadInterview =
    useCallback(
      async () => {
        if (question) {
          setInitialLoading(false);
          return;
        }

        try {
          setInitialLoading(true);
          setError("");

          const response =
            await axiosInstance.get(
              `/interviews/${interviewId}`
            );

          const interview =
            response.data?.interview;

          const answers =
            interview?.answers || [];

          const firstQuestion =
            answers[0]?.questionText ||
            "";

          if (!firstQuestion) {
            throw new Error(
              "First question not found"
            );
          }

          setQuestion(
            firstQuestion
          );

          const answeredQuestions =
            answers.filter(
              (answer) =>
                answer.answerText?.trim()
            ).length;

          setQuestionCount(
            Math.max(
              1,
              answeredQuestions + 1
            )
          );
        } catch (err) {
          console.error(
            "Failed to load interview:",
            err.response?.data ||
              err.message
          );

          setError(
            err.response?.data
              ?.message ||
              "Failed to connect to interviewer"
          );
        } finally {
          setInitialLoading(false);
        }
      },
      [
        interviewId,
        question,
      ]
    );

  useEffect(() => {
    loadInterview();
  }, [loadInterview]);

  useEffect(() => {
    const timer =
      setInterval(() => {
        setElapsed(
          (previous) =>
            previous + 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      hasStarted &&
      question &&
      !initialLoading
    ) {
      const speechText =
        cleanSpeechText(
          question
        );

      if (speechText) {
        speak(speechText);
      }
    }
  }, [
    question,
    hasStarted,
    initialLoading,
    speak,
  ]);

  const handleProctorWarning =
    useCallback(
      (event) => {
        if (!event) {
          return;
        }

        if (
          typeof event ===
          "string"
        ) {
          addWarning(
            event,
            "other"
          );

          return;
        }

        addWarning(
          event.message,
          event.type || "other"
        );
      },
      [addWarning]
    );

  const formatTime = (
    seconds
  ) => {
    const minutes =
      Math.floor(
        seconds / 60
      )
        .toString()
        .padStart(2, "0");

    const remainingSeconds = (
      seconds % 60
    )
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const handleBeginClick =
    () => {
      enterFullscreen();
      setHasStarted(true);
    };

  const handleEndInterview =
    async () => {
      try {
        setLoading(true);
        setError("");

        await axiosInstance.post(
          `/interviews/${interviewId}/end`,
          {
            cheatingFlags:
              warnings.map(
                (warning) =>
                  warning.message
              ),
            proctoringEvents:
              getProctoringEvents(),
          }
        );

        navigate(
          `/report/${interviewId}`
        );
      } catch (err) {
        console.error(
          "End interview error:",
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to end interview"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleSubmitAnswer =
    async (answerText) => {
      if (
        loading ||
        !answerText?.trim()
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await axiosInstance.post(
            `/interviews/${interviewId}/answer`,
            {
              answerText:
                answerText.trim(),

              duration: 0,

              fillerWordCount: 0,

              speechRate: 0,

              confidenceScore: 0,

              eyeContactScore: 0,

              emotion: "neutral",

              cheatingFlags:
                warnings.map(
                  (warning) =>
                    warning.message
                ),

              proctoringEvents:
                getProctoringEvents(),
            }
          );

        const nextQuestion =
          response.data?.question;

        if (!nextQuestion) {
          throw new Error(
            "Next question was not returned"
          );
        }

        if (
          questionCount >=
          MAX_QUESTIONS
        ) {
          await handleEndInterview();
          return;
        }

        setQuestion(
          nextQuestion
        );

        setQuestionCount(
          (previous) =>
            previous + 1
        );
      } catch (err) {
        console.error(
          "Submit answer error:",
          err.response?.data ||
            err.message
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to submit answer"
        );
      } finally {
        setLoading(false);
      }
    };

  const progress =
    (Math.min(
      questionCount,
      MAX_QUESTIONS
    ) /
      MAX_QUESTIONS) *
    100;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f5f6f8] font-sans text-slate-900 transition-colors duration-300 dark:bg-[#090b0f] dark:text-slate-100 select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_30%)]" />

      <WarningOverlay
        warning={
          warnings[
            warnings.length - 1
          ]
        }
        onDismiss={
          clearLatestWarning
        }
      />

      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70"
          >
            <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#11141a]">
              <div className="h-1 bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-500" />

              <div className="p-7 sm:p-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Mic
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
                      Interview room
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      Ready to begin?
                    </h2>

                    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Find a quiet and well-lit
                      space. Your camera,
                      microphone, fullscreen mode,
                      and interview monitoring will
                      be enabled when you enter.
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex flex-col items-center gap-2 border-r border-slate-200 px-3 py-4 dark:border-slate-800">
                    <Camera
                      size={17}
                      className="text-slate-700 dark:text-slate-300"
                    />

                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Camera
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 border-r border-slate-200 px-3 py-4 dark:border-slate-800">
                    <Mic
                      size={17}
                      className="text-slate-700 dark:text-slate-300"
                    />

                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Microphone
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 px-3 py-4">
                    <ShieldCheck
                      size={17}
                      className="text-slate-700 dark:text-slate-300"
                    />

                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Proctoring
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={
                    handleBeginClick
                  }
                  disabled={
                    initialLoading ||
                    !question
                  }
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {initialLoading
                    ? "Loading interview..."
                    : "Enter interview room"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative z-20 flex-shrink-0 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0d1015]/85">
        <div className="mx-auto flex min-h-[62px] max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <ShieldCheck
                size={18}
                className="text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                  Live Interview
                </h1>

                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:inline-flex dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Live
                </span>
              </div>

              <p className="font-mono text-[10px] text-slate-500 dark:text-slate-500">
                {formatTime(
                  elapsed
                )}
              </p>
            </div>
          </div>

          <div className="hidden max-w-md flex-1 px-8 md:block">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">
                Progress
              </span>

              <span className="font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400">
                {Math.min(
                  questionCount,
                  MAX_QUESTIONS
                )}{" "}
                /{" "}
                {MAX_QUESTIONS}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-slate-900 dark:bg-white"
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 0.45,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tabSwitchCount >
              0 && (
                <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                  <span className="hidden sm:inline">
                    {tabSwitchCount} tab switch
                    {tabSwitchCount >
                    1
                      ? "es"
                      : ""}
                  </span>

                  <span className="sm:hidden">
                    {tabSwitchCount}
                  </span>
                </div>
              )}

            <div
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold ${
                isFullscreen
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />

              <span className="hidden sm:inline">
                {isFullscreen
                  ? "Fullscreen"
                  : "Fullscreen off"}
              </span>

              <span className="sm:hidden">
                {isFullscreen
                  ? "FS"
                  : "FS off"}
              </span>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-600 md:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Q{" "}
              {Math.min(
                questionCount,
                MAX_QUESTIONS
              )}
              /
              {MAX_QUESTIONS}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1380px] flex-1 flex-col gap-3 overflow-hidden px-3 py-3 sm:px-5 md:px-6 lg:px-8">
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_230px]">
          <section className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[#11141a] dark:shadow-[0_15px_45px_rgba(0,0,0,0.25)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.05),transparent_55%)]" />

            <div className="absolute left-5 top-5 z-20">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSpeaking
                      ? "animate-pulse bg-blue-500"
                      : "bg-slate-400 dark:bg-slate-600"
                  }`}
                />

                AI Interviewer
              </div>
            </div>

            <div className="flex h-full min-h-0 w-full items-center justify-center p-3 sm:p-4 md:p-5">
              <div className="h-full min-h-0 w-full max-w-4xl">
                <InterviewerAvatar
                  isSpeaking={
                    isSpeaking
                  }
                />
              </div>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="absolute bottom-4 right-4 z-20 aspect-video w-28 overflow-hidden rounded-2xl border-2 border-white bg-slate-200 shadow-xl sm:w-36 md:w-40 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="absolute bottom-2 left-2 z-10 rounded-md bg-black/60 px-2 py-1 text-[9px] font-medium text-white backdrop-blur">
                You
              </div>

              <div className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />

              {hasStarted && (
                <WebcamPanel
                  onStreamReady={(
                    stream
                  ) =>
                    setMediaStream(
                      stream
                    )
                  }
                  onProctorWarning={
                    handleProctorWarning
                  }
                />
              )}
            </motion.div>
          </section>

          <aside className="flex min-h-0 flex-col gap-3">
            <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#11141a] dark:shadow-none">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Session
                  </p>

                  <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                    Interview status
                  </h2>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <ActivityIcon />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Question progress
                    </span>

                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {questionCount}/
                      {MAX_QUESTIONS}
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-slate-900 dark:bg-white"
                      animate={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-500">
                      Session time
                    </span>

                    <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                      {formatTime(
                        elapsed
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-500">
                      Camera
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ready
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-500">
                      Microphone
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-slate-500">
                      Monitoring
                    </span>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#11141a] dark:shadow-none">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Interview tip
              </p>

              <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
                Take a moment to understand each
                question. Give a clear answer with
                a short example when appropriate.
              </p>
            </section>
          </aside>
        </div>

        <section className="relative flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-[#11141a] dark:shadow-none">
          <div className="border-b border-slate-100 px-5 py-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Current question
              </span>
            </div>
          </div>

          <div className="px-5 py-3 sm:px-7 sm:py-4">
            <p className="max-w-5xl text-base font-medium leading-6 text-slate-900 dark:text-slate-100 sm:text-lg sm:leading-7">
              {initialLoading
                ? "Loading interviewer..."
                : error
                ? error
                : question ||
                  "Connecting to interviewer..."}
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-20 flex-shrink-0 border-t border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0d1015]/90">
        <div className="mx-auto flex max-w-[1380px] flex-col items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
          {error && (
            <motion.p
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-1.5 text-center text-xs font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}

          <div className="flex w-full justify-center">
            <AnswerControls
              question={
                question
              }
              isSpeaking={
                isSpeaking
              }
              onSubmitAnswer={
                handleSubmitAnswer
              }
              disabled={
                loading ||
                initialLoading ||
                !question
              }
            />
          </div>

          <button
            onClick={
              handleEndInterview
            }
            disabled={loading}
            className="flex items-center gap-2 rounded-lg px-4 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

            End session early
          </button>
        </div>
      </footer>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-600 dark:text-slate-300"
    >
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </svg>
  );
}

export default InterviewRoom;