const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", protect, getProfile);

router.put(
  "/",
  protect,
  upload.single("avatar"),
  updateProfile
);

module.exports = router;