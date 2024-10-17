// src/components/Book.js
import React from 'react';

function getClassByRate(rating) {
  if (rating >= 4) {
    return 'green';
  } else if (rating >= 2.5) {
    return 'orange';
  } else {
    return 'red';
  }
}

function Book({ book }) {
  return (
    <div className="book">
      <div className="book__cover-inner">
        <img
          src={book.thumbnail || 'https://via.placeholder.com/150'}
          className="book__cover"
          alt={book.title}
        />
        <div className="book__cover--darkened"></div>
      </div>
      <div className="book__info">
        <div className="book__title">{book.title}</div>
        <div className="book__category">
          {book.categories || 'No category'}
        </div>
        {book.average_rating && (
          <div
            className={`book__average book__average--${getClassByRate(
              book.average_rating
            )}`}
          >
            {book.average_rating}
          </div>
        )}
      </div>
    </div>
  );
}

export default Book;
