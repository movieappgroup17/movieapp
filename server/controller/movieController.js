import {pool} from "../helper/db.js"

// GET a movie by movieID
export async function getMovieById (req, res) {
    const { movieID } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM movie WHERE movieID = $1",
      [movieID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

// POST getOrCreate a movie from TMDB
export async function getOrCreateMovie (req, res) {
    const { tmdbId, title, release_date, overview, genre, imageURL } = req.body
  //console.log("Incoming getOrCreate movie body:", req.body)
  if (!tmdbId || !title) {
    return res.status(400).json({ error: "tmdbId and title are required" })
  }

  try {
    // Check if movie already exists
    const existing = await pool.query(
      "SELECT * FROM movie WHERE movieID = $1",
      [tmdbId]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0])
    }

    // Insert new movie
    const insert = await pool.query(
      `INSERT INTO movie (movieID, title, date, text, genre, imageURL)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tmdbId,
        title,
        release_date || null,
        overview || null,
        genre || null,
        imageURL || null,
      ]
    );

    res.json(insert.rows[0])
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" })
  }
}

// POST add a review
export async function addMovieReview (req, res) {
    const { movieID, userID, stars, text, date } = req.body

  if (!movieID || !userID || !stars) {
    return res
      .status(400)
      .json({ error: "movieID, userID, and stars are required" })
  }

  try {
    const result = await pool.query(
      `INSERT INTO review (movieID, userID, stars, text, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [movieID, userID, stars, text || null, date || new Date()]
    )

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" })
  }
}