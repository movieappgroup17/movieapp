import { useState, useEffect } from 'react'
import { SearchBar } from '../components/SearchBar.jsx'
import { discoverMovies, searchMoviesByText } from '../components/SearchFunctions'
import ReactPaginate from 'react-paginate'
import Header from '../components/Header'
import './css/search.css'
import ToggleFav from '../components/Favourites.jsx'
import ReviewsList from '../components/ReviewsList.jsx'
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { useFavourites } from '../context/useFavourites.jsx'

function Search() {
  const [results, setResults] = useState([])
  const [movieIDs, setMovieIDs] = useState({})
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [userGroup, setUserGroup] = useState(null)
  const [loadingGroup, setLoadingGroup] = useState(true)
  const { favourites, setFavourites, loadingFavs } = useFavourites()

  const navigate = useNavigate()

  
  const defaultFilters = {
    genres: [],
    year: "",
    query: "",
    sort: "popularity.desc"
  }

  const [filters, setFilters] = useState(defaultFilters)
  const user = JSON.parse(sessionStorage.getItem('user'))

  // function to handle movie choice with Toggle -button
  async function handleToggleMovieChoice(m) {
    if (!m.id || movieIDs[m.id]) return // skip if already fetched
        try {
          // check if movie is found in database and return it
          // if it is not in database, insert it to database 
          const res = await fetch(`http://localhost:3001/movies/getOrCreate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tmdbId: m.id,
              title: m.title,
              release_date: m.release_date,
              overview: m.overview,
              imageURL: m.poster_path

            })
          })
          const dbData = await res.json()
          return dbData.movieid
        } catch (err) {
          console.error("Failed to get movieID for", m.id, err)
        }
    }

    // function to handle movie choice in review -button
  async function handleMovieChoice(m) {
      if (!m.id || movieIDs[m.id]) return // skip if already fetched
        try {
          // check if movie is found in database and return it
          // if it is not in database, insert it to database 
          const res = await fetch(`http://localhost:3001/movies/getOrCreate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tmdbId: m.id,
              title: m.title,
              release_date: m.release_date,
              overview: m.overview,
              imageURL: m.poster_path
            })
          })
          const dbData = await res.json()

          // after getting movieid, go to review form to give a review
          if (dbData.movieid) {
            navigate(`/review/${dbData.movieid}`, {
              state: {
                title: m.title,
                poster: m.poster_path,
                overview: m.overview
              }
            })
          }
        } catch (err) {
          console.error("Failed to get movieID for", m.id, err)
        }
    }

    useEffect(() => {
    if (!user) return

    const fetchUserGroups = async () => {
      try {
        const resAll = await fetch('http://localhost:3001/groups/')
        const allGroups = await resAll.json()

        //Check if the user is a memvber of a group
        for (let g of allGroups) {
          const resCheck = await fetch(`http://localhost:3001/groups/${g.groupid}/members/${user.userid}`)
          const checkData = await resCheck.json()
          if (checkData.isMember){
            setUserGroup(g)
            break
          } 
        }
      } catch (err) {
        console.error('Failed to fetch user group:', err)
      } finally{
        setLoadingGroup(false)
      }
    }

    fetchUserGroups()
  }, [user])

  // Handler to add movie to a group
  const handleAddToGroup = async (movie) => {
    if (!user || !userGroup) return

    try {
      const resMovie = await fetch('http://localhost:3001/movies/getOrCreate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          overview: movie.overview
        })
      })
      const dbMovie = await resMovie.json()

      // Add movie to group
      await fetch(`http://localhost:3001/groups/${userGroup.groupid}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieID: dbMovie.movieid,
          addedBy: user.userid,
          showtime: null,
          theatre: null
        })
      })

      toast.success(`${movie.title} added to "${userGroup.groupname}"!`)
    } catch (error) {
      console.error('Error adding movie to group:', error)
      toast.error('Failed to add movie to group')
    }
  }
   
//Search function
  async function runSearch(newFilters, newPage = 1) {
    setFilters (newFilters)
    setPage (newPage)
    setLoading(true)
    setErr(null)

    try {
      let data;
      if (newFilters.query) {
        data = await searchMoviesByText({ query: newFilters.query, page: newPage })
        let filtered = data.results ?? []

        if (newFilters.year) {
          filtered = filtered.filter(m => m.release_date?.startsWith(newFilters.year))
        }
        if (newFilters.genres.length) {
          filtered = filtered.filter(m => m.genres_ids?.some(g => newFilters.genres.includes(g)))
        }
        if (newFilters.sort === "release_date.desc") {
          filtered = [...filtered].sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
        }
        if (newFilters.sort === "vote_average.desc") {
          filtered = [...filtered].sort((a, b) => b.vote_average - a.vote_average)
        }

        data.results = filtered
      }
      setResults(data?.results ?? [])
      setPageCount(data?.total_pages ?? 0)
      setPage (newPage)
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header pageTitle={"Search"} />
      <div id="searchbar-container">
        <SearchBar defaultValues={defaultFilters} onSearch={runSearch} />

        {loading && <p>Loading…</p>}
        {err && <p>Failed: {String(err.message || err)}</p>}

        <div id="movieContainer">
          {results.map((m) => (
          <div key={m.id} id="movieCard">
          {m.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
          alt={m.title}
        />
      )} 
           
            <div id="movieTitle">{m.title}</div>
            <div>{m.release_date}</div>
            <div id="movieDescription"> {m.overview && <p>{m.overview}</p>}</div>
            <ToggleFav 
              movie={m}
              favourites={favourites}
              setFavourites={setFavourites}
              onEnsureInDb={handleToggleMovieChoice}
              loadingFavs={loadingFavs}
            />
            <button onClick={() => handleMovieChoice(m)}>
              Review this movie
            </button>
            {/* Add to Group Button */}
            {!loadingGroup && userGroup && (
            <button onClick={() => handleAddToGroup(m)}>
            Add to "{userGroup.groupname}"
            </button>
            )}  
          </div>
        ))}
        
      </div>

      {pageCount > 1 &&(
        <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={(e) => runSearch(filters, e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName='pagination'
        activeClassName='selected'
        forcePage={page -1}
        />
      )}
    </div>
    </>
  );
}

export { Search }