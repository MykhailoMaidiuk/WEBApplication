// src/components/Header.js
import React, { useState } from 'react';

function Header({ getBooks }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    getBooksBySearch(searchTerm);
    setSearchTerm('');
  };

  const getBooksBySearch = async (query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/books/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      getBooks(data);
    } catch (error) {
      console.error('Ошибка при поиске книг:', error);
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
