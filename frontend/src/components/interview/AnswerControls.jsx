import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useAudioRecorder from "../../hooks/useAudioRecorder";
import axiosInstance from "../../api/axiosInstance";

function AnswerControls({ question, onSubmitAnswer, disabled, isSpeaking }) {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [transcribing, setTranscribing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState("");
  const hasAutoStartedForQuestion = useRef(null);

  // Auto-start recording once the AI finishes speaking (with buffer, and only once per question)
  useEffect(() => {
    if (!isSpeaking && question && hasAutoStartedForQuestion.current !== question && !disabled) {
      hasAutoStartedForQuestion.current = question;
      const delay = setTimeout(() => {
        if (!isSpeaking) handleStart();
      }, 800);
      return () => clearTimeout(delay);
    }
    // eslint-disable-next-line
  }, [isSpeaking, question, disabled]);

  // Safety: force-stop recording if AI starts speaking again
  useEffect(() => {
    if (isSpeaking && isRecording) {
      stopRecording();
    }
    // eslint-disable-next-line
  }, [isSpeaking]);

  const handleStart = async () => {
    try {
      setError("");
      setLastTranscript("");
      await startRecording();
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  };

  const handleStopAndSubmit = async () => {
    const blob = await stopRecording();
    if (!blob || blob.size < 1000) {
      setError("No audio captured. Try speaking again.");
      return;
    }

    try {
      setTranscribing(true);
      setError("");

      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");

      const res = await axiosInstance.post("/speech/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const text = res.data.text?.trim();
      if (!text) {
        setError("Could not understand audio. Try again.");
        setTranscribing(false);
        return;
      }

      setLastTranscript(text);
      setTranscribing(false);
      onSubmitAnswer(text);
    } catch (err) {
      setTranscribing(false);
      setError(err.response?.data?.message || "Transcription failed. Try again.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {error && <p className="text-danger text-xs">{error}</p>}

      <div className="min-h-[40px] max-w-lg text-center">
        {transcribing ? (
          <p className="text-primary-400 text-sm">Transcribing your answer...</p>
        ) : lastTranscript ? (
          <p className="text-slate-300 text-sm line-clamp-2">{lastTranscript}</p>
        ) : (
          <p className="text-slate-600 text-sm italic">
            {isSpeaking ? "Interviewer speaking..." : isRecording ? "Recording your answer..." : "Waiting..."}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={disabled || isSpeaking || transcribing}
            className="flex items-center gap-2 btn-gradient text-white px-5 py-2.5 rounded-full font-medium disabled:opacity-40 shadow-glow text-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 rounded-full bg-white"
            />
            Start Speaking
          </button>
        ) : (
          <button
            onClick={handleStopAndSubmit}
            className="flex items-center gap-2 bg-danger hover:opacity-90 transition px-5 py-2.5 rounded-full font-medium text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Stop & Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default AnswerControls;