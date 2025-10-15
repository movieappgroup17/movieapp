import express from 'express'
import { getShowtimes } from '../controller/showtimesController'

const router = express.Router()

router.get('/:area/:date', getShowtimes)

export default router
