// authRoutes.test.js
// Tests authentication routes using flexible text matching (case-insensitive)

const request = require("supertest");
const app = require("../app");

describe("Authentication Routes", function () {

  test("GET /login loads login page", async function () {
    const res = await request(app).get("/login");

    expect(res.statusCode).toBe(200);

    // flexible match for "Log In", "Login", etc.
    expect(res.text).toMatch(/log\s?in/i);
  });

  test("GET /register loads register page", async function () {
    const res = await request(app).get("/register");

    expect(res.statusCode).toBe(200);

    // flexible match for "Register" OR "Create Account"
    expect(res.text).toMatch(/register|create account/i);
  });

  test("POST /login with missing username/password is rejected safely", async function () {
    const res = await request(app)
      .post("/login")
      .send({
        username: "",
        password: ""
      });

    expect([400, 401, 403]).toContain(res.statusCode);
  });

  test("POST /login with fake user is rejected safely", async function () {
    const res = await request(app)
      .post("/login")
      .send({
        username: "fakeuser",
        password: "wrongpassword"
      });

    expect([400, 401, 403]).toContain(res.statusCode);

    // flexible error message check
    expect(res.text).toMatch(/not found|incorrect|invalid|disabled/i);
  });

  test("GET /logout redirects or completes safely", async function () {
    const res = await request(app).get("/logout");

    expect([200, 302]).toContain(res.statusCode);
  });

  test("GET /profile blocks guest access", async function () {
    const res = await request(app).get("/profile");

    expect([302, 401, 403]).toContain(res.statusCode);
  });

});