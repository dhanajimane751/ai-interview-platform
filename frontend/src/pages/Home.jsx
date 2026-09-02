import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Target,
  BarChart3,
  ShieldCheck,
  Zap,
  Check,
  Video,
  FileText,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Gift,
  Heart,
  Globe,
  Unlock,
} from "lucide-react";

const HERO_STATS = [
  { value: "100%", label: "Free forever, no credit card" },
  { value: "150k+", label: "Mock interviews completed" },
  { value: "4.9/5", label: "Candidate rating" },
];

const FEATURES = [
  {
    id: "personas",
    icon: Target,
    title: "Company-Specific Personas",
    shortDesc: "Google, Amazon, Meta & 500+ top tech companies",
    longDesc:
      "Our AI adapts directly to known company rubrics, culture codes, and historical interview styles. Practice Leadership Principles with Amazon or System Design with Meta — completely free.",
    highlights: [
      "Custom interviewer tone",
      "Role-tailored questions",
      "Leveling calibration",
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Real-Time Speech & Video Scoring",
    shortDesc: "Confidence, clarity, filler words & posture",
    longDesc:
      "Get instant, actionable feedback right after your response. Analyze your cadence, eye contact, tone, and technical precision down to the second.",
    highlights: [
      "Filler word counter",
      "Sentiment & tone analysis",
      "STAR method checker",
    ],
  },
  {
    id: "pressure",
    icon: ShieldCheck,
    title: "Adaptive Pressure Engine",
    shortDesc: "Simulated follow-ups and live technical pushback",
    longDesc:
      "Interviews aren't static lists of questions. The AI pushes back on weak answers, asks deep follow-ups, and tests how well you handle unexpected pressure.",
    highlights: [
      "Dynamic follow-up questions",
      "Time pressure stress testing",
      "Technical deep dives",
    ],
  },
];

const FREE_ADVANTAGES = [
  {
    icon: Unlock,
    title: "Zero Paywalls",
    desc: "Every company persona, feedback metric, and analysis tool is available to all users from day one.",
  },
  {
    icon: Globe,
    title: "Unlimited Practice",
    desc: "Run as many mock sessions as you need until you feel confident for the real thing.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    desc: "Built to give everyone an equal shot at landing their dream role.",
  },
];

const MOCK_TRANSCRIPT = [
  {
    speaker: "AI Interviewer (Google Persona)",
    text: "Can you describe a time you had to optimize a slow database query in production under high load?",
    time: "00:12",
  },
  {
    speaker: "Candidate (You)",
    text: "At my previous role, our main Postgres database spiked to 98% CPU during peak traffic. I identified a missing composite index on the orders table...",
    time: "00:45",
  },
];

const FAQS = [
  {
    q: "Is this platform really free?",
    a: "Yes. No hidden fees or paywalled features — full access to all interview personas, video analysis, and scoring metrics.",
  },
  {
    q: "How does the AI know how Google or Amazon interviews?",
    a: "Our models are shaped by publicly known interview formats, leveling rubrics, and structured interview guidelines from top tech firms.",
  },
  {
    q: "Do I need a camera to practice?",
    a: "No. You can run audio-only sessions. Enabling your camera adds eye-contact tracking, pacing, and facial sentiment analysis.",
  },
  {
    q: "Can I upload my resume and a job description?",
    a: "Yes. Paste the JD and upload your resume — the AI cross-references both to ask targeted questions about your experience.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

function GithubIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.11.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.2.67.79.55C20.21 21.38 23.5 17.08 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("personas");
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-base-950 text-ink">
      {/* HERO */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center max-w-3xl"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mint/30 bg-mint/10 mb-6 text-sm text-mint font-medium"
          >
            <Gift size={15} />
            <span>Free & open access — no card required</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-4xl sm:text-6xl font-bold leading-[1.1] mb-6"
          >
            Walk into your next interview{" "}
            <span className="text-signal">already having done it</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-ink-muted text-lg max-w-xl mb-10 leading-relaxed"
          >
            Practice unlimited sessions with an AI interviewer that adapts to
            your resume, role, and target company — voice, video, and pressure
            included.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-3 mb-14 w-full sm:w-auto"
          >
            <Link
              to="/register"
              className="btn-signal text-white rounded-lg px-7 py-3.5 font-semibold flex items-center justify-center gap-2"
            >
              Start Practicing Free <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              className="border border-base-700 hover:border-base-600 text-ink rounded-lg px-7 py-3.5 font-medium flex items-center justify-center transition"
            >
              I have an account
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-3 gap-6 w-full max-w-lg pt-8 border-t border-base-700"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-ink">
                  {stat.value}
                </p>
                <p className="text-ink-muted text-xs mt-1 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* LIVE SESSION PREVIEW */}
      <section className="py-8 px-6 max-w-5xl mx-auto">
        <div className="card rounded-2xl p-4 sm:p-7">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-700">
            <span className="text-xs text-ink-muted font-mono-data">
              LIVE_SESSION // GOOGLE_L5_ENGINEER
            </span>
            <span className="flex items-center gap-1.5 text-xs text-signal font-medium px-2.5 py-1 rounded-full bg-signal/10 border border-signal/30">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse" />{" "}
              REC 00:02:45
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative aspect-video rounded-xl bg-base-800 border border-base-700 overflow-hidden flex items-center justify-center">
                <Video size={40} className="text-ink-muted opacity-40" />

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-base-950/80 px-2.5 py-1 rounded-md text-xs font-mono-data text-mint border border-mint/30 flex items-center gap-1.5">
                    <Check size={11} /> Eye contact 92%
                  </span>
                  <span className="bg-base-950/80 px-2.5 py-1 rounded-md text-xs font-mono-data text-signal border border-signal/30">
                    Pacing optimal
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-signal/15 flex items-center justify-center border border-signal/30">
                      <Mic size={14} className="text-signal" />
                    </div>
                    <span className="text-xs font-medium">Audio active</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-base-800 border border-base-700 flex items-center gap-3 text-sm">
                <Zap size={16} className="text-signal flex-shrink-0" />
                <span className="text-ink-muted">
                  Tip: speak slightly slower during complex explanations.
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-base-800 rounded-xl p-4 border border-base-700 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
                  Live transcript
                </p>

                {MOCK_TRANSCRIPT.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-base-900 border border-base-700 text-left text-xs space-y-1"
                  >
                    <div className="flex justify-between text-ink-muted">
                      <span className="font-medium text-signal">
                        {msg.speaker}
                      </span>
                      <span className="font-mono-data">{msg.time}</span>
                    </div>
                    <p className="text-ink leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-base-700 text-left space-y-2">
                <p className="text-xs text-ink-muted">
                  STAR framework detected:
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-mint/15 text-mint font-mono-data">
                    S — Situation
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-mint/15 text-mint font-mono-data">
                    T — Task
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-warn/15 text-warn font-mono-data">
                    A — In progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE TABS */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          Everything you need to master high-stakes interviews
        </h2>

        <p className="text-ink-muted max-w-xl mx-auto mb-12">
          Traditional prep is passive. This puts you under real simulated
          conditions.
        </p>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isActive = activeTab === feat.id;

            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition ${
                  isActive
                    ? "bg-signal/10 border border-signal/40 text-signal"
                    : "bg-base-800 border border-base-700 text-ink-muted hover:border-base-600"
                }`}
              >
                <Icon size={16} />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {FEATURES.filter((f) => f.id === activeTab).map((feat) => {
            const Icon = feat.icon;

            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="card rounded-2xl p-7 sm:p-10 text-left grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto"
              >
                <div className="space-y-5">
                  <div className="w-11 h-11 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center">
                    <Icon size={20} className="text-signal" />
                  </div>

                  <h3 className="font-display text-2xl font-bold">
                    {feat.title}
                  </h3>

                  <p className="text-ink-muted leading-relaxed">
                    {feat.longDesc}
                  </p>

                  <ul className="space-y-2.5 pt-1">
                    {feat.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <div className="w-5 h-5 rounded-full bg-mint/15 flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-mint" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-base-800 rounded-xl p-5 border border-base-700 space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-base-700 pb-3">
                    <FileText className="text-signal" size={18} />
                    <span className="font-semibold text-sm">
                      System intelligence
                    </span>
                  </div>

                  <p className="text-xs text-ink-muted leading-relaxed">
                    Each response is scored against structured rubrics for
                    technical accuracy and delivery.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-muted">
                        Technical accuracy
                      </span>
                      <span className="text-mint font-mono-data">98.4%</span>
                    </div>

                    <div className="w-full bg-base-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-mint h-full"
                        style={{ width: "98.4%" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>

      {/* FREE ADVANTAGES */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center border-t border-base-700">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-signal/30 bg-signal/10 mb-5 text-sm text-signal font-medium">
          <Sparkles size={15} />
          <span>Our commitment to job seekers</span>
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          Why we built this completely free
        </h2>

        <p className="text-ink-muted max-w-lg mx-auto mb-12">
          Interviewing is nerve-wracking enough without a subscription
          attached to it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {FREE_ADVANTAGES.map((adv) => {
            const Icon = adv.icon;

            return (
              <div
                key={adv.title}
                className="card rounded-xl p-6 text-left hover:border-base-600 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-signal" />
                </div>

                <h3 className="font-display text-lg font-semibold mb-2">
                  {adv.title}
                </h3>

                <p className="text-ink-muted text-sm leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-3xl mx-auto border-t border-base-700">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-10 text-center">
          Frequently asked questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <div key={index} className="card rounded-xl overflow-hidden text-left">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-base-800 transition"
                >
                  <span className="font-medium">{faq.q}</span>

                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 flex-shrink-0 ${
                      isOpen
                        ? "rotate-180 text-signal"
                        : "text-ink-muted"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 text-ink-muted text-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-6 max-w-4xl mx-auto mb-16">
        <div className="card rounded-2xl p-9 sm:p-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">
            Ready to ace your upcoming interviews?
          </h2>

          <p className="text-ink-muted max-w-lg mx-auto mb-8">
            Join engineers, product managers, and designers practicing for the
            interview that matters.
          </p>

          <Link
            to="/register"
            className="btn-signal inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold text-white"
          >
            Start Free Practice Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-base-700">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-10 border-b border-base-700">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-signal" />
                <span className="font-display font-semibold text-sm text-ink">
                  MockAI
                </span>
              </div>

              <p className="text-ink-muted text-xs leading-relaxed max-w-[200px]">
                Voice-driven mock interviews, scored like the real thing.
              </p>
            </div>

            <div>
              <p className="text-ink text-xs font-semibold uppercase tracking-wide mb-3">
                Product
              </p>

              <ul className="space-y-2 text-xs text-ink-muted">
                <li>
                  <Link
                    to="/register"
                    className="hover:text-ink transition"
                  >
                    Get started
                  </Link>
                </li>

                <li>
                  <Link to="/login" className="hover:text-ink transition">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-ink text-xs font-semibold uppercase tracking-wide mb-3">
                Company
              </p>

              <ul className="space-y-2 text-xs text-ink-muted">
                <li>
                  <a href="#" className="hover:text-ink transition">
                    Privacy
                  </a>
                </li>

                <li>
                  <a href="#" className="hover:text-ink transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-ink text-xs font-semibold uppercase tracking-wide mb-3">
                Connect
              </p>

              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/dhanajimane751/ai-interview-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-8 h-8 rounded-full border border-base-700 flex items-center justify-center text-ink-muted hover:text-ink hover:border-signal transition"
                >
                  <GithubIcon size={14} />
                </a>

                <a
                  href="https://www.linkedin.com/in/dhanaji-mane-301302349"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full border border-base-700 flex items-center justify-center text-ink-muted hover:text-ink hover:border-signal transition"
                >
                  <LinkedinIcon size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <p className="text-ink-muted text-xs">
              © 2026 MockAI. All rights reserved.
            </p>

            <p className="text-ink-muted text-xs">
              Designed & built by{" "}
              <a
                href="https://github.com/dhanajimane751/ai-interview-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal hover:underline font-medium"
              >
                Dhanaji Mane
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}