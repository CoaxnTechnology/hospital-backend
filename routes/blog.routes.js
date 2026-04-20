const express = require("express");
const router = express.Router();

const blogController = require("../controller/blog.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");

const multer = require("multer");
const path = require("path");

/**
 * ======================
 * LOCAL STORAGE (BLOG IMAGE)
 * ======================
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/blogs"); // 📁 folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * ======================
 * PUBLIC
 * ======================
 */
router.get("/", blogController.getBlogs);
router.get("/:id", blogController.getBlog);

/**
 * ======================
 * ADMIN
 * ======================
 */
router.post(
  "/",
  verifyToken,
  allowRoles("admin", "doctor"),
  upload.single("image"), // ✅ LOCAL
  blogController.createBlog
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor"),
  upload.single("image"), // ✅ LOCAL
  blogController.updateBlog
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin", "doctor"),
  blogController.deleteBlog
);

module.exports = router;