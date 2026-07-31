import StartInterviewModal from "../components/dashboard/StartInterviewModal";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
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

const handleLogout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (err) {
    console.error("Logout API failed", err);
  } finally {
    dispatch(logout());
    navigate("/login");
  }
};

  const handleStartInterview = async ({ role, companyId, difficulty, interviewType }) => {
    try {
      setError("");
      const res = await axiosInstance.post("/interviews/start", {
        role,
        companyId,
        difficulty,
        interviewType,
      });
      navigate(`/interview/${res.data.interviewId}`, {
        state: { firstQuestion: res.data.question },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
      setShowModal(false);
    }
  };

  const completedCount = history.filter((h) => h.status === "completed").length;
  const avgScore =
    history.filter((h) => h.report?.overallScore != null).length > 0
      ? Math.round(
          history
            .filter((h) => h.report?.overallScore != null)
            .reduce((sum, h) => sum + h.report.overallScore, 0) /
            history.filter((h) => h.report?.overallScore != null).length
        )
      : "—";

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full signature-ring p-[2px]">
            <div className="w-full h-full rounded-full bg-base-950 flex items-center justify-center font-display font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">
              Welcome, {user?.name || "Candidate"}
            </h1>
            <p className="text-slate-500 text-xs">Let's sharpen your interview game.</p>
          </div>
        </div>
        
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-slate-500 text-xs mb-1">Interviews completed</p>
          <p className="font-display text-2xl font-bold text-accent-cyan">{completedCount}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-slate-500 text-xs mb-1">Average score</p>
          <p className="font-display text-2xl font-bold text-accent-pink">{avgScore}</p>
        </div>
        <div className="glass-card rounded-xl p-5 col-span-2 md:col-span-1">
          <p className="text-slate-500 text-xs mb-1">Total attempts</p>
          <p className="font-display text-2xl font-bold text-warn">{history.length}</p>
        </div>
      </div>

      {/* CTA card */}
      <div className="glass-card rounded-2xl p-8 text-center mb-10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-glow-radial blur-2xl" />
        <p className="text-slate-400 mb-4 relative">Ready to practice your next interview?</p>
        {error && <p className="text-danger text-sm mb-3 relative">{error}</p>}
        <button
          onClick={() => setShowModal(true)}
          className="btn-gradient text-white px-7 py-3 rounded-xl font-medium shadow-glow relative"
        >
          Start New Interview
        </button>
      </div>

      {/* History */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Interview History</h2>

        {historyLoading ? (
          <p className="text-slate-500 text-sm">Loading history...</p>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">
              No interviews yet. Start your first one above to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((interview, i) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-xl p-4 flex justify-between items-center hover:border-primary-500/40 border border-transparent transition"
              >
                <div>
                  <p className="font-medium">{interview.role}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(interview.createdAt).toLocaleDateString()} ·{" "}
                    <span className="capitalize">{interview.status}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {interview.report ? (
                    <>
                      <span className="font-display font-semibold bg-clip-text text-transparent bg-signature-gradient">
                        {interview.report.overallScore}%
                      </span>
                      <Link
                        to={`/report/${interview._id}`}
                        className="text-sm text-slate-300 hover:text-white underline"
                      >
                        View Report
                      </Link>
                    </>
                  ) : (
                    <span className="text-slate-500 text-xs">No report</span>
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