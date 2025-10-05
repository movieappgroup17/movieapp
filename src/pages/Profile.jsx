import { useState, useContext, useEffect } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'  // to notify user after login or signup
import 'react-toastify/dist/ReactToastify.css'
import { rejectRequest, acceptRequest } from '../components/GroupFunctions'

export default function Profile() {
  const { user, deleteAccount } = useContext(UserContext)
  const navigate = useNavigate()
  const [favourites, setFavourites] = useState(null)
  const [myGroups, setMyGroups] = useState([])
  const [myRequests, setMyRequests] = useState([])

  const isLoggedIn = sessionStorage.getItem('user')

  // Get userID from sessionStorage
  const userFromSessionStorage = JSON.parse(sessionStorage.getItem('user'))
  const userID = userFromSessionStorage?.userid // store in variable if found

  // function to fetch user's groups and group requests
  const fetchGroupsAndRequests = async () => {

    if(!userID) return  // does not fetch if user is not found

    try {
      // Fetches user's groups on his/hers Profile page
      const groupRes = await fetch(`${import.meta.env.VITE_API_URL}/groups/mygroups/${userID}`)
      const groupsData = await groupRes.json()
      setMyGroups(groupsData)

      // Fetches user's group requests on his/hers Profile page
      const requestRes = await fetch(`${import.meta.env.VITE_API_URL}/groups/pending/${userID}`)
      const requestData = await requestRes.json()
      setMyRequests(requestData)
    } catch (error) {
      console.error(error)
    }
  }

  // Fetches user's favourite list on his/hers Profile page
  const fetchFavourites = async () => {
  if (!userID) return
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/favourites/user/${userID}`)
    const data = await res.json()
    setFavourites(data)
  } catch (err) {
    console.error(err)
  }
}

  // fetch favourites when userID changes
  useEffect(() => {
    fetchFavourites()
  }, [userID])

  // Fetches groups and request when first uploading page
  useEffect(() => {
    fetchGroupsAndRequests()
  }, [userID])

  


  const handleDeleteAccount = async () => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        await deleteAccount(userFromStorage.token)
        navigate('/signin')
    }
  }

  // function to delete movie from favouritelist
  const deleteFavourite = async (movieID) => {
    console.log(movieID)
    console.log(userFromSessionStorage.token)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/favourites/${movieID}?userID=${userFromSessionStorage.userid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userFromSessionStorage.token}`
        },
        body: JSON.stringify({ userID: userFromSessionStorage.userid })
      })
      console.log(res.status, res.ok)
      // fetch favourites again after deletion
      if(res.ok) {
        fetchFavourites(setFavourites(prev => ({
        ...prev,
        movies: prev.movies.filter(m => m.movieID !== movieID)
      })))
      }

    } catch (err) {
      console.error(err)
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

  // function to handle request approval
  const handleAcceptRequest = async (requestid, groupid, userid) => {
  try {
    await acceptRequest(requestid, groupid, userid);
    toast.success("Request accepted!");
    fetchGroupsAndRequests(); // updates lists on page
  } catch (err) {
    console.error(err);
    toast.error("Error accepting request");
  }
  }

  // function to handle request rejection
  const handleRejectRequest = async (requestid) => {
  try {
    await rejectRequest(requestid);
    toast.info("Request rejected!");
    fetchGroupsAndRequests(); // update lists on page
  } catch (err) {
    console.error(err);
    toast.error("Error rejecting request");
  }
  }

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
                <li key={movie.movieID} className="mb-3 d-flex align-items-center gap-2">
                  <img
                    src={
                      `https://image.tmdb.org/t/p/w200${movie.imageURL}` ||
                      "https://placehold.co/100x150?text=No+Image"
                    }
                    alt={movie.title}
                    className="img-thumbnail mb-2"
                    style={{ width: "100px" }}
                  />
                  <h5>{movie.title}</h5>
                  <button onClick={() => deleteFavourite(movie.movieID)}>Delete</button>
                  
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

      {myGroups.length === 0 ? (
        <p>You don't have groups yet</p>
      ) : (
        <div id="mygroups" className='row'>
          <div id="grouplist" className='col-md-4'>
            <h1>My groups</h1>
            <ul className='list-unstyled'>
              {myGroups.map((group) => (
                <li key={group.groupid} className='mb-3'>
                  <h5 onClick={() => navigate(`/groups/${group.groupid}`)}>{group.groupname}</h5>
                  <p>My role: {group.role}</p>
                </li>
              ))}
            </ul>
          </div>
          {myRequests.length > 0 && 
          <div id="myrequests">
            <h1>Group requests</h1>
            <ul className='list-unstyled'>
              {myRequests.map((request) => (
                <li key={request.requestid} className='mb-3'>
                  <h5>{request.groupname}</h5>
                  <p>Made request: {request.nickname}</p>
                  <p>Request sent: {new Date(request.createdat).toLocaleDateString('fi-FI')}</p>
                  <button onClick={() => {handleAcceptRequest(request.requestid, request.groupid, request.userid)}}>Accept</button>
                  <button onClick={() =>{handleRejectRequest(request.requestid)}}>Reject</button>
                </li>
              ))}
            </ul>
          </div>}
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
