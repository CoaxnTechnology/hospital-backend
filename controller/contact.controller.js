const { sendContactEmail } = require("../utils/email.util");

exports.contact = async (req, res) => {
  try {
    await sendContactEmail(req.body);

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
