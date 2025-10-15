import express from 'express'
import { auth } from '../helper/auth.js'
import { addFavourite, getFavourites, deleteFavourite, getFavouritesToProfile, getPublicFavourites, getSharedFavourites, togglePublic } from '../controller/favouriteController.js'


const router = express.Router()

// Lisää suosikki 
router.post("/", auth, addFavourite)

// router hakee omat suosikit 
router.get("/favourites", auth, getFavourites)

// Poista suosikki 
router.delete('/:movieID', auth, deleteFavourite)

// ROUTER to shows list of favourite movies on Profile -page
router.get("/user/:userID", getFavouritesToProfile)

// ROUTER to show all public lists on Favourites -page
router.get('/publicLists', getPublicFavourites)

// ROUTER to fetch a spesific list of favourite movies on SharedFavouritelist -page
router.get('/share/:shareToken', getSharedFavourites)

// ROUTER to toggle list between public and private by listID
router.put('/public/:listID', togglePublic)


export default router