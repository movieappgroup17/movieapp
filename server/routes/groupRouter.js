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

// router for creating a new group
router.post('/', (req, res, next) => {
    const { groupname, description, ownerid } = req.body

    if (!groupname || !ownerid) {
        const error = new Error('Group name and owner ID are required')
        error.status = 400
        return next(error)
    }

    pool.query(
        'INSERT INTO groups (groupname, ownerid, description) VALUES ($1, $2, $3) RETURNING *',
        [groupname, ownerid, description],
        (err, result) => {
            if (err) {
                console.error('Error while creating group: ', err)
                return next(err)
            }
            res.status(201).json(result.rows[0])
        }
    )
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