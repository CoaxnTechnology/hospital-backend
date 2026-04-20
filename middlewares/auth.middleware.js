const jwt = require("jsonwebtoken");

/* ======================
   VERIFY TOKEN
====================== */
exports.verifyToken = (req, res, next) => {
  try {
  //  console.log("🔐 VERIFY TOKEN START");

    const authHeader = req.headers.authorization;
    // console.log("📩 AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log("❌ NO TOKEN FOUND");
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];
    //   console.log("🔑 TOKEN EXTRACTED:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   console.log("✅ TOKEN DECODED:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("❌ TOKEN ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* ======================
   ROLE BASED ACCESS
====================== */
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    //  console.log("🧑 USER:", req.user);
    // console.log("🎭 USER ROLE:", req.user?.role);
    //console.log("✅ ALLOWED ROLES:", roles);

    if (!req.user || !req.user.role) {
      console.log("❌ NO ROLE FOUND");
      return res.status(403).json({
        success: false,
        message: "No role found",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log("❌ ROLE NOT MATCH");
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

   // console.log("✅ ROLE MATCH SUCCESS");

    next();
  };
};
