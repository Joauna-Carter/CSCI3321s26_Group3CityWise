// statsRoutes.js
// Handles leaderboard, website statistics, user statistics, and a small database test route

var express = require("express"); // Imports Express for routing
var router = express.Router(); // Creates a router object for this file
var db = require("../db/connection"); // Imports the MySQL database connection

// Converts a part and total into a percentage rounded to two decimal places
function percent(part, total) {
    // Convert possible string/null database values into safe numbers
    part = Number(part) || 0;
    total = Number(total) || 0;

    // Prevent division by zero when there is no total
    if (total === 0) {
        return 0;
    }

    // Return percentage rounded to 2 decimal places
    return Number(((part / total) * 100).toFixed(2));
}

// Leaderboard page
router.get("/leaderboard", async function(req, res) {
    try {
        // Build leaderboard directly from completed quiz attempts so it matches current quiz data
        var leaderboardRows = await db.query(`
            SELECT
                Users.Username,
                COALESCE(SUM(CASE WHEN QuizAttempts.Status = 'completed' THEN QuizAttempts.Score ELSE 0 END), 0) AS TotalQuizPoints,
                COALESCE(SUM(CASE WHEN QuizAttempts.Status = 'completed' THEN 1 ELSE 0 END), 0) AS QuizzesCompleted,
                COALESCE(AVG(CASE WHEN QuizAttempts.Status = 'completed' THEN QuizAttempts.Score END), 0) AS AverageScore,
                COALESCE(MAX(CASE WHEN QuizAttempts.Status = 'completed' THEN QuizAttempts.Score END), 0) AS BestScore
            FROM Users
            LEFT JOIN QuizAttempts ON Users.UserID = QuizAttempts.UserID
            WHERE Users.IsDeleted = 0 OR Users.IsDeleted IS NULL
            GROUP BY Users.UserID, Users.Username
            ORDER BY TotalQuizPoints DESC, BestScore DESC, Username ASC
        `);

        // Render leaderboard page with calculated ranking data
        res.render("leaderboard", {
            leaderboardRows: leaderboardRows[0] || []
        });
    } catch (err) {
        // Log server-side error for debugging
        console.error("Leaderboard error:", err);

        // Show simple error message to the user
        res.status(500).send("Could not load leaderboard.");
    }
});

// Statistics page
router.get("/statistics", async function(req, res) {
    try {
        // Get user totals from Users table
        var userRows = await db.query(`
            SELECT
                COUNT(*) AS TotalUsers,
                SUM(CASE WHEN UserType = 'admin' THEN 1 ELSE 0 END) AS TotalAdmins,
                SUM(CASE WHEN UserType = 'user' THEN 1 ELSE 0 END) AS TotalRegularUsers,
                SUM(CASE WHEN IsDeleted = 0 OR IsDeleted IS NULL THEN 1 ELSE 0 END) AS TotalActiveUsers,
                SUM(CASE WHEN IsDeleted = 1 THEN 1 ELSE 0 END) AS TotalDeletedUsers
            FROM Users
        `);

        // Get quiz totals and score values from QuizAttempts table
        var scoreRows = await db.query(`
            SELECT
                COUNT(*) AS TotalQuizAttempts,
                SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS TotalQuizzesCompleted,
                SUM(CASE WHEN Status = 'abandoned' THEN 1 ELSE 0 END) AS TotalQuizzesAbandoned,
                SUM(CASE WHEN Status = 'in_progress' THEN 1 ELSE 0 END) AS TotalQuizzesInProgress,
                SUM(CASE WHEN Timed = 1 THEN 1 ELSE 0 END) AS TotalTimedQuizzes,
                SUM(CASE WHEN Timed = 0 THEN 1 ELSE 0 END) AS TotalUntimedQuizzes,
                COALESCE(AVG(CASE WHEN Status = 'completed' THEN Score END), 0) AS AverageQuizScore,
                COALESCE(MAX(CASE WHEN Status = 'completed' THEN Score END), 0) AS HighestQuizScore,
                COALESCE(MIN(CASE WHEN Status = 'completed' THEN Score END), 0) AS LowestQuizScore
            FROM QuizAttempts
        `);

        // Get point totals directly from completed quiz scores
        var pointRows = await db.query(`
            SELECT
                COALESCE(SUM(CASE WHEN Status = 'completed' THEN Score ELSE 0 END), 0) AS TotalQuizPoints,
                COALESCE(MAX(UserTotals.TotalQuizPoints), 0) AS TopPlayerTotalPoints,
                COALESCE(AVG(CASE WHEN UserTotals.QuizzesCompleted > 0 THEN UserTotals.TotalQuizPoints END), 0) AS AveragePointsPerUser
            FROM QuizAttempts
            LEFT JOIN (
                SELECT
                    UserID,
                    SUM(CASE WHEN Status = 'completed' THEN Score ELSE 0 END) AS TotalQuizPoints,
                    SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS QuizzesCompleted
                FROM QuizAttempts
                GROUP BY UserID
            ) AS UserTotals ON QuizAttempts.UserID = UserTotals.UserID
        `);

        // Get flashcard session totals from FlashcardSessions table
        var flashcardRows = await db.query(`
            SELECT
                COUNT(*) AS TotalFlashcardSessions,
                COUNT(DISTINCT UserID) AS UsersWhoUsedFlashcards
            FROM FlashcardSessions
        `);

        // Find the most common completed quiz mode
        var modeRows = await db.query(`
            SELECT Mode, COUNT(*) AS ModeCount
            FROM QuizAttempts
            WHERE Status = 'completed'
            GROUP BY Mode
            ORDER BY ModeCount DESC
            LIMIT 1
        `);

        // Count completed quizzes by difficulty level
        var difficultyRows = await db.query(`
            SELECT
                SUM(CASE WHEN Difficulty = 'easy' THEN 1 ELSE 0 END) AS TotalEasyQuizzes,
                SUM(CASE WHEN Difficulty = 'medium' THEN 1 ELSE 0 END) AS TotalMediumQuizzes,
                SUM(CASE WHEN Difficulty = 'hard' THEN 1 ELSE 0 END) AS TotalHardQuizzes
            FROM QuizAttempts
            WHERE Status = 'completed'
        `);

        // Count users who completed at least one quiz
        var quizUserRows = await db.query(`
            SELECT COUNT(DISTINCT UserID) AS UsersWhoCompletedQuiz
            FROM QuizAttempts
            WHERE Status = 'completed'
        `);

        // Count active users who have not completed quizzes or used flashcards
        var inactiveRows = await db.query(`
            SELECT COUNT(*) AS InactiveUsers
            FROM Users
            WHERE (IsDeleted = 0 OR IsDeleted IS NULL)
              AND UserID NOT IN (
                  SELECT DISTINCT UserID
                  FROM QuizAttempts
                  WHERE Status = 'completed'
              )
              AND UserID NOT IN (
                  SELECT DISTINCT UserID
                  FROM FlashcardSessions
              )
        `);

        // Store query results in easier variable names
        var users = userRows[0][0] || {};
        var scores = scoreRows[0][0] || {};
        var points = pointRows[0][0] || {};
        var flashcards = flashcardRows[0][0] || {};
        var difficulty = difficultyRows[0][0] || {};
        var quizUsers = quizUserRows[0][0] || {};
        var inactiveUsers = inactiveRows[0][0] || {};

        // Convert important totals into numbers for percentage calculations
        var totalUsers = Number(users.TotalUsers) || 0;
        var activeUsers = Number(users.TotalActiveUsers) || 0;
        var totalAttempts = Number(scores.TotalQuizAttempts) || 0;
        var totalCompleted = Number(scores.TotalQuizzesCompleted) || 0;

        // Build one object containing all website statistics used by the EJS page
        var websiteStats = {
            AverageQuizScore: Number(scores.AverageQuizScore) || 0,
            HighestQuizScore: Number(scores.HighestQuizScore) || 0,
            LowestQuizScore: Number(scores.LowestQuizScore) || 0,
            TotalQuizPoints: Number(points.TotalQuizPoints) || 0,
            TopPlayerTotalPoints: Number(points.TopPlayerTotalPoints) || 0,
            AveragePointsPerUser: Number(points.AveragePointsPerUser) || 0,
            TotalQuizAttempts: totalAttempts,
            TotalQuizzesCompleted: totalCompleted,
            TotalQuizzesAbandoned: Number(scores.TotalQuizzesAbandoned) || 0,
            TotalQuizzesInProgress: Number(scores.TotalQuizzesInProgress) || 0,
            TotalTimedQuizzes: Number(scores.TotalTimedQuizzes) || 0,
            TotalUntimedQuizzes: Number(scores.TotalUntimedQuizzes) || 0,
            TotalUsers: totalUsers,
            TotalAdmins: Number(users.TotalAdmins) || 0,
            TotalRegularUsers: Number(users.TotalRegularUsers) || 0,
            TotalActiveUsers: activeUsers,
            TotalDeletedUsers: Number(users.TotalDeletedUsers) || 0,
            TotalFlashcardSessions: Number(flashcards.TotalFlashcardSessions) || 0,
            UsersWhoUsedFlashcards: Number(flashcards.UsersWhoUsedFlashcards) || 0,
            MostPopularQuizMode: modeRows[0].length > 0 ? modeRows[0][0].Mode : "None",
            TotalEasyQuizzes: Number(difficulty.TotalEasyQuizzes) || 0,
            TotalMediumQuizzes: Number(difficulty.TotalMediumQuizzes) || 0,
            TotalHardQuizzes: Number(difficulty.TotalHardQuizzes) || 0,
            AdminPercent: percent(users.TotalAdmins, totalUsers),
            RegularUserPercent: percent(users.TotalRegularUsers, totalUsers),
            ActiveUserPercent: percent(users.TotalActiveUsers, totalUsers),
            DeletedUserPercent: percent(users.TotalDeletedUsers, totalUsers),
            QuizParticipationRate: percent(quizUsers.UsersWhoCompletedQuiz, activeUsers),
            FlashcardUsageRate: percent(flashcards.UsersWhoUsedFlashcards, activeUsers),
            InactiveUserRate: percent(inactiveUsers.InactiveUsers, activeUsers),
            CompletedQuizPercent: percent(scores.TotalQuizzesCompleted, totalAttempts),
            AbandonedQuizPercent: percent(scores.TotalQuizzesAbandoned, totalAttempts),
            InProgressQuizPercent: percent(scores.TotalQuizzesInProgress, totalAttempts),
            TimedQuizPercent: percent(scores.TotalTimedQuizzes, totalAttempts),
            UntimedQuizPercent: percent(scores.TotalUntimedQuizzes, totalAttempts)
        };

        // Default user stats to null for guests
        var userStats = null;

        // Only load personal stats if someone is logged in
        if (req.session.user) {
            // Get user ID from session, supporting alternate field names
            var userId = req.session.user.userId || req.session.user.UserID;

            // Load current user's saved statistics
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

            // Use stats row if found
            userStats = statRows[0].length > 0 ? statRows[0][0] : null;
        }

        // Render statistics page with website-level and user-level data
        res.render("statistics", {
            websiteStats: websiteStats,
            userStats: userStats
        });
    } catch (err) {
        // Log server-side error for debugging
        console.error("Statistics error:", err);

        // Show simple error message to the user
        res.status(500).send("Could not load statistics.");
    }
});

// Test route used to verify database joins between Cities, Countries, and Regions
router.get("/test-db", async function(req, res) {
    try {
        // Query city records with country and region names
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

        // Return raw JSON for debugging
        res.json(rows[0]);
    } catch (err) {
        // Log database test error
        console.error("Test DB query failed:", err);

        // Send simple failure response
        res.status(500).send("Database query failed.");
    }
});

// Export router for use in app.js
module.exports = router;