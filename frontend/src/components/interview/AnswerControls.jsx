import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";

function AnswerControls({ question, onSubmitAnswer, disabled, isSpeaking }) {
  const {
    transcript = "",
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const silenceTimer = useRef(null);
  const hasStartedForQuestion = useRef(null);

  // Auto-start listening once the AI finishes speaking the question
  useEffect(() => {
    if (!isSpeaking && question && hasStartedForQuestion.current !== question && !disabled) {
      hasStartedForQuestion.current = question;
      resetTranscript();
      const delay = setTimeout(() => startListening(), 400);
      return () => clearTimeout(delay);
    }
  }, [isSpeaking, question, disabled]);

  // Auto-submit after ~3s of silence once user has said something
  useEffect(() => {
    if (transcript.trim()) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        stopListening();
        onSubmitAnswer(transcript.trim());
        resetTranscript();
      }, 3000);
    }
    return () => clearTimeout(silenceTimer.current);
  }, [transcript]);

  const handleManualSubmit = () => {
    if (transcript.trim()) {
      clearTimeout(silenceTimer.current);
      stopListening();
      onSubmitAnswer(transcript.trim());
      resetTranscript();
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {error && <p className="text-danger text-xs">{error}</p>}

      {/* Small transcript caption */}
      <div className="min-h-[40px] max-w-lg text-center">
        {transcript ? (
          <p className="text-slate-300 text-sm line-clamp-2">{transcript}</p>
        ) : (
          <p className="text-slate-600 text-sm italic">
            {isListening ? "Listening for your answer..." : "Waiting..."}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={disabled || isSpeaking}
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
            onClick={stopListening}
            className="flex items-center gap-2 bg-danger hover:opacity-90 transition px-5 py-2.5 rounded-full font-medium text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Stop
          </button>
        )}

        <button
          onClick={handleManualSubmit}
          disabled={!transcript.trim() || disabled}
          className="bg-base-900 border border-base-600 hover:border-primary-400 transition px-5 py-2.5 rounded-full font-medium disabled:opacity-30 text-sm"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}

export default AnswerControls;