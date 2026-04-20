const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

module.exports = async ({ htmlContent, filePath }) => {
  console.log("🚀 GENERATING PDF...");
  console.log("📄 HTML LENGTH:", htmlContent?.length);

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath:
        "/root/.cache/puppeteer/chrome/linux-146.0.7680.153/chrome-linux64/chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // wait for images
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ✅ ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("📁 Folder created:", dir);
    }

    console.log("📄 FILE PATH:", filePath);

    // delete old file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑 Old PDF deleted");
    }

    // create PDF
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // check file
    if (fs.existsSync(filePath)) {
      console.log("✅ PDF SAVED:", filePath);
    } else {
      console.log("❌ PDF NOT CREATED");
    }

    return filePath; // 👈 important
  } catch (error) {
    console.error("❌ PDF GENERATION ERROR:", error);
    throw error;
  }
};