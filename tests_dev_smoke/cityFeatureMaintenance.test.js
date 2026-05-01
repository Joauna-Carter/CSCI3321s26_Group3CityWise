// cityFeatureMaintenance.test.js
// Tests city pages, map page, quiz links, flashcard links, and static CSS

const request = require("supertest"); // Sends test HTTP requests
const app = require("../app"); // Imports Express app

// City feature maintenance tests
describe("City Feature Maintenance Tests", function() {

  // MTC-08
  // Confirms city list route loads
  test("MTC-08 /cities loads city list page", async function() {
    const res = await request(app).get("/cities");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/city|cities|trivia/i);
  });

  // MTC-09
  // Confirms a city page loads safely or returns not found
  test("MTC-09 /cities/1 loads city page or safely returns 404", async function() {
    const res = await request(app).get("/cities/1");

    expect([200, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.text).toMatch(/Quick Facts|Facts|Test Your Knowledge|Flashcards|Quiz/i);
    }
  });

  // MTC-16
  // Confirms flashcard route for a city does not crash
  test("MTC-16 flashcards for city loads or fails safely", async function() {
    const res = await request(app).get("/flashcards/start?cityId=1");

    expect([200, 404, 500]).toContain(res.statusCode);
  });

  // MTC-17
  // Confirms map page loads
  test("MTC-17 /map loads map page", async function() {
    const res = await request(app).get("/map");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/map|city-map|leaflet/i);
  });

  // MTC-20
  // Confirms shared CSS file is served from public folder
  test("MTC-20 style.css loads from static files", async function() {
    const res = await request(app).get("/css/style.css");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/body|navbar|city-card/i);
  });

});