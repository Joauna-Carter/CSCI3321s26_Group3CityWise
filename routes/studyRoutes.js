var express = require("express");
var router = express.Router();
var db = require("../db/connection");
var quizHelpers = require("../utils/quizHelpers");
var { renderPage, escapeHtml } = require("../utils/pageHelpers");

// study and quiz setup page
router.get("/study", async function(req, res) {
    try {
        var selectedCityId = req.query.cityId || "";
        var mode = req.query.mode || "quiz";

        var cityRows = await db.query(`
            SELECT CityID, CityName
            FROM Cities
            ORDER BY CityName
        `);

        var regionRows = await db.query(`
            SELECT RegionID, RegionName
            FROM Regions
            ORDER BY RegionName
        `);

        res.render("study", {
            cities: cityRows[0],
            regions: regionRows[0],
            selectedCityId: selectedCityId,
            mode: mode
        });
    } catch (err) {
        console.error("Study page error:", err);
        res.status(500).send("Could not load study page.");
    }
});

// study form submit
router.post("/study/start", async function(req, res) {
    try {
        var mode = req.body.mode || "quiz";
        var cityId = req.body.cityId || "";
        var regionId = req.body.regionId || "";
        var requestedCityCount = req.body.requestedCityCount || "";
        var difficulty = req.body.difficulty || "easy";
        var timed = req.body.timed === "1";

        if (mode === "flashcards") {
            var flashcardUrl = "/flashcards/start?cityId=" + encodeURIComponent(cityId) +
                "&regionId=" + encodeURIComponent(regionId) +
                "&requestedCityCount=" + encodeURIComponent(requestedCityCount);

            return res.redirect(flashcardUrl);
        }

        var quizUrl = "/quiz/start?cityId=" + encodeURIComponent(cityId) +
            "&regionId=" + encodeURIComponent(regionId) +
            "&requestedCityCount=" + encodeURIComponent(requestedCityCount) +
            "&difficulty=" + encodeURIComponent(difficulty) +
            "&timed=" + encodeURIComponent(timed ? "1" : "0");

        res.redirect(quizUrl);
    } catch (err) {
        console.error("Study start error:", err);
        res.status(500).send("Could not start activity.");
    }
});

// start quiz and generate questions
router.get("/quiz/start", async function(req, res) {
    try {
        var cityId = req.query.cityId || "";
        var regionId = req.query.regionId || "";
        var requestedCityCount = req.query.requestedCityCount || "";
        var difficulty = req.query.difficulty || "easy";
        var timed = req.query.timed === "1";

        var selectedCities = await quizHelpers.getSelectedCities({
            cityId: cityId,
            regionId: regionId,
            requestedCityCount: requestedCityCount
        });

        if (!selectedCities || selectedCities.length === 0) {
            return res.send(renderPage(req, "Quiz", "<p>No cities were found for this quiz selection.</p><p><a href='/study'>Go back</a></p>"));
        }

        var cityIds = selectedCities.map(function(city) {
            return city.CityID;
        });

        var facts = await quizHelpers.getFactsForCities(cityIds);
        var templates = await quizHelpers.getQuestionTemplates();
        var questions = quizHelpers.generateQuizQuestions(selectedCities, facts, templates, difficulty);

        if (questions.length === 0) {
            return res.send(renderPage(req, "Quiz", "<p>Not enough facts/templates are available to generate quiz questions yet.</p><p><a href='/study'>Go back</a></p>"));
        }

        req.session.currentQuiz = {
            cityId: cityId || null,
            regionId: regionId || null,
            requestedCityCount: requestedCityCount || null,
            difficulty: difficulty,
            timed: timed,
            selectedCities: selectedCities,
            questions: questions
        };

        res.redirect("/quiz");
    } catch (err) {
        console.error("Quiz start error:", err);
        res.status(500).send("Could not generate quiz.");
    }
});

// show current quiz
router.get("/quiz", function(req, res) {
    var quiz = req.session.currentQuiz;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return res.send(renderPage(req, "Quiz", "<p>No quiz is active right now.</p><p><a href='/study'>Go to Study &amp; Quiz</a></p>"));
    }

    var content = "";
    content += "<section class='hero'>";
    content += "<h1>Trivia Quiz</h1>";
    content += "<p><strong>Difficulty:</strong> " + escapeHtml(quiz.difficulty) + "</p>";
    content += "<p><strong>Timed:</strong> " + (quiz.timed ? "Yes" : "No") + "</p>";
    content += "</section>";

    content += "<section class='cities-section'>";
    content += "<form method='POST' action='/quiz/submit'>";

    quiz.questions.forEach(function(question, index) {
        content += "<div class='city-card'>";
        content += "<p><strong>Question " + (index + 1) + ":</strong> " + escapeHtml(question.questionText) + "</p>";

        if (question.questionType === "MC" || question.questionType === "TF") {
            question.choices.forEach(function(choice, choiceIndex) {
                var choiceId = "q_" + index + "_" + choiceIndex;
                content += "<p>";
                content += "<label for='" + choiceId + "'>";
                content += "<input type='radio' id='" + choiceId + "' name='answer_" + index + "' value='" + escapeHtml(choice) + "' required> ";
                content += escapeHtml(choice);
                content += "</label>";
                content += "</p>";
            });
        } else {
            content += "<p><input type='text' name='answer_" + index + "' required></p>";
        }

        content += "</div>";
    });

    content += "<p><button type='submit'>Submit Quiz</button></p>";
    content += "</form>";
    content += "</section>";

    res.send(renderPage(req, "Quiz", content));
});

// submit quiz
router.post("/quiz/submit", async function(req, res) {
    try {
        var quiz = req.session.currentQuiz;

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return res.send(renderPage(req, "Quiz Results", "<p>No active quiz to submit.</p><p><a href='/study'>Back to Study &amp; Quiz</a></p>"));
        }

        var score = 0;
        var gradedQuestions = [];

        quiz.questions.forEach(function(question, index) {
            var userAnswer = req.body["answer_" + index] || "";
            var normalizedUserAnswer = String(userAnswer).trim().toLowerCase();
            var normalizedCorrectAnswer = String(question.correctAnswer).trim().toLowerCase();

            var isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

            if (isCorrect) {
                score += 1;
            }

            gradedQuestions.push({
                templateId: question.templateId,
                cityId: question.cityId,
                questionText: question.questionText,
                correctAnswer: question.correctAnswer,
                userAnswer: userAnswer,
                isCorrect: isCorrect
            });
        });

        if (req.session.user) {
            await quizHelpers.saveQuizResults(req.session.user.userId, quiz, gradedQuestions, score);
        }

        var content = "";
        content += "<section class='hero'>";
        content += "<h1>Quiz Results</h1>";
        content += "<p><strong>Score:</strong> " + score + " / " + quiz.questions.length + "</p>";

        if (!req.session.user) {
            content += "<p>You played as a guest, so this score was not saved.</p>";
        }

        content += "</section>";

        content += "<section class='cities-section'>";

        gradedQuestions.forEach(function(question, index) {
            content += "<div class='city-card'>";
            content += "<p><strong>Question " + (index + 1) + ":</strong> " + escapeHtml(question.questionText) + "</p>";
            content += "<p><strong>Your Answer:</strong> " + escapeHtml(question.userAnswer || "(blank)") + "</p>";
            content += "<p><strong>Correct Answer:</strong> " + escapeHtml(question.correctAnswer) + "</p>";
            content += "<p><strong>Result:</strong> " + (question.isCorrect ? "Correct" : "Incorrect") + "</p>";
            content += "</div>";
        });

        content += "<p><a href='/study'>Start Another Quiz</a></p>";
        content += "</section>";

        req.session.currentQuiz = null;

        res.send(renderPage(req, "Quiz Results", content));
    } catch (err) {
        console.error("Quiz submit error:", err);
        res.status(500).send("Could not grade quiz.");
    }
});

// start flashcards
router.get("/flashcards/start", async function(req, res) {
    try {
        var cityId = req.query.cityId || "";
        var regionId = req.query.regionId || "";
        var requestedCityCount = req.query.requestedCityCount || "";

        var selectedCities = await quizHelpers.getSelectedCities({
            cityId: cityId,
            regionId: regionId,
            requestedCityCount: requestedCityCount
        });

        if (!selectedCities || selectedCities.length === 0) {
            return res.send(renderPage(req, "Flashcards", "<p>No cities were found for this flashcard selection.</p><p><a href='/study'>Go back</a></p>"));
        }

        var cityIds = selectedCities.map(function(city) {
            return city.CityID;
        });

        var facts = await quizHelpers.getFactsForCities(cityIds);

        if (facts.length === 0) {
            return res.send(renderPage(req, "Flashcards", "<p>No flashcard facts are available yet.</p><p><a href='/study'>Go back</a></p>"));
        }

        if (req.session.user) {
            await quizHelpers.saveFlashcardSession(req.session.user.userId, selectedCities, facts, {
                cityId: cityId || null,
                regionId: regionId || null,
                requestedCityCount: requestedCityCount || null
            });
        }

        var flashcards = facts.map(function(fact) {
            var city = selectedCities.find(function(item) {
                return item.CityID === fact.CityID;
            });

            if (!city) {
                return null;
            }

            return {
                frontText: city.CityName + " - " + fact.FactLabel,
                backText: fact.FactValue
            };
        }).filter(function(card) {
            return card !== null;
        });

        res.render("flashcards", {
            flashcards: flashcards,
            isGuest: !req.session.user
        });
    } catch (err) {
        console.error("Flashcards error:", err);
        res.status(500).send("Could not load flashcards.");
    }
});

module.exports = router;