import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Signature glowing ring behind hero */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-glow-radial blur-2xl -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 rounded-full signature-ring p-[3px] mb-8 animate-ring-spin"
      >
        <div className="w-full h-full rounded-full bg-base-950 flex items-center justify-center">
          <span className="text-2xl">🎙️</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-4xl md:text-6xl font-bold mb-4 max-w-3xl leading-tight"
      >
        Walk into your next interview{" "}
        <span className="bg-clip-text text-transparent bg-signature-gradient">
          already having done it
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-slate-400 max-w-xl mb-10 text-lg"
      >
        Practice with an AI interviewer that adapts to your resume, role, and target company —
        voice, video, and pressure included.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex gap-4 mb-16"
      >
        <Link
          to="/register"
          className="btn-gradient text-white px-7 py-3 rounded-xl font-medium shadow-glow"
        >
          Start Practicing Free
        </Link>
        <Link
          to="/login"
          className="border border-base-600 hover:border-primary-400 transition px-7 py-3 rounded-xl font-medium"
        >
          I have an account
        </Link>
      </motion.div>

      {/* Feature strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full"
      >
        {[
          { icon: "🎯", label: "Company-specific personas", desc: "Google, Amazon, Meta & more" },
          { icon: "📊", label: "Real-time scoring", desc: "Confidence, clarity, eye contact" },
          { icon: "🛡️", label: "Realistic pressure", desc: "Proctoring that mimics the real thing" },
        ].map((f) => (
          <div key={f.label} className="glass-card rounded-xl p-5 text-left">
            <span className="text-2xl">{f.icon}</span>
            <p className="font-display font-semibold mt-2">{f.label}</p>
            <p className="text-slate-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default Home;