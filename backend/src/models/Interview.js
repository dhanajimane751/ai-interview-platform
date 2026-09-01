const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
        questionText: String,
        answerText: String,
        audioUrl: String,
        duration: Number,
        fillerWordCount: {
            type: Number,
            default: 0,
        },
        speechRate: Number,
        confidenceScore: Number,
        eyeContactScore: Number,
        emotion: String,
        aiFeedback: String,
    },
    { _id: false }
);

const proctoringEventSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                "tab_switch",
                "window_blur",
                "fullscreen_exit",
                "no_face",
                "multiple_faces",
                "camera_error",
                "microphone_error",
                "other",
            ],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const interviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        role: {
            type: String,
            required: true,
        },
        interviewType: {
            type: String,
            enum: [
                "Behavioral",
                "Technical",
                "Coding",
                "SystemDesign",
                "HR",
                "Mixed",
            ],
            default: "Mixed",
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
        },
        resumeText: {
            type: String,
            default: "",
        },
        resumeFileName: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "scheduled",
                "in-progress",
                "completed",
                "abandoned",
            ],
            default: "scheduled",
        },
        answers: [answerSchema],
        startedAt: Date,
        completedAt: Date,
        totalDuration: Number,
        cheatingFlags: [
            {
                type: String,
            },
        ],
        proctoring: {
            tabSwitches: {
                type: Number,
                default: 0,
            },
            windowBlurs: {
                type: Number,
                default: 0,
            },
            fullscreenExits: {
                type: Number,
                default: 0,
            },
            noFaceEvents: {
                type: Number,
                default: 0,
            },
            multipleFaceEvents: {
                type: Number,
                default: 0,
            },
            cameraErrors: {
                type: Number,
                default: 0,
            },
            microphoneErrors: {
                type: Number,
                default: 0,
            },
            warnings: {
                type: Number,
                default: 0,
            },
            events: [proctoringEventSchema],
        },
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Report",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Interview",
    interviewSchema
);