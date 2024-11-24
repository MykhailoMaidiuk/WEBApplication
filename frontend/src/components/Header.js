// src/components/Header.js
import React, { useState } from 'react';

function Header({ getBooks, cartItems, toggleCart, isAuthenticated }) {
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  const handleSubmit = (e) => {
    e.preventDefault();
    getBooksBySearch(searchTerm);
    setSearchTerm('');
  };

  const getBooksBySearch = async (query) => {
    try {
      const response = await fetch(
        `${API_URL}/books/search?query=${encodeURIComponent(query)}`
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
        {isAuthenticated && (
          <div className="header__cart" onClick={toggleCart}>
            <span className="header__cart-icon">🛒</span>
            <span className="header__cart-count">{cartItems}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
