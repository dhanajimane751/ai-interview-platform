const Company = require("../models/Company");

const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().select("name interviewStyle description difficultyLevel");
    res.status(200).json({ success: true, companies });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompanies };