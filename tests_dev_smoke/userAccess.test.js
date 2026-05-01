// userAccess.test.js
// Tests user login protection and guest restrictions

const request = require("supertest"); // Sends HTTP requests to Express app
const app = require("../app"); // Imports app without starting server

// Status codes that mean a protected page blocked access
const blockedStatuses = [302, 401, 403];

// User access control tests
describe("User Access Control Maintenance Tests", function() {

  // MTC-06
  // Guests should not access profile page
  test("MTC-06 guest cannot open /profile", async function() {
    const res = await request(app).get("/profile");

    expect(blockedStatuses).toContain(res.statusCode);
  });

  // MTC-05
  // Logout should safely redirect or finish
  test("MTC-05 logout route completes safely", async function() {
    const res = await request(app).get("/logout");

    expect([200, 302]).toContain(res.statusCode);
  });

});