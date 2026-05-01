# CityWise

CityWise is a web-based application that helps users learn about cities through interactive quizzes, flashcards, and structured city information pages. The system combines learning and testing into one place so users do not need separate tools.

## Features

User account system including register, login, and profile. City browsing with detailed city pages. Quiz system with multiple question types. Flashcard study mode. Leaderboard and statistics tracking. Admin dashboard for managing content and data. Interactive map with clickable city markers.

## Tech Stack

Backend: Node.js and Express. Frontend: EJS templates. Database: MySQL. Authentication: bcrypt and express-session. Testing: Jest and Supertest.

## Getting Started

1. Fork the repository on GitHub and clone your fork using git clone [https://github.com/YOUR-USERNAME/REPOSITORY-NAME.git](https://github.com/YOUR-USERNAME/REPOSITORY-NAME.git) then move into the folder with cd REPOSITORY-NAME.
2. Install dependencies using npm install. If testing tools are missing install them using npm install --save-dev jest supertest.
3. Create a .env file in the root directory with the following values: DB_HOST=localhost, DB_USER=root, DB_PASSWORD=your_password, DB_NAME=citywise, DB_PORT=3306, SESSION_SECRET=citywise_secret_key, PORT=3000.
4. Create a .gitignore file if it does not exist and include: node_modules/, .env, .env.local, *.log, coverage/.
5. Set up MySQL and create the database by running CREATE DATABASE citywise; in MySQL.
6. Import the database backup using mysql -u root -p citywise < citywise_backup.sql or use MySQL Workbench through Server → Data Import and select the file.
7. Run the application using node app.js and open [http://localhost:3000](http://localhost:3000) in a browser.

## Running Tests

Run tests using npm test. For more detailed output use npm test -- --verbose.

## Admin Access

Use the test admin account with Username: testadmin and Password: admin123. To manually make a user an admin run UPDATE Users SET UserType = 'admin' WHERE Username = 'your_username';

## Project Structure

Main files include app.js, routes, middleware, utils, db, views, and public.

## Maintenance Handbook

Detailed documentation for developers and administrators is available here: [https://docs.google.com/document/d/1b4dtzIBhxDSbO6JE0oTsSZhnEMszcjI_nJ6sgjaCliU/edit?usp=sharing]

## Known Issues

Admin routes for city history and content may not work in all cases. No password recovery system is implemented. Image upload functionality is not implemented even though the database table exists. Some UI error messages are basic. The application runs locally and is not hosted.

## Future Improvements

Fix admin routing issues. Improve UI and error feedback. Add password reset feature. Implement image uploads. Deploy the application and database.

## Disclaimer

This project is actively being updated and documentation may change. Check the latest version regularly.

## Authors

CityWise Development Team (Joauna Carter, Aidan, Joss)


