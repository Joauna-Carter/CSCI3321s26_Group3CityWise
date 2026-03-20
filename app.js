var express = require("express");
var path = require("path");

var app = express();
var PORT = 3000;

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// let express read form data
app.use(express.urlencoded({ extended: true }));

// static files
app.use(express.static(path.join(__dirname, "public")));

// fake login state for testing
var isLoggedIn = false;
var username = "";

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

// show create account page
app.get("/register", function(req, res) {
    res.render("register");
});

// handle create account form
app.post("/register", function(req, res) {
    var newUsername = req.body.username;
    var newPassword = req.body.password;

    if (newUsername == "" || newPassword == "") {
        res.send("Username and password cannot be empty. <a href='/register'>Go back</a>");
        return;
    }

    // fake account creation
    username = newUsername;
    isLoggedIn = true;

    res.redirect("/");
});

// profile page
app.get("/profile", function(req, res) {

    if (!isLoggedIn) {
        res.redirect("/");
        return;
    }

    res.render("profile", {
        username: username
    });

});

// show login page
app.get("/login", function(req, res) {
    res.render("login");
});

// handle login form
app.post("/login", function(req, res) {

    var inputUsername = req.body.username;
    var inputPassword = req.body.password;

    // check if empty
    if (inputUsername == "" || inputPassword == "") {
        res.send("Please enter username and password. <a href='/login'>Go back</a>");
        return;
    }

    // since we don't have a database yet,
    // we compare with the stored variable
    if (inputUsername == username) {

        isLoggedIn = true;

        res.redirect("/");
    } else {

        res.send("User not found. <a href='/login'>Try again</a>");
    }

});

// cities page placeholder
app.get("/cities", function(req, res) {
    res.send(
        "<h1>City Index Page</h1>" +
        "<p>This page will show all cities in the game.</p>" +
        "<a href='/'>Back to Home</a>"
    );
});

// trivia quiz page placeholder
app.get("/quiz", function(req, res) {
    res.send(
        "<h1>Trivia Quiz Page</h1>" +
        "<p>This page will let users answer city trivia questions.</p>" +
        "<a href='/'>Back to Home</a>"
    );
});

// leaderboard page placeholder
app.get("/leaderboard", function(req, res) {
    res.send(
        "<h1>Leaderboard Page</h1>" +
        "<p>This page will show user rankings based on scores.</p>" +
        "<a href='/'>Back to Home</a>"
    );
});

// statistics page placeholder
app.get("/statistics", function(req, res) {
    res.send(
        "<h1>Statistics Page</h1>" +
        "<p>This page will show user and site statistics.</p>" +
        "<a href='/'>Back to Home</a>"
    );
});

// logout route
app.get("/logout", function(req, res) {
    isLoggedIn = false;
    username = "";
    res.redirect("/");
});

// start server
app.listen(PORT, function() {
    console.log("Server running at http://localhost:" + PORT);
});

