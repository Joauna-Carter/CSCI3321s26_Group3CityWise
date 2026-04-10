// seedData.js
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

// find file ignoring uppercase/lowercase
function findFileInsensitive(fileName) {
  const files = fs.readdirSync(__dirname);
  const match = files.find((f) => f.toLowerCase() === fileName.toLowerCase());

  if (!match) {
    throw new Error(`File not found: ${fileName}`);
  }

  return path.join(__dirname, match);
}

// load CSV and normalize header names
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(
        csv({
          mapHeaders: ({ header }) =>
            header.toLowerCase().trim().replace(/\s+/g, "")
        })
      )
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

// convert blank values and NULL text to null
function clean(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();

  if (trimmed === "" || trimmed.toUpperCase() === "NULL") {
    return null;
  }

  return trimmed;
}

async function main() {
  const conn = await mysql.createConnection(dbConfig);

  try {
    console.log("Importing data...");

    // regions
    let rows = await loadCSV(findFileInsensitive("regions.csv"));
    for (const r of rows) {
      await conn.execute(
        "INSERT INTO Regions (RegionCode, RegionName) VALUES (?, ?)",
        [
          clean(r.regioncode),
          clean(r.regionname)
        ]
      );
    }

    // countries
    rows = await loadCSV(findFileInsensitive("countries.csv"));
    for (const r of rows) {
      await conn.execute(
        "INSERT INTO Countries (CountryName, RegionID, FlagImagePath) VALUES (?, ?, ?)",
        [
          clean(r.countryname),
          clean(r.regionid),
          clean(r.flagimagepath)
        ]
      );
    }

    // cities
    rows = await loadCSV(findFileInsensitive("cities.csv"));
    for (const r of rows) {
      await conn.execute(
        `INSERT INTO Cities
        (CityName, CountryID, Population, Description, Latitude, Longitude, CityImagePath)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          clean(r.cityname),
          clean(r.countryid),
          clean(r.population),
          clean(r.description),
          clean(r.latitude),
          clean(r.longitude),
          clean(r.cityimagepath)
        ]
      );
    }

    // city facts
    rows = await loadCSV(findFileInsensitive("citiesfacts.csv"));
    for (const r of rows) {
      await conn.execute(
        `INSERT INTO CityFacts
        (CityID, FactType, FactSubtype, FactLabel, FactValue, AltAnswers, FactImageType)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          clean(r.cityid),
          clean(r.facttype),
          clean(r.factsubtype),
          clean(r.factlabel),
          clean(r.factvalue),
          clean(r.altanswers),
          clean(r.factimagepath)
        ]
      );
    }

    // question templates
    rows = await loadCSV(findFileInsensitive("questiontemplates.csv"));
    for (const r of rows) {
      let qType = clean(r.questiontype);

      if (qType && qType.toUpperCase() === "FIB") {
        qType = "FB";
      }

      await conn.execute(
        `INSERT INTO QuestionTemplates
        (QuestionType, TemplateText, AnswerSource, RequiredFactType, RequiredFactSubtype, ImageSourceType)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          qType,
          clean(r.templatetext),
          clean(r.answersource),
          clean(r.requiredfacttype),
          clean(r.requiredfactsubtype),
          clean(r.imagesourcetype)
        ]
      );
    }

    console.log("Data imported successfully!");
  } catch (err) {
    console.error("Import error:", err);
  } finally {
    await conn.end();
  }
}

main();