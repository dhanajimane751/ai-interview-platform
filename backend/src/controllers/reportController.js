const Interview = require("../models/Interview");
const Report = require("../models/Report");
const { generateInterviewReport } = require("../services/aiService");

// @desc Generate report for a completed interview
const generateReport = async (req, res, next) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId).populate("company");
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.report) {
      const existingReport = await Report.findById(interview.report);
      return res.status(200).json({ success: true, report: existingReport });
    }

    const answeredQuestions = interview.answers.filter((a) => a.answerText && a.answerText.trim().length > 0);

    if (answeredQuestions.length === 0) {
      // No real answers — return a zeroed-out report without calling AI
      const report = await Report.create({
        interview: interview._id,
        user: interview.user,
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        grammarScore: 0,
        professionalismScore: 0,
        timeManagementScore: 0,
        strengths: [],
        weaknesses: ["No answers were provided during this interview."],
        recommendedImprovements: ["Complete at least one full question-answer cycle to receive meaningful feedback."],
        aiSuggestions: interview.cheatingFlags.length > 0
          ? `The interview was ended without any answers. Proctoring flags detected: ${interview.cheatingFlags.join("; ")}.`
          : "The interview was ended without any answers, so no evaluation could be performed.",
        hiringProbability: 0,
        expectedRating: "No Hire",
      });

      interview.report = report._id;
      await interview.save();

      return res.status(201).json({ success: true, report });
    }

    const analysis = await generateInterviewReport({
      role: interview.role,
      company: interview.company,
      answers: interview.answers,
      cheatingFlags: interview.cheatingFlags,
    });

    const report = await Report.create({
      interview: interview._id,
      user: interview.user,
      ...analysis,
    });

    interview.report = report._id;
    await interview.save();

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// @desc Get report by interview ID
const getReportByInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    if (!interview?.report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    const report = await Report.findById(interview.report);
    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateReport, getReportByInterview };