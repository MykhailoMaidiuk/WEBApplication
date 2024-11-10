import React, { useState } from "react";
import Book from "./Book";
import BookDetail from "./BookDetail";
import Pagination from "./Pagination"; // Import Pagination component

function BooksList({ books, currentPage, totalPages, onPageChange }) {
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

      {/* Pagination controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default BooksList;
