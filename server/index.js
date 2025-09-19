import express from 'express'
import cors from 'cors'
import { pool } from './helper/db.js'
import userRouter from './routes/userRouter.js'

const port = process.env.PORT || 3001

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/user', userRouter)

app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode
    }
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
