const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

const { protect, adminOnly } = require("../middleware/auth");

const useCloud =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (useCloud) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Temporary local storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);

    if (!allowed) {
      return cb(
        new Error("Only JPG, PNG, WEBP and GIF images are allowed.")
      );
    }

    cb(null, true);
  },
});

router.post(
  "/",
  protect,
  adminOnly,
  (req, res) => {
    upload.single("image")(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({
            message: err.message || "Image upload failed.",
          });
        }

        if (!req.file) {
          return res.status(400).json({
            message: "Select an image file (maximum 5 MB).",
          });
        }

        // =========================
        // CLOUDINARY
        // =========================
        if (useCloud) {
          const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
            "base64"
          )}`;

          const result = await cloudinary.uploader.upload(base64Image, {
            folder: "sp-fashion/products",
            resource_type: "image",
          });

          return res.status(201).json({
            imageUrl: result.secure_url,
          });
        }

        // =========================
        // LOCAL STORAGE
        // =========================

        const uploadDir = path.join(__dirname, "../../uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename =
          crypto.randomBytes(16).toString("hex") +
          path.extname(req.file.originalname).toLowerCase();

        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, req.file.buffer);

        const imageUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${filename}`;

        return res.status(201).json({
          imageUrl,
        });
      } catch (error) {
        console.error("Image upload error:", error);

        return res.status(500).json({
          message: error.message || "Image upload failed.",
        });
      }
    });
  }
);

module.exports = router;