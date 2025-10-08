import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { getTrendingMovies } from '../components/SearchFunctions'
import './css/Home.css'

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([])

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    const movies = await getTrendingMovies()
    setTrendingMovies(movies)
  }

  return (
    <>
      <Header pageTitle="Home" />
      <div className="home-container">
        <h2>Trending movies this week</h2>
        <div className="movies-grid">
          {trendingMovies.map(movie => (
            <div key={movie.id} className="movie-card">
              {movie.poster_path && (
                <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} />
              )}
              <h4>
                <a href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank">{movie.title}</a>
              </h4>
              <p>{new Date(movie.release_date).toLocaleDateString('fi-FI')}</p>
              <span className="rating">
                {"★".repeat(Math.round(movie.vote_average / 2))}
                {"☆".repeat(5 - Math.round(movie.vote_average / 2))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
