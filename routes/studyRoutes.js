// studyRoutes.js

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
        var allFacts = await quizHelpers.getAllFactsForChoices();
        var allCities = await quizHelpers.getAllCitiesForChoices();
        var templates = await quizHelpers.getQuestionTemplates();

        var questions = quizHelpers.generateQuizQuestions(
            selectedCities,
            facts,
            templates,
            difficulty,
            allFacts,
            allCities
        );

        var timing = quizHelpers.getQuizTiming(difficulty);

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
            questions: questions,
            currentIndex: 0,
            gradedQuestions: [],
            totalPoints: 0,
            correctCount: 0,
            timing: timing,
            questionStartedAt: Date.now()
        };

        res.redirect("/quiz");
    } catch (err) {
        console.error("Quiz start error:", err);
        res.status(500).send("Could not generate quiz.");
    }
});

// show current quiz question
router.get("/quiz", function(req, res) {
    var quiz = req.session.currentQuiz;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return res.send(renderPage(req, "Quiz", "<p>No quiz is active right now.</p><p><a href='/study'>Go to Study &amp; Quiz</a></p>"));
    }

    var index = quiz.currentIndex || 0;

    if (index >= quiz.questions.length) {
        return res.redirect("/quiz/results");
    }

    var question = quiz.questions[index];
    var secondsPerQuestion = quiz.timing ? quiz.timing.secondsPerQuestion : 30;

    quiz.questionStartedAt = Date.now();

    var content = "";

    content += "<section class='hero'>";
    content += "<h1>Trivia Quiz</h1>";
    content += "<p><strong>Question:</strong> " + (index + 1) + " / " + quiz.questions.length + "</p>";
    content += "<p><strong>Difficulty:</strong> " + escapeHtml(quiz.difficulty) + "</p>";
    content += "<p><strong>Score:</strong> " + quiz.totalPoints + " points</p>";

    if (quiz.timed) {
        content += "<p><strong>Time Left:</strong> <span id='quiz-timer'></span></p>";
        content += "<p>Answer faster to earn more points.</p>";
    }

    content += "</section>";

    content += "<section class='cities-section'>";
    content += "<form id='quiz-form' method='POST' action='/quiz/answer'>";

    content += "<div class='city-card'>";
    content += "<p><strong>" + escapeHtml(question.questionText) + "</strong></p>";

    if (question.imagePath) {
        content += "<p>";
        content += "<img src='" + escapeHtml(question.imagePath) + "' alt='Question image' style='max-width:320px; max-height:220px; border-radius:8px;'>";
        content += "</p>";
    }

    content += "<input type='hidden' id='timeLeft' name='timeLeft' value='" + secondsPerQuestion + "'>";

    if (question.questionType === "MC" || question.questionType === "TF") {
        question.choices.forEach(function(choice, choiceIndex) {
            var choiceId = "choice_" + choiceIndex;
            content += "<p>";
            content += "<label for='" + choiceId + "'>";
            content += "<input type='radio' id='" + choiceId + "' name='answer' value='" + escapeHtml(choice.value) + "' required> ";
            content += escapeHtml(choice.text || choice.value);
            content += "</label>";
            content += "</p>";
        });
    } else if (question.questionType === "MC_IMAGE") {
        content += "<div style='display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px;'>";

        question.choices.forEach(function(choice, choiceIndex) {
            var choiceId = "choice_" + choiceIndex;

            content += "<label for='" + choiceId + "' style='border:1px solid #ccc; padding:12px; border-radius:10px; cursor:pointer; text-align:center;'>";
            content += "<input type='radio' id='" + choiceId + "' name='answer' value='" + escapeHtml(choice.value) + "' required>";
            content += "<br>";

            if (choice.imagePath) {
                content += "<img src='" + escapeHtml(choice.imagePath) + "' alt='" + escapeHtml(choice.text || "choice image") + "' style='max-width:150px; max-height:100px; margin-top:8px;'>";
            }

            content += "<p>" + escapeHtml(choice.text || "Flag choice") + "</p>";
            content += "</label>";
        });

        content += "</div>";
    } else {
        content += "<p><input type='text' name='answer' required></p>";
    }

    content += "</div>";

    content += "<p><button type='submit'>Submit Answer</button></p>";
    content += "</form>";
    content += "</section>";

    if (quiz.timed) {
        content += `
            <script>
                var remaining = ${secondsPerQuestion};
                var timerEl = document.getElementById("quiz-timer");
                var formEl = document.getElementById("quiz-form");
                var timeLeftInput = document.getElementById("timeLeft");
                var submitted = false;

                function removeRequiredInputs() {
                    var inputs = formEl.querySelectorAll("input[required]");
                    inputs.forEach(function(input) {
                        input.required = false;
                    });
                }

                function updateTimer() {
                    timerEl.textContent = remaining + " seconds";
                    timeLeftInput.value = remaining;

                    if (remaining <= 0 && !submitted) {
                        submitted = true;
                        removeRequiredInputs();
                        formEl.submit();
                        return;
                    }

                    remaining--;
                }

                formEl.addEventListener("submit", function() {
                    submitted = true;
                    timeLeftInput.value = remaining;
                });

                updateTimer();
                setInterval(updateTimer, 1000);
            </script>
        `;
    }

    res.send(renderPage(req, "Quiz", content));
});

// submit one quiz answer
router.post("/quiz/answer", async function(req, res) {
    try {
        var quiz = req.session.currentQuiz;

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return res.send(renderPage(req, "Quiz", "<p>No active quiz to submit.</p><p><a href='/study'>Back to Study &amp; Quiz</a></p>"));
        }

        var index = quiz.currentIndex || 0;

        if (index >= quiz.questions.length) {
            return res.redirect("/quiz/results");
        }

        var question = quiz.questions[index];
        var userAnswer = req.body.answer || "";
        var timing = quiz.timing || quizHelpers.getQuizTiming(quiz.difficulty);
        var secondsPerQuestion = timing.secondsPerQuestion;
        var maxPointsPerQuestion = timing.maxPointsPerQuestion;
        var timeLeft = Number(req.body.timeLeft) || 0;
        var timeLeftRatio = quiz.timed ? timeLeft / secondsPerQuestion : 1;

        var isCorrect = false;

        if (question.questionType === "FB") {
            isCorrect = quizHelpers.isFillInCorrect(
                userAnswer,
                question.correctAnswer,
                question.altAnswers || []
            );
        } else {
            isCorrect =
                String(userAnswer).trim().toLowerCase() ===
                String(question.correctAnswer).trim().toLowerCase();
        }

        var questionPoints = quizHelpers.calculateQuestionPoints(
            isCorrect,
            timeLeftRatio,
            maxPointsPerQuestion
        );

        if (isCorrect) {
            quiz.correctCount += 1;
        }

        quiz.totalPoints += questionPoints;

        quiz.gradedQuestions.push({
            templateId: question.templateId,
            cityId: question.cityId,
            questionText: question.questionText,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            pointsEarned: questionPoints,
            timeLeft: timeLeft
        });

        quiz.currentIndex = index + 1;
        req.session.currentQuiz = quiz;

        if (quiz.currentIndex >= quiz.questions.length) {
            return res.redirect("/quiz/results");
        }

        res.redirect("/quiz");
    } catch (err) {
        console.error("Quiz answer error:", err);
        res.status(500).send("Could not submit answer.");
    }
});

// quiz results
router.get("/quiz/results", async function(req, res) {
    try {
        var quiz = req.session.currentQuiz;

        if (!quiz || !quiz.gradedQuestions) {
            return res.send(renderPage(req, "Quiz Results", "<p>No quiz results are available.</p><p><a href='/study'>Back to Study &amp; Quiz</a></p>"));
        }

        if (req.session.user) {
            await quizHelpers.saveQuizResults(
                req.session.user.userId,
                quiz,
                quiz.gradedQuestions,
                quiz.totalPoints
            );
        }

        var content = "";

        content += "<section class='hero'>";
        content += "<h1>Quiz Results</h1>";
        content += "<p><strong>Correct:</strong> " + quiz.correctCount + " / " + quiz.questions.length + "</p>";
        content += "<p><strong>Total Points:</strong> " + quiz.totalPoints + "</p>";

        if (quiz.timed) {
            content += "<p>Timed mode used Kahoot-style scoring: faster correct answers earned more points.</p>";
        }

        if (!req.session.user) {
            content += "<p>You played as a guest, so this score was not saved.</p>";
        }

        content += "</section>";

        content += "<section class='cities-section'>";

        quiz.gradedQuestions.forEach(function(question, index) {
            content += "<div class='city-card'>";
            content += "<p><strong>Question " + (index + 1) + ":</strong> " + escapeHtml(question.questionText) + "</p>";
            content += "<p><strong>Your Answer:</strong> " + escapeHtml(question.userAnswer || "(blank)") + "</p>";
            content += "<p><strong>Correct Answer:</strong> " + escapeHtml(question.correctAnswer) + "</p>";
            content += "<p><strong>Result:</strong> " + (question.isCorrect ? "Correct" : "Incorrect") + "</p>";
            content += "<p><strong>Points Earned:</strong> " + question.pointsEarned + "</p>";

            if (quiz.timed) {
                content += "<p><strong>Time Left:</strong> " + question.timeLeft + " seconds</p>";
            }

            content += "</div>";
        });

        content += "<p><a href='/study'>Start Another Quiz</a></p>";
        content += "</section>";

        req.session.currentQuiz = null;

        res.send(renderPage(req, "Quiz Results", content));
    } catch (err) {
        console.error("Quiz results error:", err);
        res.status(500).send("Could not load quiz results.");
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