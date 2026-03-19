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

    res.send(
        "<h1>" + username + "'s Profile</h1>" +
        "<p>This is a placeholder profile page.</p>" +
        "<a href='/'>Back to Home</a>"
    );
});

// login page placeholder
app.get("/login", function(req, res) {
    res.send(
        "<h1>Log In Page</h1>" +
        "<p>This is a placeholder page for now.</p>" +
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