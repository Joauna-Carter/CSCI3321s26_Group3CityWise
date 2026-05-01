// finalCityFeatures.test.js
// Final submission tests for city list, city detail page, and city-related public features

const request = require("supertest");
const app = require("../app");

describe("Final City Feature Tests", function () {

  test("MTC-08 cities page loads city list", async function () {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/City|Cities|Trivia/i);
  });

  test("MTC-09 city page for CityID 1 loads without server error", async function () {
    const res = await request(app).get("/cities/1");

    expect([200, 404]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);

    if (res.statusCode === 200) {
      expect(res.text).toMatch(/Quick Facts|Fun Facts|Test Your Knowledge|Quiz|Flashcards/i);
    }
  });

  test("MTC-09 missing city returns safe not found behavior", async function () {
    const res = await request(app).get("/cities/999999");

    expect([404]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });

  test("MTC-17 map page includes map container or no-coordinate message", async function () {
    const res = await request(app).get("/map");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/city-map|No cities with coordinates/i);
  });

});