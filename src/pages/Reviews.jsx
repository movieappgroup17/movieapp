import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm.jsx";
import { useUser } from "../context/useUser";
import { useLocation, useParams } from "react-router-dom";
import { UserContext } from '../context/UserContext'
import './css/Reviews.css'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Reviews() {
  // component for fetching reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewData = await getReviews()
      setReviews(reviewData)
    }
    fetchReviews()
  }, [])

  const { user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [tmdbMovies, setTmdbMovies] = useState({});

  const { movieID: locationMovieID, title, poster, overview } = useLocation().state || {};
  const { movieID: paramMovieID } = useParams();
  const movieID = paramMovieID || locationMovieID;

  useEffect(() => {
    if (!user?.userid) return;

    fetch(`http://localhost:3001/reviews/user/${user.userid}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then(data => setReviews(data))
      .catch(err => console.error("Error fetching user reviews:", err));
  }, [user]);

  useEffect(() => {
    if (reviews.length === 0) return;

    const uniqueMovieIDs = [...new Set(reviews.map(r => r.movieid))];

    async function fetchTMDBMovies() {
      const movies = {};
      await Promise.all(
        uniqueMovieIDs.map(async id => {
          try {
            const res = await fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`
            );
            if (!res.ok) throw new Error(`Failed to fetch TMDB for movie ${id}`);
            const data = await res.json();
            movies[id] = {
              title: data.title,
              poster_path: data.poster_path,
              overview: data.overview
            };
          } catch (err) {
            console.error(err);
          }
        })
      );
      setTmdbMovies(movies);
    }

    fetchTMDBMovies();
  }, [reviews]);

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
                <a href={`https://www.themoviedb.org/movie/${review.movieid}`} target="_blank">{review.title}</a>
              </h3>
              <div className="review-meta">
                <span>Reviewed by: {review.nickname}</span>
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
