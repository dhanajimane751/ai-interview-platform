const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRE } = require("../config/env");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "30d" });
};

module.exports = { generateAccessToken, generateRefreshToken };