import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n.js';

function Header({ getBooks }) {
  const { t, i18n } = useTranslation();
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
      console.error(t('Error searching for books'), error);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="container">
      <div className="header__content">
        <a href="/" className="header__logo">
          {t('Books')} {/* Translated "Books" */}
        </a>
        <form onSubmit={handleSubmit}>
          <input
            className="header__search"
            type="text"
            placeholder={t('Search...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className="language-switcher">
          <button onClick={() => changeLanguage('en')}>EN</button>
          <button onClick={() => changeLanguage('cs')}>CS</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
