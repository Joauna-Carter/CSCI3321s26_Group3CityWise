// navigationMaintenance.test.js
// Tests all main navbar routes load successfully

const request = require("supertest");
const app = require("../app");

// Navigation routes to test
const routes = [
  "/",
  "/cities",
  "/study",
  "/map",
  "/leaderboard",
  "/statistics"
];

// Navigation tests
describe("Navigation Maintenance Tests", function () {

  // MTC-04
  // Loop through all navbar routes
  routes.forEach(function (route) {

    test(`MTC-04 route ${route} loads`, async function () {
      const res = await request(app).get(route);

      expect(res.statusCode).toBe(200);
    });

  });

});