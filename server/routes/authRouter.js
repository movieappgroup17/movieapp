// routes/auth.js
import express from 'express'
import { auth } from '../helper/auth.js'

const router = express.Router()

// Router to check token validation. Returns 200, if all is good
router.get('/validate', auth, (req, res) => {
  res.status(200).json({ valid: true, user: req.user })
})

export default router
