// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BooksList from './components/BooksList';
import './index.css';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    try {
      // Напрямую используем URL API
      const response = await fetch('http://localhost:8009/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Ошибка при получении данных книг:', error);
    }
  };

  return (
    <div>
      <Header getBooks={getBooks} />
      <div className="container">
        <BooksList books={books} />
      </div>
    </div>
  );
}

export default App;
