import React from "react";

export default function ReviewsList({ reviews = [], tmdbMovies = {} }) {
  if (!reviews || reviews.length === 0) return <p>No reviews to show.</p>

  return (
    <div>
      {reviews.map(r => {
        const tmdb = tmdbMovies[r.movieid]; // TMDB info for this movie
        return (
          <div key={r.reviewid} className="review-card">
            <strong>{r.usernickname || r.useremail || "Anonymous"}</strong> — ⭐ {r.stars}/5
            <p>{r.text}</p>

            {r.movietitle && <small>Movie: {r.movietitle}</small>}

            {tmdb?.poster_path && (
              <div className="my-2">
                <img
                  src={`https://image.tmdb.org/t/p/w200${tmdb.poster_path}`}
                  alt={r.movietitle || tmdb.title}
                  className="rounded w-32"
                />
              </div>
            )}

            {tmdb?.overview && <p className="text-sm italic">{tmdb.overview}</p>}

            <small>{new Date(r.date).toLocaleDateString()}</small>
          </div>
        )
      })}
    </div>
  )
}
