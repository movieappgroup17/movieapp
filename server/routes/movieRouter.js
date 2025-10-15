import express from "express";
import { getMovieById, getOrCreateMovie, addMovieReview } from "../controller/movieController.js";


const router = express.Router();

// GET a movie by movieID
router.get("/:movieID", getMovieById);

// POST getOrCreate a movie from TMDB
router.post("/getOrCreate", getOrCreateMovie)

// POST add a review
router.post("/review", addMovieReview)

export default router
