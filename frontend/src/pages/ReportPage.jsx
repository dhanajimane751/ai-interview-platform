import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

function ReportPage() {
  const { interviewId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrGenerateReport();
  }, [interviewId]);

  const fetchOrGenerateReport = async () => {
    try {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/reports/${interviewId}`);
        setReport(res.data.report);
      } catch {
        const genRes = await axiosInstance.post(`/reports/${interviewId}/generate`);
        setReport(genRes.data.report);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full signature-ring p-[3px] animate-ring-spin">
          <div className="w-full h-full rounded-full bg-base-950" />
        </div>
        <p className="text-slate-400">Analyzing your interview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  const radarData = [
    { subject: "Technical", value: report.technicalScore },
    { subject: "Communication", value: report.communicationScore },
    { subject: "Confidence", value: report.confidenceScore },
    { subject: "Grammar", value: report.grammarScore },
    { subject: "Professionalism", value: report.professionalismScore },
    { subject: "Time Mgmt", value: report.timeManagementScore },
  ];

  return (
    <div className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl font-bold">Interview Report</h1>
        <Link to="/dashboard" className="text-primary-400 text-sm hover:text-primary-300">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Overall Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 mb-8 text-center relative overflow-hidden"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-glow-radial blur-2xl" />
        <p className="text-slate-400 mb-2 relative">Overall Score</p>
        <p className="font-display text-6xl font-bold bg-clip-text text-transparent bg-signature-gradient relative">
          {report.overallScore}
        </p>
        <div className="flex justify-center gap-8 mt-4 relative">
          <div>
            <p className="text-slate-500 text-xs">Expected Rating</p>
            <p className="font-medium">{report.expectedRating}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Hiring Probability</p>
            <p className="font-medium">{report.hiringProbability}%</p>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart */}
      <div className="glass-card rounded-2xl p-8 mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Performance Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2A3350" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2A3350" />
            <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-success font-semibold mb-3 font-display">Strengths</h3>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            {report.strengths?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-danger font-semibold mb-3 font-display">Weaknesses</h3>
          <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
            {report.weaknesses?.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-display font-semibold mb-3">Recommended Improvements</h3>
        <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
          {report.recommendedImprovements?.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {/* AI Suggestions */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-glow-radial blur-2xl" />
        <h3 className="font-display font-semibold mb-3 relative">AI Suggestions</h3>
        <p className="text-sm text-slate-300 relative">{report.aiSuggestions}</p>
      </div>
    </div>
  );
}

export default ReportPage;