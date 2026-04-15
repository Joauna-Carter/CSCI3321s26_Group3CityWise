var db = require("../db/connection");

// helper to get question count from difficulty
function getQuestionCount(difficulty) {
    if (difficulty === "hard") {
        return 15;
    }

    if (difficulty === "medium") {
        return 10;
    }

    return 5;
}

// helper to shuffle array
function shuffleArray(items) {
    var arr = items.slice();

    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
}

// helper to split alt answers
function parseAltAnswers(text) {
    if (!text) {
        return [];
    }

    return String(text)
        .split(/[|;,]/)
        .map(function(item) {
            return item.trim();
        })
        .filter(function(item) {
            return item !== "";
        });
}

// helper to replace placeholders
function replacePlaceholders(templateText, city, fact, replacementValue) {
    var text = templateText;

    text = text.replace(/{CityName}/g, city.CityName || "");
    text = text.replace(/{FactValue}/g, replacementValue || fact.FactValue || "");
    text = text.replace(/{FactLabel}/g, fact.FactLabel || "");

    return text;
}

// helper to fetch selected cities
async function getSelectedCities(options) {
    var cityId = options.cityId || null;
    var regionId = options.regionId || null;
    var requestedCityCount = parseInt(options.requestedCityCount, 10) || 0;

    if (cityId) {
        var cityRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.CountryID,
                Countries.CountryName,
                Regions.RegionID,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            WHERE Cities.CityID = ?
        `, [cityId]);

        return cityRows[0];
    }

    if (regionId && requestedCityCount > 0) {
        var regionRandomRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.CountryID,
                Countries.CountryName,
                Regions.RegionID,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            WHERE Regions.RegionID = ?
            ORDER BY RAND()
            LIMIT ?
        `, [regionId, requestedCityCount]);

        return regionRandomRows[0];
    }

    if (regionId) {
        var regionRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.CountryID,
                Countries.CountryName,
                Regions.RegionID,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            WHERE Regions.RegionID = ?
            ORDER BY RAND()
            LIMIT 5
        `, [regionId]);

        return regionRows[0];
    }

    if (requestedCityCount > 0) {
        var randomRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.CountryID,
                Countries.CountryName,
                Regions.RegionID,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY RAND()
            LIMIT ?
        `, [requestedCityCount]);

        return randomRows[0];
    }

    var defaultRows = await db.query(`
        SELECT
            Cities.CityID,
            Cities.CityName,
            Cities.CountryID,
            Countries.CountryName,
            Regions.RegionID,
            Regions.RegionName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        JOIN Regions ON Countries.RegionID = Regions.RegionID
        ORDER BY RAND()
        LIMIT 5
    `);

    return defaultRows[0];
}

// helper to fetch facts for selected cities
async function getFactsForCities(cityIds) {
    if (!cityIds || cityIds.length === 0) {
        return [];
    }

    var placeholders = cityIds.map(function() {
        return "?";
    }).join(",");

    var factRows = await db.query(`
        SELECT
            FactID,
            CityID,
            FactType,
            FactSubtype,
            FactLabel,
            FactValue,
            AltAnswers,
            FactImageType
        FROM CityFacts
        WHERE CityID IN (${placeholders})
    `, cityIds);

    return factRows[0];
}

// helper to fetch templates
async function getQuestionTemplates() {
    var templateRows = await db.query(`
        SELECT
            TemplateID,
            QuestionType,
            TemplateText,
            AnswerSource,
            RequiredFactType,
            RequiredFactSubtype,
            ImageSourceType
        FROM QuestionTemplates
        ORDER BY TemplateID
    `);

    return templateRows[0];
}

// helper to get matching templates for a fact
function getMatchingTemplates(templates, fact) {
    return templates.filter(function(template) {
        var typeMatches = !template.RequiredFactType || template.RequiredFactType === fact.FactType;
        var labelMatches = !template.RequiredFactSubtype || template.RequiredFactSubtype === fact.FactLabel;
        var imageMatches = !template.ImageSourceType;

        return typeMatches && labelMatches && imageMatches;
    });
}

// helper to make multiple choice options
function buildMcChoices(fact, allFacts) {
    var correctAnswer = fact.FactValue;
    var choices = [correctAnswer];

    var altAnswers = parseAltAnswers(fact.AltAnswers);
    altAnswers.forEach(function(answer) {
        if (choices.indexOf(answer) === -1 && choices.length < 4) {
            choices.push(answer);
        }
    });

    var sameLabel = allFacts.filter(function(otherFact) {
        return otherFact.FactID !== fact.FactID &&
               otherFact.FactType === fact.FactType &&
               otherFact.FactLabel === fact.FactLabel &&
               otherFact.FactValue !== fact.FactValue;
    });

    shuffleArray(sameLabel).forEach(function(otherFact) {
        if (choices.indexOf(otherFact.FactValue) === -1 && choices.length < 4) {
            choices.push(otherFact.FactValue);
        }
    });

    if (choices.length < 2) {
        return null;
    }

    return shuffleArray(choices).slice(0, 4);
}

// helper to build one question
function buildQuestion(template, city, fact, allFacts) {
    var questionType = template.QuestionType;
    var questionText = "";
    var correctAnswer = "";
    var choices = null;

    if (questionType === "MC") {
        choices = buildMcChoices(fact, allFacts);

        if (!choices || choices.length < 2) {
            return null;
        }

        correctAnswer = fact.FactValue;
        questionText = replacePlaceholders(template.TemplateText, city, fact, fact.FactValue);

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "MC",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: choices,
            factId: fact.FactID
        };
    }

    if (questionType === "TF") {
        var useTrue = Math.random() < 0.5;
        var displayValue = fact.FactValue;
        correctAnswer = "True";

        if (!useTrue) {
            var falsePool = [];

            parseAltAnswers(fact.AltAnswers).forEach(function(answer) {
                if (answer !== fact.FactValue) {
                    falsePool.push(answer);
                }
            });

            allFacts.forEach(function(otherFact) {
                if (otherFact.FactID !== fact.FactID &&
                    otherFact.FactType === fact.FactType &&
                    otherFact.FactLabel === fact.FactLabel &&
                    otherFact.FactValue !== fact.FactValue) {
                    falsePool.push(otherFact.FactValue);
                }
            });

            falsePool = shuffleArray(falsePool);

            if (falsePool.length > 0) {
                displayValue = falsePool[0];
                correctAnswer = "False";
            }
        }

        questionText = replacePlaceholders(template.TemplateText, city, fact, displayValue);

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "TF",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: ["True", "False"],
            factId: fact.FactID
        };
    }

    if (questionType === "FB") {
        questionText = replacePlaceholders(template.TemplateText, city, fact, fact.FactValue);
        correctAnswer = fact.FactValue;

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "FB",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: null,
            factId: fact.FactID
        };
    }

    return null;
}

// helper to generate quiz questions
function generateQuizQuestions(selectedCities, facts, templates, difficulty) {
    var questionTarget = getQuestionCount(difficulty);
    var questionPool = [];

    selectedCities.forEach(function(city) {
        var cityFacts = facts.filter(function(fact) {
            return fact.CityID === city.CityID;
        });

        cityFacts.forEach(function(fact) {
            var matchingTemplates = getMatchingTemplates(templates, fact);

            matchingTemplates.forEach(function(template) {
                var question = buildQuestion(template, city, fact, facts);

                if (question) {
                    questionPool.push(question);
                }
            });
        });
    });

    questionPool = shuffleArray(questionPool);

    var usedKeys = {};
    var finalQuestions = [];

    questionPool.forEach(function(question) {
        var key = question.cityId + "|" + question.questionText;

        if (!usedKeys[key] && finalQuestions.length < questionTarget) {
            usedKeys[key] = true;
            finalQuestions.push(question);
        }
    });

    return finalQuestions;
}

// helper to save quiz results
async function saveQuizResults(userId, quizSession, gradedQuestions, score) {
    var quizAttemptInsert = await db.query(`
        INSERT INTO QuizAttempts
        (UserID, Mode, Timed, Difficulty, Score, SelectedRegionID, RequestedCityCount, SelectedCityID, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        userId,
        "quiz",
        quizSession.timed ? 1 : 0,
        quizSession.difficulty,
        score,
        quizSession.regionId || null,
        quizSession.requestedCityCount || null,
        quizSession.cityId || null,
        "completed"
    ]);

    var quizAttemptId = quizAttemptInsert[0].insertId;

    var uniqueCityIds = {};
    gradedQuestions.forEach(function(question) {
        uniqueCityIds[question.cityId] = true;
    });

    var cityIds = Object.keys(uniqueCityIds);

    for (var i = 0; i < cityIds.length; i++) {
        await db.query(`
            INSERT INTO QuizAttemptCities (QuizAttemptID, CityID)
            VALUES (?, ?)
        `, [quizAttemptId, cityIds[i]]);
    }

    for (var j = 0; j < gradedQuestions.length; j++) {
        var question = gradedQuestions[j];

        await db.query(`
            INSERT INTO QuizAttemptQuestions
            (QuizAttemptID, TemplateID, CustomQuestionID, CityID, QuestionText, CorrectAnswer, UserAnswer, IsCorrect)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            quizAttemptId,
            question.templateId,
            null,
            question.cityId,
            question.questionText,
            question.correctAnswer,
            question.userAnswer,
            question.isCorrect ? 1 : 0
        ]);
    }

    await db.query(`
        UPDATE Leaderboard
        SET
            TotalQuizPoints = TotalQuizPoints + ?,
            QuizzesCompleted = QuizzesCompleted + 1,
            BestScore = GREATEST(BestScore, ?),
            AverageScore = (TotalQuizPoints + ?) / (QuizzesCompleted + 1),
            LastUpdated = CURRENT_TIMESTAMP
        WHERE UserID = ?
    `, [score, score, score, userId]);

    await db.query(`
        UPDATE UserStatistics
        SET
            LastQuizAttemptedAt = CURRENT_TIMESTAMP,
            QuizzesCompleted = QuizzesCompleted + 1,
            AverageScore = (TotalQuizPoints + ?) / (QuizzesCompleted + 1),
            MostDoneQuizMode = COALESCE(MostDoneQuizMode, 'quiz'),
            BestScore = GREATEST(BestScore, ?),
            TotalQuizPoints = TotalQuizPoints + ?,
            LastUpdated = CURRENT_TIMESTAMP
        WHERE UserID = ?
    `, [score, score, score, userId]);
}

// helper to save flashcard session
async function saveFlashcardSession(userId, selectedCities, facts, options) {
    var flashcardInsert = await db.query(`
        INSERT INTO FlashcardSessions
        (UserID, Mode, SelectedRegionID, RequestedCityCount, SelectedCityID)
        VALUES (?, ?, ?, ?, ?)
    `, [
        userId,
        "flashcards",
        options.regionId || null,
        options.requestedCityCount || null,
        options.cityId || null
    ]);

    var flashcardSessionId = flashcardInsert[0].insertId;

    for (var i = 0; i < selectedCities.length; i++) {
        await db.query(`
            INSERT INTO FlashcardSessionCities (FlashcardSessionID, CityID)
            VALUES (?, ?)
        `, [flashcardSessionId, selectedCities[i].CityID]);
    }

    for (var j = 0; j < facts.length; j++) {
        var fact = facts[j];
        var city = selectedCities.find(function(item) {
            return item.CityID === fact.CityID;
        });

        if (!city) {
            continue;
        }

        var frontText = city.CityName + " - " + fact.FactLabel;
        var backText = fact.FactValue;

        await db.query(`
            INSERT INTO FlashcardSessionCards
            (FlashcardSessionID, CityID, FactID, FrontText, BackText, OrderShown)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [flashcardSessionId, fact.CityID, fact.FactID, frontText, backText, j + 1]);
    }

    await db.query(`
        UPDATE UserStatistics
        SET
            FlashcardSessionsUsed = FlashcardSessionsUsed + 1,
            LastUpdated = CURRENT_TIMESTAMP
        WHERE UserID = ?
    `, [userId]);
}

module.exports = {
    getSelectedCities,
    getFactsForCities,
    getQuestionTemplates,
    generateQuizQuestions,
    saveQuizResults,
    saveFlashcardSession
};