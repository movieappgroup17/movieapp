import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import jwt from 'jsonwebtoken'
import { hash } from 'bcrypt'
import { fileURLToPath } from 'url';

// setup for reading .sql file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// function to initialize database
const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../db.sql'), 'utf8')

    pool.query(sql, (err) => {
        if (err) {
            console.error('Error initializing test database:', err)
        }
        else {
            console.log('Test database initialized succesfully')
        }
    })
}

// function to insert test user to database
const insertTestUser = (user) => {
    hash(user.password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password: ', err)
            return
        }
        pool.query('INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3)',
            [user.email, hashedPassword, user.nickname],
            (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err)
                } else {
                    console.log('Test user inserted successfully:', user.nickname)
                }
            }
        )
    })
}

// function to add test review

const addTestReview = async (review) => {
    try {
        const result = await pool.query(`INSERT INTO review (movieid, userid, stars, date, text)
            VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
            [review.movieID, review.userID, review.stars, review.text])
        console.log("Review added successfully")
        return result
    } catch (error) {
        console.error("Error inserting review:", error)
    }
}

// function to add test movie

const addTestMovie = async (movie) => {
    try {
        const result = await pool.query(`INSERT INTO movie (movieID, title, date, text, imageURL)
        VALUES ($1, $2, $3, $4, $5)`,
        [movie.movieID, movie.title, movie.date, movie.text, movie.imageURL])
        console.log("Movie added successfully")
        return result
    } catch (error) {
        console.log("Error adding movie: ", error)
    }
}

// function to get token
const getToken = (email) => {
    return jwt.sign({ user: user.email }, process.env.JWT_SECRET_KEY)
}

export { initializeTestDb, insertTestUser, getToken, addTestReview, addTestMovie }