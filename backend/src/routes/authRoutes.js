const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { forgotPassword, resetPassword } = require("../controllers/authController")

const router = express.Router();

const passport = require("passport");
const { generateAccessToken } = require("../utils/generateToken");
const { CLIENT_URL } = require("../config/env");


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

router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);



router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login` }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user._id);
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${CLIENT_URL}/oauth-success?token=${accessToken}`);
  }
);

module.exports = router;