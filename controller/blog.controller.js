const Blog = require("../models/blog");

/**
 * CREATE BLOG
 */
exports.createBlog = async (req, res) => {
  try {
    let image = null;

    if (req.file) {
      image = `/uploads/blogs/${req.file.filename}`;
      console.log("📦 Uploaded:", req.file.filename);
    }

    const data = {
      ...req.body,
      image,
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
      image = `/uploads/blogs/${req.file.filename}`;
      console.log("📦 New image:", req.file.filename);

      // optional old delete
      if (existing?.image) {
        const oldPath = "uploads/blogs/" + existing.image.split("/").pop();

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await Blog.updateBlog(req.params.id, {
      ...req.body,
      image,
    });

    res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (err) {
    console.error("❌ UPDATE BLOG ERROR:", err);
    res.status(500).json({ success: false });
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
