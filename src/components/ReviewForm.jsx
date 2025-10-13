import { useState } from "react"
import { useUser } from "../context/useUser"

export default function ReviewForm({ movieID, onReviewAdded, tmdbMovies = {} }) {
  const { user } = useUser()
  const [stars, setStars] = useState(0)
  const [text, setText] = useState("")

  const tmdb = tmdbMovies[movieID]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.token) {
      alert("You must be signed in to submit a review")
      return
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          movieID,
          userID: user.userid,
          stars,
          text
        })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        console.error("Backend error:", error)
        alert(error.error || "Failed to submit review")
        return
      }

      const newReview = await res.json()
      if (onReviewAdded) onReviewAdded(newReview)
      setStars(0)
      setText("")
    } catch (err) {
      console.error("Review submission failed", err)
      alert("Failed to submit review")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      {tmdb?.poster_path && (
        <div className="mb-2">
          <img
            src={`https://image.tmdb.org/t/p/w200${tmdb.poster_path}`}
            alt={tmdb.title}
            className="rounded"
          />
        </div>
      )}

      <label>Stars</label>
      <input
        type="number"
        value={stars}
        onChange={(e) => setStars(Number(e.target.value))}
        min={1}
        max={5}
        required
      />

      <label>Review</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review here..."
        required
      />

      <button type="submit">Submit Review</button>
    </form>
  )
}
