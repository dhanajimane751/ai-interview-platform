const express = require("express");
const { body } = require("express-validator");

const {
    startInterview,
    submitAnswer,
    endInterview,
    getUserInterviews,
    getUserInterviewsWithReports,
    getInterviewById,
} = require("../controllers/interviewController");

const {
    protect,
} = require("../middlewares/authMiddleware");

const {
    aiLimiter,
} = require("../middlewares/rateLimiter");

const validate = require("../middlewares/validateMiddleware");

const resumeUpload = require("../middlewares/resumeUploadMiddleware");

const router = express.Router();

router.post(
    "/start",
    aiLimiter,
    protect,
    resumeUpload.single("resume"),
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required"),
    validate,
    startInterview
);

router.post(
    "/:interviewId/answer",
    aiLimiter,
    protect,
    submitAnswer
);

router.post(
    "/:interviewId/end",
    protect,
    endInterview
);

router.get(
    "/history",
    protect,
    getUserInterviewsWithReports
);

router.get(
    "/",
    protect,
    getUserInterviews
);

router.get(
    "/:interviewId",
    protect,
    getInterviewById
);

module.exports = router;