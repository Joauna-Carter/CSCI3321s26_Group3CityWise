// adminMaintenance.test.js
// Tests admin protection and admin database routes without requiring real admin login

const request = require("supertest"); // Sends HTTP requests to Express app
const app = require("../app"); // Imports app without starting another server

// Accepted blocked responses for protected admin routes
const blockedStatuses = [302, 401, 403];

// Admin maintenance tests
describe("Admin Maintenance Tests", function() {

  // MTC-07
  // Guests should not access admin dashboard
  test("MTC-07 guest cannot open /admin", async function() {
    const res = await request(app).get("/admin");

    expect(blockedStatuses).toContain(res.statusCode);
  });

  // MTC-07
  // Guests should not open generic admin database editor
  test("MTC-07 guest cannot open /admin/database/cities", async function() {
    const res = await request(app).get("/admin/database/cities");

    expect(blockedStatuses).toContain(res.statusCode);
  });

  // MTC-10
  // Guests should not add rows through admin database editor
  test("MTC-10 guest cannot add city through admin route", async function() {
    const res = await request(app)
      .post("/admin/database/cities/add")
      .send({
        CityName: "Maintenance Test City",
        CountryID: 1,
        Population: 1000,
        Description: "Test city created by maintenance test.",
        Latitude: 10.0,
        Longitude: 10.0,
        CityImagePath: "https://example.com/test.jpg",
        IsActive: 1
      });

    expect(blockedStatuses).toContain(res.statusCode);
  });

  // MTC-11
  // Guests should not edit city content
  test("MTC-11 guest cannot open city content editor", async function() {
    const res = await request(app).get("/admin/cities/1/content");

    expect([302, 401, 403, 404]).toContain(res.statusCode);
  });

  // MTC-12
  // Guests should not view city revision history
  test("MTC-12 guest cannot open city revision history", async function() {
    const res = await request(app).get("/admin/cities/1/history");

    expect([302, 401, 403, 404]).toContain(res.statusCode);
  });

});