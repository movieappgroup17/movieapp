import React from "react";

export default function ReviewsList({ reviews, tmdbMovies = {} }) {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews to show.</p>
  }

  return (
    <div>
      <h3>Reviews</h3>
      {reviews.map(r => {
        console.log("single review:", r)
        const tmdb = tmdbMovies[r.movieid]
        return (
          <div key={r.reviewid} className="border p-2 my-2">
            <strong>{r.useremail || "Anonymous"}</strong> — ⭐ {r.stars}/5
            <p>{r.text}</p>

            {r.movietitle || tmdb?.title ? (
              <small>Movie: {r.movietitle || tmdb.title}</small>
            ) : null}

            {tmdb?.poster_path && (
              <div className="my-2">
                <img
                  src={`https://image.tmdb.org/t/p/w200${tmdb.poster_path}`}
                  alt={r.movietitle || tmdb.title}
                  className="rounded"
                />
              </div>
            )}
            {tmdb?.overview && (
              <p className="text-sm italic">{tmdb.overview}</p>
            )}
            {r.date && (
              <small>{new Date(r.date).toLocaleDateString()}</small>
            )}
          </div>
        )
      })}
    </div>
  );
}
