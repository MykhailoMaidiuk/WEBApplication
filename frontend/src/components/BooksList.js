import React, { useState } from "react";
import Book from "./Book";
import BookDetail from "./BookDetail";

function BooksList({ books }) {
  const [selectedBookIsbn, setSelectedBookIsbn] = useState(null);

  const handleBookClick = (isbn13) => {
    console.log("Selected ISBN:", isbn13);
    setSelectedBookIsbn(isbn13);
  };

  const handleBack = () => {
    setSelectedBookIsbn(null);
  };

  return (
    <div className="books">
      {selectedBookIsbn ? (
        <BookDetail isbn13={selectedBookIsbn} onBack={handleBack} />
      ) : (
        books.map((book) => (
          <div key={book.isbn13} onClick={() => handleBookClick(book.isbn13)}>
            <Book book={book} />
          </div>
        ))
      )}
    </div>
  );
}

export default BooksList;
