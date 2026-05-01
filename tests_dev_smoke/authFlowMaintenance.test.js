// authFlowMaintenance.test.js
// Tests register + login basic flow (safe version without DB assumptions)

const request = require("supertest");
const app = require("../app");

// Unique username to avoid duplicate errors
const testUser = {
  username: "testuser_" + Date.now(),
  password: "testpass123"
};

// Auth flow tests
describe("Authentication Flow Maintenance Tests", function () {

  // MTC-05
  // Register should not crash and should redirect or succeed
  test("MTC-05 register new user safely", async function () {
    const res = await request(app)
      .post("/register")
      .send(testUser);

    expect([200, 302]).toContain(res.statusCode);
  });

  // MTC-05
  // Login attempt should not crash even if credentials fail
  test("MTC-05 login attempt does not crash", async function () {
    const res = await request(app)
      .post("/login")
      .send(testUser);

    expect([200, 302, 400]).toContain(res.statusCode);
  });

});