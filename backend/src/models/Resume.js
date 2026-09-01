const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
    },

    publicId: {
      type: String,
    },

    rawText: {
      type: String,
    },

    skills: [{ type: String }],

    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
      },
    ],

    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],

    education: [
      {
        institution: String,
        degree: String,
        year: String,
      },
    ],

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    parsedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);