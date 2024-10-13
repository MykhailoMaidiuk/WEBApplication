// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MoviesList from './components/MoviesList';
import './index.css';

const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";

function App() {
  const [movies, setMovies] = useState([]);

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

  return (
    <div>
      <Header getMovies={getMovies} />
      <div className="container">
        <MoviesList movies={movies} />
      </div>
    </div>
  );
}

export default App;
