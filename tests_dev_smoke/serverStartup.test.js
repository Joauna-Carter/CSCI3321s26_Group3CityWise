// serverStartup.test.js
// Tests that the Express app loads correctly without starting a second server

const app = require("../app");

// Server startup maintenance tests
describe("Server Startup Maintenance Tests", function () {

  // MTC-01
  // App import should not crash
  test("MTC-01 app loads without crashing", function () {
    expect(app).toBeDefined();
  });

  // MTC-01
  // Express app should expose HTTP route methods
  test("MTC-01 app has Express route methods", function () {
    expect(typeof app.get).toBe("function");
    expect(typeof app.post).toBe("function");
    expect(typeof app.use).toBe("function");
  });

});