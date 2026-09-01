const rateLimit = require("express-rate-limit");

// General limiter — applies to all API routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Stricter limiter for auth endpoints (login/register/forgot-password) — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

// AI/interview endpoints — expensive Groq calls, prevent abuse/cost spikes
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You're sending requests too quickly. Please slow down.",
  },
});

// Speech transcription — audio uploads, more resource-intensive
const speechLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many transcription requests. Please wait a moment.",
  },
});

module.exports = { globalLimiter, authLimiter, aiLimiter, speechLimiter };