const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

const uploadFromBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mockai/profile-photos",
        resource_type: "image",

        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// GET PROFILE
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email avatar authProvider role"
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = trimmedName;
    }

    // Upload new avatar
    if (req.file) {
      const oldPublicId = user.avatarPublicId;

      const result = await uploadFromBuffer(req.file.buffer);

      user.avatar = result.secure_url;
      user.avatarPublicId = result.public_id;

      // Delete old image after successful upload
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId, {
            invalidate: true,
          });
        } catch (deleteError) {
          console.error(
            "Old avatar deletion failed:",
            deleteError.message
          );
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};