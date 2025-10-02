import express from "express"
import {auth} from "../helper/auth.js"
import { addReview, getReviewsByMovie, getAllReviews } from "../controller/reviewController.js"

const router = express.Router()

//New review
router.post("/", auth, addReview)
//All reviews
router.get("/:movieID", getAllReviews)
// Get reviews for a specific movie
router.get("/reviews/movie/:movieID", getReviewsByMovie)

export default router