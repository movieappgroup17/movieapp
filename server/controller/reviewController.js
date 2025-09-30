import {pool} from "../helper/db.js"

export async function addReview(req, res, next) {
    console.log("incoming review body:", req.body);
    const { movieID, stars, text, userID } = req.body;

    if (!movieID || !userID || !stars) {
        return res.status(400).json({ error: "MovieID, UserID and stars are required" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO review (movieid, userid, stars, date, text)
             VALUES ($1, $2, $3, CURRENT_DATE, $4)
             RETURNING *`,
            [movieID, userID, stars, text]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

export async function getReviewsByMovie(req, res, next) {
    const { movieID } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.*, u.email AS useremail
             FROM review r
             JOIN users u ON r.userid = u.userid
             WHERE r.movieid = $1
             ORDER BY r.date DESC`,
            [movieID]
        );
        console.log("Reviews fetched:", result.rows);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

export async function getReviewsByUser(req, res, next) {
    const { userID } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.*, m.name AS movietitle
             FROM review r
             JOIN movie m ON r.movieid = m.movieid
             WHERE r.userid = $1
             ORDER BY r.date DESC`,
            [userID]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
}

