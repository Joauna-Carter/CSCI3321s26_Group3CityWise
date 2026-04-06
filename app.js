require("dotenv").config();

var express = require("express");
var path = require("path");
var mysql = require("mysql2");

var app = express();
var PORT = process.env.PORT || 3000;

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// let express read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static files
app.use(express.static(path.join(__dirname, "public")));

// mysql connection
var db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "citywise",
    port: process.env.DB_PORT || 3306
});

// connect to mysql
db.connect(function(err) {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }

    console.log("Connected to MySQL");
});

// fake login state for testing
var isLoggedIn = false;
var username = "";

// home page route
app.get("/", function(req, res) {
    var query = `
        SELECT Cities.CityName, Countries.CountryName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        ORDER BY Cities.CityName
    `;

    db.query(query, function(err, results) {
        if (err) {
            console.error("Home page city query failed:", err);

            res.render("home", {
                isLoggedIn: isLoggedIn,
                username: username,
                cities: []
            });

            return;
        }

        var cities = results.map(function(row) {
            return row.CityName + ", " + row.CountryName;
        });

        res.render("home", {
            isLoggedIn: isLoggedIn,
            username: username,
            cities: cities
        });
    });
});

// test database route
app.get("/test-db", function(req, res) {
    var query = `
        SELECT Cities.CityID, Cities.CityName, Countries.CountryName, Regions.RegionName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        JOIN Regions ON Countries.RegionID = Regions.RegionID
        ORDER BY Cities.CityID
    `;

    db.query(query, function(err, results) {
        if (err) {
            console.error("Test DB query failed:", err);
            res.status(500).send("Database query failed.");
            return;
        }

        res.json(results);
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

    if (!newUsername || !newPassword || newUsername.trim() === "" || newPassword.trim() === "") {
        res.send("Username and password cannot be empty. <a href='/register'>Go back</a>");
        return;
    }

    // fake account creation for now
    username = newUsername.trim();
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
    if (!inputUsername || !inputPassword || inputUsername.trim() === "" || inputPassword.trim() === "") {
        res.send("Please enter username and password. <a href='/login'>Go back</a>");
        return;
    }

    // fake login for now
    if (inputUsername.trim() === username) {
        isLoggedIn = true;
        res.redirect("/");
    } else {
        res.send("User not found. <a href='/login'>Try again</a>");
    }
});

// cities page
app.get("/cities", function(req, res) {
    var query = `
        SELECT Cities.CityID, Cities.CityName, Countries.CountryName, Regions.RegionName
        FROM Cities
        JOIN Countries ON Cities.CountryID = Countries.CountryID
        JOIN Regions ON Countries.RegionID = Regions.RegionID
        ORDER BY Cities.CityName
    `;

    db.query(query, function(err, results) {
        if (err) {
            console.error("Cities query failed:", err);
            res.send("Could not load cities. <a href='/'>Back to Home</a>");
            return;
        }

        var html = "<h1>City Index Page</h1>";
        html += "<p>This page will show all cities in the game.</p>";
        html += "<ul>";

        results.forEach(function(row) {
            html += "<li>" + row.CityName + ", " + row.CountryName + " (" + row.RegionName + ")</li>";
        });

        html += "</ul>";
        html += "<a href='/'>Back to Home</a>";

        res.send(html);
    });
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