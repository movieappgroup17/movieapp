import { useState } from "react";

export default function ToggleFav({ movie }) {
  const [inFav, setInFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function toggleFav() {
    setLoading(true)
    setError("")
    try {
      if (!inFav) {
        const resp = await fetch(`/favouriteRouter/post/${movieid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ movieID: movie.id, title: movie.title }),
        })
        if (!resp.ok) throw new Error("Add failed")
        setInFav(true)
      } else {
        const resp = await fetch(`/favouriteRouter/delete/${movie.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!resp.ok && resp.status !== 204) throw new Error("Delete failed")
        setInFav(false)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={toggleFav} disabled={loading}>
        {loading
          ? "Working..."
          : inFav
          ? "Delete from favourites"
          : "Add to favourites"}
      </button>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
    </div>
  )
}
