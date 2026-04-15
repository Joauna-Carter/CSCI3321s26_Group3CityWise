// utils/pageHelpers.js

// helper to escape html for simple HTML pages
function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// helper to build nav for simple HTML pages
function buildNav(req) {
    var html = "";
    html += "<header class='navbar'>";
    html += "<div class='nav-left'><a href='/' class='logo'>CityWise</a></div>";
    html += "<div class='nav-center'>";
    html += "<a href='/' class='nav-tab'>Home</a>";
    html += "<a href='/cities' class='nav-tab'>City Trivia</a>";
    html += "<a href='/study' class='nav-tab'>Study &amp; Quiz</a>";
    html += "<a href='/map' class='nav-tab'>Map</a>";
    html += "<a href='/leaderboard' class='nav-tab'>Leaderboard</a>";
    html += "<a href='/statistics' class='nav-tab'>Statistics</a>";

    if (req.session.user && req.session.user.isAdmin) {
        html += "<a href='/admin' class='nav-tab'>Admin</a>";
    }

    html += "</div>";
    html += "<div class='nav-right'>";

    if (!req.session.user) {
        html += "<a href='/register'>Create Account</a>";
        html += "<span class='divider'>|</span>";
        html += "<a href='/login'>Log In</a>";
    } else {
        html += "<a href='/profile'>" + escapeHtml(req.session.user.username) + "</a>";
        html += "<span class='divider'>|</span>";
        html += "<a href='/logout'>Log Out</a>";
    }

    html += "</div>";
    html += "</header>";
    return html;
}

// helper to render simple HTML pages
function renderPage(req, title, content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        ${buildNav(req)}
        <main class="home-container">
            ${content}
        </main>
    </body>
    </html>
    `;
}

module.exports = {
    escapeHtml,
    buildNav,
    renderPage
};