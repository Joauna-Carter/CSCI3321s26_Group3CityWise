var express = require("express");
var router = express.Router();
var db = require("../db/connection");

// helper for percentages
function percent(part, total) {
    part = Number(part) || 0;
    total = Number(total) || 0;

    if (total === 0) return 0;

    return Number(((part / total) * 100).toFixed(2));
}

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
            WHERE Users.IsDeleted = 0 OR Users.IsDeleted IS NULL
            ORDER BY Leaderboard.TotalQuizPoints DESC, Leaderboard.BestScore DESC
        `);

        res.render("leaderboard", {
            leaderboardRows: leaderboardRows[0] || []
        });
    } catch (err) {
        console.error("Leaderboard error:", err);
        res.status(500).send("Could not load leaderboard.");
    }
});

// statistics
router.get("/statistics", async function(req, res) {
    try {
        // USER TOTALS
        var userRows = await db.query(`
            SELECT
                COUNT(*) AS TotalUsers,
                SUM(CASE WHEN UserType = 'admin' THEN 1 ELSE 0 END) AS TotalAdmins,
                SUM(CASE WHEN UserType = 'user' THEN 1 ELSE 0 END) AS TotalRegularUsers,
                SUM(CASE WHEN IsDeleted = 0 OR IsDeleted IS NULL THEN 1 ELSE 0 END) AS TotalActiveUsers,
                SUM(CASE WHEN IsDeleted = 1 THEN 1 ELSE 0 END) AS TotalDeletedUsers
            FROM Users
        `);

        // SCORE STATS
        var scoreRows = await db.query(`
            SELECT
                COUNT(*) AS TotalQuizAttempts,
                SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS TotalQuizzesCompleted,
                SUM(CASE WHEN Status = 'abandoned' THEN 1 ELSE 0 END) AS TotalQuizzesAbandoned,
                SUM(CASE WHEN Timed = 1 THEN 1 ELSE 0 END) AS TotalTimedQuizzes,
                SUM(CASE WHEN Timed = 0 THEN 1 ELSE 0 END) AS TotalUntimedQuizzes,
                COALESCE(AVG(CASE WHEN Status = 'completed' THEN Score END), 0) AS AverageQuizScore,
                COALESCE(MAX(CASE WHEN Status = 'completed' THEN Score END), 0) AS HighestQuizScore,
                COALESCE(MIN(CASE WHEN Status = 'completed' THEN Score END), 0) AS LowestQuizScore
            FROM QuizAttempts
        `);

        // POINT STATS
        var pointRows = await db.query(`
            SELECT
                COALESCE(SUM(TotalQuizPoints), 0) AS TotalQuizPoints,
                COALESCE(MAX(TotalQuizPoints), 0) AS TopPlayerTotalPoints,
                COALESCE(AVG(CASE WHEN QuizzesCompleted > 0 THEN TotalQuizPoints END), 0) AS AveragePointsPerUser
            FROM Leaderboard
        `);

        // FLASHCARDS
        var flashcardRows = await db.query(`
            SELECT
                COUNT(*) AS TotalFlashcardSessions,
                COUNT(DISTINCT UserID) AS UsersWhoUsedFlashcards
            FROM FlashcardSessions
        `);

        // MODE
        var modeRows = await db.query(`
            SELECT Mode, COUNT(*) AS ModeCount
            FROM QuizAttempts
            WHERE Status = 'completed'
            GROUP BY Mode
            ORDER BY ModeCount DESC
            LIMIT 1
        `);

        // DIFFICULTY
        var difficultyRows = await db.query(`
            SELECT
                SUM(CASE WHEN Difficulty = 'easy' THEN 1 ELSE 0 END) AS TotalEasyQuizzes,
                SUM(CASE WHEN Difficulty = 'medium' THEN 1 ELSE 0 END) AS TotalMediumQuizzes,
                SUM(CASE WHEN Difficulty = 'hard' THEN 1 ELSE 0 END) AS TotalHardQuizzes
            FROM QuizAttempts
            WHERE Status = 'completed'
        `);

        // PARTICIPATION
        var quizUserRows = await db.query(`
            SELECT COUNT(DISTINCT UserID) AS UsersWhoCompletedQuiz
            FROM QuizAttempts
            WHERE Status = 'completed'
        `);

        var inactiveRows = await db.query(`
            SELECT COUNT(*) AS InactiveUsers
            FROM Users
            WHERE (IsDeleted = 0 OR IsDeleted IS NULL)
              AND UserID NOT IN (
                  SELECT DISTINCT UserID FROM QuizAttempts WHERE Status = 'completed'
              )
              AND UserID NOT IN (
                  SELECT DISTINCT UserID FROM FlashcardSessions
              )
        `);

        var users = userRows[0][0] || {};
        var scores = scoreRows[0][0] || {};
        var points = pointRows[0][0] || {};
        var flashcards = flashcardRows[0][0] || {};
        var difficulty = difficultyRows[0][0] || {};
        var quizUsers = quizUserRows[0][0] || {};
        var inactiveUsers = inactiveRows[0][0] || {};

        var totalUsers = users.TotalUsers || 0;
        var activeUsers = users.TotalActiveUsers || 0;
        var totalAttempts = scores.TotalQuizAttempts || 0;
        var totalCompleted = scores.TotalQuizzesCompleted || 0;

        var websiteStats = {
            // SCORE
            AverageQuizScore: scores.AverageQuizScore || 0,
            HighestQuizScore: scores.HighestQuizScore || 0,
            LowestQuizScore: scores.LowestQuizScore || 0,

            // POINTS
            TotalQuizPoints: points.TotalQuizPoints || 0,
            TopPlayerTotalPoints: points.TopPlayerTotalPoints || 0,
            AveragePointsPerUser: points.AveragePointsPerUser || 0,

            // QUIZ TOTALS
            TotalQuizAttempts: totalAttempts,
            TotalQuizzesCompleted: totalCompleted,
            TotalQuizzesAbandoned: scores.TotalQuizzesAbandoned || 0,
            TotalTimedQuizzes: scores.TotalTimedQuizzes || 0,
            TotalUntimedQuizzes: scores.TotalUntimedQuizzes || 0,

            // USERS
            TotalUsers: totalUsers,
            TotalAdmins: users.TotalAdmins || 0,
            TotalRegularUsers: users.TotalRegularUsers || 0,
            TotalActiveUsers: activeUsers,
            TotalDeletedUsers: users.TotalDeletedUsers || 0,

            // FLASHCARDS
            TotalFlashcardSessions: flashcards.TotalFlashcardSessions || 0,
            UsersWhoUsedFlashcards: flashcards.UsersWhoUsedFlashcards || 0,

            // MODE
            MostPopularQuizMode: modeRows[0].length > 0 ? modeRows[0][0].Mode : "None",

            // DIFFICULTY
            TotalEasyQuizzes: difficulty.TotalEasyQuizzes || 0,
            TotalMediumQuizzes: difficulty.TotalMediumQuizzes || 0,
            TotalHardQuizzes: difficulty.TotalHardQuizzes || 0,

            // PERCENTAGES
            AdminPercent: percent(users.TotalAdmins, totalUsers),
            RegularUserPercent: percent(users.TotalRegularUsers, totalUsers),
            ActiveUserPercent: percent(users.TotalActiveUsers, totalUsers),
            DeletedUserPercent: percent(users.TotalDeletedUsers, totalUsers),

            QuizParticipationRate: percent(quizUsers.UsersWhoCompletedQuiz, activeUsers),
            FlashcardUsageRate: percent(flashcards.UsersWhoUsedFlashcards, activeUsers),
            InactiveUserRate: percent(inactiveUsers.InactiveUsers, activeUsers),

            CompletedQuizPercent: percent(scores.TotalQuizzesCompleted, totalAttempts),
            AbandonedQuizPercent: percent(scores.TotalQuizzesAbandoned, totalAttempts),

            TimedQuizPercent: percent(scores.TotalTimedQuizzes, totalAttempts),
            UntimedQuizPercent: percent(scores.TotalUntimedQuizzes, totalAttempts)
        };

        var userStats = null;

        if (req.session.user) {
            var userId = req.session.user.userId || req.session.user.UserID;

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