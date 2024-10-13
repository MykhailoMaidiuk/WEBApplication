import React, { useState, useEffect } from "react";
import "./styles.css";

const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";
const API_URL_SEARCH =
  "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";

const App = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getMovies(API_URL_POPULAR);
  }, []);

  const getMovies = async (url) => {
    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
    });
    const respData = await resp.json();
    setMovies(respData.films);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      getMovies(`${API_URL_SEARCH}${searchTerm}`);
      setSearchTerm("");
    }
  };

  const getClassByRate = (vote) => {
    if (vote >= 7) return "green";
    if (vote > 5) return "orange";
    return "red";
  };

  return (
    <div className="container">
      <header>
        <h1>Movies</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="header__search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </header>
      <div className="movies">
        {movies.map((movie) => (
          <div key={movie.filmId} className="movie">
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
                {movie.genres.map((genre) => ` ${genre.genre}`)}
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
        ))}
      </div>
    </div>
  );
};

export default App;
