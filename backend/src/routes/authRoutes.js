const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser
);

router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

module.exports = router;