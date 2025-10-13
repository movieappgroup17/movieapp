import {pool} from "../helper/db.js"
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt

// for signing up a new user
export function signup (req, res, next) {
    const { user } = req.body

    if (!user || !user.email || !user.password) {
        const error = new Error('Email and password are required')
        return next(error)
    }

    // password check
    /* Must contain:
        - minimum 8 characters
        - a lowercase letter
        - a uppercase letter
        - a number
    */
    if (user.password.length < 8 || user.password.search(/[a-z]/) < 0 || user.password.search(/[A-Z]/) < 0 || user.password.search(/[0-9]/) < 0) {
        return res.status(400).json({ error: 'Failed to fill password requirements'})
    }

    // password is hashed before stored in database
    hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err)
        
        pool.query('INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING *',
        [user.email, hashedPassword, user.nickname],
        (err, result) => {
            if(err) {
                // checking if email or nickname are already stored in database
                if(err.code === '23505') {
                    console.log(err.constraint)
                    // checking if email is already registered
                    if(err.constraint === 'users_email_key') {
                        return res.status(409).json({ error: 'Email already registered' })
                    }
                    // checking if nickname is already taken
                    if(err.constraint === 'users_nickname_key') {
                        return res.status(409).json({ error: 'Nickname already taken' })
                    } else {
                        return res.status(409).json({ error: 'Duplicate value not allowed' })
                    }
                }
                return next(err)
            }
            console.log(result.rows[0])

            res.status(201).json({ userid: result.rows[0].userid, email: user.email, nickname: user.nickname})   // TSEKKAA TÄÄ
        }
    )
    })
}

// for signing in existing user
export function signin (req, res, next) {
    const { user } = req.body
    if(!user || !user.email || !user.password) {
        const error = new Error('Email and password are required')
        error.status = 400
        return next(error)
    }
    pool.query('SELECT * FROM users WHERE email = $1', [user.email], (err, result) => {
        if (err) return next(err)
        if (result.rows.length === 0){
            const error = new Error('User not found')
            error.status = 404
            return next(error)
        }

        const dbUser = result.rows[0]

        // compares if the password matches one stored in database
        compare(user.password, dbUser.password, (err, isMatch) => {
            if (err) return next(err)
            if (!isMatch){
                const error = new Error ('Invalid password')
                error.status = 401
                return next(error)
            }

            // create token for the user
            const token = sign({user: dbUser.email}, process.env.JWT_SECRET, {expiresIn: '15m'})
            // set Authorization-header to response
            res
                .header('Access-Control-Expose-Headers','Authorization')    // Needed to allow the front to read header
                .header('Authorization','Bearer ' + token)  // Add token to response-header
                .status(200)
                .json({
                userid: dbUser.userid,
                email: dbUser.email,
                nickname: dbUser.nickname,
                token
            })
        })

        
    })
}

// for deleting user account
export async function deleteAccount(req, res, next) {
    try {
        const email = req.user // get email from token
        console.log('deleten email: ', email)

        if (!email) {
            return res.status(400).json({ error: 'No email in token' })
        }

        // get user id from database by user email
        const { rows } = await pool.query('SELECT userID FROM users WHERE email = $1', [email])

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        const userID = rows[0].userid   // set user id to variable

        await pool.query('DELETE FROM usergroup WHERE userID = $1', [userID])
        await pool.query('DELETE FROM favourite_list WHERE userID = $1', [userID])
        await pool.query('DELETE FROM review WHERE userID = $1', [userID])
        //await pool.query('DELETE FROM movie WHERE userID = $1', [userID])
        await pool.query('DELETE FROM groups WHERE ownerID = $1', [userID])
        await pool.query('DELETE FROM users WHERE userID = $1', [userID])
        res.status(204).json({ message: 'Account deleted.' })
    } catch (error) {
        console.error('Delete account error:', error)
        return next(error)
    }
}

// for getting all reviews
export function getAllReviews (req, res, next) {
    pool.query(
        `SELECT r.reviewid, r.movieid, r.text, r.date, r.stars, u.nickname, m.title 
        FROM review r 
        JOIN users u ON r.userid = u.userid 
        JOIN movie m ON r.movieid = m.movieid 
        ORDER BY r.date DESC`,
    (err, result) => {
        if (err) {
            console.error('Reviews fetch error:', err)
            return next(err)
        }
        res.json(result.rows)
    })
}