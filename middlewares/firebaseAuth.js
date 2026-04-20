const admin = require("../utils/firebaseAdmin");

exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);

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