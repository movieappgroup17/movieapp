import React, { useState, useEffect, useContext } from 'react'
import Header from '../components/Header'
import { UserContext } from '../context/UserContext'
import './css/Reviews.css'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const { getReviews } = useContext(UserContext)

  // component for fetching reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewData = await getReviews()
      setReviews(reviewData)
    }
    fetchReviews()
  }, [])

  return (
    <>
      <Header pageTitle={"Reviews"}/>
      <div className="reviews-container">
        {reviews.length === 0 ? (
          <p>No reviews found</p>
        ) : (
          reviews.map(review => (
            <div key={review.reviewid} className="review-card">
              <h3 className="movie-title">
                <a href={`https://www.themoviedb.org/movie/${review.movieid}`} target="_blank">{review.name}</a>
              </h3>
              <div className="review-meta">
                <span>Reviewed by: {review.email}</span>
                <span>Date: {new Date(review.date).toLocaleDateString()}</span>
                <span className="rating">{"★".repeat(review.stars)}{"☆".repeat(5-review.stars)}</span>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))
        )}
      </div>
    </>
  )
}
