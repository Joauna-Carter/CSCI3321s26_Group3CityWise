// seedingMaintenance.test.js
// Validates required seed CSV files exist in db folder and are not empty

const fs = require("fs");
const path = require("path");

// CSV files used by db/seedData.js
const csvFiles = [
  "regions.csv",
  "countries.csv",
  "cities.csv",
  "cityfacts.csv",
  "questiontemplates.csv"
];

describe("Seeding Maintenance Tests", function () {

  // MTC-03
  // Confirms all required CSV files exist in db folder
  test("MTC-03 all seed CSV files exist", function () {
    csvFiles.forEach(function (file) {
      const filePath = path.join(__dirname, "..", "db", file);

      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  // MTC-03
  // Confirms each CSV has content
  test("MTC-03 CSV files contain data", function () {
    csvFiles.forEach(function (file) {
      const filePath = path.join(__dirname, "..", "db", file);
      const content = fs.readFileSync(filePath, "utf8");

      expect(content.length).toBeGreaterThan(10);
    });
  });

});