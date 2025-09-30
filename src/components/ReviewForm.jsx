import { useState } from "react"
import { useUser } from "../context/useUser"

export default function ReviewForm({ movieID, onReviewAdded }) {
  const { user } = useUser();
  const [stars, setStars] = useState(0)
  const [text, setText] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert("You must be signed in to submit a review")
      return
    }

    try {
      const res = await fetch("http://localhost:3001/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": user.token
        },
        body: JSON.stringify({
          movieID,
          userID: user.userid,
          stars,
          text,
          date: new Date()
        })
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        console.error("Backend error:", error)
        alert(error.error || "Failed to submit review")
        return
      }

      const newReview = await res.json();
      newReview.useremail = user.nickname || user.email
      console.log("newly added review:", newReview)
      onReviewAdded(newReview)
      setStars(0)
      setText("")
    } catch (err) {
      console.error("Review submission failed", err)
      alert("Failed to submit review")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Stars</label>
      <input
        type="number"
        value={stars}
        onChange={e => setStars(Number(e.target.value))}
        min={1}
        max={5}
        required
      />

      <label>Review</label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your review here..."
      />

      <button type="submit">Submit Review</button>
    </form>
  )
}
