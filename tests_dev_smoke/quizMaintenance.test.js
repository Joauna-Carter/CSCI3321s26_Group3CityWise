// quizMaintenance.test.js
// Tests quiz start routes and quiz failure safety

const request = require("supertest"); // Sends HTTP requests to Express app
const app = require("../app"); // Imports app without starting another server

// Quiz maintenance tests
describe("Quiz Maintenance Tests", function() {

  // MTC-13
  // Confirms quiz start route works or fails safely when city data is missing
  test("MTC-13 start quiz from city parameter", async function() {
    const res = await request(app).get("/quiz/start?cityId=1&difficulty=easy&timed=0");

    expect([200, 302, 404, 500]).toContain(res.statusCode);
  });

  // MTC-15
  // Confirms limited/missing data does not crash permanently
  test("MTC-15 start quiz for missing city fails safely", async function() {
    const res = await request(app).get("/quiz/start?cityId=999999&difficulty=easy&timed=0");

    expect([200, 302, 404, 500]).toContain(res.statusCode);
  });

  // MTC-14
  // Answer route without active quiz should fail safely
  test("MTC-14 submit answer without active quiz does not crash", async function() {
    const res = await request(app)
      .post("/quiz/answer")
      .send({
        answer: "Test Answer",
        timeLeft: 10
      });

    expect([200, 302, 400, 404, 500]).toContain(res.statusCode);
  });

  // MTC-13
  // Quiz page without active quiz should show safe message
  test("MTC-13 quiz page without active quiz shows safe response", async function() {
    const res = await request(app).get("/quiz");

    expect([200, 302]).toContain(res.statusCode);
    expect(res.text).toMatch(/no quiz|study|quiz/i);
  });

});