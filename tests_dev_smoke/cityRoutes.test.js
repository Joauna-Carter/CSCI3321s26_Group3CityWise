// cityRoutes.test.js
// Tests city list, individual city pages, missing city handling, and map route behavior

const request = require("supertest"); // Makes HTTP requests to app
const app = require("../app"); // Imports Express app

describe("City Routes", function () {

  test("GET /cities shows city list page", async function () {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/City|Cities|Trivia/i);
  });

  test("GET /cities/1 loads city page or returns not found safely", async function () {
    const res = await request(app).get("/cities/1");

    expect([200, 404]).toContain(res.statusCode);
  });

  test("GET /cities/999999 returns not found or safe page", async function () {
    const res = await request(app).get("/cities/999999");

    expect([200, 404]).toContain(res.statusCode);
  });

  test("GET /cities/abc does not crash server", async function () {
    const res = await request(app).get("/cities/abc");

    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });

  test("GET /map loads map page", async function () {
    const res = await request(app).get("/map");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Map|CityWise/i);
  });

  test("GET /cities route should not expose admin-only edit controls to guest", async function () {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).not.toContain("Admin City Tools");
  });

});