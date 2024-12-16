import React, { useState } from "react";
import Book from "./Book";
import BookDetail from "./BookDetail";
import Pagination from "./Pagination"; // Import Pagination component

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8009"
    : "http://wea.nti.tul.cz:8009";

function BooksList({ books, currentPage, totalPages, onPageChange, favorites, toggleFavorite, user, addToCart }) {
  const [selectedBookIsbn, setSelectedBookIsbn] = useState(null);

  const handleBookClick = (isbn13) => {
    console.log("Selected ISBN:", isbn13);
    setSelectedBookIsbn(isbn13);
  };

  const handleAddToFavorite = async (book) => {
    console.log("Přidávám knihu do oblíbených s ISBN:", book.isbn13);

    try {
      const response = await fetch(`${API_URL}/add_to_favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
        credentials: "include",
      });

      if (response.ok) {
        const updatedFavorites = await response.json();
        console.log("Aktualizovaný seznam oblíbených knih:", updatedFavorites);
        setFavorites(updatedFavorites.books);
      } else {
        const errorText = await response.text();
        console.error("Chyba při přidávání knihy:", errorText);
      }
    } catch (error) {
      console.error("Chyba při komunikaci s API:", error);
    }
  };

  const handleBack = () => {
    setSelectedBookIsbn(null);
  };

  const booksClass = books.length <= 4 ? "few-books" : "";
  return (
    <div className={`books ${booksClass}`}>
      {selectedBookIsbn ? (
        <BookDetail isbn13={selectedBookIsbn} onBack={handleBack} user={user} />
      ) : (
        books.map((book) => (
          <div key={book.isbn13} onClick={() => handleBookClick(book.isbn13)}>
            <Book
              book={book}
              user={user}
              isFavorite={favorites?.some((fav) => fav.isbn13 === book.isbn13) || false}
              onFavorite={toggleFavorite}
              addToCart={addToCart}
            />
          </div>
        ))
      )}

      <div className="pagination">
        {!selectedBookIsbn && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
export default BooksList;