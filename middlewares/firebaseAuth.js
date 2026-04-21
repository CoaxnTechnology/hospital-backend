const admin = require("../utils/firebaseAdmin");

exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    console.log("🔐 Firebase auth middleware entered");
    console.log("🔐 Request headers.authorization:", req.headers.authorization);

    const token = req.headers.authorization?.split("Bearer ")[1];
    console.log("🔐 Extracted Firebase token:", token ? "[REDACTED]" : token);

    if (!token) {
      console.log("⚠️ Firebase auth failed: no token provided");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Firebase decoded token:", decoded);

    // 🔥 USER SAVE
    req.firebaseUser = decoded;

    next();
  } catch (err) {
    console.error("❌ Firebase Token Error:", err);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
