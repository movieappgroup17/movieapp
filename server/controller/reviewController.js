import {pool} from "../helper/db.js"

export async function addReview(req, res, next) {
    console.log("incoming review body:", req.body)
    const { movieID, stars, text, userID } = req.body

    if (!movieID || !userID || !stars) {
        return res.status(400).json({ error: "MovieID, UserID and stars are required" })
    }

    try {
        const result = await pool.query(
            `INSERT INTO review (movieid, userid, stars, date, text)
             VALUES ($1, $2, $3, CURRENT_DATE, $4)
             RETURNING *`,
            [movieID, userID, stars, text]
        );
        res.status(201).json(result.rows[0])
    } catch (err) {
        next(err)
    }
}
//Review for a single movie
export async function getReviewsByMovie(req, res, next) {
    const { movieID } = req.params;
    try {
        const result = await pool.query(
        `SELECT r.*,
        u.email AS userEmail,
        u.nickname AS userNickname,
        m.title AS movieTitle,
        m.imageURL AS moviePoster,
        m.text AS movieOverview
        FROM review r
        JOIN users u ON r.userid = u.userid
        JOIN movie m ON r.movieid = m.movieid
        WHERE r.movieid = $1
        ORDER BY r.date DESC`,
        [movieID]
        )
        console.log("Reviews fetched:", result.rows)
        res.json(result.rows)
    } catch (err) {
        next(err)
    }
}
// Get all reviews
export async function getAllReviews(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT r.*,
              u.email AS userEmail, 
              u.nickname AS userNickname,
              m.title AS movieTitle,
              m.imageURL AS moviePoster,
              m.text AS movieOverview
       FROM review r
       JOIN users u ON r.userid = u.userid
       JOIN movie m ON r.movieid = m.movieid
       ORDER BY r.date DESC`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}

