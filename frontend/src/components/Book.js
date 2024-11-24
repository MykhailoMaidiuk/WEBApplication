import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../i18n.js";

function getClassByRate(rating) {
  return rating >= 4 ? "green" : rating >= 2.5 ? "orange" : "red";
}

function Book({ book, user, onFavorite, isFavorite }) {
  const { t } = useTranslation();

  const handleFavoriteClick = (event) => {
    event.stopPropagation(); // Prevent the click from bubbling up and triggering the handleBookClick
    onFavorite(book);
  };

  return (
    <div className="book">
      <div className="book__cover-inner">
        <img
          src={book.thumbnail || "https://via.placeholder.com/150"}
          className="book__cover"
          alt={t("Book cover for {{title}}", { title: book.title || t("Untitled") })}
        />
        <div className="book__cover--darkened"></div>
      </div>
      <div className="book__info">
        <div className="book__title">{book.title}</div>
        <div className="book__author">{book.authors || t("Unknown Author")}</div>
        <div className="book__category">
          {book.categories && book.categories.length > 0
            ? t("Category: {{category}}", { category: book.categories.join(", ") })
            : t("No category")}
        </div>
        {user && (
          <button
            className="favorite-button"
            onClick={handleFavoriteClick} // Use the new function here
            disabled={isFavorite} // Tlačítko je deaktivováno, pokud je kniha již oblíbená
          >
            {isFavorite ? t("In Favorites") : t("Add to Favorites")}
          </button>
        )}
        <div className={`book__average book__average--${getClassByRate(book.average_rating)}`}>
          {book.average_rating}
        </div>
      </div>
    </div>
  );
}


Book.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string,
    authors: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    average_rating: PropTypes.number,
    thumbnail: PropTypes.string,
    isbn13: PropTypes.string.isRequired,
  }).isRequired,
  onFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  user: PropTypes.object, // Uživatelský objekt může být null, pokud není přihlášen
};

export default Book;
