// maintenanceDatabase.test.js
// Tests database connection and basic table access

var db = require("../db/connection");

// Database maintenance tests
describe("Maintenance Database Tests", function() {

  // MTC-02
  // Confirms database connection works using .env values
  test("MTC-02 database connection can run a simple query", async function() {
    var result = await db.query("SELECT 1 AS testValue");

    expect(result[0][0].testValue).toBe(1);
  });

  // MTC-02
  // Confirms main CityWise tables exist
  test("MTC-02 database has required core tables", async function() {
    var result = await db.query(`
      SHOW TABLES
    `);

    var tableText = JSON.stringify(result[0]);

    expect(tableText).toMatch(/Users/i);
    expect(tableText).toMatch(/Cities/i);
    expect(tableText).toMatch(/CityFacts/i);
    expect(tableText).toMatch(/QuizAttempts/i);
  });

});