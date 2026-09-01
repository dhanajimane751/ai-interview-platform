const Interview = require("../models/Interview");
const Report = require("../models/Report");

const {
    generateInterviewReport,
} = require("../services/aiService");

const calculateProctoringScore = (
    proctoring
) => {
    const p = proctoring || {};

    const penalty =
        (p.tabSwitches || 0) * 10 +
        (p.windowBlurs || 0) * 3 +
        (p.fullscreenExits || 0) * 8 +
        (p.noFaceEvents || 0) * 5 +
        (p.multipleFaceEvents || 0) *
            12 +
        (p.cameraErrors || 0) * 8 +
        (p.microphoneErrors || 0) *
            5;

    return Math.max(
        0,
        Math.min(100, 100 - penalty)
    );
};

const getProctoringStatus = (
    score
) => {
    if (score >= 90) {
        return "Clean";
    }

    if (score >= 70) {
        return "Minor Issues";
    }

    return "Needs Attention";
};

const generateReport = async (
    req,
    res,
    next
) => {
    try {
        const { interviewId } =
            req.params;

        const interview =
            await Interview.findById(
                interviewId
            ).populate("company");

        if (!interview) {
            return res.status(404).json({
                success: false,
                message:
                    "Interview not found",
            });
        }

        if (
            interview.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Not authorized",
            });
        }

        if (interview.report) {
            const existingReport =
                await Report.findById(
                    interview.report
                );

            if (existingReport) {
                return res.status(
                    200
                ).json({
                    success: true,
                    report:
                        existingReport,
                });
            }
        }

        const answeredQuestions =
            interview.answers.filter(
                (answer) =>
                    answer.answerText &&
                    answer.answerText.trim()
            );

        const p =
            interview.proctoring || {};

        const proctoringScore =
            calculateProctoringScore(p);

        const proctoringStatus =
            getProctoringStatus(
                proctoringScore
            );

        const eventMessages =
            (p.events || []).map(
                (event) =>
                    `${event.type}: ${event.message}`
            );

        if (
            answeredQuestions.length ===
            0
        ) {
            const report =
                await Report.create({
                    interview:
                        interview._id,
                    user: interview.user,
                    overallScore: 0,
                    technicalScore: 0,
                    communicationScore: 0,
                    confidenceScore: 0,
                    bodyLanguageScore: 0,
                    grammarScore: 0,
                    voiceScore: 0,
                    eyeContactScore: 0,
                    professionalismScore:
                        0,
                    timeManagementScore:
                        0,
                    proctoringScore,
                    proctoringStatus,
                    proctoringSummary:
                        eventMessages.length
                            ? `Proctoring recorded ${eventMessages.length} event(s) during the interview.`
                            : "No proctoring violations were recorded.",
                    strengths: [],
                    weaknesses: [
                        "No interview answers were provided.",
                    ],
                    recommendedImprovements:
                        [
                            "Complete the interview and answer the questions so your technical and communication performance can be evaluated.",
                        ],
                    aiSuggestions:
                        eventMessages.length
                            ? `No technical evaluation was possible because the interview contained no answers. Proctoring recorded ${eventMessages.length} event(s), including ${p.tabSwitches || 0} tab switch(es), ${p.noFaceEvents || 0} no-face event(s), and ${p.multipleFaceEvents || 0} multiple-face event(s).`
                            : "No technical evaluation was possible because the interview contained no answers.",
                    hiringProbability: 0,
                    expectedRating:
                        "No Hire",
                    proctoring: {
                        tabSwitches:
                            p.tabSwitches ||
                            0,
                        windowBlurs:
                            p.windowBlurs ||
                            0,
                        fullscreenExits:
                            p.fullscreenExits ||
                            0,
                        noFaceEvents:
                            p.noFaceEvents ||
                            0,
                        multipleFaceEvents:
                            p.multipleFaceEvents ||
                            0,
                        cameraErrors:
                            p.cameraErrors ||
                            0,
                        microphoneErrors:
                            p.microphoneErrors ||
                            0,
                        warnings:
                            p.warnings || 0,
                        events:
                            eventMessages,
                    },
                });

            interview.report =
                report._id;

            await interview.save();

            return res.status(201).json({
                success: true,
                report,
            });
        }

        const analysis =
            await generateInterviewReport({
                role: interview.role,
                company:
                    interview.company,
                answers:
                    interview.answers,
                cheatingFlags:
                    interview.cheatingFlags ||
                    [],
                proctoring: p,
            });

        const report =
            await Report.create({
                interview:
                    interview._id,
                user: interview.user,
                ...analysis,
                proctoringScore,
                proctoringStatus,
                proctoringSummary:
                    eventMessages.length
                        ? `Detected ${eventMessages.length} proctoring event(s) during the interview.`
                        : "No proctoring violations were recorded.",
                proctoring: {
                    tabSwitches:
                        p.tabSwitches ||
                        0,
                    windowBlurs:
                        p.windowBlurs ||
                        0,
                    fullscreenExits:
                        p.fullscreenExits ||
                        0,
                    noFaceEvents:
                        p.noFaceEvents ||
                        0,
                    multipleFaceEvents:
                        p.multipleFaceEvents ||
                        0,
                    cameraErrors:
                        p.cameraErrors ||
                        0,
                    microphoneErrors:
                        p.microphoneErrors ||
                        0,
                    warnings:
                        p.warnings || 0,
                    events:
                        eventMessages,
                },
            });

        interview.report =
            report._id;

        await interview.save();

        return res.status(201).json({
            success: true,
            report,
        });
    } catch (error) {
        next(error);
    }
};

const getReportByInterview =
    async (req, res, next) => {
        try {
            const interview =
                await Interview.findById(
                    req.params.interviewId
                );

            if (!interview?.report) {
                return res.status(
                    404
                ).json({
                    success: false,
                    message:
                        "Report not found",
                });
            }

            const report =
                await Report.findById(
                    interview.report
                );

            if (!report) {
                return res.status(
                    404
                ).json({
                    success: false,
                    message:
                        "Report not found",
                });
            }

            return res.status(
                200
            ).json({
                success: true,
                report,
            });
        } catch (error) {
            next(error);
        }
    };

module.exports = {
    generateReport,
    getReportByInterview,
};