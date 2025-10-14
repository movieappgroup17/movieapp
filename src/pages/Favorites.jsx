import { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import './css/Favourites.css'

export default function Favorites() {

  const { user } = useContext(UserContext) // Get user information from UserContext
  const isLoggedIn = !!user?.userid   // Checks if user has logged in (user id is set as a boolean value)
  
  const [favouritelists, setFavouritelists] = useState([])  // useState for favourite lists

  useEffect(() => {
    // fetches all public favourite lists from backend
    fetch(`${import.meta.env.VITE_API_URL}/favourites/publicLists`)
    .then(res => res.json())
    .then(data => {
      //console.log("Fetched lists:", data)
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
        <ul className="list">
          {favouritelists.map(list => (
            <li key={list.listID} className="list-group-item">
                  <div id='whose-list'><h2>{list.nickname}'s list</h2></div>
              <ol className="list-group">
                {list.movies?.map(movie => (
                  <li key={movie.movieID} className="list-group-item d-flex flex-column align-items-center text-center">
                  <div className="fw-bold mb-2">{movie.title}</div>
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.imageURL}` || "https://placehold.co/100x150?text=No+Image"}
                    alt={movie.title}
                    style={{
                      width: "100px",
                      borderRadius: "8px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
                    }}
                  />
                </li>                
                ))}
              </ol>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </>
    
  )
}
