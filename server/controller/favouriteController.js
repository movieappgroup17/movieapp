import {pool} from "../helper/db.js"

// Function to add a favourite movie
export async function addFavourite(req, res) {
    const { movieID, title, userID } = req.body || {}
    console.log(userID)

    if (!Number.isFinite(Number(movieID)) || !title?.trim()) {
            return res.status(400).json({ error: "movieId and title required" })
        }
    
    try {
        // Hakee olemassa olevan listID tai luo uuden 
        let listID
        {const { rows } = await pool.query(
                `SELECT listID FROM favourite_list WHERE userID = $1 LIMIT 1;`,
                [userID]
            )
            console.log("DEBUG: rows from SELECT", rows)
            listID = rows[0]?.listid
        }

        if (!listID) {
            const { rows } = await pool.query(
                `INSERT INTO favourite_list (userID) VALUES ($1) RETURNING listID;`,
                [userID]
            )
            console.log("DEBUG: rows from INSERT", rows)
            listID = rows[0].listid
        }

        // Lisää favouriteseihin 
        await pool.query(
            `INSERT INTO favourites (listID, movieID) VALUES ($1, $2)
            ON CONFLICT (listID, movieID) DO NOTHING RETURNING movieID`,
            [listID, movieID]
        )

        return res.status(201).json({ ok: true, movieID, title })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ ok: false, error: "Failed to add favourite" })
    }
    
}

// Function to get favourite movies
export async function getFavourites(req, res) {
    const userID = req.user.id
    try {
        const { rows } = await pool.query(
            `SELECT m.title, m.movieid  
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
}

// Function to delete a favourite movie
export async function deleteFavourite(req, res) {
    console.log("yritetään deleteä")
    const userID = Number(req.query.userID)
    console.log("userid on ", userID)
    const movieID = Number(req.params.movieID)
    try {
        
        if (!Number.isFinite(movieID)) {
            return res.status(400).json({ error: 'Invalid movieID' })
        }

        const { rows } = await pool.query(
            `SELECT listID FROM favourite_list WHERE userID = $1 LIMIT 1;`,
            [userID]
        )
        const listID = rows[0]?.listid
        console.log(listID)
        if (!listID) {
            return res.status(204).end()
        }

        const result = await pool.query(
            `DELETE FROM favourites WHERE listID = $1 AND movieID = $2;`,
            [listID, movieID]
        )
        console.log('Deleted rows:', result.rowCount)
        return res.json({ deleted: result.rowCount > 0 })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: 'Failed to delete favourite' })
    }
}

// Function to show favourites in profile page

export async function getFavouritesToProfile(req, res) {
    const { userID } = req.params   // get userID from parameters

    try {
        // Fetch favourite list from database by user id
        const result = await pool.query(
            `SELECT fl.listID,
                    fl.isPublic,
                    fl.share_token,
                    m.movieID,
                    m.title,
                    m.imageURL,
                    m.genre
            FROM favourite_list fl
            LEFT JOIN favourites f ON fl.listID = f.listID
            LEFT JOIN movie m ON f.movieID = m.movieID
            WHERE fl.userID = $1`,
            [userID]
        )

        // Data to JSON
        if (result.rows.length === 0) {
            return res.json({ movies: [], isPublic: false })
        }

        // Takes basic data from list from first row(data is same in every line)
        const { listid, ispublic, share_token } = result.rows[0]

        // Build an array of movies
        const movies = result.rows
            .filter(r => r.movieid !== null)
            .map(r => ({
                movieID: r.movieid,
                title: r.title,
                imageURL: r.imageurl,
                genre: r.genre
            }))

        // Final JSON response to the frontend
        res.json({
            listID: listid,
            isPublic: ispublic,
            share_token,
            movies
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Server error" })
    }
    
}

// Function to show all public lists on Favourites -page
export async function getPublicFavourites(req, res) {
    try {
        // Fetch all public favourite list from database by 'isPublic = true'
        const result = await pool.query(
            `SELECT fl.listID,
                    fl.share_token, 
                    u.nickname,
                    m.movieID,
                    m.title,
                    m.imageURL,
                    m.genre
            FROM favourite_list fl
            JOIN users u ON fl.userID = u.userID
            JOIN favourites f ON fl.listID = f.listID
            JOIN movie m ON f.movieID = m.movieID
            WHERE fl.ispublic = true`
        )

        // Data to JSON
        if (result.rows.length === 0) {
            return res.json([])
        }

        console.log("Rows from DB:", result.rows)

        // Grouping result rows by listID
        const listsMap = {}
        result.rows.forEach(row => {
            if (!listsMap[row.listid]) {
                listsMap[row.listid] = {
                    listID: row.listid,
                    nickname: row.nickname,
                    share_token: row.share_token,
                    movies: []
                }
            }

            // Adding movies to array
            if (row.movieid) {
                listsMap[row.listid].movies.push({
                    movieID: row.movieid,
                    title: row.title,
                    imageURL: row.imageurl,
                    genre: row.genre
                })
            }
        })

        const lists = Object.values(listsMap)

        // Final JSON response to the frontend
        res.json(lists)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Server error" })
    }
}

// Function to fetch a spesific list of favourite movies on SharedFavouritelist -page

export async function getSharedFavourites(req, res) {
    const { shareToken } = req.params

    try {
        // Fetch favourite list from database by share_token
        const result = await pool.query(
            `SELECT fl.listID,
                    fl.share_token, 
                    u.nickname,
                    m.movieID,
                    m.title,
                    m.imageURL,
                    m.genre
            FROM favourite_list fl
            JOIN users u ON fl.userID = u.userID
            JOIN favourites f ON fl.listID = f.listID
            JOIN movie m ON f.movieID = m.movieID
            WHERE fl.share_token = $1`, [shareToken]
        )

        if (!result || result.rows.length === 0) return res.status(404).json({ error: 'Not found' })

        const { listid, nickname, share_token } = result.rows[0]

        // Build an array of movies
        const movies = result.rows
            .filter(r => r.movieid !== null)
            .map(r => ({
                movieID: r.movieid,
                title: r.title,
                imageURL: r.imageurl,
                genre: r.genre
            }))

        // Final JSON response to the frontend
        res.json({
            listID: listid,
            nickname,
            share_token,
            movies
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Server error" })
    }
}

// Function to toggle list between public and private by listID
export async function togglePublic(req, res) {
    const { listID } = req.params
    const { isPublic } = req.body

    try {
        // Update favourite list to public or private, depending on previous setup
        const result = await pool.query(
            `UPDATE favourite_list
            SET isPublic = $1
            WHERE listID = $2
            RETURNING listID, isPublic`,
            [isPublic, listID]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "List not found" })
        }

        res.json({
            message: `List ${isPublic ? "set to public" : "set to private"}`,
            list: result.rows[0]
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: "Server error" })
    }
}