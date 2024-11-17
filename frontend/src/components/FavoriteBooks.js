import React, { useEffect, useState } from "react";
import Book from "./Book";
import Header from "./Header";
import { useTranslation } from "react-i18next";

function FavoriteBooks() {
  const [favorites, setFavorites] = useState({ books: [] });
  const { t } = useTranslation();

  fetch('/api/favorites')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Favorites:', data);
    })
    .catch(error => {
      console.error('Error fetching favorites:', error);
    });

  return (
    <div className="favorite-books">
      {favorites.books.length > 0 ? (
        favorites.books.map((book) => (
          <Book key={book.isbn13} book={book} />
        ))
      ) : (
        <p>{t("No favorite books yet.")}</p>
      )}
    </div>
  );
}
export default FavoriteBooks;
