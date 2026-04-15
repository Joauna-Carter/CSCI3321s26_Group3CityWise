var express = require("express");
var router = express.Router();
var db = require("../db/connection");

// leaderboard
router.get("/leaderboard", async function(req, res) {
    try {
        var leaderboardRows = await db.query(`
            SELECT
                Users.Username,
                Leaderboard.TotalQuizPoints,
                Leaderboard.QuizzesCompleted,
                Leaderboard.AverageScore,
                Leaderboard.BestScore
            FROM Leaderboard
            JOIN Users ON Leaderboard.UserID = Users.UserID
            ORDER BY Leaderboard.TotalQuizPoints DESC, Leaderboard.BestScore DESC
        `);

        res.render("leaderboard", {
            leaderboardRows: leaderboardRows[0]
        });
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).send("Could not load leaderboard.");
    }
});

// statistics
router.get("/statistics", async function(req, res) {
    try {
        var websiteRows = await db.query(`
            SELECT
                COUNT(*) AS TotalUsers,
                SUM(CASE WHEN Users.UserType = 'admin' THEN 1 ELSE 0 END) AS TotalAdmins,
                SUM(CASE WHEN Users.UserType = 'user' THEN 1 ELSE 0 END) AS TotalRegularUsers,
                COALESCE(SUM(UserStatistics.QuizzesCompleted), 0) AS TotalQuizzesCompleted,
                COALESCE(AVG(UserStatistics.AverageScore), 0) AS AverageQuizScore,
                COALESCE(MAX(UserStatistics.BestScore), 0) AS HighestQuizScore,
                COALESCE(SUM(UserStatistics.FlashcardSessionsUsed), 0) AS TotalFlashcardSessions
            FROM Users
            LEFT JOIN UserStatistics ON Users.UserID = UserStatistics.UserID
            WHERE Users.IsDeleted = 0 OR Users.IsDeleted IS NULL
        `);

        var modeRows = await db.query(`
            SELECT MostDoneQuizMode, COUNT(*) AS ModeCount
            FROM UserStatistics
            WHERE MostDoneQuizMode IS NOT NULL
              AND MostDoneQuizMode <> ''
            GROUP BY MostDoneQuizMode
            ORDER BY ModeCount DESC
            LIMIT 1
        `);

        var websiteStats = websiteRows[0][0];
        websiteStats.MostPopularQuizMode = modeRows[0].length > 0 ? modeRows[0][0].MostDoneQuizMode : "None";

        var userStats = null;

        if (req.session.user) {
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

            userStats = statRows[0].length > 0 ? statRows[0][0] : null;
        }

        res.render("statistics", {
            websiteStats: websiteStats,
            userStats: userStats
        });
    } catch (err) {
        console.error("Statistics error:", err);
        res.status(500).send("Could not load statistics.");
    }
});

// test database route
router.get("/test-db", async function(req, res) {
    try {
        var rows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Countries.CountryName,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Cities.CityID
        `);

        res.json(rows[0]);
    } catch (err) {
        console.error("Test DB query failed:", err);
        res.status(500).send("Database query failed.");
    }
});

module.exports = router;