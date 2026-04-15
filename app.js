require("dotenv").config();

var express = require("express");
var path = require("path");
var session = require("express-session");

var authRoutes = require("./routes/authRoutes");
var cityRoutes = require("./routes/cityRoutes");
var statsRoutes = require("./routes/statsRoutes");
var adminRoutes = require("./routes/adminRoutes");
var studyRoutes = require("./routes/studyRoutes");

console.log("authRoutes:", typeof authRoutes);
console.log("cityRoutes:", typeof cityRoutes);
console.log("statsRoutes:", typeof statsRoutes);
console.log("adminRoutes:", typeof adminRoutes);
console.log("studyRoutes:", typeof studyRoutes);

var app = express();
var PORT = process.env.PORT || 3000;

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: process.env.SESSION_SECRET || "citywise_secret_key",
    resave: false,
    saveUninitialized: false
}));

// helper to put session user data into all views
app.use(function(req, res, next) {
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.username = req.session.user ? req.session.user.username : "";
    res.locals.isAdmin = req.session.user ? req.session.user.isAdmin : false;
    next();
});

// routes
app.use("/", authRoutes);
app.use("/", cityRoutes);
app.use("/", statsRoutes);
app.use("/", adminRoutes);
app.use("/", studyRoutes);

// start server
app.listen(PORT, function() {
    console.log("Server running at http://localhost:" + PORT);
});