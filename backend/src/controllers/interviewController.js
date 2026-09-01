const Interview = require("../models/Interview");
const Company = require("../models/Company");
const pdf = require("pdf-parse");

const {
    generateFirstQuestion,
    generateNextQuestion,
} = require("../services/aiService");

const extractPdfText = async (buffer) => {
    try {
        const data = await pdf(buffer);

        const text = (data.text || "")
            .replace(/\u0000/g, "")
            .replace(/\s+/g, " ")
            .trim();

        if (!text || text.length < 30) {
            throw new Error(
                "Could not read text from this resume"
            );
        }

        return text.slice(0, 6000);
    } catch (error) {
        console.error(
            "Resume PDF parsing error:",
            error.message
        );

        throw new Error(
            "Could not read text from this resume"
        );
    }
};

const normalizeProctoringEvents = (
    events = []
) => {
    if (!Array.isArray(events)) {
        return [];
    }

    return events
        .filter(
            (event) =>
                event &&
                event.type &&
                event.message
        )
        .map((event) => ({
            type: event.type,
            message: String(event.message),
            timestamp: event.timestamp
                ? new Date(event.timestamp)
                : new Date(),
        }));
};

const applyProctoringEvents = (
    interview,
    events
) => {
    const normalized =
        normalizeProctoringEvents(events);

    if (!normalized.length) {
        return;
    }

    if (!interview.proctoring) {
        interview.proctoring = {
            tabSwitches: 0,
            windowBlurs: 0,
            fullscreenExits: 0,
            noFaceEvents: 0,
            multipleFaceEvents: 0,
            cameraErrors: 0,
            microphoneErrors: 0,
            warnings: 0,
            events: [],
        };
    }

    const existingKeys = new Set(
        (interview.proctoring.events || []).map(
            (event) =>
                `${event.type}|${event.timestamp?.toISOString()}`
        )
    );

    for (const event of normalized) {
        const key = `${event.type}|${event.timestamp.toISOString()}`;

        if (existingKeys.has(key)) {
            continue;
        }

        interview.proctoring.events.push(
            event
        );

        interview.proctoring.warnings += 1;

        if (
            event.type === "tab_switch"
        ) {
            interview.proctoring.tabSwitches += 1;
        }

        if (
            event.type === "window_blur"
        ) {
            interview.proctoring.windowBlurs += 1;
        }

        if (
            event.type ===
            "fullscreen_exit"
        ) {
            interview.proctoring.fullscreenExits += 1;
        }

        if (
            event.type === "no_face"
        ) {
            interview.proctoring.noFaceEvents += 1;
        }

        if (
            event.type ===
            "multiple_faces"
        ) {
            interview.proctoring.multipleFaceEvents += 1;
        }

        if (
            event.type === "camera_error"
        ) {
            interview.proctoring.cameraErrors += 1;
        }

        if (
            event.type ===
            "microphone_error"
        ) {
            interview.proctoring.microphoneErrors += 1;
        }

        existingKeys.add(key);
    }

    interview.markModified("proctoring");
};

const buildConversationHistory = (
    answers
) => {
    return answers
        .filter(
            (answer) =>
                answer.questionText &&
                answer.answerText &&
                answer.answerText.trim()
        )
        .slice(-6)
        .flatMap((answer) => [
            {
                role: "assistant",
                content:
                    answer.questionText,
            },
            {
                role: "user",
                content:
                    answer.answerText,
            },
        ]);
};

const startInterview = async (
    req,
    res,
    next
) => {
    try {
        const {
            role,
            companyId,
            interviewType,
            difficulty,
        } = req.body;

        if (!role?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Role is required",
            });
        }

        let company = null;

        if (companyId) {
            company =
                await Company.findById(
                    companyId
                );

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Company not found",
                });
            }
        }

        let resumeText = "";
        let resumeFileName = "";

        if (req.file) {
            resumeFileName =
                req.file.originalname;

            resumeText =
                await extractPdfText(
                    req.file.buffer
                );
        }

        const firstQuestion =
            await generateFirstQuestion({
                role: role.trim(),
                company,
                resumeText,
                difficulty:
                    difficulty || "Medium",
            });

        const interview =
            await Interview.create({
                user: req.user._id,
                company:
                    company?._id ||
                    undefined,
                role: role.trim(),
                interviewType:
                    interviewType ||
                    "Mixed",
                difficulty:
                    difficulty ||
                    "Medium",
                resumeText,
                resumeFileName,
                status: "in-progress",
                startedAt: new Date(),
                answers: [
                    {
                        questionText:
                            firstQuestion,
                        answerText: "",
                    },
                ],
            });

        return res.status(201).json({
            success: true,
            interviewId:
                interview._id,
            question:
                firstQuestion,
        });
    } catch (error) {
        console.error(
            "Start interview error:",
            error
        );

        if (
            error.message ===
            "Could not read text from this resume"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Could not read text from this resume. Please upload a text-based PDF resume.",
            });
        }

        next(error);
    }
};

const submitAnswer = async (
    req,
    res,
    next
) => {
    try {
        const { interviewId } =
            req.params;

        const {
            answerText,
            duration,
            fillerWordCount,
            speechRate,
            confidenceScore,
            eyeContactScore,
            emotion,
            cheatingFlags,
            proctoringEvents,
        } = req.body;

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

        if (
            interview.status !==
            "in-progress"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Interview is not active",
            });
        }

        const currentAnswer =
            interview.answers[
                interview.answers.length - 1
            ];

        if (!currentAnswer) {
            return res.status(400).json({
                success: false,
                message:
                    "No active question found",
            });
        }

        currentAnswer.answerText =
            answerText || "";

        currentAnswer.duration =
            Number(duration) || 0;

        currentAnswer.fillerWordCount =
            Number(
                fillerWordCount
            ) || 0;

        currentAnswer.speechRate =
            Number(speechRate) || 0;

        currentAnswer.confidenceScore =
            Number(confidenceScore) || 0;

        currentAnswer.eyeContactScore =
            Number(
                eyeContactScore
            ) || 0;

        currentAnswer.emotion =
            emotion || "";

        applyProctoringEvents(
            interview,
            proctoringEvents
        );

        if (
            Array.isArray(
                cheatingFlags
            )
        ) {
            interview.cheatingFlags =
                cheatingFlags;
        }

        const conversationHistory =
            buildConversationHistory(
                interview.answers
            );

        const nextQuestion =
            await generateNextQuestion({
                role: interview.role,
                company:
                    interview.company,
                difficulty:
                    interview.difficulty,
                resumeText:
                    interview.resumeText ||
                    "",
                conversationHistory,
            });

        interview.answers.push({
            questionText:
                nextQuestion,
            answerText: "",
        });

        await interview.save();

        return res.status(200).json({
            success: true,
            question:
                nextQuestion,
        });
    } catch (error) {
        console.error(
            "Submit answer error:",
            error
        );

        next(error);
    }
};

const endInterview = async (
    req,
    res,
    next
) => {
    try {
        const { interviewId } =
            req.params;

        const {
            cheatingFlags,
            proctoringEvents,
        } = req.body;

        const interview =
            await Interview.findById(
                interviewId
            );

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

        applyProctoringEvents(
            interview,
            proctoringEvents
        );

        if (
            Array.isArray(
                cheatingFlags
            )
        ) {
            interview.cheatingFlags =
                cheatingFlags;
        }

        interview.status =
            "completed";

        interview.completedAt =
            new Date();

        if (interview.startedAt) {
            interview.totalDuration =
                (interview.completedAt -
                    interview.startedAt) /
                1000;
        }

        if (
            interview.answers.length >
                0 &&
            !interview.answers[
                interview.answers.length -
                    1
            ].answerText?.trim()
        ) {
            interview.answers.pop();
        }

        await interview.save();

        return res.status(200).json({
            success: true,
            message:
                "Interview completed",
            interviewId:
                interview._id,
        });
    } catch (error) {
        next(error);
    }
};

const getUserInterviews = async (
    req,
    res,
    next
) => {
    try {
        const interviews =
            await Interview.find({
                user: req.user._id,
            })
                .populate("company")
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            interviews,
        });
    } catch (error) {
        next(error);
    }
};

const getInterviewById = async (
    req,
    res,
    next
) => {
    try {
        const interview =
            await Interview.findById(
                req.params.interviewId
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

        return res.status(200).json({
            success: true,
            interview,
        });
    } catch (error) {
        next(error);
    }
};

const getUserInterviewsWithReports =
    async (req, res, next) => {
        try {
            const interviews =
                await Interview.find({
                    user: req.user._id,
                })
                    .populate("company")
                    .populate("report")
                    .sort({
                        createdAt: -1,
                    });

            return res.status(200).json({
                success: true,
                interviews,
            });
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
    extractPdfText,
};