
CREATE TABLE "User" (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(25) NOT NULL
);

CREATE TABLE Movie (
    movieID SERIAL PRIMARY KEY,
    reviewID INT,
    userID INT NOT NULL,
    stars INT,
    date DATE,
    text VARCHAR(2000),
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Review (
    reviewID SERIAL PRIMARY KEY,
    movieID INT NOT NULL,
    userID INT NOT NULL,
    stars INT,
    date DATE,
    text VARCHAR(2000),
    FOREIGN KEY (movieID) REFERENCES Movie(movieID),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Favourites (
    movieID INT NOT NULL,
    userID INT NOT NULL,
    PRIMARY KEY (userID, movieID),
    FOREIGN KEY (movieID) REFERENCES Movie(movieID),
    FOREIGN KEY (userID) REFERENCES "User"(userID)
);

CREATE TABLE Groups (
    groupID SERIAL PRIMARY KEY,
    groupname VARCHAR(255) NOT NULL,
    ownerID INT NOT NULL,
    description VARCHAR(2000),
    FOREIGN KEY (ownerID) REFERENCES "User"(userID)
);

CREATE TABLE UserGroup (
    userID INT NOT NULL,
    groupID INT NOT NULL,
    role VARCHAR(25),
    PRIMARY KEY (userID, groupID),
    FOREIGN KEY (userID) REFERENCES "User"(userID),
    FOREIGN KEY (groupID) REFERENCES Groups(groupID)
);