// src/components/Header.js
import React, { useState } from 'react';

function Header({ getMovies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL_SEARCH =
    "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      getMovies(`${API_URL_SEARCH}${searchTerm}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="container">
      <div className="header__content">
        <a href="/" className="header__logo">
          Books
        </a>
        <form onSubmit={handleSubmit}>
          <input
            className="header__search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}

export default Header;
