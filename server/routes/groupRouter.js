import { pool } from '../helper/db.js'
import { Router } from 'express'


const router = Router()

// router for fetching all groups
router.get('/', (req, res, next) => {
    pool.query(`
        SELECT g.groupid, g.groupname, g.description, g.ownerid, u.nickname as owner
        FROM groups g
        JOIN users u ON g.ownerid = u.userid
        ORDER BY g.groupid DESC
        `, (err, result) => {
        if (err) {
            console.error('Error while fetching groups: ', err)
            return next(err)
        }
        res.json(result.rows)
    })
})

// router for fetching users groups on profile page
router.get('/mygroups/:userid', (req, res, next) => {
    const userID = req.params.userid
    pool.query(`
        SELECT g.groupid, g.groupname, g.description, g.ownerid, ug.role, u.nickname as owner
        FROM groups g
        JOIN users u ON g.ownerid = u.userid
        JOIN userGroup ug ON ug.groupID = g.groupID
        WHERE ug.userID = $1
        ORDER BY ug.role DESC
        `, [userID], (err, result) => {
        if (err) {
            console.error('Error while fetching groups: ', err)
            return next(err)
        }
        res.json(result.rows)
    })
})

// router for creating a new group
router.post('/', async (req, res, next) => {
    const { groupname, description, ownerid } = req.body

    if (!groupname || !ownerid) {
        const error = new Error('Group name and owner ID are required')
        error.status = 400
        return next(error)
    }

    try {
        const insertResult = await pool.query(
            'INSERT INTO groups (groupname, ownerid, description) VALUES ($1, $2, $3) RETURNING *',
            [groupname, ownerid, description])

        const groupid = insertResult.rows[0].groupid    // previously created group´s id is set to variable
        //console.log("ryhmä lisätty ja sen id: ", groupid)

        // Group creator is made the owner of the group
        await pool.query(
            `INSERT INTO userGroup (userID, groupID, role) VALUES ($1, $2, 'owner')`, [ownerid, groupid]
        )

        return res.status(201).json(insertResult.rows[0])


    } catch (error) {
        console.error('Error while creating group: ', error)
        res.status(500).json({ error: "Database error" })

    }

})

// router for fetching single group by id
router.get('/:id', (req, res, next) => {
    const groupID = req.params.id

    pool.query(
        `SELECT g.groupid, g.groupname, g.description, g.ownerid, u.nickname as owner, u.email
        FROM groups g
        JOIN users u ON g.ownerid = u.userid
        WHERE g.groupid = $1
        `, [groupID], (err, result) => {
        if (err) {
            console.error('Error while fetching groups:', err)
            return next(err)
        }
        if (result.rows.length === 0) {
            const error = new Error('Group not found')
            error.status = 404
            return next(err)
        }
        res.json(result.rows[0])
    })
})

// router for getting pending join-requests to the owner of the group
router.get('/pending/:userid', (req, res, next) => {
    const ownerid = req.params.userid

    pool.query(`SELECT j.requestid, j.groupid, j.userid, g.groupname, u.nickname, j.createdat FROM joinRequest j
        JOIN groups g ON g.groupid  = j.groupid
        JOIN users u ON u.userid = j.userid
        WHERE g.ownerid = $1 AND j.status = 'pending';`, [ownerid], (err, result) => {
        if (err) {
            console.error('Error while fetching requests: ', err)
            return next(err)
        }
        res.json(result.rows)
    })
})

// router for sending group joining request
router.post('/joinreq', async (req, res, next) => {
    const { groupid, userid } = req.body
    const status = "pending"

    // check if user is the owner of the group
    if (!groupid || !userid) return res.status(400).json({ error: "No groupid or ownerid" })

    try {
        // check if join request has been made, and it is pending or accepted
        const hasRequest = await pool.query(`SELECT * FROM joinRequest WHERE userID = $1 AND groupID = $2 AND status IN ('pending', 'accepted')`, [userid, groupid])

        // if there is not request pending or accepted, user can send new request to join
        if (hasRequest.rows.length === 0) {

            // check is request has been rejected
            const rejected = await pool.query(`SELECT * FROM joinRequest WHERE userID = $1 AND groupID = $2 AND status IN ('rejected')`, [userid, groupid])

            // if request has been rejected, send new request by updating status to 'pending'
            if (rejected.rows.length > 0) {
                await pool.query(
                    `UPDATE joinRequest SET status = $1`,
                    [status]
                )
                return res.status(201).json({ message: "Join request sent" })
            } else {
                // if there is no previous request, send new request by inserting new request to the database
                await pool.query(
                    `INSERT INTO joinRequest (groupID, userID, status) VALUES ($1,$2,$3)`,
                    [groupid, userid, status]
                )
                return res.status(201).json({ message: "Join request sent" })
            }
        } else {
            // error status for request already existing
            res.status(409).json({ error: "request already exists" })
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Database error" })
    }

})

// router for rejecting join request
router.patch('/reject/:reqid', async (req, res, next) => {
    const requestid = req.params.reqid

    try {
        // updates request status from 'pending' to 'rejected'
        await pool.query(
            `UPDATE joinrequest SET status = 'rejected' WHERE requestid = $1`,
            [requestid]
        )
        res.status(200).json({ message: "request rejected" })
    } catch (err) {
        console.error('Error while updating status to rejected:', err)
        next(err)
    }
})

// router for accepting join request
router.patch('/accept', async (req, res, next) => {

    const { requestid, groupid, userid } = req.body

    try {
        // updates request status from 'pending' to 'accepted'
        await pool.query(
            `UPDATE joinrequest SET status = 'accepted' WHERE requestid = $1`,
            [requestid]
        )
        // inserts accepted user as a member of the group
        await pool.query(
            `INSERT INTO userGroup (userID, groupID, role) VALUES ($1, $2, 'member')`, [userid, groupid]
        )
        res.status(200).json({ message: "request accepted, new member added to the group" })
    } catch (err) {
        console.error('Error while updating status to accepted:', err)
        next(err)
    }
})

// router for deleting user from a group 
router.delete('/remove', async (req, res, next) => {
    const { groupid, userid, ownerid } = req.body
    try {
        const ownerCheck = await pool.query(
            `SELECT ownerid FROM groups WHERE groupid = $1`,
            [groupid]
        )
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' })
        }
        const isOwner = ownerCheck.rows[0].ownerid == ownerid
        if (!isOwner) {
            return res.status(403).json({ error: 'Only the owner can remove members' })
        }
        await pool.query(
            `DELETE FROM usergroup WHERE userID = $1 AND groupID = $2`,
            [userid, groupid]
        )
        res.status(200).json({ message: 'Member removed from group' })
    } catch (err) {
        console.error('Error while removing member:', err)
        next(err)
    }
})


// router for leaving the group
router.delete('/leave', async (req, res, next) => {
    const { groupid, userid } = req.body
    try {
        const roleCheck = await pool.query(
            `SELECT role FROM userGroup WHERE userID = $1 AND groupID = $2`,
            [userid, groupid]
        )
        if (roleCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User is not a member of this group' })
        }
        if (roleCheck.rows[0].role === 'owner') {
            return res.status(403).json({ error: 'Owner cannot leave the group directly' })
        }
        await pool.query(
            `DELETE FROM userGroup WHERE userID = $1 AND groupID = $2`,
            [userid, groupid]
        )
        res.status(200).json({ message: 'You have left the group' })
    } catch (err) {
        console.error('Error while leaving group:', err)
        next(err)
    }
})

// router for getting all the members of the group
router.get('/:id/members', async (req, res, next) => {
    const groupID = req.params.id
    try {
      const groupResp = await pool.query(
        'SELECT ownerid FROM groups WHERE groupid = $1',
        [groupID]
      )
      if (groupResp.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' })
      }
      const ownerID = groupResp.rows[0].ownerid
      const membersResp = await pool.query(
        `SELECT ug.userid,
                u.nickname,
                ug.role
         FROM usergroup ug
         JOIN users u ON u.userid = ug.userid
         WHERE ug.groupid = $1
         ORDER BY (ug.userid = $2) DESC, LOWER(u.nickname) ASC`,
        [groupID, ownerID]
      )
      const members = membersResp.rows.map(r => ({
        userID: r.userid,
        nickname: r.nickname,
        role: r.role
      }))
      res.json({ ownerID, members })
    } catch (err) {
      console.error('Error fetching members:', err)
      next(err)
    }
  })
  

// router for deleting a group
router.delete('/:id', (req, res, next) => {
    const groupID = req.params.id

    pool.query('DELETE FROM groups WHERE groupid = $1', [groupID], (err, result) => {
        if (err) {
            console.error('Error while deleting group: ', err)
            return next(err)
        }
        res.json({ message: 'Group succesfully deleted' })
    })
})

// router for checking if user is member of group or the owner of the group
router.get('/:id/members/:userid', (req, res, next) => {
    const { id, userid } = req.params

    pool.query(
        'SELECT * FROM usergroup WHERE groupid = $1 AND userid = $2',
        [id, userid],
        (err, result) => {
            if (err) return next(err)
            pool.query('SELECT ownerid FROM groups WHERE groupid = $1', [id], (err2, res2) => {
                if (err2) return next(err2)
                const isOwner = res2.rows[0]?.ownerid == userid
                res.json({ isMember: result.rows.length > 0 || isOwner })
            })
        }
    )
})

// router for fetching movies of a group
router.get('/:id/movies', (req, res, next) => {
    const groupID = req.params.id

    pool.query(`
        SELECT gm.id, m.movieid, m.title, m.imageurl, gm.showtime, gm.theatre, u.nickname AS added_by
        FROM group_movies gm
        JOIN movie m ON gm.movieid = m.movieid
        JOIN users u ON gm.addedby = u.userid
        WHERE gm.groupid = $1
        ORDER BY gm.created_at DESC
    `, [groupID], (err, result) => {
        if (err) {
            console.error('Error while fetching group movies:', err)
            return next(err)
        }
        res.json(result.rows)
    })
})

// router for adding a movie to a group
router.post('/:id/movies', (req, res, next) => {
    const groupID = req.params.id
    const { movieID, addedBy, showtime, theatre } = req.body

    if (!movieID || !addedBy) {
        const error = new Error('movieID and addedBy are required')
        error.status = 400
        return next(error)
    }

    pool.query(`
        INSERT INTO group_movies (groupid, movieid, addedby, showtime, theatre)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [groupID, movieID, addedBy, showtime, theatre], (err, result) => {
        if (err) {
            console.error('Error while adding movie to group:', err)
            return next(err)
        }
        res.status(201).json(result.rows[0])
    })
})

// Get all groups a user is a member of
router.get('/user/:userid', (req, res, next) => {
    const { userid } = req.params
    pool.query(
        `SELECT g.groupid, g.groupname, g.description, g.ownerid, u.nickname as owner
     FROM groups g
     JOIN usergroup ug ON g.groupid = ug.groupid
     JOIN users u ON g.ownerid = u.userid
     WHERE ug.userid = $1
     ORDER BY g.groupid DESC`,
        [userid],
        (err, result) => {
            if (err) return next(err)
            res.json(result.rows)
        }
    )
})

export default router