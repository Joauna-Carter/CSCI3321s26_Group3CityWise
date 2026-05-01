// statsMaintenance.test.js
// Tests leaderboard and statistics pages for guest access and safe rendering

const request = require("supertest"); // Sends HTTP requests to Express app
const app = require("../app"); // Imports app without starting another server

// Statistics and leaderboard maintenance tests
describe("Statistics Maintenance Tests", function() {

  // MTC-18
  // Leaderboard should be public and load safely
  test("MTC-18 leaderboard loads for guest", async function() {
    const res = await request(app).get("/leaderboard");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/leaderboard|total points|average score/i);
  });

  // MTC-19
  // Statistics page should be public
  test("MTC-19 statistics loads for guest", async function() {
    const res = await request(app).get("/statistics");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/statistics|website statistics|quiz/i);
  });

  // MTC-19
  // Statistics page should include guest message for personal stats
  test("MTC-19 statistics guest sees login message for personal stats", async function() {
    const res = await request(app).get("/statistics");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/log in to view your personal statistics/i);
  });

});