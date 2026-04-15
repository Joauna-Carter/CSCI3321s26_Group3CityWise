var express = require("express");
var router = express.Router();
var db = require("../db/connection");
var auth = require("../middleware/auth");

// admin dashboard
router.get("/admin", auth.requireAdmin, async function(req, res) {
    try {
        var selectedCityId = req.query.cityId || "";

        var countryRows = await db.query(`
            SELECT
                Countries.CountryID,
                Countries.CountryName,
                Regions.RegionName
            FROM Countries
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Countries.CountryName
        `);

        var cityRows = await db.query(`
            SELECT
                Cities.CityID,
                Cities.CityName,
                Cities.Description,
                Countries.CountryName,
                Regions.RegionName
            FROM Cities
            JOIN Countries ON Cities.CountryID = Countries.CountryID
            JOIN Regions ON Countries.RegionID = Regions.RegionID
            ORDER BY Cities.CityName
        `);

        var selectedCity = null;
        var selectedFacts = [];
        var selectedPageContent = "";

        if (selectedCityId) {
            var selectedCityRows = await db.query(`
                SELECT
                    Cities.CityID,
                    Cities.CityName,
                    Cities.Description,
                    Countries.CountryName,
                    Regions.RegionName
                FROM Cities
                JOIN Countries ON Cities.CountryID = Countries.CountryID
                JOIN Regions ON Countries.RegionID = Regions.RegionID
                WHERE Cities.CityID = ?
                LIMIT 1
            `, [selectedCityId]);

            if (selectedCityRows[0].length > 0) {
                selectedCity = selectedCityRows[0][0];
            }

            var selectedFactRows = await db.query(`
                SELECT
                    FactID,
                    FactType,
                    FactSubtype,
                    FactLabel,
                    FactValue
                FROM CityFacts
                WHERE CityID = ?
                ORDER BY FactType, FactSubtype, FactLabel
            `, [selectedCityId]);

            selectedFacts = selectedFactRows[0];

            var pageRows = await db.query(`
                SELECT PageContent
                FROM CityPageContent
                WHERE CityID = ?
                LIMIT 1
            `, [selectedCityId]);

            if (pageRows[0].length > 0) {
                selectedPageContent = pageRows[0][0].PageContent || "";
            }
        }

        res.render("admin", {
            countries: countryRows[0],
            cities: cityRows[0],
            selectedCity: selectedCity,
            selectedFacts: selectedFacts,
            selectedPageContent: selectedPageContent,
            message: req.query.message || ""
        });
    } catch (err) {
        console.error("Admin page error:", err);
        res.status(500).send("Could not load admin dashboard.");
    }
});

// add city
router.post("/admin/cities/add", auth.requireAdmin, async function(req, res) {
    try {
        var cityName = (req.body.cityName || "").trim();
        var countryId = req.body.countryId || null;
        var population = req.body.population || null;
        var description = (req.body.description || "").trim() || null;
        var latitude = req.body.latitude || null;
        var longitude = req.body.longitude || null;
        var cityImagePath = (req.body.cityImagePath || "").trim() || null;

        if (!cityName || !countryId) {
            return res.redirect("/admin?message=" + encodeURIComponent("City name and country are required."));
        }

        await db.query(`
            INSERT INTO Cities
            (CityName, CountryID, Population, Description, Latitude, Longitude, CityImagePath)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            cityName,
            countryId,
            population || null,
            description,
            latitude || null,
            longitude || null,
            cityImagePath
        ]);

        res.redirect("/admin?message=" + encodeURIComponent("City added successfully."));
    } catch (err) {
        console.error("Add city error:", err);
        res.redirect("/admin?message=" + encodeURIComponent("Could not add city."));
    }
});

// add fact
router.post("/admin/facts/add", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.body.cityId || null;
        var factType = (req.body.factType || "").trim();
        var factSubtype = (req.body.factSubtype || "").trim();
        var factLabel = (req.body.factLabel || "").trim();
        var factValue = (req.body.factValue || "").trim();
        var altAnswers = (req.body.altAnswers || "").trim() || null;
        var factImageType = (req.body.factImageType || "").trim() || null;

        if (!cityId || !factType || !factSubtype || !factLabel || !factValue) {
            return res.redirect("/admin?message=" + encodeURIComponent("All fact fields except optional ones are required."));
        }

        await db.query(`
            INSERT INTO CityFacts
            (CityID, FactType, FactSubtype, FactLabel, FactValue, AltAnswers, FactImageType)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            cityId,
            factType,
            factSubtype,
            factLabel,
            factValue,
            altAnswers,
            factImageType
        ]);

        res.redirect("/admin?cityId=" + encodeURIComponent(cityId) + "&message=" + encodeURIComponent("Fact added successfully."));
    } catch (err) {
        console.error("Add fact error:", err);
        res.redirect("/admin?message=" + encodeURIComponent("Could not add fact."));
    }
});

// save city page content
router.post("/admin/content/save", auth.requireAdmin, async function(req, res) {
    try {
        var cityId = req.body.cityId || null;
        var pageContent = req.body.pageContent || "";

        if (!cityId) {
            return res.redirect("/admin?message=" + encodeURIComponent("Please select a city."));
        }

        var existingRows = await db.query(`
            SELECT CityPageContentID
            FROM CityPageContent
            WHERE CityID = ?
            LIMIT 1
        `, [cityId]);

        if (existingRows[0].length > 0) {
            await db.query(`
                UPDATE CityPageContent
                SET PageContent = ?, LastUpdated = CURRENT_TIMESTAMP
                WHERE CityID = ?
            `, [pageContent, cityId]);
        } else {
            await db.query(`
                INSERT INTO CityPageContent (CityID, PageContent)
                VALUES (?, ?)
            `, [cityId, pageContent]);
        }

        res.redirect("/admin?cityId=" + encodeURIComponent(cityId) + "&message=" + encodeURIComponent("City page content saved."));
    } catch (err) {
        console.error("Save city page content error:", err);
        res.redirect("/admin?message=" + encodeURIComponent("Could not save city page content."));
    }
});

module.exports = router;