const express = require("express");
const { getCompanies } = require("../controllers/companyController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getCompanies);

module.exports = router;