import { motion } from "framer-motion";
import { User } from "lucide-react";

function InterviewerAvatar({ isSpeaking, companyName }) {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-base-800 to-base-900 rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="absolute w-72 h-72 bg-glow-radial blur-3xl" />

      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          animate={isSpeaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1.2 }}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full signature-ring p-[4px]"
        >
          <div className="w-full h-full rounded-full bg-base-900 flex items-center justify-center">
            <User size={56} className="text-ink-muted" />
          </div>
        </motion.div>

        <div className="text-center">
          <p className="font-display font-semibold text-ink">{companyName || "AI"} Interviewer</p>
          <p className="text-ink-muted text-xs">{isSpeaking ? "Speaking" : "Listening"}</p>
        </div>

        <div className="flex items-center gap-1 h-6">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-primary-400"
              animate={isSpeaking ? { height: [6, 20, 6] } : { height: 6 }}
              transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.6, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
        <span className="text-xs text-slate-300">Live Interview</span>
      </div>
    </div>
  );
}

export default InterviewerAvatar;