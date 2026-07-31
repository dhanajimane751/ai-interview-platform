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
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/start",
  protect,
  [body("role").notEmpty().withMessage("Role is required")],
  validate,
  startInterview
);

router.post("/:interviewId/answer", protect, submitAnswer);
router.post("/:interviewId/end", protect, endInterview);

router.get("/history", protect, getUserInterviewsWithReports);
router.get("/", protect, getUserInterviews);
router.get("/:interviewId", protect, getInterviewById);

module.exports = router;