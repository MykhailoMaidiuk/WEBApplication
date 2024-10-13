// src/components/MoviesList.js
import React from 'react';
import Movie from './Movie';

function MoviesList({ movies }) {
  return (
    <div className="movies">
      {movies.map((movie) => (
        <Movie key={movie.filmId} movie={movie} />
      ))}
    </div>
  );
}

export default MoviesList;
