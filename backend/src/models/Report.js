const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    interview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    overallScore: { type: Number, min: 0, max: 100 },
    technicalScore: Number,
    communicationScore: Number,
    confidenceScore: Number,
    bodyLanguageScore: Number,
    grammarScore: Number,
    voiceScore: Number,
    eyeContactScore: Number,
    professionalismScore: Number,
    timeManagementScore: Number,
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendedImprovements: [{ type: String }],
    aiSuggestions: { type: String },
    hiringProbability: { type: Number, min: 0, max: 100 },
    expectedRating: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);