require("dotenv").config();

var mysql = require("mysql2/promise");

var db = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "citywise_user",
    password: process.env.DB_PASSWORD || "citywise_password",
    database: process.env.DB_NAME || "citywise",
    port: process.env.DB_PORT || 3308,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;