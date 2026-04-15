var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
var db = require("../db/connection");
var auth = require("../middleware/auth");

// home page
router.get("/", function(req, res) {
    res.render("home");
});

// register page
router.get("/register", function(req, res) {
    res.render("register");
});

// register submit
router.post("/register", async function(req, res) {
    try {
        var username = (req.body.username || "").trim();
        var password = (req.body.password || "").trim();

        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        var existingUserRows = await db.query(`
            SELECT UserID
            FROM Users
            WHERE Username = ?
        `, [username]);

        if (existingUserRows[0].length > 0) {
            return res.status(400).send("Username already exists.");
        }

        var passwordHash = await bcrypt.hash(password, 10);

        var insertUser = await db.query(`
            INSERT INTO Users (Username, PasswordHash, UserType)
            VALUES (?, ?, ?)
        `, [username, passwordHash, "user"]);

        var userId = insertUser[0].insertId;

        await db.query(`
            INSERT INTO UserProfiles (UserID, DisplayName)
            VALUES (?, ?)
        `, [userId, username]);

        await db.query(`
            INSERT INTO Leaderboard (UserID)
            VALUES (?)
        `, [userId]);

        await db.query(`
            INSERT INTO UserStatistics (UserID)
            VALUES (?)
        `, [userId]);

        req.session.user = {
            userId: userId,
            username: username,
            isAdmin: false
        };

        res.redirect("/");
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).send("Could not create account.");
    }
});

// login page
router.get("/login", function(req, res) {
    res.render("login");
});

// login submit
router.post("/login", async function(req, res) {
    try {
        var username = (req.body.username || "").trim();
        var password = (req.body.password || "").trim();

        if (!username || !password) {
            return res.status(400).send("Please enter username and password.");
        }

        var userRows = await db.query(`
            SELECT UserID, Username, PasswordHash, UserType, IsDeleted
            FROM Users
            WHERE Username = ?
            LIMIT 1
        `, [username]);

        if (userRows[0].length === 0) {
            return res.status(400).send("User not found.");
        }

        var user = userRows[0][0];

        if (user.IsDeleted) {
            return res.status(403).send("This account has been disabled.");
        }

        var passwordMatches = await bcrypt.compare(password, user.PasswordHash);

        if (!passwordMatches) {
            return res.status(400).send("Incorrect password.");
        }

        req.session.user = {
            userId: user.UserID,
            username: user.Username,
            isAdmin: user.UserType === "admin"
        };

        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Could not log in.");
    }
});

// logout
router.get("/logout", function(req, res) {
    req.session.destroy(function() {
        res.redirect("/");
    });
});

// profile
router.get("/profile", auth.requireLogin, async function(req, res) {
    try {
        var userId = req.session.user.userId;

        var statRows = await db.query(`
            SELECT
                LastQuizAttemptedAt,
                QuizzesCompleted,
                AverageScore,
                MostDoneQuizMode,
                BestScore,
                TotalQuizPoints,
                FlashcardSessionsUsed
            FROM UserStatistics
            WHERE UserID = ?
            LIMIT 1
        `, [userId]);

        var stats = statRows[0].length > 0 ? statRows[0][0] : null;

        res.render("profile", {
            stats: stats
        });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).send("Could not load profile.");
    }
});

module.exports = router;