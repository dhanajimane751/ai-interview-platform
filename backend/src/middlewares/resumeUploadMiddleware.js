const multer = require("multer");

const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(
                new Error("Only PDF resumes are supported")
            );
        }

        cb(null, true);
    },
});

module.exports = resumeUpload;