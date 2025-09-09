import { useEffect, useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Groups from './pages/Groups'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Reviews from './pages/Reviews'
import Search from './pages/Search'
import Showtimes from './pages/Showtimes'
import ReactPaginate from 'react-paginate'

function App() {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState (1)
  const [pageCount, setPageCount] = useState (0)
  const [query, setQuery] = useState('Star wars')

  const Movies = () =>{
    return (
      <table>
        <tbody>
        { movies && movies.map(movie => (
          <tr key={movie.id}><td>{movie.title}</td></tr>
        ))}
        </tbody>
      </table>
    )
  } 

  const search = () =>{
      fetch('https://api.themoviedb.org/3/search/movie?query=' + query + ' &include_adult=false&language=en-US&page=' + page,{
      headers:{
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYTJlNTY4M2NhYWFjZTEyN2FmMDQxNThhYTQ0NjIxZCIsIm5iZiI6MTc1NzQyMTQ1OS4xNjcsInN1YiI6IjY4YzAxZjkzMzI4NTRmMDZkYzljMGM5MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dSBy_osKCyQGYn2qlaIhVtop1BAykVrrgDpiBlIuVG8',
        'Content-Type' : 'application/json'
      }
    })
    .then (response => response.json())
    .then(json =>{
      //console.log(json)
      setMovies(json.results)
      setPageCount(json.total_pages)
    })
    .catch(error => {
      console.log(error)
    })
  }
  useEffect(() =>{
    search()
  }, [page])

  return (
    <>
    <Navbar/>
    <Header/>
    <div id="container">
      <h3>Search movies: </h3>
      <input value={query} onChange={e => setQuery(e.target.value)}></input><button onClick={search} type="button">Search</button>
      <ReactPaginate
      breakLabel="..."
      nextLabel=">"
      onPageChange={(e) => setPage(e.selected + 1)}
      pageRangeDisplayed={5}
      pageCount={pageCount}
      previousLabel="<"
      renderOnZeroPageCount={null}
      />
      <Movies/>
      <Routes>
        <Route path="/" exact element={<Home/>}/>
        <Route path="/favorites" exact element={<Favorites/>}/>
        <Route path="/groups" exact element={<Groups/>}/>
        <Route path="/*" exact element={<NotFound/>}/>
        <Route path="/profile" exact element={<Profile/>}/>
        <Route path="/reviews" exact element={<Reviews/>}/>
        <Route path="/search" exact element={<Search/>}/>
        <Route path="/showtimes" exact element={<Showtimes/>}/>
      </Routes>
    </div>
    <Footer/>
    </>
  )
}


export default App
