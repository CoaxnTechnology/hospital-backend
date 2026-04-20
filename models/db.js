var mysql = require("mysql2");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Hammad@4747",
  database: "hmsystem",
});

con.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("Database connected successfully");
  }
});

module.exports = con;
