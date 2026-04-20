// utils/imageHelper.js

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

exports.compressImage = async (filePath) => {
  try {
    const outputPath = filePath.replace(
      path.extname(filePath),
      "_compressed.jpg"
    );

    await sharp(filePath)
      .resize(800) // 🔥 width optimize
      .jpeg({ quality: 80 }) // 🔥 quality maintain
      .toFile(outputPath);

    // ❌ original delete
    fs.unlinkSync(filePath);

    return path.basename(outputPath); // only filename return
  } catch (err) {
    console.error("❌ Compression error:", err);
    return path.basename(filePath); // fallback
  }
};