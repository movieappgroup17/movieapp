import { useState, useEffect, useContext, useCallback } from 'react'
import Header from '../components/Header'
import { useParams, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { toast } from 'react-toastify'
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
      const res = await fetch(`http://localhost:3001/groups/${id}/movies`)
      const data = await res.json()
      setGroupMovies(data)

      // Fetch user's member groups
      const resGroups = await fetch(`http://localhost:3001/groups/user/${user.userid}`)
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
    const dateStr = `${currentDate.getDate().toString().padStart(2,'0')}.${(currentDate.getMonth()+1).toString().padStart(2,'0')}.${currentDate.getFullYear()}`

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
      await fetch(`http://localhost:3001/groups/${id}/movies`, {
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
      <div>
        <h2>{group.groupname}</h2>
        <p>Owner: {group.owner}</p>
        <p>{group.description}</p>
        {isLoggedIn && (
          <>
            <button onClick={handleDeleteGroup}>Delete this group</button>
            <button onClick={() => navigate('/groups')}>Go back</button>
          </>
        )}

        {/* Theatre selection for showtimes */}
        <div style={{ margin: '10px 0' }}>
          <label>Select theatre: </label>
          <select onChange={e => setSelectedArea(e.target.value)} value={selectedArea || ''}>
            <option value="" disabled>Choose theatre</option>
            {areas.map(area => (
              <option key={area.ID} value={area.ID}>{area.Name}</option>
            ))}
          </select>
        </div>

        <h3>Movies in this group</h3>
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
                        {show.dttmShowStart ? new Date(show.dttmShowStart).toLocaleTimeString('fi-FI', {hour:'2-digit', minute:'2-digit'}) : 'No time'} — {show.TheatreAuditorium || 'No auditorium'}
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