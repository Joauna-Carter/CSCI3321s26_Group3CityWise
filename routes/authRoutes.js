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
    res.render("register", {
        errorMessage: "",
        username: "",
        email: ""
    });
});

// register submit
router.post("/register", async function(req, res) {
    try {
        var username = (req.body.username || "").trim();
        var email = (req.body.email || "").trim().toLowerCase();
        var password = (req.body.password || "").trim();
        var emailColumnRows = await db.query(`
            SHOW COLUMNS FROM Users LIKE 'Email'
        `);

        if (emailColumnRows[0].length === 0) {
            await db.query(`
                ALTER TABLE Users
                ADD COLUMN Email VARCHAR(255) NULL UNIQUE
            `);
        }

        if (!username || !email || !password) {
            return res.render("register", {
                errorMessage: "Username, email, and password are required.",
                username: username,
                email: email
            });
        }

        var existingUserRows = await db.query(`
            SELECT UserID
            FROM Users
            WHERE Username = ?
        `, [username]);

        if (existingUserRows[0].length > 0) {
            return res.render("register", {
                errorMessage: "Username already exists.",
                username: username,
                email: email
            });
        }

        var existingEmailRows = await db.query(`
            SELECT UserID
            FROM Users
            WHERE Email = ?
        `, [email]);

        if (existingEmailRows[0].length > 0) {
            return res.render("register", {
                errorMessage: "Email already exists.",
                username: username,
                email: email
            });
        }

        var passwordHash = await bcrypt.hash(password, 10);

        var insertUser = await db.query(`
            INSERT INTO Users (Username, Email, PasswordHash, UserType)
            VALUES (?, ?, ?, ?)
        `, [username, email, passwordHash, "user"]);

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
            userType: "user",
            isAdmin: false
        };

        req.session.isAdmin = false;

        res.redirect("/");
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).render("register", {
            errorMessage: "Could not create account.",
            username: (req.body.username || "").trim(),
            email: (req.body.email || "").trim().toLowerCase()
        });
    }
});

// login page
router.get("/login", function(req, res) {
    res.render("login", {
        errorMessage: "",
        email: ""
    });
});

// login submit
router.post("/login", async function(req, res) {
    try {
        var email = (req.body.email || req.body.username || "").trim();
        var password = (req.body.password || "").trim();
        var emailColumnRows = await db.query(`
            SHOW COLUMNS FROM Users LIKE 'Email'
        `);
        var hasEmailColumn = emailColumnRows[0].length > 0;

        if (!hasEmailColumn) {
            await db.query(`
                ALTER TABLE Users
                ADD COLUMN Email VARCHAR(255) NULL UNIQUE
            `);

            hasEmailColumn = true;
        }

        if (!email || !password) {
            return res.render("login", {
                errorMessage: "Please enter email and password.",
                email: email
            });
        }

        var userRows;

        if (hasEmailColumn) {
            userRows = await db.query(`
                SELECT UserID, Username, Email, PasswordHash, UserType, IsDeleted
                FROM Users
                WHERE LOWER(Email) = LOWER(?)
                   OR ((Email IS NULL OR Email = '') AND BINARY Username = ?)
                LIMIT 1
            `, [email, email]);
        } else {
            userRows = await db.query(`
                SELECT UserID, Username, PasswordHash, UserType, IsDeleted
                FROM Users
                WHERE BINARY Username = ?
                LIMIT 1
            `, [email]);
        }

        if (userRows[0].length === 0) {
            return res.render("login", {
                errorMessage: "Email or username not found.",
                email: email
            });
        }

        var user = userRows[0][0];

        if (user.IsDeleted) {
            return res.render("login", {
                errorMessage: "This account has been disabled.",
                email: email
            });
        }

        var passwordMatches = await bcrypt.compare(password, user.PasswordHash);

        if (!passwordMatches) {
            return res.render("login", {
                errorMessage: "Incorrect email, username, or password.",
                email: email
            });
        }

       req.session.user = {
        
        userId: user.UserID,
        username: user.Username,
        userType: user.UserType,
        isAdmin: user.UserType === "admin"
       };

        req.session.isAdmin = user.UserType === "admin";

        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).render("login", {
            errorMessage: "Could not log in.",
            email: (req.body.email || req.body.username || "").trim()
        });
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
