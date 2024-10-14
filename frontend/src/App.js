// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BooksList from './components/BooksList';
import './index.css';

function App() {
  const [books, setBooks] = useState([]);

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка при получении данных книг:', error);
    }
  };

  return (
    <div>
      <Header getBooks={setBooks} />
      <div className="container">
        <BooksList books={books} />
      </div>
    </div>
  );
}

export default App;
