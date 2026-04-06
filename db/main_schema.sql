DROP DATABASE IF EXISTS citywise;
CREATE DATABASE citywise;
USE citywise;

CREATE TABLE Regions (
    RegionID INT AUTO_INCREMENT PRIMARY KEY,
    RegionCode VARCHAR(10) NOT NULL UNIQUE,
    RegionName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Countries (
    CountryID INT AUTO_INCREMENT PRIMARY KEY,
    CountryName VARCHAR(100) NOT NULL UNIQUE,
    RegionID INT NOT NULL,
    FlagImagePath VARCHAR(255) NULL,
    CONSTRAINT fk_countries_region
        FOREIGN KEY (RegionID) REFERENCES Regions(RegionID)
);

CREATE TABLE Cities (
    CityID INT AUTO_INCREMENT PRIMARY KEY,
    CityName VARCHAR(100) NOT NULL,
    CountryID INT NOT NULL,
    Population BIGINT NULL,
    Description TEXT NULL,
    Latitude DECIMAL(9,6) NULL,
    Longitude DECIMAL(9,6) NULL,
    ImagePath VARCHAR(255) NULL,
    CONSTRAINT fk_cities_country
        FOREIGN KEY (CountryID) REFERENCES Countries(CountryID),
    CONSTRAINT uq_city_country UNIQUE (CityName, CountryID)
);

CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    UserType VARCHAR(20) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_users_usertype
        CHECK (UserType IN ('user', 'admin'))
);

CREATE TABLE UserProfiles (
    ProfileID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    DisplayName VARCHAR(100) NOT NULL,
    Bio TEXT NULL,
    ProfileImagePath VARCHAR(255) NULL,
    FavoriteRegionID INT NULL,
    FavoriteCityID INT NULL,
    CONSTRAINT fk_profiles_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT fk_profiles_region
        FOREIGN KEY (FavoriteRegionID) REFERENCES Regions(RegionID),
    CONSTRAINT fk_profiles_city
        FOREIGN KEY (FavoriteCityID) REFERENCES Cities(CityID)
);

CREATE TABLE CityFacts (
    FactID INT AUTO_INCREMENT PRIMARY KEY,
    CityID INT NOT NULL,
    FactType VARCHAR(50) NOT NULL,
    FactSubtype VARCHAR(50) NOT NULL,
    FactLabel VARCHAR(100) NOT NULL,
    FactValue TEXT NOT NULL,
    AltAnswers TEXT NULL,
    CONSTRAINT fk_cityfacts_city
        FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE QuestionTemplates (
    TemplateID INT AUTO_INCREMENT PRIMARY KEY,
    QuestionType VARCHAR(10) NOT NULL,
    TemplateText TEXT NOT NULL,
    AnswerSource VARCHAR(50) NOT NULL,
    RequiredFactType VARCHAR(50) NULL,
    RequiredFactSubtype VARCHAR(50) NULL,
    ImageType VARCHAR(50) NULL,
    CONSTRAINT chk_templates_qtype
        CHECK (QuestionType IN ('MC', 'TF', 'FB'))
);

CREATE TABLE QuizAttempts (
    QuizAttemptID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Mode VARCHAR(50) NOT NULL,
    Timed BOOLEAN NOT NULL DEFAULT FALSE,
    Difficulty VARCHAR(20) NOT NULL,
    Score INT NOT NULL,
    PlayedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    SelectedRegionID INT NULL,
    RequestedCityCount INT NULL,
    SelectedCityID INT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'completed',
    CONSTRAINT fk_quizattempts_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT fk_quizattempts_region
        FOREIGN KEY (SelectedRegionID) REFERENCES Regions(RegionID),
    CONSTRAINT fk_quizattempts_city
        FOREIGN KEY (SelectedCityID) REFERENCES Cities(CityID),
    CONSTRAINT chk_quizattempts_difficulty
        CHECK (Difficulty IN ('easy', 'medium', 'hard')),
    CONSTRAINT chk_quizattempts_status
        CHECK (Status IN ('completed', 'abandoned', 'in_progress'))
);

CREATE TABLE QuizAttemptCities (
    QuizAttemptID INT NOT NULL,
    CityID INT NOT NULL,
    PRIMARY KEY (QuizAttemptID, CityID),
    CONSTRAINT fk_quizattemptcities_attempt
        FOREIGN KEY (QuizAttemptID) REFERENCES QuizAttempts(QuizAttemptID),
    CONSTRAINT fk_quizattemptcities_city
        FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE QuizAttemptQuestions (
    QuizAttemptQuestionID INT AUTO_INCREMENT PRIMARY KEY,
    QuizAttemptID INT NOT NULL,
    TemplateID INT NOT NULL,
    CityID INT NOT NULL,
    QuestionText TEXT NOT NULL,
    CorrectAnswer TEXT NOT NULL,
    UserAnswer TEXT NULL,
    IsCorrect BOOLEAN NOT NULL,
    CONSTRAINT fk_quizattemptquestions_attempt
        FOREIGN KEY (QuizAttemptID) REFERENCES QuizAttempts(QuizAttemptID),
    CONSTRAINT fk_quizattemptquestions_template
        FOREIGN KEY (TemplateID) REFERENCES QuestionTemplates(TemplateID),
    CONSTRAINT fk_quizattemptquestions_city
        FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE FlashcardSessions (
    FlashcardSessionID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Mode VARCHAR(50) NOT NULL,
    DateUsed DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    SelectedRegionID INT NULL,
    RequestedCityCount INT NULL,
    SelectedCityID INT NULL,
    CONSTRAINT fk_flashcardsessions_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT fk_flashcardsessions_region
        FOREIGN KEY (SelectedRegionID) REFERENCES Regions(RegionID),
    CONSTRAINT fk_flashcardsessions_city
        FOREIGN KEY (SelectedCityID) REFERENCES Cities(CityID)
);

CREATE TABLE FlashcardSessionCities (
    FlashcardSessionID INT NOT NULL,
    CityID INT NOT NULL,
    PRIMARY KEY (FlashcardSessionID, CityID),
    CONSTRAINT fk_flashcardsessioncities_session
        FOREIGN KEY (FlashcardSessionID) REFERENCES FlashcardSessions(FlashcardSessionID),
    CONSTRAINT fk_flashcardsessioncities_city
        FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE FlashcardSessionCards (
    FlashcardCardID INT AUTO_INCREMENT PRIMARY KEY,
    FlashcardSessionID INT NOT NULL,
    CityID INT NOT NULL,
    FactID INT NULL,
    FrontText TEXT NOT NULL,
    BackText TEXT NOT NULL,
    OrderShown INT NOT NULL,
    CONSTRAINT fk_flashcardcards_session
        FOREIGN KEY (FlashcardSessionID) REFERENCES FlashcardSessions(FlashcardSessionID),
    CONSTRAINT fk_flashcardcards_city
        FOREIGN KEY (CityID) REFERENCES Cities(CityID),
    CONSTRAINT fk_flashcardcards_fact
        FOREIGN KEY (FactID) REFERENCES CityFacts(FactID)
);

CREATE TABLE Leaderboard (
    LeaderboardID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    TotalQuizPoints INT NOT NULL DEFAULT 0,
    QuizzesCompleted INT NOT NULL DEFAULT 0,
    AverageScore DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    BestScore INT NOT NULL DEFAULT 0,
    LastUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leaderboard_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE UserStatistics (
    UserStatsID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    LastQuizAttemptedAt DATETIME NULL,
    QuizzesCompleted INT NOT NULL DEFAULT 0,
    AverageScore DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    MostDoneQuizMode VARCHAR(50) NULL,
    BestScore INT NOT NULL DEFAULT 0,
    TotalQuizPoints INT NOT NULL DEFAULT 0,
    FlashcardSessionsUsed INT NOT NULL DEFAULT 0,
    LastUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_userstatistics_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE WebsiteStatistics (
    WebsiteStatsID INT AUTO_INCREMENT PRIMARY KEY,
    TotalUsers INT NOT NULL DEFAULT 0,
    TotalAdmins INT NOT NULL DEFAULT 0,
    TotalRegularUsers INT NOT NULL DEFAULT 0,
    TotalQuizzesCompleted INT NOT NULL DEFAULT 0,
    AverageQuizScore DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    HighestQuizScore INT NOT NULL DEFAULT 0,
    MostPopularQuizMode VARCHAR(50) NULL,
    TotalFlashcardSessions INT NOT NULL DEFAULT 0,
    LastUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);