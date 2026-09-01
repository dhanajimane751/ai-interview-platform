import StartInterviewModal from "../components/dashboard/StartInterviewModal";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get("/interviews/history");
      setHistory(res.data.interviews);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

const handleStartInterview = async (formData) => {
    try {
        setError("");

        const response =
            await axiosInstance.post(
                "/interviews/start",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );

        navigate(
            `/interview/${response.data.interviewId}/check`,
            {
                state: {
                    firstQuestion:
                        response.data.question,
                },
            }
        );
    } catch (error) {
        console.error(
            "Start interview error:",
            error.response?.data
        );

        setError(
            error.response?.data?.errors?.[0]
                ?.msg ||
                error.response?.data
                    ?.message ||
                "Failed to start interview"
        );

        setShowModal(false);
    }
};

  const completedCount = history.filter((h) => h.status === "completed").length;
  const scored = history.filter((h) => h.report?.overallScore != null);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, h) => sum + h.report.overallScore, 0) / scored.length)
    : null;
  const bestScore = scored.length > 0
    ? Math.max(...scored.map((h) => h.report.overallScore))
    : null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-ink-muted text-sm mb-1">{greeting()},</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {user?.name || "Candidate"}
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Completed", value: completedCount, color: "text-accent-cyan" },
          { label: "Average score", value: avgScore ?? "—", color: "text-primary-400" },
          { label: "Best score", value: bestScore ?? "—", color: "text-accent-pink" },
          { label: "Total attempts", value: history.length, color: "text-warn" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5"
          >
            <p className="text-ink-muted text-xs mb-1">{stat.label}</p>
            <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="glass-card rounded-2xl p-8 mb-10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-glow-radial blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-1">
              Ready for your next practice round?
            </h2>
            <p className="text-ink-muted text-sm">
              Choose a company style and difficulty, and start a fresh mock interview.
            </p>
            {error && <p className="text-danger text-sm mt-2">{error}</p>}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient text-white px-6 py-3 rounded-xl font-medium shadow-glow whitespace-nowrap"
          >
            Start New Interview
          </button>
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink">Interview History</h2>
          {history.length > 0 && (
            <span className="text-ink-muted text-xs">{history.length} total</span>
          )}
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center">
            <p className="text-3xl mb-3">🎯</p>
            <p className="text-ink-muted text-sm">
              No interviews yet. Start your first one above to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((interview, i) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-4 flex justify-between items-center border border-transparent hover:border-primary-500/30 transition"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{interview.role}</p>
                  <p className="text-ink-muted text-xs mt-0.5">
                    {new Date(interview.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    <span
                      className={`capitalize ${interview.status === "completed" ? "text-success" : "text-ink-muted"
                        }`}
                    >
                      {interview.status}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {interview.report ? (
                    <>
                      <span className="font-display font-bold bg-clip-text text-transparent bg-signature-gradient">
                        {interview.report.overallScore}%
                      </span>
                      <Link
                        to={`/report/${interview._id}`}
                        className="text-sm text-primary-400 hover:text-primary-300 font-medium whitespace-nowrap"
                      >
                        View Report →
                      </Link>
                    </>
                  ) : (
                    <span className="text-ink-muted text-xs">No report</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <StartInterviewModal
          onClose={() => setShowModal(false)}
          onStart={handleStartInterview}
        />
      )}
    </div>
  );
}

export default Dashboard;