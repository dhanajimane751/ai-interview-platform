const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    questionText: String,
    answerText: String,
    audioUrl: String,
    duration: Number,
    fillerWordCount: { type: Number, default: 0 },
    speechRate: Number,
    confidenceScore: Number,
    eyeContactScore: Number,
    emotion: String,
    aiFeedback: String,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    role: { type: String, required: true },
    interviewType: {
      type: String,
      enum: ["Behavioral", "Technical", "Coding", "SystemDesign", "HR", "Mixed"],
      default: "Mixed",
    },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    status: { type: String, enum: ["scheduled", "in-progress", "completed", "abandoned"], default: "scheduled" },
    answers: [answerSchema],
    startedAt: Date,
    completedAt: Date,
    totalDuration: Number,
    cheatingFlags: [{ type: String }],
    report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);