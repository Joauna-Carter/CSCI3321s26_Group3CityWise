var express = require("express");
var router = express.Router();
var db = require("../db/connection");

// city list
router.get("/cities", async function(req, res) {
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
router.get("/cities/:id", async function(req, res) {
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

// map page
router.get("/map", async function(req, res) {
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

module.exports = router;