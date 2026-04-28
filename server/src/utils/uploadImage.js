const fs = require("fs");
const path = require("path");
const { cloudinary, initCloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

let cloudinaryReady = false;

function ensureUploadsDir() {
  const dir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveImageFromMulter(file) {
  if (!file) return { url: "", publicId: "" };
  ensureUploadsDir();

  if (!cloudinaryReady) {
    cloudinaryReady = initCloudinary();
  }

  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "lost-found-portal",
      resource_type: "image"
    });
    try {
      fs.unlinkSync(file.path);
    } catch (_) {
      // ignore
    }
    return { url: result.secure_url, publicId: result.public_id };
  }

  // Local fallback: file already stored in /uploads by multer
  return { url: `/uploads/${file.filename}`, publicId: "" };
}

module.exports = { saveImageFromMulter };

