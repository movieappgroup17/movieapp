import { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'

export default function Favorites() {

  const { user } = useContext(UserContext) // Get user information from UserContext
  const isLoggedIn = !!user?.userid   // Checks if user has logged in (user id is set as a boolean value)
  
  const [favouritelists, setFavouritelists] = useState([])  // useState for favourite lists

  useEffect(() => {
    // fetches all public favourite lists from backend
    fetch(`${import.meta.env.VITE_API_URL}/favourites/publicLists`)
    .then(res => res.json())
    .then(data => {
      console.log("Fetched lists:", data)
      setFavouritelists(data)

    })
    .catch(err => console.error(err))
  },[isLoggedIn])

  // If user has not logged in, this message is shown on the page
  if(!isLoggedIn) {
    return <p>You need to be logged in to see favourite lists</p>
  }

  // If no list is found or list is empty, this message is shown on the page
  if(!favouritelists || favouritelists.length === 0) {
    return <p>No one wants to share...no shared favourite lists</p>
  }

  return (
    <>
      <Header pageTitle={"Favorites"} />
      <div>
        <div>
        <ul>
          {favouritelists.map(list => (
            <li key={list.listID}>
              <h2>{list.nickname}'s list</h2>
              <ul>
                {list.movies?.map(movie => (
                  <li key={movie.movieID}>
                    <h3>{movie.title}</h3>
                    <img
                      src={movie.imageURL || "https://placehold.co/100x150?text=No+Image"}
                      alt={movie.title}
                      style={{ width: "100px" }}
                    />
                    <p>{movie.genre || "Unknown genre"}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </>
    
  )
}
