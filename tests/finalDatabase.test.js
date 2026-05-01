// finalDatabase.test.js
// Final submission tests for database connectivity and required tables

const db = require("../db/connection");

describe("Final Database Tests", function () {

  test("MTC-02 database connection works", async function () {
    const result = await db.query("SELECT 1 AS testValue");

    expect(result[0][0].testValue).toBe(1);
  });

  test("MTC-02 required core tables exist", async function () {
    const result = await db.query("SHOW TABLES");

    const tableText = JSON.stringify(result[0]);

    expect(tableText).toMatch(/Users/i);
    expect(tableText).toMatch(/Cities/i);
    expect(tableText).toMatch(/CityFacts/i);
    expect(tableText).toMatch(/QuizAttempts/i);
    expect(tableText).toMatch(/Leaderboard/i);
    expect(tableText).toMatch(/UserStatistics/i);
  });

});