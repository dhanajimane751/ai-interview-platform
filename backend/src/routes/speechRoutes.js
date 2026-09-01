const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");
const { transcribeAudio } = require("../controllers/speechController");
const { protect } = require("../middlewares/authMiddleware");
const { speechLimiter } = require("../middlewares/rateLimiter");

const upload = multer({ dest: os.tmpdir() });

const router = express.Router();

router.post("/transcribe",speechLimiter, protect, upload.single("audio"), transcribeAudio);

module.exports = router;