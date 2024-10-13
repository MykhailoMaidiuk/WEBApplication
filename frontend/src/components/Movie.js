// src/components/Movie.js
import React from 'react';

function getClassByRate(vote) {
  if (vote >= 7) {
    return 'green';
  } else if (vote > 5) {
    return 'orange';
  } else {
    return 'red';
  }
}

function Movie({ movie }) {
  return (
    <div className="movie">
      <div className="movie__cover-inner">
        <img
          src={movie.posterUrlPreview}
          className="movie__cover"
          alt={movie.nameRu}
        />
        <div className="movie__cover--darkened"></div>
      </div>
      <div className="movie__info">
        <div className="movie__title">{movie.nameRu}</div>
        <div className="movie__category">
          {movie.genres.map((genre) => ` ${genre.genre}`).join(', ')}
        </div>
        {movie.rating && (
          <div
            className={`movie__average movie__average--${getClassByRate(
              movie.rating
            )}`}
          >
            {movie.rating}
          </div>
        )}
      </div>
    </div>
  );
}

export default Movie;
