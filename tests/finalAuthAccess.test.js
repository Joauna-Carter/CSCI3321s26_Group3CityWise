// finalAuthAccess.test.js
// Final submission tests for authentication and access control

const request = require("supertest");
const app = require("../app");

describe("Final Authentication and Access Tests", function () {

  test("MTC-05 login page loads", async function () {
    const res = await request(app).get("/login");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/log\s?in/i);
  });

  test("MTC-05 register page loads", async function () {
    const res = await request(app).get("/register");

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/create account|register/i);
  });

  test("MTC-05 fake login is rejected without server error", async function () {
    const res = await request(app)
      .post("/login")
      .send({
        username: "fakeuser_final_test",
        password: "wrongpassword"
      });

    expect([400, 401, 403]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });

  test("MTC-06 guest cannot access profile", async function () {
    const res = await request(app).get("/profile");

    expect([302, 401, 403]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });

  test("MTC-07 guest cannot access admin dashboard", async function () {
    const res = await request(app).get("/admin");

    expect([302, 401, 403]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });

  test("MTC-07 guest cannot access admin table editor", async function () {
    const res = await request(app).get("/admin/database/cities");

    expect([302, 401, 403]).toContain(res.statusCode);
    expect(res.statusCode).not.toBe(500);
  });

});