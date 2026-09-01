const express = require("express");

const {
  uploadResume,
  getResume,
  deleteResume,
} = require("../controllers/resumeController");

const { protect } = require("../middlewares/authMiddleware");
const resumeUpload = require("../middlewares/resumeUploadMiddleware");

const router = express.Router();

router.get("/", protect, getResume);

router.post(
  "/upload",
  protect,
  resumeUpload.single("resume"),
  uploadResume
);

router.delete("/", protect, deleteResume);

module.exports = router;