const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST, // localhost
  user: process.env.DB_USER, // cpanel user
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// connection check
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully");
    connection.release();
  }
});

module.exports = db.promise();
