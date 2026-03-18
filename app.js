var express = require("express");
var path = require("path");

var app = express();
var PORT = 3000;

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// fake login state for testing
var isLoggedIn = false;
var username = "Traveler123";

// list of cities
var cities = [
    "Mexico City, Mexico",
    "Los Angeles, USA",
    "Paris, France",
    "Rome, Italy",
    "Cape Town, South Africa",
    "Melbourne, Australia",
    "Seoul, South Korea",
    "Rio de Janeiro, Brazil",
    "Buenos Aires, Argentina",
    "Cairo, Egypt"
];

// home page route
app.get("/", function(req, res) {

    res.render("home", {
        isLoggedIn: isLoggedIn,
        username: username,
        cities: cities
    });

});

// profile page
app.get("/profile", function(req, res) {

    if (!isLoggedIn) {
        res.redirect("/");
        return;
    }

    res.send(
        "<h1>" + username + "'s Profile</h1>" +
        "<p>This is a placeholder profile page.</p>" +
        "<a href='/'>Back to Home</a>"
    );

});

// create account page
app.get("/register", function(req, res) {

    res.send(
        "<h1>Create Account Page</h1>" +
        "<p>This is a placeholder page.</p>" +
        "<a href='/'>Back to Home</a>"
    );

});

// login page
app.get("/login", function(req, res) {

    res.send(
        "<h1>Log In Page</h1>" +
        "<p>This is a placeholder page.</p>" +
        "<a href='/'>Back to Home</a>"
    );

});

// logout route
app.get("/logout", function(req, res) {

    res.redirect("/");

});

// start server
app.listen(PORT, function() {

    console.log("Server running at http://localhost:" + PORT);

});