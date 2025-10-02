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
        await deleteAccount(userFromStorage.token)
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
    <Header pageTitle={"Profile"} />
    <div className="container mt-4">
      {favourites.movies.length === 0 ? (
        <p>You don't have favourite movies yet</p>
      ) : (
        <div id="favourites" className="row">
          
          <div id="favouritelist" className="col-md-4">
            <h1>My favourites</h1>
            <ul className="list-unstyled">
              {favourites.movies?.map((movie) => (
                <li key={movie.movieID} className="mb-3">
                  <h5>{movie.title}</h5>
                  <img
                    src={
                      movie.imageURL ||
                      "https://placehold.co/100x150?text=No+Image"
                    }
                    alt={movie.title}
                    className="img-thumbnail mb-2"
                    style={{ width: "100px" }}
                  />
                  <p>{movie.genre || "Unknown genre"}</p>
                </li>
              ))}
            </ul>
          </div>

          <div id="favouriteOptions" className="col-md-4">
            <div className="card p-3">
              <p>
                Public: <span>{favourites.isPublic ? "Yes" : "No"}</span>
              </p>
              <button
                className="btn btn-primary d-flex justify-content-center align-items-center"
                onClick={handleTogglePublic}
              >
                {favourites.isPublic ? "Make Private" : "Make Public"}
              </button>

              <p>Share link:</p>
              <div className="input-group">
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={`${window.location.origin}/favourites/share/${favourites.share_token}`}
                />
                <button
                  className="btn btn-outline-secondary d-flex justify-content-center align-items-center"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/favourites/share/${favourites.share_token}`
                    );
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isLoggedIn && (
            <div className="col-md-2 d-flex align-items-start justify-content-end">
              <button
              type='button'
                onClick={handleDeleteAccount}
                className="btn btn-danger d-flex justify-content-center align-items-center"
              >
                Delete your account
              </button>
            </div>
          )}
    </div>
  </>
  )
}
