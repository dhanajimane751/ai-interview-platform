import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { motion } from "framer-motion";

function StartInterviewModal({ onClose, onStart }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axiosInstance.get("/companies");
      setCompanies(res.data.companies);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setFetching(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    await onStart({
      role,
      companyId: selectedCompany?._id,
      difficulty,
      interviewType: "Mixed",
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-base-950/80 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 w-full max-w-lg shadow-card"
      >
        <h2 className="font-display text-xl font-bold mb-1">Set up your interview</h2>
        <p className="text-slate-500 text-sm mb-5">Tailor the difficulty and interviewer style.</p>

        <label className="text-xs text-slate-400 block mb-1">Target role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-base-900 border border-base-600 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
          placeholder="e.g. Software Engineer"
        />

        <label className="text-xs text-slate-400 block mb-1">Difficulty</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["Easy", "Medium", "Hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`py-2 rounded-lg text-sm font-medium border transition ${
                difficulty === level
                  ? "btn-gradient text-white border-transparent"
                  : "border-base-600 text-slate-400 hover:border-primary-400"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <label className="text-xs text-slate-400 block mb-2">Company style</label>
        {fetching ? (
          <p className="text-slate-500 text-sm mb-4">Loading companies...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {companies.map((company) => (
              <button
                key={company._id}
                onClick={() => setSelectedCompany(company)}
                className={`text-left p-3 rounded-lg border transition ${
                  selectedCompany?._id === company._id
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-base-600 hover:border-base-500"
                }`}
              >
                <p className="font-medium text-sm">{company.name}</p>
                <p className="text-slate-500 text-xs">{company.difficultyLevel}</p>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-base-600 hover:border-base-500 transition py-2.5 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={loading || !role.trim()}
            className="flex-1 btn-gradient text-white py-2.5 rounded-lg font-medium disabled:opacity-50 shadow-glow"
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default StartInterviewModal;