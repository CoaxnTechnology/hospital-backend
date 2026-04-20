const Blog = require("../models/blog");
const { compressImage } = require("../utils/imageHelper");
/**
 * CREATE BLOG
 */
exports.createBlog = async (req, res) => {
  try {
    let image = null;

    if (req.file) {
      const filePath = req.file.path;
      const compressedFileName = await compressImage(filePath);
      image = `/uploads/blogs/${compressedFileName}`;
    }

    const data = {
      ...req.body,
      image: req.file
        ? `/uploads/blogs/${req.file.filename}` // ✅ LOCAL PATH
        : null,
    };

    await Blog.addBlog(data);

    res.json({
      success: true,
      message: "Blog added successfully",
    });
  } catch (err) {
    console.error("❌ CREATE BLOG ERROR:", err);
    res.status(500).json({ success: false });
  }
};

/**
 * GET ALL BLOGS (PUBLIC)
 */
exports.getBlogs = async (req, res) => {
  try {
    const data = await Blog.getAllBlogs();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/**
 * GET BLOG BY ID
 */
exports.getBlog = async (req, res) => {
  try {
    const data = await Blog.getBlogById(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/**
 * UPDATE BLOG
 */
exports.updateBlog = async (req, res) => {
  try {
    const existing = await Blog.getBlogById(req.params.id);

    let image = existing?.image;

    if (req.file) {
      const filePath = req.file.path;

      // 🔥 COMPRESS IMAGE
      const compressedFileName = await compressImage(filePath);

      image = `/uploads/blogs/${compressedFileName}`;

      // 🔥 OLD IMAGE DELETE
      if (existing?.image) {
        const oldPath = "uploads/blogs/" + existing.image.split("/").pop();

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const data = {
      ...req.body,
      image,
    };

    await Blog.updateBlog(req.params.id, data);

    res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE BLOG ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update blog",
    });
  }
};
/**
 * DELETE BLOG
 */
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.deleteBlog(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
