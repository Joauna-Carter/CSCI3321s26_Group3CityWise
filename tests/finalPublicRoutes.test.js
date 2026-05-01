// finalPublicRoutes.test.js
// Final submission tests for public pages that must load successfully

const request = require("supertest");
const app = require("../app");

describe("Final Public Route Tests", function () {

  test("MTC-01 home page loads", async function () {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/CityWise/i);
  });

  test("MTC-04 city list page loads", async function () {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/City Trivia|Browse/i);
  });

  test("MTC-04 study page loads", async function () {
    const res = await request(app).get("/study");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Study|Quiz|Flashcards/i);
  });

  test("MTC-04 map page loads", async function () {
    const res = await request(app).get("/map");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Map|city-map|Leaflet/i);
  });

  test("MTC-18 leaderboard page loads", async function () {
    const res = await request(app).get("/leaderboard");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Leaderboard|Total Points|Average Score/i);
  });

  test("MTC-19 statistics page loads for guest", async function () {
    const res = await request(app).get("/statistics");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Statistics|Website Statistics/i);
  });

  test("MTC-20 stylesheet loads", async function () {
    const res = await request(app).get("/css/style.css");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/body|navbar|city-card/i);
  });

});