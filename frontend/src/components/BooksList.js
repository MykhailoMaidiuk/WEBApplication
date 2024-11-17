import React, { useState } from "react";
import Book from "./Book";
import BookDetail from "./BookDetail";
import Pagination from "./Pagination"; // Import Pagination component

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8009"
    : "http://backend:8009";

function BooksList({ books, currentPage, totalPages, onPageChange, favorites, setFavorites, user }) {
  const [selectedBookIsbn, setSelectedBookIsbn] = useState(null);

  const handleBookClick = (isbn13) => {
    console.log("Selected ISBN:", isbn13);
    setSelectedBookIsbn(isbn13);
  };

  const handleAddToFavorite = async (isbn13) => {
  console.log("Přidávám knihu do oblíbených s ISBN:", isbn13);

  try {
    const response = await fetch(`${API_URL}/add_to_favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn13 }),
      credentials: "include",
    });

    if (response.ok) {
      const updatedFavorites = await response.json();
      console.log("Aktualizovaný seznam oblíbených knih:", updatedFavorites);

      // Pokud je v odpovědi objekt obsahující pole knih
      if (updatedFavorites && updatedFavorites.books) {
        setFavorites(updatedFavorites.books); // Předáme seznam knih
      } else {
        console.error("Odpověď neobsahuje pole knih.");
      }
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

  return (
    <div className="books">
      {selectedBookIsbn ? (
        <BookDetail isbn13={selectedBookIsbn} onBack={handleBack} />
      ) : (
        books.map((book) => (
          <div key={book.isbn13} onClick={() => handleBookClick(book.isbn13)}>
            <Book
              book={book}
              user={user}
              onFavorite={handleAddToFavorite}
              isFavorite={favorites.some((fav) => fav.isbn13 === book.isbn13)}
            />
          </div>
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default BooksList;
