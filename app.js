require("dotenv").config();

var express = require("express");
var path = require("path");
var mysql = require("mysql2/promise");
var session = require("express-session");
var bcrypt = require("bcrypt");

var app = express();
var PORT = process.env.PORT || 3000;

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "citywise_secret_key",
    resave: false,
    saveUninitialized: false
}));

// database pool
var db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "citywise",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// helper to put session user data into all views
app.use(function(req, res, next) {
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.username = req.session.user ? req.session.user.username : "";
    res.locals.isAdmin = req.session.user ? req.session.user.isAdmin : false;
    next();
});

// helper to require login
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// helper to require admin
function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).send("Access denied.");
    }
    next();
}

// helper to escape html for simple HTML pages
function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// helper to build nav for simple HTML pages
function buildNav(req) {
    var html = "";
    html += "<header class='navbar'>";
    html += "<div class='nav-left'><a href='/' class='logo'>CityWise</a></div>";
    html += "<div class='nav-center'>";
    html += "<a href='/' class='nav-tab'>Home</a>";
    html += "<a href='/cities' class='nav-tab'>City Trivia</a>";
    html += "<a href='/study' class='nav-tab'>Study &amp; Quiz</a>";
    html += "<a href='/map' class='nav-tab'>Map</a>";
    html += "<a href='/leaderboard' class='nav-tab'>Leaderboard</a>";
    html += "<a href='/statistics' class='nav-tab'>Statistics</a>";

    if (req.session.user && req.session.user.isAdmin) {
        html += "<a href='/admin' class='nav-tab'>Admin</a>";
    }

    html += "</div>";
    html += "<div class='nav-right'>";

    if (!req.session.user) {
        html += "<a href='/register'>Create Account</a>";
        html += "<span class='divider'>|</span>";
        html += "<a href='/login'>Log In</a>";
    } else {
        html += "<a href='/profile'>" + escapeHtml(req.session.user.username) + "</a>";
        html += "<span class='divider'>|</span>";
        html += "<a href='/logout'>Log Out</a>";
    }

    html += "</div>";
    html += "</header>";
    return html;
}

// helper to render simple HTML pages
function renderPage(req, title, content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        ${buildNav(req)}
        <main class="home-container">
            ${content}
        </main>
    </body>
    </html>
    `;
}

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
        var subtypeMatches = !template.RequiredFactSubtype || template.RequiredFactSubtype === fact.FactSubtype;
        var imageMatches = !template.ImageSourceType;

        return typeMatches && subtypeMatches && imageMatches;
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

    var sameSubtype = allFacts.filter(function(otherFact) {
        return otherFact.FactID !== fact.FactID &&
               otherFact.FactType === fact.FactType &&
               otherFact.FactSubtype === fact.FactSubtype &&
               otherFact.FactValue !== fact.FactValue;
    });

    shuffleArray(sameSubtype).forEach(function(otherFact) {
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
                    otherFact.FactSubtype === fact.FactSubtype &&
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

// home page
app.get("/", function(req, res) {
    res.render("home");
});

// register page
app.get("/register", function(req, res) {
    res.render("register");
});

// register submit
app.post("/register", async function(req, res) {
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
app.get("/login", function(req, res) {
    res.render("login");
});

// login submit
app.post("/login", async function(req, res) {
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
app.get("/logout", function(req, res) {
    req.session.destroy(function() {
        res.redirect("/");
    });
});

// profile
app.get("/profile", requireLogin, async function(req, res) {
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

// city list
app.get("/cities", async function(req, res) {
    try {
        var cityRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.Description,
                Cities.CityImagePath,
                Countries.CountryName,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Cities.CityName
        `);

        res.render("cities", {
            cities: cityRows[0]
        });
    } catch (err) {
        console.error("Cities error:", err);
        res.status(500).send("Could not load cities.");
    }
});

// single city page
app.get("/cities/:id", async function(req, res) {
    try {
        var cityId = req.params.id;

        var cityRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.Description,
                Cities.Population,
                Cities.Latitude,
                Cities.Longitude,
                Cities.CityImagePath,
                Countries.CountryName,
                Regions.RegionID,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            WHERE Cities.CityID = ?
            LIMIT 1
        `, [cityId]);

        if (cityRows[0].length === 0) {
            return res.status(404).send("City not found.");
        }

        var city = cityRows[0][0];

        var factRows = await db.query(`
            SELECT
                FactID,
                FactType,
                FactSubtype,
                FactLabel,
                FactValue,
                AltAnswers,
                FactImageType
            FROM CityFacts
            WHERE CityID = ?
            ORDER BY FactType, FactSubtype, FactLabel
        `, [cityId]);

        var pageRows = await db.query(`
            SELECT PageContent
            FROM CityPageContent
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        var facts = factRows[0];
        var quickFacts = facts.filter(function(fact) {
            return fact.FactType === "QuickFact";
        });
        var funFacts = facts.filter(function(fact) {
            return fact.FactType === "FunFact";
        });

        res.render("city", {
            city: city,
            quickFacts: quickFacts,
            funFacts: funFacts,
            pageContent: pageRows[0].length > 0 ? pageRows[0][0].PageContent : null
        });
    } catch (err) {
        console.error("City page error:", err);
        res.status(500).send("Could not load city page.");
    }
});

// study and quiz setup page
app.get("/study", async function(req, res) {
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
app.post("/study/start", async function(req, res) {
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
app.get("/quiz/start", async function(req, res) {
    try {
        var cityId = req.query.cityId || "";
        var regionId = req.query.regionId || "";
        var requestedCityCount = req.query.requestedCityCount || "";
        var difficulty = req.query.difficulty || "easy";
        var timed = req.query.timed === "1";

        var selectedCities = await getSelectedCities({
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

        var facts = await getFactsForCities(cityIds);
        var templates = await getQuestionTemplates();
        var questions = generateQuizQuestions(selectedCities, facts, templates, difficulty);

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
app.get("/quiz", function(req, res) {
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
app.post("/quiz/submit", async function(req, res) {
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
            await saveQuizResults(req.session.user.userId, quiz, gradedQuestions, score);
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
app.get("/flashcards/start", async function(req, res) {
    try {
        var cityId = req.query.cityId || "";
        var regionId = req.query.regionId || "";
        var requestedCityCount = req.query.requestedCityCount || "";

        var selectedCities = await getSelectedCities({
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

        var facts = await getFactsForCities(cityIds);

        if (facts.length === 0) {
            return res.send(renderPage(req, "Flashcards", "<p>No flashcard facts are available yet.</p><p><a href='/study'>Go back</a></p>"));
        }

        if (req.session.user) {
            await saveFlashcardSession(req.session.user.userId, selectedCities, facts, {
                cityId: cityId || null,
                regionId: regionId || null,
                requestedCityCount: requestedCityCount || null
            });
        }

        var content = "";
        content += "<section class='hero'>";
        content += "<h1>Flashcards</h1>";
        content += "<p>Use these cards to study city facts before taking a quiz.</p>";

        if (!req.session.user) {
            content += "<p>You are using flashcards as a guest, so this session was not saved.</p>";
        }

        content += "</section>";

        content += "<section class='cities-section'>";
        content += "<div class='city-grid'>";

        facts.forEach(function(fact) {
            var city = selectedCities.find(function(item) {
                return item.CityID === fact.CityID;
            });

            if (!city) {
                return;
            }

            content += "<div class='city-card'>";
            content += "<h3>" + escapeHtml(city.CityName) + "</h3>";
            content += "<p><strong>" + escapeHtml(fact.FactLabel) + "</strong></p>";
            content += "<p>" + escapeHtml(fact.FactValue) + "</p>";
            content += "</div>";
        });

        content += "</div>";
        content += "<p><a href='/study'>Start Another Activity</a></p>";
        content += "</section>";

        res.send(renderPage(req, "Flashcards", content));
    } catch (err) {
        console.error("Flashcards error:", err);
        res.status(500).send("Could not load flashcards.");
    }
});

// map page
app.get("/map", async function(req, res) {
    try {
        var cityRows = await db.query(`
            SELECT CityID, CityName, Latitude, Longitude
            FROM Cities
            WHERE Latitude IS NOT NULL AND Longitude IS NOT NULL
            ORDER BY CityName
        `);

        res.render("map", {
            cities: cityRows[0]
        });
    } catch (err) {
        console.error("Map error:", err);
        res.status(500).send("Could not load map.");
    }
});

// leaderboard
app.get("/leaderboard", async function(req, res) {
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
app.get("/statistics", requireLogin, async function(req, res) {
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

        res.render("statistics", {
            stats: stats
        });
    } catch (err) {
        console.error("Statistics error:", err);
        res.status(500).send("Could not load statistics.");
    }
});

// admin
app.get("/admin", requireAdmin, function(req, res) {
    var content = "";
    content += "<section class='hero'>";
    content += "<h1>Admin Dashboard</h1>";
    content += "<p>This page is reserved for admin tools such as managing cities, facts, page content, and questions.</p>";
    content += "</section>";

    res.send(renderPage(req, "Admin", content));
});

// test database route
app.get("/test-db", async function(req, res) {
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

// start server
app.listen(PORT, function() {
    console.log("Server running at http://localhost:" + PORT);
});