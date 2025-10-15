import { useState, useEffect, useContext, useCallback } from 'react'
import Header from '../components/Header'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { toast } from 'react-toastify'
import './css/Groups.css'
import { getGroupById, deleteGroup, checkIsGroupMember } from '../components/GroupFunctions'

export default function GroupPage() {
  const [group, setGroup] = useState(null)
  const [groupMovies, setGroupMovies] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [showTimes, setShowTimes] = useState({})
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const { id } = useParams()
  const navigate = useNavigate()
  const isLoggedIn = sessionStorage.getItem('user')

  // XML to JSON parser (from Showtimes.jsx)
  const xmlToJson = useCallback((node) => {
    const json = {}
    const children = [...node.children]
    if (!children.length) return node.innerHTML
    for (let child of children) {
      const hasSiblings = children.filter(c => c.nodeName === child.nodeName).length > 1
      if (hasSiblings) {
        if (!json[child.nodeName]) json[child.nodeName] = [xmlToJson(child)]
        else json[child.nodeName].push(xmlToJson(child))
      } else {
        json[child.nodeName] = xmlToJson(child)
      }
    }
    return json
  }, [])

  const parseXML = useCallback((xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    return xmlToJson(xmlDoc)
  }, [xmlToJson])

  // Fetch Finnkino theatre areas
  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
      .then(res => res.text())
      .then(xml => {
        const json = parseXML(xml)
        setAreas(json.TheatreAreas.TheatreArea)
      })
      .catch(console.error)
  }, [parseXML])

  // Fetch group & group movies
  useEffect(() => {
    fetchGroup()
    fetchGroupMovies()
  }, [id])

  const fetchGroup = async () => {
    const groupData = await getGroupById(id)
    setGroup(groupData)
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    if (userFromStorage) {
      const isOwner = groupData.ownerid === userFromStorage.userid
      const memberStatus = await checkIsGroupMember(id, userFromStorage.userid)
      if (!isOwner && !memberStatus) {
        toast.error('You are not a member of this group')
        navigate('/groups')
      }
    }
  }

  const fetchGroupMovies = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem('user'))
      const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/${id}/movies`)
      const data = await res.json()
      setGroupMovies(data)

      // Fetch user's member groups
      const resGroups = await fetch(`${import.meta.env.VITE_API_URL}/groups/user/${user.userid}`)
      const memberGroups = await resGroups.json()
      setUserGroups(memberGroups)
    } catch (err) {
      console.error('Error fetching group movies:', err)
    }
  }

  // Showtimes fetch for a movie
  const fetchShowTimesForMovie = async (movieTitle) => {
    if (!selectedArea) {
      toast.error('Please select a theatre area first')
      return
    }
    console.log(selectedArea)
    const dateStr = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`

    try {
      const res = await fetch(`https://www.finnkino.fi/xml/Schedule/?area=${selectedArea}&dt=${dateStr}`)
      const xml = await res.text()
      const json = parseXML(xml)

      let shows = json.Schedule?.Shows?.Show || []
      if (!Array.isArray(shows)) shows = [shows]

      // Filter by movie title (case-insensitive)
      const movieShows = shows.filter(show =>
        show.Title?.toLowerCase().includes(movieTitle.toLowerCase())
      )

      setShowTimes(prev => ({ ...prev, [movieTitle]: movieShows }))
    } catch (err) {
      console.error('Error fetching showtimes:', err)
      toast.error('Failed to fetch showtimes')
    }
  }

  const handleDeleteGroup = () => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    if (userFromStorage.userid !== group.ownerid) {
      alert('Only owner can delete this group!')
      return
    }
    if (window.confirm('Are you sure you want to delete this group?')) {
      deleteGroup(id)
      navigate('/groups')
    }
  }


  const handleAddMovie = async () => {
    const userFromStorage = JSON.parse(sessionStorage.getItem('user'))
    if (!userFromStorage) {
      toast.error('You must be logged in to add movies')
      return
    }

    const exampleMovieID = 11
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/groups/${id}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieID: exampleMovieID,
          addedBy: userFromStorage.userid,
          showtime: null,
          theatre: null
        })
      })
      toast.success('Movie added to group')
      fetchGroupMovies()
    } catch (err) {
      console.error('Error adding movie:', err)
    }
  }

  if (!group) return null

  return (
    <>
      <Header pageTitle={group.groupname} />
      <div id='groupinfo'>
        <h2>{group.groupname}</h2>
        <p>Owner: {group.owner}</p>
        <p>{group.description}</p>
        {isLoggedIn && (
          <>
            <button id='deleteBtn' onClick={handleDeleteGroup}>Delete this group</button>
            <button onClick={() => navigate('/groups')}>Go back</button>
            <GroupMembers groupID={id}/>
          </>
        )}

        {/* Theatre selection for showtimes */}
        <div style={{ margin: '10px 0' }}>
          <label>Select theatre: </label>
          <select className='theatre-select' onChange={e => setSelectedArea(e.target.value)} value={selectedArea || ''}>
            <option value="" disabled>Choose theatre</option>
            {areas.map(area => (
              <option key={area.ID} value={area.ID}>{area.Name}</option>
            ))}
          </select>
        </div>

        <h3 className="group-movies-title">Movies in this group</h3>
        {groupMovies.length > 0 ? (
          <ul>
            {groupMovies.map(movie => (
              <li key={movie.id} style={{ marginBottom: '15px' }}>
                <strong>{movie.title}</strong>
                {movie.showtime && <> — {new Date(movie.showtime).toLocaleString()} @ {movie.theatre}</>}
                <span> (added by {movie.added_by})</span>

                <div>
                  <button onClick={() => fetchShowTimesForMovie(movie.title)}>
                    Show Showtimes
                  </button>
                </div>

                {/* Render showtimes */}
                {showTimes[movie.title]?.length > 0 && (
                  <ul>
                    {showTimes[movie.title].map((show, i) => (
                      <li key={i}>
                        {show.dttmShowStart ? new Date(show.dttmShowStart).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) : 'No time'} — {show.TheatreAuditorium || 'No auditorium'}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No movies added yet</p>
        )}
      </div>
    </>
  )
}
function GroupMembers({ groupID }) {
  const [ownerID, setOwnerID] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null')
const currentUserID = String(currentUser?.userid ?? currentUser?.userID ?? currentUser?.id ?? '')

  const showMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/${groupID}/members`)
      if (!res.ok) throw new Error(`Failed to fetch members: ${res.status}`)
      const data = await res.json()
      setOwnerID(data.ownerID)
      setMembers(Array.isArray(data.members) ? data.members : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [groupID])

  useEffect(() => {
    showMembers()
  }, [showMembers])


  const handleRemove = async (userID) => {
    if (!window.confirm('Remove this member from the group?')) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupid: groupID, userid: userID, ownerid: currentUserID })
      })
      if (!res.ok) {
        let errJson = null
        try { errJson = await res.json() } catch { }
        throw new Error(errJson?.error || `Remove failed: ${res.status}`)
      }
      setMembers((prev) => prev.filter((m) => m.userID !== userID))
    } catch (e) {
      alert(e.message)
    }
  }

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/groups/leave`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupid: groupID, userid: currentUserID })
      })
      if (!res.ok) {
        let errJson = null
        try { errJson = await res.json() } catch { }
        throw new Error(err?.error || `Leave failed: ${res.status}`)
      }
      setMembers((prev) => prev.filter((m) => m.userID !== currentUserID))
      navigate('/groups')
    } catch (e) {
      alert(e.message)
    }
  }

  const isOwner = ownerID != null && String(currentUserID) === String(ownerID)

  if (loading) return <div>Loading members…</div>
  if (error) return <div style={{ color: 'crimson' }}>Error: {error}</div>
  console.log({ currentUserID, ownerID, members })



  return (
    <>
      <div className="group-members">
        <h3>Members</h3>
        <button onClick={showMembers} aria-label="Refresh members">Refresh</button>
      </div>

      <ul className="member-list">
        {members.map((m) => {
          const isSelf = String(m.userID) === String(currentUserID)
          const ownerRemovesUser = isOwner && !isSelf // owner cannot remove themselves
          const memberLeaves = isSelf && !isOwner    // owner cannot leave

          return (
            <li key={m.userID} className="member-row">
              <div className="info">
                <span className="nickname">{m.nickname}</span>
                {String(m.userID) === String(ownerID) && <span className="badge">owner</span>}
                {m.role && String(m.userID) !== String(ownerID) && <span className="muted">({m.role})</span>}
              </div>

              <div className="actions">
                {ownerRemovesUser && (
                  <button onClick={() => handleRemove(m.userID)}>
                    Remove from group
                  </button>
                )}
                {memberLeaves && (
                  <button onClick={handleLeave}> Leave the group</button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}