import { pool } from '../helper/db.js'
import { Router } from 'express'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt
const router = Router()

// router for signing up a new user
router.post('/signup', (req, res, next) => {
    const { user } = req.body

    if (!user || !user.email || !user.password) {
        const error = new Error('Email and password are required')
        return next(error)
    }

    // password is hashed before stored in database
    hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err)
        
        pool.query('INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING *',
        [user.email, hashedPassword, user.nickname],
        (err, result) => {
            if(err) {
                return next(err)
            }
            console.log(result.rows[0])

            res.status(201).json({ userid: result.rows[0].userid, email: user.email, nickname: user.nickname})   // TSEKKAA TÄÄ
        }
    )
    })

    
})

// router for signing in existing user
router.post('/signin', (req, res, next) =>{
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
        })

        // create token for the user
        const token = sign({user: dbUser.email}, process.env.JWT_SECRET)
        res.status(200).json({
            userid: dbUser.userid,
            email: dbUser.email,
            nickname: dbUser.nickname,
            token
        })
    })
})

export default router