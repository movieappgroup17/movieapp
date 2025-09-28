import { pool } from '../helper/db.js'
import { Router } from 'express'
import { auth } from '../helper/auth.js'

const router = Router()

// Lisää suosikki
router.post("/favourites", auth, async (req, res) => {
    try {
        const userID = req.user.id
        const { movieID, title } = req.body || {}
        if (!Number.isFinite(Number(movieID)) || !title?.trim()) {
            return res.status(400).json({ error: "movieId and title required" })
        }

        // 1/3 Lisää movie-tauluun
        await pool.query(
            `INSERT INTO movie (movieID, title)
            VALUES ($1, $2)
            ON CONFLICT (movieID) DO UPDATE SET title = EXCLUDED.title;`,
            [movieID, title.trim()]
        )

        //2/3 Hakee olemassa olevan listID tai luo uuden
        let listID
        {
            const { rows } = await pool.query(
                `SELECT listID FROM favourite_list WHERE userID = $1 LIMIT 1;`,
                [userID]
            )
            listID = rows[0]?.listID
        }
        if (!listID) {
            const { rows } = await pool.query(
                `INSERT INTO favourite_list (userID)
                VALUES ($1)
                 RETURNING listID;`,
                [userID]
            )
            listID = rows[0].listID
        }

        // 3/3 Lisää favouriteseihin
        await pool.query(
            `INSERT INTO favourites (listID, movieID)
            VALUES ($1, $2)
            ON CONFLICT (listID, movieID) DO NOTHING;`,
            [listID, movieID]
        )

        return res.status(201).json({ ok: true, movieID, title })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: "Failed to add favourite" })
    }
})

// router hakee omat suosikit
router.get("/favourites", auth, async (req, res) => {
    try {
        const userID = req.user.id
        const { rows } = await pool.query(
            `SELECT m.title 
        FROM favourites f 
        JOIN favourite_list l ON f.listID = l.listID
        JOIN movie m ON f.movieID = m.movieID
        WHERE l.userID = $1
         ORDER BY m.title ASC;`,
            [userID]
        );
        return res.json(rows)
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: "Failed to fetch favourites" })
    }
})

// Poista suosikki
router.delete('/favourites/:movieID', auth, async (req, res) => {
    try {
        const userID = req.user.id
        const movieID = Number(req.params.movieID)
        if (!Number.isFinite(movieID)) {
            return res.status(400).json({ error: 'Invalid movieID' })
        }

        const { rows } = await pool.query(
            `SELECT listID FROM favourite_list WHERE userID = $1 LIMIT 1;`,
            [userID]
        )
        const listID = rows[0]?.listid
        if (!listID) {
            return res.status(204).end()
        }

        const result = await pool.query(
            `DELETE FROM favourites WHERE listID = $1 AND movieID = $2;`,
            [listID, movieID]
        )

        return res.json({ deleted: result.rowCount > 0 })

    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: 'Failed to delete favourite' })
    }
})


export default router