import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useParams } from 'react-router-dom'

export default function SharedFavouriteList() {

    // useState for shared favourite list
    const [favourites, setFavourites] = useState(null)

    useEffect (() => {
        // Get list's token from URL address
        const token = window.location.pathname.split("/").pop()

        // Fetch shared favourite list from backend by list's token
        fetch(`${import.meta.env.VITE_API_URL}/favourites/share/${token}`)
            .then(res => res.json())
            .then(data => setFavourites(data))
            .catch(err => console.error(err))
}, [])

if(!favourites) return <p>Loading shared list...</p>

return (
    <>
          <Header pageTitle={`${favourites.nickname}'s favourites`} />
            <div>
            <h2>{favourites.nickname}'s favourite movies</h2>
            <ul>
                {favourites.movies?.map(movie => (
                    <li key={movie.movieID}>
                        <h3>{movie.title}</h3>
                        <img src={movie.imageURL || "https://placehold.co/100x150?text=No+Image"} alt={movie.title} />
                        <p>{movie.genre || "Unknown genre"}</p>
                    </li>
                ))}
            </ul>
            </div>
          
        </>
)


}



