import { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify"
import { UserContext } from '../context/UserContext'

export default function ToggleFav({ movie, favourites, setFavourites, onEnsureInDb, loadingFavs }) {
  const { user } = useContext(UserContext) // Get user information from UserContext
  const [inFav, setInFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // check
  useEffect(() => {
    if (!favourites) return
    console.log(favourites.movies.map(m => m.movieID))
    setInFav(favourites.movies.some(m => m.movieID === movie.id))
  }, [favourites, movie.id])

  async function toggleFav() {
    setLoading(true)
    setError("")

    try {
      const token = user.token
      if (!token) throw new error("Not logged in")

      let dbMovieId = movie.id
      if (onEnsureInDb) {
        dbMovieId = await onEnsureInDb(movie)
      }


      if (!inFav) {
        const resp = await fetch("http://localhost:3001/favourites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movieID: movie.id, title: movie.title, userID: user.userid }),
        })

        if (!resp.ok) throw new Error("Add failed / already in favourites")
        setInFav(true)
        setFavourites(prev => ({  // update favourite list
          ...prev, movies: [...prev.movies, { movieID: dbMovieId, title: movie.title }]
        })) 
        toast.success("Added to favourites")
      } else {
        const resp = await fetch(`http://localhost:3001/favourites/${movie.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok && resp.status !== 204) throw new Error("Delete failed")
        setInFav(false)
        setFavourites(prev => ({  // update favourite list
          ...prev, movies: prev.movies.filter(m => m.movieID !== dbMovieId)
        }))

        toast.info("Removed from favourites")
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingFavs) return <div>Loading...</div>


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
