const Resume = require("../models/Resume");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

// pdf-parse v2
const { PDFParse } = require("pdf-parse");

const uploadResumeToCloudinary = (buffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mockai/resumes",
        resource_type: "raw",
        public_id: `${Date.now()}-${fileName.replace(
          /\.pdf$/i,
          ""
        )}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const extractPdfText = async (buffer) => {
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  if (!result?.text?.trim()) {
    throw new Error(
      "Could not extract text from this resume. Please upload a text-based PDF."
    );
  }

  return result.text.trim();
};

const cleanResumeText = (text) => {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Upload or replace resume
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Extract text before Cloudinary upload
    const rawText = cleanResumeText(
      await extractPdfText(req.file.buffer)
    );

    // Upload PDF
    const uploaded = await uploadResumeToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    // Delete old resume
    if (user.resume) {
      const oldResume = await Resume.findById(user.resume);

      if (oldResume) {
        if (oldResume.publicId) {
          try {
            await cloudinary.uploader.destroy(
              oldResume.publicId,
              {
                resource_type: "raw",
              }
            );
          } catch (error) {
            console.error(
              "Old resume deletion failed:",
              error.message
            );
          }
        }

        await Resume.findByIdAndDelete(oldResume._id);
      }
    }

    // Create new resume document
    const resume = await Resume.create({
      user: req.user._id,
      fileUrl: uploaded.secure_url,
      fileName: req.file.originalname,
      publicId: uploaded.public_id,
      rawText,
      parsedAt: new Date(),
    });

    // Link resume to user
    user.resume = resume._id;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        parsedAt: resume.parsedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      user: req.user._id,
    }).select("-rawText");

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user?.resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    const resume = await Resume.findById(user.resume);

    if (resume?.publicId) {
      try {
        await cloudinary.uploader.destroy(
          resume.publicId,
          {
            resource_type: "raw",
          }
        );
      } catch (error) {
        console.error(
          "Cloudinary delete failed:",
          error.message
        );
      }
    }

    await Resume.findByIdAndDelete(user.resume);

    user.resume = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResume,
  deleteResume,
};