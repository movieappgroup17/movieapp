import express from "express"
import {auth} from "../helper/auth.js"
import { addReview, getReviewsByMovie, getReviewsByUser } from "../controller/reviewController.js"

const router = express.Router()


router.post("/", auth, addReview)

router.get("/:movieID", getReviewsByMovie)

router.get("/user/:userID", getReviewsByUser)

router.get("/user/:userID", auth, getReviewsByUser) // user specific reviews

export default router