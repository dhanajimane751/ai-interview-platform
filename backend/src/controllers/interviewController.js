const Interview = require("../models/Interview");
const Company = require("../models/Company");
const Resume = require("../models/Resume");
const { generateFirstQuestion, generateNextQuestion } = require("../services/aiService");

// @desc Start a new interview
const startInterview = async (req, res, next) => {
  try {
    const { role, companyId, interviewType, difficulty } = req.body;

    let company = null;
    if (companyId) company = await Company.findById(companyId);

    const resume = await Resume.findOne({ user: req.user._id });

    const firstQuestion = await generateFirstQuestion({
      role,
      company,
      resumeSummary: resume?.rawText?.slice(0, 1000),
      difficulty,
    });

    const interview = await Interview.create({
      user: req.user._id,
      company: company?._id,
      role,
      interviewType,
      difficulty,
      status: "in-progress",
      startedAt: new Date(),
      answers: [
        {
          questionText: firstQuestion,
          answerText: "",
        },
      ],
    });

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      question: firstQuestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit an answer and get next question
const submitAnswer = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const {
      answerText,
      duration,
      fillerWordCount,
      speechRate,
      confidenceScore,
      eyeContactScore,
      emotion,
      cheatingFlags,
    } = req.body;

    const interview = await Interview.findById(interviewId).populate("company");
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const lastAnswer = interview.answers[interview.answers.length - 1];
    lastAnswer.answerText = answerText;
    lastAnswer.duration = duration;
    lastAnswer.fillerWordCount = fillerWordCount;
    lastAnswer.speechRate = speechRate;
    lastAnswer.confidenceScore = confidenceScore;
    lastAnswer.eyeContactScore = eyeContactScore;
    lastAnswer.emotion = emotion;

    // Accumulate cheating flags without duplicating identical messages
    if (Array.isArray(cheatingFlags) && cheatingFlags.length > 0) {
      const newFlags = cheatingFlags.filter((flag) => !interview.cheatingFlags.includes(flag));
      interview.cheatingFlags.push(...newFlags);
    }

    const conversationHistory = interview.answers
      .filter((a) => a.answerText)
      .flatMap((a) => [
        { role: "assistant", content: a.questionText },
        { role: "user", content: a.answerText },
      ]);

    const nextQuestion = await generateNextQuestion({
      role: interview.role,
      company: interview.company,
      difficulty: interview.difficulty,
      conversationHistory,
    });

    interview.answers.push({ questionText: nextQuestion, answerText: "" });
    await interview.save();

    res.status(200).json({
      success: true,
      question: nextQuestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc End interview
const endInterview = async (req, res, next) => {
  try {
    const { interviewId } = req.params;
    const { cheatingFlags } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (Array.isArray(cheatingFlags) && cheatingFlags.length > 0) {
      const newFlags = cheatingFlags.filter((flag) => !interview.cheatingFlags.includes(flag));
      interview.cheatingFlags.push(...newFlags);
    }

    interview.status = "completed";
    interview.completedAt = new Date();
    interview.totalDuration = (interview.completedAt - interview.startedAt) / 1000;
    await interview.save();

    res.status(200).json({ success: true, message: "Interview completed", interviewId: interview._id });
  } catch (error) {
    next(error);
  }
};

// @desc Get interview history for user
const getUserInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

// @desc Get single interview
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};
const getUserInterviewsWithReports = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .populate("report", "overallScore expectedRating hiringProbability")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  endInterview,
  getUserInterviews,
  getInterviewById,
  getUserInterviewsWithReports,
};