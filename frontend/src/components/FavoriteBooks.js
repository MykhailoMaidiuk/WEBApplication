import React, { useState, useEffect } from "react";
import Book from "./Book";
import Pagination from "./Pagination"; // Komponenta pro stránkování
import { useTranslation } from "react-i18next";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8009"
    : "http://wea.nti.tul.cz:8009";

function FavoriteBooks({ user, favorites = [], setFavorites }) {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    // Načítání oblíbených knih
    fetch(`${API_URL}/favorites?page=${currentPage}&page_size=10`, {credentials: "include"})
      .then((response) => response.json())
      .then((data) => {
        setBooks(data.books);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
      });
  }, [currentPage]);

  const toggleFavorite = async (book) => {
    console.log("toggleFavorite voláno pro knihu:", book); // Přidání logu pro diagnostiku
    const isAlreadyFavorite = favorites.some((fav) => fav.isbn13 === book.isbn13);

    try {
      if (isAlreadyFavorite) {
        // Odebrání z oblíbených
        const response = await fetch(`${API_URL}/remove_from_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13: book.isbn13 }),
          credentials: "include", // Zajišťuje odesílání cookies
        });

        if (response.ok) {
          console.log("Kniha úspěšně odebrána z oblíbených");
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.isbn13 !== book.isbn13)
          );
        } else {
          console.error("Chyba při odebrání z oblíbených", await response.text());
        }
      } else {
        // Přidání do oblíbených
        const response = await fetch(`${API_URL}/add_to_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13: book.isbn13 }),
          credentials: "include",
        });

        if (response.ok) {
          console.log("Kniha úspěšně přidána do oblíbených");
          setFavorites((prevFavorites) => [...prevFavorites, book]);
        } else {
          console.error("Chyba při přidávání do oblíbených", await response.text());
        }
      }
    } catch (error) {
      console.error("Chyba při přepínání oblíbených", error);
    }
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="favorite-books">
      <h1>{t("Favorite Books")}</h1>
      {books.length > 0 ? (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.isbn13} className="book-item">
              <Book
                book={book}
                user={user}
                onFavorite={toggleFavorite}
                isFavorite={favorites?.some((fav) => fav.isbn13 === book.isbn13) || false}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>{t("No favorite books yet.")}</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default FavoriteBooks;