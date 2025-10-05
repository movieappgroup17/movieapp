DROP TABLE if exists joinRequest, userGroup, groups, favourites, favourite_list, review, movie, users;


CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(25) NOT NULL UNIQUE,
    refresh_token VARCHAR(512)
);

CREATE TABLE movie (
    movieID INT PRIMARY KEY,
    date DATE,
    text VARCHAR(2000),
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    imageURL VARCHAR(255) 
);

CREATE TABLE favourite_list (
    listID SERIAL PRIMARY KEY,
    userID INT UNIQUE REFERENCES users(userID) ON DELETE CASCADE,
    share_token UUID DEFAULT gen_random_uuid() UNIQUE,
    isPublic BOOLEAN DEFAULT false
);

CREATE TABLE favourites (
    listID INT REFERENCES favourite_list(listID) ON DELETE CASCADE,
    movieID INT REFERENCES movie(movieID) ON DELETE CASCADE,
    PRIMARY KEY (listID, movieID)
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
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (groupID) REFERENCES groups(groupID) ON DELETE CASCADE
);

CREATE TABLE joinRequest (
    requestID SERIAL PRIMARY KEY,
    groupID INT NOT NULL,
    userID INT NOT NULL,
    status VARCHAR(10),
    createdAt DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (groupID) REFERENCES groups(groupID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);
