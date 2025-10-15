import { auth } from '../helper/auth.js'
import { Router } from 'express'
import { signin, signup, deleteAccount, getAllReviews } from '../controller/userController.js'

const router = Router()

// router for signing up a new user
router.post('/signup', signup)

// router for signing in existing user
router.post('/signin', signin)

// router for deleting user account
router.delete('/', auth, deleteAccount)

// router for getting all reviews
router.get('/reviews', getAllReviews)

export default router