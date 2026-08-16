const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const { GROQ_API_KEY } = require("../config/env");

const groq = new Groq({ apiKey: GROQ_API_KEY });

const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided" });
    }

    // Rename temp file to have a proper extension so Groq can detect format
    const originalPath = req.file.path;
    const renamedPath = `${originalPath}.webm`;
    fs.renameSync(originalPath, renamedPath);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(renamedPath),
      model: "whisper-large-v3-turbo",
      language: "en",
      response_format: "json",
    });

    fs.unlink(renamedPath, () => {});

    res.status(200).json({ success: true, text: transcription.text.trim() });
  } catch (error) {
    if (req.file) {
      const attemptedPath = `${req.file.path}.webm`;
      fs.unlink(req.file.path, () => {});
      fs.unlink(attemptedPath, () => {});
    }
    next(error);
  }
};

module.exports = { transcribeAudio };