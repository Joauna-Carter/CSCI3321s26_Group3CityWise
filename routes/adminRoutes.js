// adminRoutes.js
// Handles admin dashboard, safe database editing rules, row viewing, row hiding, and controlled row adding

var express = require("express"); // Express framework
var router = express.Router(); // Router for admin routes
var db = require("../db/connection"); // Database connection
var auth = require("../middleware/auth"); // Admin middleware

// Defines every admin-visible table and what admins are allowed to change
function getAdminTables() {
    return [
        {
            slug: "regions",
            label: "Regions",
            table: "Regions",
            keyFields: ["RegionID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["RegionCode", "RegionName", "IsActive"],
            foreignKeys: {}
        },
        {
            slug: "countries",
            label: "Countries",
            table: "Countries",
            keyFields: ["CountryID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CountryName", "RegionID", "FlagImagePath", "IsActive"],
            foreignKeys: { RegionID: "Regions" }
        },
        {
            slug: "cities",
            label: "Cities",
            table: "Cities",
            keyFields: ["CityID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CityName", "CountryID", "Population", "Description", "Latitude", "Longitude", "CityImagePath", "IsActive"],
            foreignKeys: { CountryID: "Countries" }
        },
        {
            slug: "users",
            label: "Users",
            table: "Users",
            keyFields: ["UserID"],
            hasIsActive: true,
            canAdd: false,
            editableFields: ["UserType", "IsDeleted", "IsActive"],
            foreignKeys: {}
        },
        {
            slug: "userprofiles",
            label: "User Profiles",
            table: "UserProfiles",
            keyFields: ["ProfileID"],
            hasIsActive: true,
            canAdd: false,
            editableFields: ["DisplayName", "Bio", "ProfileImagePath", "FavoriteRegionID", "FavoriteCityID", "IsActive"],
            foreignKeys: { UserID: "Users", FavoriteRegionID: "Regions", FavoriteCityID: "Cities" }
        },
        {
            slug: "cityfacts",
            label: "City Facts",
            table: "CityFacts",
            keyFields: ["FactID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CityID", "FactType", "FactSubtype", "FactLabel", "FactValue", "AltAnswers", "FactImagePath", "IsActive"],
            foreignKeys: { CityID: "Cities" }
        },
        {
            slug: "citypagecontent",
            label: "City Page Content",
            table: "CityPageContent",
            keyFields: ["CityPageContentID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CityID", "PageContent", "IsActive"],
            foreignKeys: { CityID: "Cities" }
        },
        {
            slug: "citypagerevisions",
            label: "City Page Revisions",
            table: "CityPageRevisions",
            keyFields: ["RevisionID"],
            hasIsActive: true,
            canAdd: false,
            editableFields: ["IsActive"],
            foreignKeys: { CityID: "Cities", EditedByUserID: "Users" }
        },
        {
            slug: "citypageimages",
            label: "City Page Images",
            table: "CityPageImages",
            keyFields: ["CityPageImageID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CityID", "ImagePath", "AltText", "Caption", "UploadedByUserID", "IsActive"],
            foreignKeys: { CityID: "Cities", UploadedByUserID: "Users" }
        },
        {
            slug: "questiontemplates",
            label: "Question Templates",
            table: "QuestionTemplates",
            keyFields: ["TemplateID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["QuestionType", "TemplateText", "AnswerSource", "RequiredFactType", "RequiredFactSubtype", "RequiredFactLabel", "ImageSourceType", "IsActive"],
            foreignKeys: {}
        },
        {
            slug: "customquestions",
            label: "Custom Questions",
            table: "CustomQuestions",
            keyFields: ["CustomQuestionID"],
            hasIsActive: true,
            canAdd: true,
            editableFields: ["CityID", "QuestionType", "QuestionText", "CorrectAnswer", "WrongAnswer1", "WrongAnswer2", "WrongAnswer3", "Explanation", "Difficulty", "ImagePath", "IsActive"],
            foreignKeys: { CityID: "Cities" }
        },
        {
            slug: "quizattempts",
            label: "Quiz Attempts",
            table: "QuizAttempts",
            keyFields: ["QuizAttemptID"],
            hasIsActive: true,
            canAdd: false,
            editableFields: ["Status", "IsActive"],
            foreignKeys: { UserID: "Users", SelectedRegionID: "Regions", SelectedCityID: "Cities" }
        },
        {
            slug: "quizattemptcities",
            label: "Quiz Attempt Cities",
            table: "QuizAttemptCities",
            keyFields: ["QuizAttemptID", "CityID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { QuizAttemptID: "QuizAttempts", CityID: "Cities" }
        },
        {
            slug: "quizattemptquestions",
            label: "Quiz Attempt Questions",
            table: "QuizAttemptQuestions",
            keyFields: ["QuizAttemptQuestionID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { QuizAttemptID: "QuizAttempts", TemplateID: "QuestionTemplates", CustomQuestionID: "CustomQuestions", CityID: "Cities" }
        },
        {
            slug: "flashcardsessions",
            label: "Flashcard Sessions",
            table: "FlashcardSessions",
            keyFields: ["FlashcardSessionID"],
            hasIsActive: true,
            canAdd: false,
            editableFields: ["IsActive"],
            foreignKeys: { UserID: "Users", SelectedRegionID: "Regions", SelectedCityID: "Cities" }
        },
        {
            slug: "flashcardsessioncities",
            label: "Flashcard Session Cities",
            table: "FlashcardSessionCities",
            keyFields: ["FlashcardSessionID", "CityID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { FlashcardSessionID: "FlashcardSessions", CityID: "Cities" }
        },
        {
            slug: "flashcardsessioncards",
            label: "Flashcard Session Cards",
            table: "FlashcardSessionCards",
            keyFields: ["FlashcardCardID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { FlashcardSessionID: "FlashcardSessions", CityID: "Cities", FactID: "CityFacts" }
        },
        {
            slug: "leaderboard",
            label: "Leaderboard",
            table: "Leaderboard",
            keyFields: ["LeaderboardID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { UserID: "Users" }
        },
        {
            slug: "userstatistics",
            label: "User Statistics",
            table: "UserStatistics",
            keyFields: ["UserStatsID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: { UserID: "Users" }
        },
        {
            slug: "websitestatistics",
            label: "Website Statistics",
            table: "WebsiteStatistics",
            keyFields: ["WebsiteStatsID"],
            hasIsActive: false,
            canAdd: false,
            editableFields: [],
            foreignKeys: {}
        }
    ];
}

// Gets table rules from URL slug
function getTableInfo(tableParam) {
    return getAdminTables().find(function(table) {
        return table.slug === String(tableParam).toLowerCase();
    }) || null;
}

// Escapes table and column names after whitelist validation
function q(name) {
    return "`" + String(name).replace(/`/g, "") + "`";
}

// Builds WHERE clause for primary key or composite key
function buildKeyWhere(tableInfo, bodyOrQuery) {
    var values = [];

    var clauses = tableInfo.keyFields.map(function(field) {
        var value = bodyOrQuery["__key_" + field] || bodyOrQuery[field];

        values.push(value);

        return q(field) + " = ?";
    });

    return {
        sql: clauses.join(" AND "),
        values: values
    };
}

// Builds search condition for visible table columns
function buildSearchWhere(columns, search) {
    if (!search) {
        return {
            sql: "",
            values: []
        };
    }

    var searchableColumns = columns.filter(function(col) {
        return !col.endsWith("_Display");
    });

    if (searchableColumns.length === 0) {
        return {
            sql: "",
            values: []
        };
    }

    return {
        sql: "WHERE CONCAT_WS(' ', " + searchableColumns.map(q).join(", ") + ") LIKE ?",
        values: ["%" + search + "%"]
    };
}

// Adds readable display names for foreign key columns
function getTableSelectSql(tableName) {
    if (tableName === "Cities") {
        return `
            SELECT Cities.*, Countries.CountryName AS CountryID_Display
            FROM Cities
            LEFT JOIN Countries ON Cities.CountryID = Countries.CountryID
        `;
    }

    if (tableName === "Countries") {
        return `
            SELECT Countries.*, Regions.RegionName AS RegionID_Display
            FROM Countries
            LEFT JOIN Regions ON Countries.RegionID = Regions.RegionID
        `;
    }

    if (tableName === "CityFacts") {
        return `
            SELECT CityFacts.*, Cities.CityName AS CityID_Display
            FROM CityFacts
            LEFT JOIN Cities ON CityFacts.CityID = Cities.CityID
        `;
    }

    if (tableName === "CustomQuestions") {
        return `
            SELECT CustomQuestions.*, Cities.CityName AS CityID_Display
            FROM CustomQuestions
            LEFT JOIN Cities ON CustomQuestions.CityID = Cities.CityID
        `;
    }

    return "SELECT * FROM " + q(tableName);
}

// Loads dropdown options for foreign key fields
async function getForeignOptions() {
    var regionRows = await db.query("SELECT RegionID AS value, RegionName AS label FROM Regions ORDER BY RegionName");
    var countryRows = await db.query("SELECT CountryID AS value, CountryName AS label FROM Countries ORDER BY CountryName");
    var cityRows = await db.query("SELECT CityID AS value, CityName AS label FROM Cities ORDER BY CityName");
    var userRows = await db.query("SELECT UserID AS value, Username AS label FROM Users ORDER BY Username");
    var templateRows = await db.query("SELECT TemplateID AS value, TemplateText AS label FROM QuestionTemplates ORDER BY TemplateID");
    var customQuestionRows = await db.query("SELECT CustomQuestionID AS value, QuestionText AS label FROM CustomQuestions ORDER BY CustomQuestionID");
    var factRows = await db.query("SELECT FactID AS value, FactLabel AS label FROM CityFacts ORDER BY FactID");
    var quizAttemptRows = await db.query("SELECT QuizAttemptID AS value, CONCAT('Attempt ', QuizAttemptID, ' - User ', UserID) AS label FROM QuizAttempts ORDER BY QuizAttemptID DESC");
    var flashcardSessionRows = await db.query("SELECT FlashcardSessionID AS value, CONCAT('Session ', FlashcardSessionID, ' - User ', UserID) AS label FROM FlashcardSessions ORDER BY FlashcardSessionID DESC");

    return {
        Regions: regionRows[0] || [],
        Countries: countryRows[0] || [],
        Cities: cityRows[0] || [],
        Users: userRows[0] || [],
        QuestionTemplates: templateRows[0] || [],
        CustomQuestions: customQuestionRows[0] || [],
        CityFacts: factRows[0] || [],
        QuizAttempts: quizAttemptRows[0] || [],
        FlashcardSessions: flashcardSessionRows[0] || []
    };
}

// Admin dashboard route
router.get("/admin", auth.requireAdmin, async function(req, res) {
    try {
        res.render("admin", {
            tables: getAdminTables(),
            message: req.query.message || ""
        });
    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).send("Admin dashboard failed.");
    }
});

// Shows selected database table
router.get("/admin/database/:table", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        var search = req.query.search || "";
        var page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        var limit = Math.max(parseInt(req.query.limit, 10) || 25, 5);
        var offset = (page - 1) * limit;

        var columnRows = await db.query("SHOW COLUMNS FROM " + q(tableInfo.table));

        var columns = columnRows[0].map(function(col) {
            return col.Field;
        });

        var searchWhere = buildSearchWhere(columns, search);

        var countRows = await db.query(
            "SELECT COUNT(*) AS total FROM " + q(tableInfo.table) + " " + searchWhere.sql,
            searchWhere.values
        );

        var totalRows = countRows[0][0].total || 0;
        var totalPages = Math.max(Math.ceil(totalRows / limit), 1);
        var baseSql = getTableSelectSql(tableInfo.table);

        var rows = await db.query(
            baseSql + " " + searchWhere.sql + " LIMIT ? OFFSET ?",
            searchWhere.values.concat([limit, offset])
        );

        res.render("adminTable", {
            tables: getAdminTables(),
            tableInfo: tableInfo,
            tableName: tableInfo.table,
            tableSlug: tableInfo.slug,
            keyFields: tableInfo.keyFields,
            hasIsActive: tableInfo.hasIsActive,
            canAdd: tableInfo.canAdd,
            editableFields: tableInfo.editableFields,
            foreignKeys: tableInfo.foreignKeys,
            foreignOptions: await getForeignOptions(),
            rows: rows[0] || [],
            columns: columns,
            search: search,
            page: page,
            limit: limit,
            totalRows: totalRows,
            totalPages: totalPages
        });
    } catch (err) {
        console.error("Database table error:", err);
        res.status(500).send("Could not load table.");
    }
});

// Shows one row in read-only view
router.get("/admin/database/:table/view", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        var keyData = JSON.parse(req.query.key || "{}");
        var keyWhere = buildKeyWhere(tableInfo, keyData);

        var rowResult = await db.query(
            "SELECT * FROM " + q(tableInfo.table) + " WHERE " + keyWhere.sql + " LIMIT 1",
            keyWhere.values
        );

        if (rowResult[0].length === 0) {
            return res.status(404).send("Row not found.");
        }

        var row = rowResult[0][0];
        var html = "";

        html += "<!DOCTYPE html><html><head>";
        html += "<title>View Row</title>";
        html += "<link rel='stylesheet' href='/css/style.css'>";
        html += "</head><body>";
        html += "<main class='home-container'>";
        html += "<p><a href='/admin/database/" + tableInfo.slug + "'>Back to Table</a></p>";
        html += "<h1>View Row: " + tableInfo.table + "</h1>";
        html += "<table class='admin-table'>";

        Object.keys(row).forEach(function(col) {
            html += "<tr>";
            html += "<th>" + col + "</th>";
            html += "<td>" + (row[col] === null ? "" : String(row[col])) + "</td>";
            html += "</tr>";
        });

        html += "</table>";
        html += "</main></body></html>";

        res.send(html);
    } catch (err) {
        console.error("View row error:", err);
        res.status(500).send("Could not view row.");
    }
});

// Updates only allowed editable fields
router.post("/admin/database/:table/update", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        var fields = Object.keys(req.body).filter(function(field) {
            return tableInfo.editableFields.includes(field);
        });

        if (fields.length === 0) {
            return res.redirect("/admin/database/" + tableInfo.slug);
        }

        var values = fields.map(function(field) {
            return req.body[field] === "" ? null : req.body[field];
        });

        var setClause = fields.map(function(field) {
            return q(field) + " = ?";
        }).join(", ");

        var keyWhere = buildKeyWhere(tableInfo, req.body);

        await db.query(
            "UPDATE " + q(tableInfo.table) + " SET " + setClause + " WHERE " + keyWhere.sql,
            values.concat(keyWhere.values)
        );

        res.redirect("/admin/database/" + tableInfo.slug);
    } catch (err) {
        console.error("Update row error:", err);
        res.status(500).send("Could not update row.");
    }
});

// Adds rows only for tables where canAdd is true
router.post("/admin/database/:table/add", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo || !tableInfo.canAdd) {
            return res.status(400).send("This table does not allow manual row creation.");
        }

        var insertFields = Object.keys(req.body).filter(function(field) {
            return tableInfo.editableFields.includes(field);
        });

        var insertValues = insertFields.map(function(field) {
            return req.body[field] === "" ? null : req.body[field];
        });

        if (insertFields.length === 0) {
            return res.redirect("/admin/database/" + tableInfo.slug);
        }

        var placeholders = insertFields.map(function() {
            return "?";
        }).join(", ");

        await db.query(
            "INSERT INTO " + q(tableInfo.table) +
            " (" + insertFields.map(q).join(", ") + ")" +
            " VALUES (" + placeholders + ")",
            insertValues
        );

        res.redirect("/admin/database/" + tableInfo.slug);
    } catch (err) {
        console.error("Add row error:", err);
        res.status(500).send("Could not add row.");
    }
});

// Hides rows using IsActive
router.post("/admin/database/:table/hide", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo || !tableInfo.hasIsActive) {
            return res.status(400).send("This table cannot be hidden.");
        }

        var keyWhere = buildKeyWhere(tableInfo, req.body);

        await db.query(
            "UPDATE " + q(tableInfo.table) + " SET IsActive = FALSE WHERE " + keyWhere.sql,
            keyWhere.values
        );

        res.redirect("/admin/database/" + tableInfo.slug);
    } catch (err) {
        console.error("Hide row error:", err);
        res.status(500).send("Could not hide row.");
    }
});

// Unhides rows using IsActive
router.post("/admin/database/:table/unhide", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo || !tableInfo.hasIsActive) {
            return res.status(400).send("This table cannot be unhidden.");
        }

        var keyWhere = buildKeyWhere(tableInfo, req.body);

        await db.query(
            "UPDATE " + q(tableInfo.table) + " SET IsActive = TRUE WHERE " + keyWhere.sql,
            keyWhere.values
        );

        res.redirect("/admin/database/" + tableInfo.slug);
    } catch (err) {
        console.error("Unhide row error:", err);
        res.status(500).send("Could not unhide row.");
    }
});

// Exports admin router
module.exports = router;