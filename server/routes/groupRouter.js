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

//KESKEN
// router for fetching users groups
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

        const groupid = insertResult.rows[0].groupid
        console.log("ryhmä lisätty ja sen id: ", groupid)
        
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

// router for joining request
router.post('/joinreq', async (req, res, next) => {
    const { groupid, userid } = req.body
    const status = "pending"

    // check if user is the owner of the group
    if (!groupid || !userid) return res.status(400).json({ error: "No groupid or ownerid" })

    try {
        // check if join request has been made, and it is pending or accepted
        const hasRequest = await pool.query(`SELECT * FROM joinRequest WHERE userID = $1 AND groupID = $2 AND status IN ('pending', 'accepted')`, [userid, groupid])

        // if there is not request pending or accepted, user can send new request to join
        if(hasRequest.rows.length === 0) {

            // check is request has been rejected
            const rejected = await pool.query(`SELECT * FROM joinRequest WHERE userID = $1 AND groupID = $2 AND status IN ('rejected')`, [userid, groupid])

            // if request has been rejected, send new request by updating status to 'pending'
            if(rejected.rows.length > 0) {
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
                await pool.query(
                    `INSERT INTO userGroup (userID, groupID, role) VALUES ($1, $2, 'member')`, [userid, groupid]
                )
                return res.status(201).json({ message: "Join request sent" })
            }
        } else {
            // error status for request already existing
            res.status(409).json({ error: "request already exists"})
        }

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Database error" })
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

// router for checking if user is member of group
router.get('/:id/members/:userid', (req, res, next) => {
    const { id, userid } = req.params
    
    pool.query(
        'SELECT * FROM usergroup WHERE groupid = $1 AND userid = $2',
        [id, userid],
        (err, result) => {
            if (err) return next(err)
                res.json({ isMember: result.rows.length > 0})
        }
    )
})

export default router