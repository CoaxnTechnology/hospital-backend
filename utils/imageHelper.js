const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

exports.compressImage = async (filePath) => {
  try {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath, ext);

    const outputFileName = filename + "_compressed.jpg";
    const outputPath = path.join(dir, outputFileName);

    console.log("📁 Input Path:", filePath);
    console.log("📁 Output Path:", outputPath);

    await sharp(filePath)
      .resize({
        width: 1000,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // 🔥 SAFE DELETE (EPERM FIX)
    try {
      await fs.promises.unlink(filePath);
      console.log("🗑 Original file deleted");
    } catch (err) {
      console.log("⚠️ File delete failed (ignore):", err.message);
    }

    return outputFileName;
  } catch (err) {
    console.error("❌ Compression error:", err);
    return path.basename(filePath); // fallback
  }
};