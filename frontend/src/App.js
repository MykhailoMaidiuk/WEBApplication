// src/App.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import Header from './components/Header';
import BooksList from './components/BooksList';
import './index.css';
import './i18n';

function App() {
  const { t, i18n } = useTranslation(); // Use the translation hook for managing language
  const [books, setBooks] = useState([]);

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  useEffect(() => {
  console.log('Current language:', i18n.language);
  getBooks();
}, [i18n.language]);

  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(t('Error fetching books'), error); // Localize error message
    }
  };

  // Function to change language
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      {/* Language Switcher */}
      <div className="language-switcher">
        <button onClick={() => changeLanguage('en')} className="language-btn">EN</button>
        <button onClick={() => changeLanguage('cs')} className="language-btn">CS</button>
      </div>

      {/* Header and Main Content */}
      <Header getBooks={setBooks} />
      <div className="container">
        <BooksList books={books} />
      </div>
    </div>
  );
}

export default App;
