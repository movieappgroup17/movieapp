import React, { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import ReviewForm from '../components/ReviewForm'
import { UserContext } from '../context/UserContext'
import { useUser } from '../context/useUser'
import { useParams } from 'react-router-dom'
import './css/Reviews.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [movieData, setMovieData] = useState(null) // store TMDB info
  const { getReviews } = useContext(UserContext)
  const { user } = useUser()
  const { movieID } = useParams() // get movieID from /review/:movieID

  // Fetch all reviews (filtered by movieID if present)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewData = await getReviews()
        if (movieID) {
          setReviews(reviewData.filter(r => r.movieid.toString() === movieID))
        } else {
          setReviews(reviewData)
        }
      } catch (err) {
        console.error("Error fetching reviews:", err)
      }
    }
    fetchReviews()
  }, [getReviews, movieID])

  // Fetch TMDB info for this movie if movieID exists
  useEffect(() => {
    if (!movieID) return

    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movieID}?api_key=${TMDB_API_KEY}&language=en-US`
        )
        if (!res.ok) throw new Error("Failed to fetch movie info")
        const data = await res.json()
        setMovieData({
          title: data.title,
          poster_path: data.poster_path,
          overview: data.overview
        })
      } catch (err) {
        console.error(err)
      }
    }
    fetchMovie()
  }, [movieID])

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev])
  }

  return (
    <>
      <Header pageTitle={"Reviews"} />

      {/* Show movie info + form if movieID exists */}
      {movieID && movieData && user?.userid && (
        <div className="review-form-container mb-6">
          <h2 className="font-semibold mb-2">Review: {movieData.title}</h2>
          {movieData.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w200${movieData.poster_path}`}
              alt={movieData.title}
              className="rounded mb-2"
            />
          )}
          {movieData.overview && <p>{movieData.overview}</p>}

          <ReviewForm movieID={movieID} onReviewAdded={handleReviewAdded} />
        </div>
      )}

      <div className="reviews-container">
        {reviews.length === 0 ? (
          <p>No reviews found</p>
        ) : (
          reviews.map(review => (
            <div key={review.reviewid} className="review-card">
              <h3 className="movie-title">
                <a
                  href={`https://www.themoviedb.org/movie/${review.movieid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {review.title}
                </a>
              </h3>
              <div className="review-meta">
                <span>Reviewed by: {review.nickname}</span>
                <span>Date: {new Date(review.date).toLocaleDateString()}</span>
                <span className="rating">
                  {"★".repeat(review.stars)}
                  {"☆".repeat(5 - review.stars)}
                </span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))
        )}
      </div>
    </>
  )
}
