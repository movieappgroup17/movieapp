import { pool } from '../helper/db.js'
import { Router } from 'express'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt
const router = Router()

router.post('signin', (req, res, next) =>{
    const { user } = req.body
    if(!user || !user.email || !user.password) {
        const error = new Error('Email and password are required')
        error.status = 400
        return next(error)
    }
    pool.query('SELECT * FROM user WHERE email = $1', [user.email], (err, result) => {
        if (err) return next(err)
        if (result.rows.length === 0){
            const error = new Error('User not found')
            error.status = 404
            return next(error)
        }

        const dbUser = result.rows[0]

        compare(user.password, dbUser.password, (err, isMatch) => {
            if (err) return next(err)
            if (!isMatch){
                const error = new Error ('Invalid password')
                error.status = 401
                return next(error)
            }
        })

        const token = sign({user: debUser.email}, process.env.JWT_SECRET)
        res.status(200).json({
            id: dbUser.id,
            email: dbUser.email,
            token
        })
    })
})

export default router