const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String, default: "" },
    description: { type: String },
    interviewStyle: {
      type: String,
      enum: ["Google", "Amazon", "Meta", "Microsoft", "Startup", "Generic"],
      default: "Generic",
    },
    commonRoles: [{ type: String }],
    difficultyLevel: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    interviewRounds: [
      {
        type: String,
        enum: ["HR", "Technical", "Coding", "SystemDesign", "Behavioral", "EngineeringManager", "CEO"],
      },
    ],
    promptPersona: { type: String }, // Used to shape AI interviewer tone/behavior
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);