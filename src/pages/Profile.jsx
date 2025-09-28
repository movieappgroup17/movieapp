import { useState, useContext, useEffect } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const { user, deleteAccount } = useContext(UserContext)
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState(null)

  const isLoggedIn = sessionStorage.getItem('user')

  // Get userID from sessionStorage
  const userFromSessionStorage = JSON.parse(sessionStorage.getItem('user'))
  const userID = userFromSessionStorage?.userid // store in variable if found

  // Fetches user's favourite list on his/hers Profile page
  useEffect(() => {
    if(!userID) return  // does not fetch if user is not found
    fetch(`${import.meta.env.VITE_API_URL}/favourites/user/${userID}`)
    .then(res => res.json())
    .then(data => setFavourites(data))  // set favourites with useState
    .catch(err => console.error(err))
  }, [userID])

  const handleDeleteAccount = async () => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        await deleteAccount(userFromStorage.userid)
        navigate('/signin')
    }
  }

  // function to handle favourite list toggle from public to private
  const handleTogglePublic = async () => {
    try {

      // send PUT-request to update isPublic value of a favourite list
      const res = await fetch(`${import.meta.env.VITE_API_URL}/favourites/public/${favourites.listID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !favourites.isPublic })
      })

      // Data to JSON
      const data = await res.json()

      // Changes only isPublic value
      setFavourites(prev => ({...prev, isPublic: data.list.ispublic }))
    } catch (err) {
      console.error(err)
    }
  }

  // shows user the page is trying to fetch favourites
  if (!favourites) return <p>Fetching favourites...</p>

  
  return (
    
    <>
      <Header pageTitle={"Profile"}/>
      <div>
        <h1>Profile</h1>
        <div>
          <h2>My favourites</h2>

          {favourites.movies.length === 0 ? (
            <p>You don't have favourite movies yet</p>
          ) : (
            <>
            <ul>
              {favourites.movies?.map(movie => (
                <li key={movie.movieID}>
                  <h3>{movie.title}</h3>
                  <img src={movie.imageURL || "https://placehold.co/100x150?text=No+Image"} alt={movie.title} />
                  <p>{movie.genre || "Unknown genre"}</p>
                </li>
              ))}
            </ul>
            <div>
          <p>Public: {" "}
            <span>{favourites.isPublic ? "Yes" : "No"}</span>
          </p>
          <button
            onClick={handleTogglePublic}>{favourites.isPublic ? "Make Private" : "Make Public"}</button>
          <p>Share link: </p>
          <input 
            type="text"
            readOnly
            value={`${window.location.origin}/favourites/share/${favourites.share_token}`}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/favourites/share/${favourites.share_token}`)
              toast.success("Link copied to clipboard")
            }}>
              Copy link
          </button>
        </div>
        </>
          )}
        </div>

        

        {isLoggedIn && (
          <>
        <button onClick={handleDeleteAccount} className="delete-button">
          Delete your account
        </button>
        </>
        )}
      </div>
    </>
  )
}
