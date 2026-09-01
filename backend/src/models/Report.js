const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        interview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        technicalScore: Number,
        communicationScore: Number,
        confidenceScore: Number,
        bodyLanguageScore: Number,
        grammarScore: Number,
        voiceScore: Number,
        eyeContactScore: Number,
        professionalismScore: Number,
        timeManagementScore: Number,
        proctoringScore: Number,
        proctoringStatus: String,
        proctoringSummary: String,
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        recommendedImprovements: [{ type: String }],
        aiSuggestions: { type: String },
        hiringProbability: {
            type: Number,
            min: 0,
            max: 100,
        },
        expectedRating: {
            type: String,
        },
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
            events: [
                {
                    type: String,
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Report",
    reportSchema
);