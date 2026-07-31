import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import WebcamPanel from "../components/interview/WebcamPanel";
import AnswerControls from "../components/interview/AnswerControls";
import WarningOverlay from "../components/interview/WarningOverlay";
import InterviewerAvatar from "../components/interview/InterviewerAvatar";
import axiosInstance from "../api/axiosInstance";
import useTextToSpeech from "../hooks/useTextToSpeech";
import useProctoring from "../hooks/useProctoring";
import { motion, AnimatePresence } from "framer-motion";

function InterviewRoom() {
  const { interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(location.state?.firstQuestion || "");
  const [mediaStream, setMediaStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const MAX_QUESTIONS = 6;
  const { speak, isSpeaking } = useTextToSpeech();
  const { warnings, tabSwitchCount, enterFullscreen, clearLatestWarning, addWarning } = useProctoring();

  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hasStarted && question) {
      speak(question);
    }
  }, [question, hasStarted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleBeginClick = () => {
    enterFullscreen();
    setHasStarted(true);
  };

  const handleSubmitAnswer = async (answerText) => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.post(`/interviews/${interviewId}/answer`, {
        answerText,
        duration: 0,
        fillerWordCount: 0,
        speechRate: 0,
        confidenceScore: 0,
        eyeContactScore: 0,
        emotion: "neutral",
        cheatingFlags: warnings.map((w) => w.message),
      });

      if (questionCount >= MAX_QUESTIONS) {
        await handleEndInterview();
        return;
      }

      setQuestion(res.data.question);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      await axiosInstance.post(`/interviews/${interviewId}/end`, {
        cheatingFlags: warnings.map((w) => w.message),
      });
      navigate(`/report/${interviewId}`);
    } catch (err) {
      setError("Failed to end interview");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Background studio lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <WarningOverlay warning={warnings[warnings.length - 1]} onDismiss={clearLatestWarning} />

      {/* Pre-interview entrance modal */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-6"
          >
            <div className="bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                🎙️
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                Ready for your AI Interview?
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Please make sure you are in a quiet, well-lit environment. Entering the room will
                launch full-screen mode and activate audio-visual monitoring.
              </p>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-around mb-8">
                <span className="flex items-center gap-1.5">📷 Camera Ready</span>
                <span className="h-3 w-px bg-slate-800" />
                <span className="flex items-center gap-1.5">🎙️ Mic Active</span>
                <span className="h-3 w-px bg-slate-800" />
                <span className="flex items-center gap-1.5">🛡️ Proctoring On</span>
              </div>

              <button
                onClick={handleBeginClick}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-xl transition shadow-lg shadow-indigo-500/20"
              >
                Enter Interview Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top header control bar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white">Live AI Assessment Session</h1>
            <span className="text-slate-400 text-xs font-mono">{formatTime(elapsed)} elapsed</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-1.5 max-w-xs w-full px-4">
          <div className="flex justify-between w-full text-xs text-slate-400 font-medium">
            <span>Progress</span>
            <span>Question {questionCount} of {MAX_QUESTIONS}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
              animate={{ width: `${(questionCount / MAX_QUESTIONS) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tabSwitchCount > 0 && (
            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 animate-pulse">
              <span>⚠️</span>
              <span>{tabSwitchCount} Tab Switch{tabSwitchCount > 1 ? "es" : ""}</span>
            </div>
          )}
          <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 text-xs font-medium md:hidden">
            Q{questionCount}/{MAX_QUESTIONS}
          </div>
        </div>
      </header>

      {/* Main studio viewport */}
      <main className="flex-1 relative flex flex-col max-w-6xl w-full mx-auto p-4 md:p-6 gap-4 overflow-hidden">
        {/* Main stage panel — AI interviewer */}
        <div className="relative flex-1 min-h-[400px] bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-center items-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 backdrop-blur-md text-xs font-medium text-slate-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
              AI Evaluator
            </span>
          </div>

          <div className="w-full h-full flex items-center justify-center p-2">
            <InterviewerAvatar isSpeaking={isSpeaking} />
          </div>

          {/* Picture-in-picture webcam — single container, no nested absolutes */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-4 right-4 z-20 w-44 md:w-56 aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 group"
          >
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300 backdrop-blur-sm">
              You (Candidate)
            </div>
            {hasStarted && (
              <WebcamPanel
                onStreamReady={(stream) => setMediaStream(stream)}
                onProctorWarning={(message) => addWarning(message)}
              />
            )}
          </motion.div>
        </div>

        {/* Question display card */}
        <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-xl p-4 md:p-5 text-center shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
            Current Question
          </div>
          <p className="text-base md:text-lg font-medium text-slate-100 leading-snug">
            {question || "Connecting to interviewer..."}
          </p>
        </div>
      </main>

      {/* Bottom control bar */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-400 text-xs font-medium text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5"
            >
              {error}
            </motion.p>
          )}

          <div className="w-full flex justify-center">
            <AnswerControls
              question={question}
              isSpeaking={isSpeaking}
              onSubmitAnswer={handleSubmitAnswer}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleEndInterview}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border border-transparent hover:border-rose-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            End Session Early
          </button>
        </div>
      </footer>
    </div>
  );
}

export default InterviewRoom;