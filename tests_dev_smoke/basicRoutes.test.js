// basicRoutes.test.js
// Tests public site pages that guests should be able to load

const request = require("supertest"); // Makes HTTP requests to app
const app = require("../app"); // Imports Express app

describe("Basic Page Routes", function () {

  test("GET / loads home page", async function () {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("CityWise");
  });

  test("GET /cities loads city list page", async function () {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/City|Cities|Trivia/i);
  });

  test("GET /study loads study and quiz setup page", async function () {
    const res = await request(app).get("/study");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Study|Quiz|Flashcards/i);
  });

  test("GET /map loads map page", async function () {
    const res = await request(app).get("/map");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Map|CityWise/i);
  });

  test("GET /leaderboard loads leaderboard page", async function () {
    const res = await request(app).get("/leaderboard");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Leaderboard|Points|Score/i);
  });

  test("GET /statistics loads statistics page", async function () {
    const res = await request(app).get("/statistics");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Statistics|Quiz|Users/i);
  });

  test("GET /test-db returns database test response or safe failure", async function () {
    const res = await request(app).get("/test-db");

    expect([200, 500]).toContain(res.statusCode);
  });

});