var express = require("express");
var router = express.Router();
var db = require("../db/connection");
var auth = require("../middleware/auth");

// helper to get current admin user id
function getSessionUserId(req) {
    if (!req.session.user) {
        return null;
    }

    return (
        req.session.user.userId ||
        req.session.user.UserID ||
        req.session.user.id ||
        req.session.user.UserId ||
        null
    );
}

// helper for allowed admin database tables
function getTableInfo(tableParam) {
    var tables = {
        cities: { table: "Cities", primaryKey: "CityID" },
        countries: { table: "Countries", primaryKey: "CountryID" },
        regions: { table: "Regions", primaryKey: "RegionID" },
        facts: { table: "CityFacts", primaryKey: "FactID" },
        cityfacts: { table: "CityFacts", primaryKey: "FactID" },
        customquestions: { table: "CustomQuestions", primaryKey: "CustomQuestionID" },
        questions: { table: "CustomQuestions", primaryKey: "CustomQuestionID" },
        questiontemplates: { table: "QuestionTemplates", primaryKey: "TemplateID" },
        users: { table: "Users", primaryKey: "UserID" }
    };

    return tables[String(tableParam).toLowerCase()] || null;
}

// builds the editable city page article from Cities and CityFacts
async function buildDefaultCityPage(cityId) {
    var cityRows = await db.query(`
        SELECT Cities.*, Countries.CountryName, Regions.RegionName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        JOIN Regions ON Countries.RegionID = Regions.RegionID
        WHERE Cities.CityID = ?
        LIMIT 1
    `, [cityId]);

    if (cityRows[0].length === 0) {
        return "";
    }

    var city = cityRows[0][0];

    var factRows = await db.query(`
        SELECT *
        FROM CityFacts
        WHERE CityID = ? AND IsActive = TRUE
        ORDER BY FactType, FactSubtype, FactLabel
    `, [cityId]);

    var facts = factRows[0] || [];

    var quickFacts = facts.filter(function(fact) {
        return fact.FactType === "QuickFact";
    });

    var funFacts = facts.filter(function(fact) {
        return fact.FactType !== "QuickFact";
    });

    var html = "";

    html += "<h1>" + city.CityName + "</h1>";
    html += "<p><strong>" + city.CountryName + "</strong> | " + city.RegionName + "</p>";

    if (city.CityImagePath) {
        html += "<p><img class='city-image' src='" + city.CityImagePath + "' alt='" + city.CityName + "'></p>";
    }

    if (city.Description) {
        html += "<p>" + city.Description + "</p>";
    }

    html += "<h2>Quick Facts</h2>";
    html += "<ul>";
    html += "<li><strong>Country:</strong> " + city.CountryName + "</li>";

    if (city.Population) {
        html += "<li><strong>Population:</strong> " + Number(city.Population).toLocaleString() + "</li>";
    }

    quickFacts.forEach(function(fact) {
        if (fact.FactLabel !== "Country" && fact.FactLabel !== "Population") {
            html += "<li><strong>" + fact.FactLabel + ":</strong> " + fact.FactValue + "</li>";
        }
    });

    html += "</ul>";

    html += "<h2>Location</h2>";
    html += "<ul>";
    html += "<li><strong>Latitude:</strong> " + city.Latitude + "</li>";
    html += "<li><strong>Longitude:</strong> " + city.Longitude + "</li>";
    html += "</ul>";

    html += "<h2>Facts</h2>";
    html += "<table>";
    html += "<thead>";
    html += "<tr>";
    html += "<th>Fact</th>";
    html += "<th>Image</th>";
    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";

    funFacts.forEach(function(fact) {
        html += "<tr>";
        html += "<td><strong>" + fact.FactLabel + ":</strong> " + fact.FactValue + "</td>";

        if (fact.FactImagePath) {
            html += "<td><img class='fact-image' src='" + fact.FactImagePath + "' alt='" + fact.FactLabel + "'></td>";
        } else {
            html += "<td><span class='no-image'>No Image</span></td>";
        }

        html += "</tr>";
    });

    html += "</tbody>";
    html += "</table>";

    html += "<h2>Sources</h2>";
    html += "<p>Sources can be added later.</p>";

    return html;
}

// admin dashboard
router.get("/admin", auth.requireAdmin, async function(req, res) {
    try {
        var regionRows = await db.query(`
            SELECT *
            FROM Regions
            ORDER BY RegionName
        `);

        var countryRows = await db.query(`
            SELECT Countries.*, Regions.RegionName
            FROM Countries
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Countries.CountryName
        `);

        var cityRows = await db.query(`
            SELECT Cities.*, Countries.CountryName, Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Cities.CityName
        `);

        res.render("admin", {
            regions: regionRows[0] || [],
            countries: countryRows[0] || [],
            cities: cityRows[0] || [],
            message: req.query.message || ""
        });
    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).send("Admin dashboard failed.");
    }
});

// add city
router.post("/admin/cities/add", auth.requireAdmin, async function(req, res) {
    try {
        await db.query(`
            INSERT INTO Cities
            (CityName, CountryID, Population, Description, Latitude, Longitude, CityImagePath)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            req.body.name,
            req.body.countryId,
            req.body.population || null,
            req.body.description || null,
            req.body.lat || null,
            req.body.lng || null,
            req.body.image || null
        ]);

        res.redirect("/admin");
    } catch (err) {
        console.error("Add city error:", err);
        res.status(500).send("Could not add city.");
    }
});

// hide city
router.post("/admin/cities/:id/hide", auth.requireAdmin, async function(req, res) {
    try {
        await db.query("UPDATE Cities SET IsActive = FALSE WHERE CityID = ?", [req.params.id]);
        res.redirect("/cities/" + req.params.id);
    } catch (err) {
        console.error("Hide city error:", err);
        res.status(500).send("Could not hide city.");
    }
});

// unhide city
router.post("/admin/cities/:id/unhide", auth.requireAdmin, async function(req, res) {
    try {
        await db.query("UPDATE Cities SET IsActive = TRUE WHERE CityID = ?", [req.params.id]);
        res.redirect("/cities/" + req.params.id);
    } catch (err) {
        console.error("Unhide city error:", err);
        res.status(500).send("Could not unhide city.");
    }
});

// load wiki editor
router.get("/admin/cities/:id/content", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.params.id;

        var cityRows = await db.query(`
            SELECT CityID, CityName
            FROM Cities
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        if (cityRows[0].length === 0) {
            return res.status(404).send("City not found.");
        }

        var pageRows = await db.query(`
            SELECT PageContent
            FROM CityPageContent
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        var pageContent = "";

        if (pageRows[0].length > 0 && pageRows[0][0].PageContent) {
            pageContent = pageRows[0][0].PageContent;
        } else {
            pageContent = await buildDefaultCityPage(cityId);
        }

        res.render("cityContentEdit", {
            city: cityRows[0][0],
            pageContent: pageContent
        });
    } catch (err) {
        console.error("Content editor error:", err);
        res.status(500).send("Could not load city page editor.");
    }
});

// save wiki editor
router.post("/admin/cities/:id/content", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.params.id;
        var content = req.body.pageContent || "";
        var editSummary = req.body.editSummary || null;
        var userId = getSessionUserId(req);

        var existing = await db.query(`
            SELECT PageContent
            FROM CityPageContent
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        if (existing[0].length > 0) {
            await db.query(`
                INSERT INTO CityPageRevisions
                (CityID, EditedByUserID, PageContent, EditSummary)
                VALUES (?, ?, ?, ?)
            `, [
                cityId,
                userId,
                existing[0][0].PageContent || "",
                editSummary
            ]);

            await db.query(`
                UPDATE CityPageContent
                SET PageContent = ?, LastUpdated = CURRENT_TIMESTAMP
                WHERE CityID = ?
            `, [content, cityId]);
        } else {
            await db.query(`
                INSERT INTO CityPageContent
                (CityID, PageContent)
                VALUES (?, ?)
            `, [cityId, content]);
        }

        res.redirect("/cities/" + cityId);
    } catch (err) {
        console.error("Save city page content error:", err);
        res.status(500).send("Could not save city page content.");
    }
});

// reset editable content from database
router.post("/admin/cities/:id/content/reset", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.params.id;
        var rebuiltContent = await buildDefaultCityPage(cityId);
        var userId = getSessionUserId(req);

        var existing = await db.query(`
            SELECT PageContent
            FROM CityPageContent
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        if (existing[0].length > 0) {
            await db.query(`
                INSERT INTO CityPageRevisions
                (CityID, EditedByUserID, PageContent, EditSummary)
                VALUES (?, ?, ?, ?)
            `, [
                cityId,
                userId,
                existing[0][0].PageContent || "",
                "Reset page from database facts"
            ]);

            await db.query(`
                UPDATE CityPageContent
                SET PageContent = ?, LastUpdated = CURRENT_TIMESTAMP
                WHERE CityID = ?
            `, [rebuiltContent, cityId]);
        } else {
            await db.query(`
                INSERT INTO CityPageContent
                (CityID, PageContent)
                VALUES (?, ?)
            `, [cityId, rebuiltContent]);
        }

        res.redirect("/admin/cities/" + cityId + "/content");
    } catch (err) {
        console.error("Reset city page content error:", err);
        res.status(500).send("Could not reset city page content.");
    }
});

// history
router.get("/admin/cities/:id/history", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.params.id;

        var cityRows = await db.query(`
            SELECT CityID, CityName
            FROM Cities
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        if (cityRows[0].length === 0) {
            return res.status(404).send("City not found.");
        }

        var revisionRows = await db.query(`
            SELECT
                CityPageRevisions.RevisionID,
                CityPageRevisions.PageContent,
                CityPageRevisions.EditSummary,
                CityPageRevisions.CreatedAt,
                Users.Username
            FROM CityPageRevisions
            LEFT JOIN Users ON CityPageRevisions.EditedByUserID = Users.UserID
            WHERE CityPageRevisions.CityID = ?
            ORDER BY CityPageRevisions.CreatedAt DESC
        `, [cityId]);

        res.render("cityHistory", {
            city: cityRows[0][0],
            revisions: revisionRows[0] || []
        });
    } catch (err) {
        console.error("History error:", err);
        res.status(500).send("Could not load edit history.");
    }
});

// database view
router.get("/admin/database/:table", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        var columnRows = await db.query("SHOW COLUMNS FROM " + tableInfo.table);
        var columns = columnRows[0].map(function(col) {
            return col.Field;
        });

        var citiesRows = await db.query(`
            SELECT CityID, CityName
            FROM Cities
            ORDER BY CityName
        `);

        var rows;

        if (tableInfo.table === "Cities") {
            rows = await db.query(`
                SELECT Cities.*, Countries.CountryName AS CountryID_Display
                FROM Cities
                LEFT JOIN Countries ON Cities.CountryID = Countries.CountryID
                LIMIT 500
            `);
        } else if (tableInfo.table === "Countries") {
            rows = await db.query(`
                SELECT Countries.*, Regions.RegionName AS RegionID_Display
                FROM Countries
                LEFT JOIN Regions ON Countries.RegionID = Regions.RegionID
                LIMIT 500
            `);
        } else if (tableInfo.table === "CityFacts") {
            rows = await db.query(`
                SELECT CityFacts.*, Cities.CityName AS CityID_Display
                FROM CityFacts
                LEFT JOIN Cities ON CityFacts.CityID = Cities.CityID
                LIMIT 500
            `);
        } else if (tableInfo.table === "CustomQuestions") {
            rows = await db.query(`
                SELECT CustomQuestions.*, Cities.CityName AS CityID_Display
                FROM CustomQuestions
                LEFT JOIN Cities ON CustomQuestions.CityID = Cities.CityID
                LIMIT 500
            `);
        } else {
            rows = await db.query("SELECT * FROM " + tableInfo.table + " LIMIT 500");
        }

        res.render("adminTable", {
            tableName: tableInfo.table,
            tableSlug: req.params.table,
            primaryKey: tableInfo.primaryKey,
            rows: rows[0] || [],
            columns: columns,
            cities: citiesRows[0] || []
        });
    } catch (err) {
        console.error("Database table error:", err);
        res.status(500).send("Could not load table.");
    }
});

// delete database row
router.post("/admin/database/:table/delete/:id", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        await db.query(
            "DELETE FROM " + tableInfo.table + " WHERE " + tableInfo.primaryKey + " = ?",
            [req.params.id]
        );

        res.redirect("/admin/database/" + req.params.table);
    } catch (err) {
        console.error("Delete row error:", err);
        res.status(500).send("Could not delete row.");
    }
});

// update database row
router.post("/admin/database/:table/update/:id", auth.requireAdmin, async function(req, res) {
    try {
        var tableInfo = getTableInfo(req.params.table);

        if (!tableInfo) {
            return res.status(400).send("Invalid table.");
        }

        var fields = Object.keys(req.body).filter(function(field) {
            return field !== tableInfo.primaryKey && !field.endsWith("_Display");
        });

        var values = fields.map(function(field) {
            return req.body[field] === "" ? null : req.body[field];
        });

        if (fields.length === 0) {
            return res.redirect("/admin/database/" + req.params.table);
        }

        var setClause = fields.map(function(field) {
            return field + " = ?";
        }).join(", ");

        await db.query(
            "UPDATE " + tableInfo.table + " SET " + setClause + " WHERE " + tableInfo.primaryKey + " = ?",
            values.concat([req.params.id])
        );

        res.redirect("/admin/database/" + req.params.table);
    } catch (err) {
        console.error("Update row error:", err);
        res.status(500).send("Could not update row.");
    }
});

// add custom question
router.post("/admin/customquestions/add", auth.requireAdmin, async function(req, res) {
    try {
        await db.query(`
            INSERT INTO CustomQuestions
            (CityID, QuestionType, QuestionText, CorrectAnswer, WrongAnswer1, WrongAnswer2, WrongAnswer3, Explanation, Difficulty, IsActive, ImagePath)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
        `, [
            req.body.cityId,
            req.body.questionType,
            req.body.questionText,
            req.body.correctAnswer,
            req.body.wrongAnswer1 || null,
            req.body.wrongAnswer2 || null,
            req.body.wrongAnswer3 || null,
            req.body.explanation || null,
            req.body.difficulty || null,
            req.body.imagePath || null
        ]);

        res.redirect("/admin/database/customquestions");
    } catch (err) {
        console.error("Add custom question error:", err);
        res.status(500).send("Could not add custom question.");
    }
});

module.exports = router;