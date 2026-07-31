const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Behavioral",
        "Technical",
        "Coding",
        "OOP",
        "DBMS",
        "OS",
        "Networking",
        "JavaScript",
        "React",
        "Node",
        "MongoDB",
        "SystemDesign",
        "Leadership",
        "Communication",
        "ProblemSolving",
      ],
      required: true,
    },
    role: { type: String, default: "General" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    tags: [{ type: String }],
    idealAnswerPoints: [{ type: String }],
    followUpTriggers: [{ type: String }],
    isAIGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);