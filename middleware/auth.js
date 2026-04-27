// middleware/auth.js

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    next();
}

function requireAdmin(req, res, next) {
    var isAdmin =
        req.session.user &&
        (
            req.session.user.userType === "admin" ||
            req.session.user.UserType === "admin" ||
            req.session.user.isAdmin === true ||
            req.session.isAdmin === true
        );

    if (!isAdmin) {
        return res.status(403).send("Access denied.");
    }

    next();
}

module.exports = {
    requireLogin,
    requireAdmin
};