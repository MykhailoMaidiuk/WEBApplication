// src/components/BooksList.js
import React from 'react';
import Book from './Book';

function BooksList({ books, addToCart }) {
  return (
    <div className="books">
      {books.map((book) => (
        <Book key={book.isbn13} book={book} addToCart={addToCart} />
      ))}
    </div>
  );
}

export default BooksList;
