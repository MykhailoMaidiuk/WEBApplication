// src/components/BooksList.js
import React from 'react';
import Book from './Book';

function BooksList({ books }) {
  return (
    <div className="books">
      {books.map((book) => (
        <Book key={book.isbn13} book={book} />
      ))}
    </div>
  );
}

export default BooksList;
