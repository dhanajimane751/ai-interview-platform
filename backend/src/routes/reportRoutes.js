const express = require("express");
const { generateReport, getReportByInterview } = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:interviewId/generate", protect, generateReport);
router.get("/:interviewId", protect, getReportByInterview);

module.exports = router;