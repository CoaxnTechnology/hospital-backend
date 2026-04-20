exports.forcePasswordChange = (req, res, next) => {
  if (req.user.is_first_login) {
    return res.status(403).json({
      success: false,
      message: "Password change required",
      code: "FORCE_PASSWORD_CHANGE",
    });
  }
  next();
};
