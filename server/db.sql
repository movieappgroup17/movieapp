DROP TABLE if exists userGroup, groups, favourites, review, movie, users;


CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(25) NOT NULL UNIQUE
);

CREATE TABLE movie (
    movieID SERIAL PRIMARY KEY,
    reviewID INT,
    userID INT NOT NULL,
    stars INT,
    date DATE,
    text VARCHAR(2000),
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE review (
    reviewID SERIAL PRIMARY KEY,
    movieID INT NOT NULL,
    userID INT NOT NULL,
    stars INT,
    date DATE,
    text VARCHAR(2000),
    FOREIGN KEY (movieID) REFERENCES movie(movieID),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE favourites (
    movieID INT NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (userID, movieID),
    FOREIGN KEY (movieID) REFERENCES movie(movieID),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

CREATE TABLE groups (
    groupID SERIAL PRIMARY KEY,
    groupname VARCHAR(255) NOT NULL,
    ownerID INT NOT NULL,
    description VARCHAR(2000),
    FOREIGN KEY (ownerID) REFERENCES users(userID)
);

CREATE TABLE userGroup (
    userID INT NOT NULL,
    groupID INT NOT NULL,
    role VARCHAR(25),
    PRIMARY KEY (userID, groupID),
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (groupID) REFERENCES groups(groupID)
);