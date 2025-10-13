import { Router } from 'express'
import { getAllGroups, getUserGroups, createGroup, getGroupById, getPendingRequests, joinRequest, rejectRequest, acceptRequest, deleteMember, leaveGroup, getAllMembers, deleteGroup, checkIsMember, getMoviesOfAGroup, addMovieToGroup, getAllGroupsForMember } from '../controller/groupController.js'


const router = Router()

// router for fetching all groups
router.get('/', getAllGroups)

// router for fetching users groups on profile page
router.get('/mygroups/:userid', getUserGroups)

// router for creating a new group
router.post('/', createGroup)

// router for fetching single group by id
router.get('/:id', getGroupById)

// router for getting pending join-requests to the owner of the group
router.get('/pending/:userid', getPendingRequests)

// router for sending group joining request
router.post('/joinreq', joinRequest)

// router for rejecting join request
router.patch('/reject/:reqid', rejectRequest)

// router for accepting join request
router.patch('/accept', acceptRequest)

// router for deleting user from a group 
router.delete('/remove', deleteMember)

// router for leaving the group
router.delete('/leave', leaveGroup)

// router for getting all the members of the group
router.get('/:id/members', getAllMembers)
  
// router for deleting a group
router.delete('/:id', deleteGroup)

// router for checking if user is member of group or the owner of the group
router.get('/:id/members/:userid', checkIsMember)

// router for fetching movies of a group
router.get('/:id/movies', getMoviesOfAGroup)

// router for adding a movie to a group
router.post('/:id/movies', addMovieToGroup)

// Get all groups a user is a member of
router.get('/user/:userid', getAllGroupsForMember)

export default router