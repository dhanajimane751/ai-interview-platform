const mongoose = require("mongoose");
const Company = require("../models/Company");
const { MONGO_URI } = require("../config/env");

const companies = [
  {
    name: "Google",
    interviewStyle: "Google",
    description: "Focuses on problem-solving, coding, and Googleyness.",
    commonRoles: ["Software Engineer", "Product Manager", "Data Scientist"],
    difficultyLevel: "Hard",
    interviewRounds: ["Technical", "Coding", "SystemDesign", "Behavioral"],
    promptPersona: "Be analytical, ask structured problem-solving questions, probe for depth in reasoning.",
  },
  {
    name: "Amazon",
    interviewStyle: "Amazon",
    description: "Leadership principles heavy, behavioral-focused with STAR method expectations.",
    commonRoles: ["Software Engineer", "Operations Manager"],
    difficultyLevel: "Hard",
    interviewRounds: ["Behavioral", "Technical", "Coding"],
    promptPersona: "Frequently ask 'Tell me about a time when...' questions tied to Amazon's leadership principles.",
  },
  {
    name: "Meta",
    interviewStyle: "Meta",
    description: "Fast-paced, coding-heavy, values impact and execution speed.",
    commonRoles: ["Software Engineer", "Product Manager"],
    difficultyLevel: "Hard",
    interviewRounds: ["Coding", "SystemDesign", "Behavioral"],
    promptPersona: "Be direct and fast-paced, focus on execution, impact, and technical depth.",
  },
  {
    name: "Microsoft",
    interviewStyle: "Microsoft",
    description: "Balanced technical and behavioral rounds, collaborative tone.",
    commonRoles: ["Software Engineer", "Program Manager"],
    difficultyLevel: "Medium",
    interviewRounds: ["Technical", "Behavioral", "SystemDesign"],
    promptPersona: "Be collaborative and supportive in tone, while still testing technical depth.",
  },
  {
    name: "Startup",
    interviewStyle: "Startup",
    description: "Practical, scrappy, tests versatility and ownership mindset.",
    commonRoles: ["Full Stack Developer", "Generalist Engineer"],
    difficultyLevel: "Medium",
    interviewRounds: ["Technical", "Behavioral"],
    promptPersona: "Be informal and practical, focus on real-world problem solving and ownership.",
  },
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  await Company.deleteMany({});
  await Company.insertMany(companies);
  console.log("Companies seeded successfully");
  process.exit();
};

seed();