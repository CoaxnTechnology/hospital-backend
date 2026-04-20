const crypto = require("crypto");

/**
 * Generate secure reset token
 */
exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
