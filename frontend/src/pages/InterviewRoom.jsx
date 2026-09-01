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
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 shadow-inner">
                <Mic
                  size={32}
                  className="text-indigo-300"
                />
              </div>

              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
                Ready for your AI Interview?
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-slate-400">
                Please make sure you
                are in a quiet,
                well-lit environment.
                Entering the interview
                will enable camera,
                microphone, fullscreen,
                and proctoring features.
              </p>

              <div className="mb-8 flex items-center justify-around rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Camera
                    size={14}
                  />
                  Camera Ready
                </span>

                <span className="h-3 w-px bg-slate-800" />

                <span className="flex items-center gap-1.5">
                  <Mic size={14} />
                  Mic Active
                </span>

                <span className="h-3 w-px bg-slate-800" />

                <span className="flex items-center gap-1.5">
                  <ShieldCheck
                    size={14}
                  />
                  Proctoring On
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
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
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-3.5 font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-cyan-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {initialLoading
                  ? "Loading Interview..."
                  : "Enter Interview Room"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="z-10 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-4 py-3.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </div>

          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              Live AI Assessment
              Session
            </h1>

            <span className="font-mono text-xs text-slate-400">
              {formatTime(
                elapsed
              )}{" "}
              elapsed
            </span>
          </div>
        </div>

        <div className="hidden w-full max-w-xs flex-col gap-1.5 px-4 md:flex">
          <div className="flex w-full justify-between text-xs font-medium text-slate-400">
            <span>
              Progress
            </span>

            <span>
              Question{" "}
              {Math.min(
                questionCount,
                MAX_QUESTIONS
              )}{" "}
              of{" "}
              {MAX_QUESTIONS}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
              animate={{
                width: `${
                  (Math.min(
                    questionCount,
                    MAX_QUESTIONS
                  ) /
                    MAX_QUESTIONS) *
                  100
                }%`,
              }}
              transition={{
                duration: 0.5,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {tabSwitchCount >
            0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 sm:px-3">
              <span>
                ⚠️
              </span>

              <span className="hidden sm:inline">
                {tabSwitchCount} Tab Switch
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
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              isFullscreen
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}
          >
            <span className="hidden sm:inline">
              {isFullscreen
                ? "Fullscreen"
                : "Fullscreen Off"}
            </span>

            <span className="sm:hidden">
              {isFullscreen
                ? "FS"
                : "FS Off"}
            </span>
          </div>

          <div className="rounded-full border border-slate-700/50 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300 md:hidden">
            Q
            {Math.min(
              questionCount,
              MAX_QUESTIONS
            )}
            /
            {MAX_QUESTIONS}
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden p-3 sm:p-4 md:gap-4 md:p-6">
        <div className="relative flex min-h-[380px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-2xl md:min-h-[420px]">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
              <span
                className={`h-2 w-2 rounded-full ${
                  isSpeaking
                    ? "animate-ping bg-cyan-400"
                    : "bg-slate-500"
                }`}
              />

              AI Interviewer
            </span>
          </div>

          <div className="flex h-full w-full items-center justify-center p-2">
            <InterviewerAvatar
              isSpeaking={
                isSpeaking
              }
            />
          </div>

          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="group absolute bottom-4 right-4 z-20 aspect-video w-40 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-2xl sm:w-48 md:w-56"
          >
            <div className="absolute left-2 top-2 z-10 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-300 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
              You
            </div>

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
        </div>

        <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/80 p-4 text-center shadow-lg backdrop-blur-md sm:p-5">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
            Current Question
          </div>

          <p className="text-base font-medium leading-snug text-slate-100 sm:text-lg">
            {initialLoading
              ? "Loading interviewer..."
              : error
              ? error
              : question ||
                "Connecting to interviewer..."}
          </p>
        </div>
      </main>

      <footer className="z-10 border-t border-slate-800/80 bg-slate-900/60 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3">
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
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-center text-xs font-medium text-rose-400"
            >
              {error}
            </motion.p>
          )}

          <div className="flex w-full justify-center">
            <AnswerControls
              question={question}
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
            className="flex items-center gap-2 rounded-lg border border-transparent px-4 py-1.5 text-xs font-medium text-slate-400 transition hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            End Session Early
          </button>
        </div>
      </footer>
    </div>
  );
}

export default InterviewRoom;