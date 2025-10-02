import express from 'express'
import cors from 'cors'
import { pool } from './helper/db.js'
import userRouter from './routes/userRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import movieRouter from './routes/movieRouter.js'
import favouriteRouter from './routes/favouriteRouter.js'

const port = process.env.PORT || 3001

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use("/movies", movieRouter)
app.use("/reviews", reviewRouter)
app.use('/user', userRouter)
app.use('/favourites', favouriteRouter)

app.use((err, req, res, next) => {
  const statusCode = err.status || 500
  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode
    }
  })
})


app.get("/favourites", async (req, res) => {
  const result = await pool.query("SELECT * FROM favourites");
  res.json(result.rows);
})

app.post("/favourites", async (req, res) => {
  const { movieID } = req.body;
  await pool.query(
    "INSERT INTO favourites (movieID) VALUES ($1) ON CONFLICT DO NOTHING",
    [movieID]
  );
  res.sendStatus(201);
})

app.delete("/favourites", async (req, res) => {
  const { movieID } = req.body;
  await pool.query(
    "DELETE FROM favourites WHERE movieID = $1",
    [movieID]
  );
  res.sendStatus(200);
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})