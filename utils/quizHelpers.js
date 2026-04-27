// quizHelpers.js

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

// helper to get Kahoot-style timing and point values
function getQuizTiming(difficulty) {
    if (difficulty === "hard") {
        return {
            secondsPerQuestion: 15,
            maxPointsPerQuestion: 1000
        };
    }

    if (difficulty === "medium") {
        return {
            secondsPerQuestion: 20,
            maxPointsPerQuestion: 750
        };
    }

    return {
        secondsPerQuestion: 30,
        maxPointsPerQuestion: 500
    };
}

// helper to calculate Kahoot-style points
function calculateQuestionPoints(isCorrect, timeLeftRatio, maxPointsPerQuestion) {
    if (!isCorrect) {
        return 0;
    }

    if (timeLeftRatio < 0) {
        timeLeftRatio = 0;
    }

    if (timeLeftRatio > 1) {
        timeLeftRatio = 1;
    }

    return Math.round(maxPointsPerQuestion * (0.5 + 0.5 * timeLeftRatio));
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

// helper to normalize answers
function normalizeAnswer(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

// helper to replace placeholders
function replacePlaceholders(templateText, city, fact, replacementValue) {
    var text = templateText || "";

    fact = fact || {};

    text = text.replace(/{CityName}/g, city.CityName || "");
    text = text.replace(/{CountryName}/g, city.CountryName || "");
    text = text.replace(/{RegionName}/g, city.RegionName || "");
    text = text.replace(/{FactValue}/g, replacementValue || fact.FactValue || "");
    text = text.replace(/{FactLabel}/g, fact.FactLabel || "");

    return text;
}

// helper to get image for question
function getQuestionImagePath(template, city, fact) {
    var source = template.ImageSourceType;

    if (!source || source === "NULL") {
        return null;
    }

    source = String(source).toLowerCase().trim();

    if (source === "flag" || source === "countryflag" || source === "country") {
        return city.FlagImagePath || null;
    }

    if (source === "city" || source === "cityimage" || source === "cityimagepath") {
        return city.CityImagePath || null;
    }

    if (source === "fact" || source === "factimage" || source === "factimagepath") {
        return fact && fact.FactImagePath ? fact.FactImagePath : null;
    }

    return null;
}

// helper to get answer from template source
function getAnswerFromSource(template, city, fact) {
    var source = template.AnswerSource;

    if (!source || source === "NULL") {
        return fact ? fact.FactValue : "";
    }

    if (source === "FactValue") {
        return fact ? fact.FactValue : "";
    }

    if (source === "FactLabel") {
        return fact ? fact.FactLabel : "";
    }

    if (source === "CityName") {
        return city.CityName;
    }

    if (source === "CountryName") {
        return city.CountryName;
    }

    if (source === "CountryFlag") {
        return city.FlagImagePath;
    }

    return fact ? fact.FactValue : "";
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
                Cities.CityImagePath,
                Countries.CountryName,
                Countries.FlagImagePath,
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
                Cities.CityImagePath,
                Countries.CountryName,
                Countries.FlagImagePath,
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
                Cities.CityImagePath,
                Countries.CountryName,
                Countries.FlagImagePath,
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
                Cities.CityImagePath,
                Countries.CountryName,
                Countries.FlagImagePath,
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
            Cities.CityImagePath,
            Countries.CountryName,
            Countries.FlagImagePath,
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

// helper to fetch all cities for answer choices
async function getAllCitiesForChoices() {
    var cityRows = await db.query(`
        SELECT
            Cities.CityID,
            Cities.CityName,
            Cities.CountryID,
            Cities.CityImagePath,
            Countries.CountryName,
            Countries.FlagImagePath,
            Regions.RegionID,
            Regions.RegionName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        JOIN Regions ON Countries.RegionID = Regions.RegionID
        ORDER BY Cities.CityName
    `);

    return cityRows[0];
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
            FactImagePath
        FROM CityFacts
        WHERE CityID IN (${placeholders})
    `, cityIds);

    return factRows[0];
}

// helper to fetch all facts for answer choices
async function getAllFactsForChoices() {
    var factRows = await db.query(`
        SELECT
            FactID,
            CityID,
            FactType,
            FactSubtype,
            FactLabel,
            FactValue,
            AltAnswers,
            FactImagePath
        FROM CityFacts
    `);

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
            RequiredFactLabel,
            ImageSourceType
        FROM QuestionTemplates
        ORDER BY TemplateID
    `);

    return templateRows[0];
}

// helper to get matching templates for a fact
function getMatchingTemplates(templates, fact) {
    return templates.filter(function(template) {
        var needsFact =
            template.RequiredFactType ||
            template.RequiredFactSubtype ||
            template.RequiredFactLabel;

        if (!needsFact) {
            return false;
        }

        var typeMatches =
            !template.RequiredFactType ||
            template.RequiredFactType === fact.FactType;

        var subtypeMatches =
            !template.RequiredFactSubtype ||
            template.RequiredFactSubtype === fact.FactSubtype;

        var labelMatches =
            !template.RequiredFactLabel ||
            template.RequiredFactLabel === fact.FactLabel;

        return typeMatches && subtypeMatches && labelMatches;
    });
}

// helper to get city-only templates
function getCityOnlyTemplates(templates) {
    return templates.filter(function(template) {
        return !template.RequiredFactType &&
               !template.RequiredFactSubtype &&
               !template.RequiredFactLabel;
    });
}

// helper to add unique choice
function addChoice(choices, value, imagePath, label) {
    if (!value) {
        return;
    }

    var key = String(value);

    var exists = choices.some(function(choice) {
        return String(choice.value) === key;
    });

    if (!exists) {
        choices.push({
            value: value,
            text: label || value,
            imagePath: imagePath || null
        });
    }
}

// helper to make text multiple choice options
function buildTextMcChoices(template, city, fact, allFacts, allCities) {
    var correctAnswer = getAnswerFromSource(template, city, fact);
    var choices = [];

    addChoice(choices, correctAnswer, null, correctAnswer);

    if (template.AnswerSource === "CountryName") {
        shuffleArray(allCities).forEach(function(otherCity) {
            if (choices.length < 4) {
                addChoice(choices, otherCity.CountryName, null, otherCity.CountryName);
            }
        });
    } else if (template.AnswerSource === "CityName") {
        shuffleArray(allCities).forEach(function(otherCity) {
            if (choices.length < 4) {
                addChoice(choices, otherCity.CityName, null, otherCity.CityName);
            }
        });
    } else if (fact) {
        var sameKind = allFacts.filter(function(otherFact) {
            return otherFact.FactID !== fact.FactID &&
                   otherFact.FactType === fact.FactType &&
                   otherFact.FactSubtype === fact.FactSubtype &&
                   otherFact.FactLabel === fact.FactLabel &&
                   otherFact.FactValue !== fact.FactValue;
        });

        shuffleArray(sameKind).forEach(function(otherFact) {
            if (choices.length < 4) {
                addChoice(choices, otherFact.FactValue, null, otherFact.FactValue);
            }
        });
    }

    if (choices.length < 2) {
        return null;
    }

    return shuffleArray(choices).slice(0, 4);
}

// helper to make image multiple choice options
function buildImageMcChoices(template, city, fact, allFacts, allCities) {
    var choices = [];

    if (template.AnswerSource === "CountryFlag") {
        addChoice(choices, city.FlagImagePath, city.FlagImagePath, city.CountryName);

        shuffleArray(allCities).forEach(function(otherCity) {
            if (choices.length < 4 && otherCity.FlagImagePath) {
                addChoice(choices, otherCity.FlagImagePath, otherCity.FlagImagePath, otherCity.CountryName);
            }
        });
    } else if (template.AnswerSource === "CityImage") {
        addChoice(choices, city.CityImagePath, city.CityImagePath, city.CityName);

        shuffleArray(allCities).forEach(function(otherCity) {
            if (choices.length < 4 && otherCity.CityImagePath) {
                addChoice(choices, otherCity.CityImagePath, otherCity.CityImagePath, otherCity.CityName);
            }
        });
    } else if (fact) {
        addChoice(choices, fact.FactImagePath, fact.FactImagePath, fact.FactValue);

        var sameKind = allFacts.filter(function(otherFact) {
            return otherFact.FactID !== fact.FactID &&
                   otherFact.FactType === fact.FactType &&
                   otherFact.FactSubtype === fact.FactSubtype &&
                   otherFact.FactLabel === fact.FactLabel &&
                   otherFact.FactImagePath;
        });

        shuffleArray(sameKind).forEach(function(otherFact) {
            if (choices.length < 4) {
                addChoice(choices, otherFact.FactImagePath, otherFact.FactImagePath, otherFact.FactValue);
            }
        });
    }

    if (choices.length < 2) {
        return null;
    }

    return shuffleArray(choices).slice(0, 4);
}

// helper to get false value
function getFalseDisplayValue(template, city, fact, allFacts, allCities) {
    if (template.AnswerSource === "CountryName") {
        var countryCities = shuffleArray(allCities).filter(function(otherCity) {
            return otherCity.CountryName !== city.CountryName;
        });

        return countryCities.length > 0 ? countryCities[0].CountryName : null;
    }

    if (template.AnswerSource === "CityName") {
        var cityChoices = shuffleArray(allCities).filter(function(otherCity) {
            return otherCity.CityName !== city.CityName;
        });

        return cityChoices.length > 0 ? cityChoices[0].CityName : null;
    }

    if (fact) {
        var sameKind = allFacts.filter(function(otherFact) {
            return otherFact.FactID !== fact.FactID &&
                   otherFact.FactType === fact.FactType &&
                   otherFact.FactSubtype === fact.FactSubtype &&
                   otherFact.FactLabel === fact.FactLabel &&
                   otherFact.FactValue !== fact.FactValue;
        });

        sameKind = shuffleArray(sameKind);

        if (sameKind.length > 0) {
            return sameKind[0].FactValue;
        }
    }

    return null;
}

// helper to get false image
function getFalseImagePath(template, city, fact, allFacts, allCities) {
    if (template.ImageSourceType === "Flag") {
        var flagCities = shuffleArray(allCities).filter(function(otherCity) {
            return otherCity.CountryName !== city.CountryName && otherCity.FlagImagePath;
        });

        return flagCities.length > 0 ? flagCities[0].FlagImagePath : null;
    }

    if (template.ImageSourceType === "CityImage") {
        var imageCities = shuffleArray(allCities).filter(function(otherCity) {
            return otherCity.CityName !== city.CityName && otherCity.CityImagePath;
        });

        return imageCities.length > 0 ? imageCities[0].CityImagePath : null;
    }

    if (fact) {
        var imageFacts = allFacts.filter(function(otherFact) {
            return otherFact.FactID !== fact.FactID &&
                   otherFact.FactImagePath &&
                   otherFact.FactImagePath !== fact.FactImagePath;
        });

        imageFacts = shuffleArray(imageFacts);

        if (imageFacts.length > 0) {
            return imageFacts[0].FactImagePath;
        }
    }

    return null;
}

// helper to build one fact-based question
function buildQuestion(template, city, fact, allFacts, allCities) {
    var questionType = template.QuestionType;
    var questionText = "";
    var correctAnswer = getAnswerFromSource(template, city, fact);
    var choices = null;
    var imagePath = getQuestionImagePath(template, city, fact);

    if (questionType === "MC") {
        choices = buildTextMcChoices(template, city, fact, allFacts, allCities);

        if (!choices || choices.length < 2) {
            return null;
        }

        questionText = replacePlaceholders(template.TemplateText, city, fact, correctAnswer);

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "MC",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: choices,
            factId: fact ? fact.FactID : null,
            imagePath: imagePath,
            answerDisplayType: "text"
        };
    }

    if (questionType === "MC_IMAGE") {
        choices = buildImageMcChoices(template, city, fact, allFacts, allCities);

        if (!choices || choices.length < 2) {
            return null;
        }

        questionText = replacePlaceholders(template.TemplateText, city, fact, correctAnswer);

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "MC_IMAGE",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: choices,
            factId: fact ? fact.FactID : null,
            imagePath: null,
            answerDisplayType: "image"
        };
    }

    if (questionType === "TF") {
        var useTrue = Math.random() < 0.5;
        var displayValue = correctAnswer;
        var displayImagePath = imagePath;
        correctAnswer = "True";

        if (!useTrue) {
            var falseValue = getFalseDisplayValue(template, city, fact, allFacts, allCities);
            var falseImage = getFalseImagePath(template, city, fact, allFacts, allCities);

            if (falseValue) {
                displayValue = falseValue;
                correctAnswer = "False";
            }

            if (falseImage && imagePath) {
                displayImagePath = falseImage;
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
            choices: [
                { value: "True", text: "True", imagePath: null },
                { value: "False", text: "False", imagePath: null }
            ],
            factId: fact ? fact.FactID : null,
            imagePath: displayImagePath,
            answerDisplayType: "text"
        };
    }

    if (questionType === "FB" || questionType === "FIB") {
        questionText = replacePlaceholders(template.TemplateText, city, fact, correctAnswer);

        return {
            templateId: template.TemplateID,
            cityId: city.CityID,
            questionType: "FB",
            questionText: questionText,
            correctAnswer: correctAnswer,
            choices: null,
            factId: fact ? fact.FactID : null,
            imagePath: imagePath,
            answerDisplayType: "text",
            altAnswers: fact ? parseAltAnswers(fact.AltAnswers) : []
        };
    }

    return null;
}

// helper to build city-only questions
function buildCityOnlyQuestion(template, city, allCities) {
    return buildQuestion(template, city, null, [], allCities);
}

// helper to generate quiz questions
function generateQuizQuestions(selectedCities, facts, templates, difficulty, allFacts, allCities) {
    var questionTarget = getQuestionCount(difficulty);
    var questionPool = [];

    allFacts = allFacts || facts;
    allCities = allCities || selectedCities;

    selectedCities.forEach(function(city) {
        var cityFacts = facts.filter(function(fact) {
            return fact.CityID === city.CityID;
        });

        cityFacts.forEach(function(fact) {
            var matchingTemplates = getMatchingTemplates(templates, fact);

            matchingTemplates.forEach(function(template) {
                var question = buildQuestion(template, city, fact, allFacts, allCities);

                if (question) {
                    questionPool.push(question);
                }
            });
        });

        var cityOnlyTemplates = getCityOnlyTemplates(templates);

        cityOnlyTemplates.forEach(function(template) {
            var question = buildCityOnlyQuestion(template, city, allCities);

            if (question) {
                questionPool.push(question);
            }
        });
    });

    questionPool = shuffleArray(questionPool);

    var usedKeys = {};
    var finalQuestions = [];

    questionPool.forEach(function(question) {
        var key = question.cityId + "|" + question.questionText + "|" + question.correctAnswer;

        if (!usedKeys[key] && finalQuestions.length < questionTarget) {
            usedKeys[key] = true;
            finalQuestions.push(question);
        }
    });

    return finalQuestions;
}

// helper to check fill-in answers
function isFillInCorrect(userAnswer, correctAnswer, altAnswers) {
    var normalizedUserAnswer = normalizeAnswer(userAnswer);
    var possibleAnswers = [correctAnswer].concat(altAnswers || []);

    return possibleAnswers.some(function(answer) {
        return normalizeAnswer(answer) === normalizedUserAnswer;
    });
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
        INSERT INTO Leaderboard
        (UserID, TotalQuizPoints, QuizzesCompleted, AverageScore, BestScore)
        VALUES (?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
            TotalQuizPoints = TotalQuizPoints + VALUES(TotalQuizPoints),
            QuizzesCompleted = QuizzesCompleted + 1,
            BestScore = GREATEST(BestScore, VALUES(BestScore)),
            AverageScore = (TotalQuizPoints + VALUES(TotalQuizPoints)) / (QuizzesCompleted + 1),
            LastUpdated = CURRENT_TIMESTAMP
    `, [userId, score, score, score]);

    await db.query(`
        INSERT INTO UserStatistics
        (UserID, LastQuizAttemptedAt, QuizzesCompleted, AverageScore, MostDoneQuizMode, BestScore, TotalQuizPoints)
        VALUES (?, CURRENT_TIMESTAMP, 1, ?, 'quiz', ?, ?)
        ON DUPLICATE KEY UPDATE
            LastQuizAttemptedAt = CURRENT_TIMESTAMP,
            QuizzesCompleted = QuizzesCompleted + 1,
            AverageScore = (TotalQuizPoints + VALUES(TotalQuizPoints)) / (QuizzesCompleted + 1),
            MostDoneQuizMode = COALESCE(MostDoneQuizMode, 'quiz'),
            BestScore = GREATEST(BestScore, VALUES(BestScore)),
            TotalQuizPoints = TotalQuizPoints + VALUES(TotalQuizPoints),
            LastUpdated = CURRENT_TIMESTAMP
    `, [userId, score, score, score]);
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
        INSERT INTO UserStatistics
        (UserID, FlashcardSessionsUsed)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE
            FlashcardSessionsUsed = FlashcardSessionsUsed + 1,
            LastUpdated = CURRENT_TIMESTAMP
    `, [userId]);
}

module.exports = {
    getSelectedCities,
    getAllCitiesForChoices,
    getFactsForCities,
    getAllFactsForChoices,
    getQuestionTemplates,
    generateQuizQuestions,
    saveQuizResults,
    saveFlashcardSession,
    getQuizTiming,
    calculateQuestionPoints,
    isFillInCorrect
};