// adminProtection.test.js
// Tests that admin-only routes block guests from dashboard, table viewing, adding, updating, hiding, unhiding, and row viewing

const request = require("supertest"); // lets tests make HTTP requests to Express app
const app = require("../app"); // imports Express app without starting a second server

// Valid guest-block responses depend on middleware behavior
const blockedStatuses = [302, 404, 401, 403];

// Reusable assertion for protected routes
function expectBlocked(res) {
  expect(blockedStatuses).toContain(res.statusCode);
}

// Admin route protection tests
describe("Admin Protection Routes", function () {

  // Guest should not access main admin dashboard
  test("GET /admin blocks guest access", async function () {
    const res = await request(app).get("/admin");

    expectBlocked(res);
  });

  // Guest should not view Cities admin table
  test("GET /admin/database/cities blocks guest access", async function () {
    const res = await request(app).get("/admin/database/cities");

    expectBlocked(res);
  });

  // Guest should not view Users admin table
  test("GET /admin/database/users blocks guest access", async function () {
    const res = await request(app).get("/admin/database/users");

    expectBlocked(res);
  });

  // Guest should not view read-only system/stat table
  test("GET /admin/database/leaderboard blocks guest access", async function () {
    const res = await request(app).get("/admin/database/leaderboard");

    expectBlocked(res);
  });

  // Guest should not view a specific row through admin viewer
  test("GET /admin/database/cities/view blocks guest access", async function () {
    const key = encodeURIComponent(JSON.stringify({ CityID: 1 }));

    const res = await request(app).get("/admin/database/cities/view?key=" + key);

    expectBlocked(res);
  });

  // Guest should not add a city row
  test("POST /admin/database/cities/add blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/cities/add")
      .send({
        CityName: "Test City",
        CountryID: 1,
        Population: 100000,
        Description: "Test description",
        Latitude: 10.0,
        Longitude: 10.0,
        CityImagePath: "https://example.com/test.jpg",
        IsActive: 1
      });

    expectBlocked(res);
  });

  // Guest should not add a region row
  test("POST /admin/database/regions/add blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/regions/add")
      .send({
        RegionCode: "TT",
        RegionName: "Test Region",
        IsActive: 1
      });

    expectBlocked(res);
  });

  // Guest should not update a city row
  test("POST /admin/database/cities/update blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/cities/update")
      .send({
        __key_CityID: 1,
        CityName: "Updated Test City",
        CountryID: 1,
        IsActive: 1
      });

    expectBlocked(res);
  });

  // Guest should not update user role or soft-delete status
  test("POST /admin/database/users/update blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/users/update")
      .send({
        __key_UserID: 1,
        UserType: "admin",
        IsDeleted: 0,
        IsActive: 1
      });

    expectBlocked(res);
  });

  // Guest should not hide a city row
  test("POST /admin/database/cities/hide blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/cities/hide")
      .send({
        __key_CityID: 1
      });

    expectBlocked(res);
  });

  // Guest should not unhide a city row
  test("POST /admin/database/cities/unhide blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/database/cities/unhide")
      .send({
        __key_CityID: 1
      });

    expectBlocked(res);
  });

  // Guest should not use old city hide route
  test("POST /admin/cities/:id/hide blocks guest access", async function () {
    const res = await request(app).post("/admin/cities/1/hide");

    expectBlocked(res);
  });

  // Guest should not use old city unhide route
  test("POST /admin/cities/:id/unhide blocks guest access", async function () {
    const res = await request(app).post("/admin/cities/1/unhide");

    expectBlocked(res);
  });

  // Guest should not access city content editor
  test("GET /admin/cities/:id/content blocks guest access", async function () {
    const res = await request(app).get("/admin/cities/1/content");

    expectBlocked(res);
  });

  // Guest should not save city page content
  test("POST /admin/cities/:id/content blocks guest access", async function () {
    const res = await request(app)
      .post("/admin/cities/1/content")
      .send({
        pageContent: "<h1>Updated Content</h1>",
        editSummary: "Test edit"
      });

    expectBlocked(res);
  });

  // Guest should not reset city page content
  test("POST /admin/cities/:id/content/reset blocks guest access", async function () {
    const res = await request(app).post("/admin/cities/1/content/reset");

    expectBlocked(res);
  });

  // Guest should not view city edit history
  test("GET /admin/cities/:id/history blocks guest access", async function () {
    const res = await request(app).get("/admin/cities/1/history");

    expectBlocked(res);
  });

});