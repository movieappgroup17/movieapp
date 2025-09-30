import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm.jsx";
import { useUser } from "../context/useUser";
import { useLocation, useParams } from "react-router-dom";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Reviews() {
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
      <Header pageTitle="My Reviews" />
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">Your Reviews</h2>

        {user?.userid && movieID && (
        <ReviewForm
        tmdbMovies={{
        [movieID]: { title, poster_path: poster, overview }
        }}
        movieID={movieID}
        onReviewAdded={newReview => setReviews(prev => [newReview, ...prev])}
        />
        )}

        {reviews.length === 0 ? (
          <p>You haven't written any reviews yet.</p>
        ) : (
          <ReviewsList reviews={reviews} tmdbMovies={tmdbMovies} />
        )}
      </div>
    </>
  );
}
