import { useState } from "react";
import { toast } from "react-toastify"

export default function ToggleFav({ movie }) {
  const [inFav, setInFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function toggleFav() {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new error("Not logged in")
      if (!inFav) {
        const resp = await fetch("http://localhost:3001/favourites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieID: movie.id, title: movie.title }),
        })
        const data = await resp.json()

        if (inFav) {
         // throw new Error(data?.error || "Already in favourites")
          toast.error("Already in faves")
          
        }

        if (!resp.ok) throw new Error("Add failed / already in favourites")
        setInFav(true)
      } else {
        const resp = await fetch(`http://localhost:3001/favourites/${movie.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
