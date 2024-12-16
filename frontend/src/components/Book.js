import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../i18n.js";

function getClassByRate(rating) {
  return rating >= 4 ? "green" : rating >= 2.5 ? "orange" : "red";
}

function Book({ book, user, onFavorite, isFavorite, addToCart }) {
  const { t } = useTranslation();

  const handleClick = (event) => {
    event.stopPropagation();
    onFavorite(book);
  };

  const handleAddToCartClick = (event) => {
    event.stopPropagation();
    addToCart(book);
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
        <div className="book__title">{book.title || t("Untitled")}</div>
        <div className="book__author">{book.authors || t("Unknown Author")}</div>
        <div className="book__category">
          {book.categories && book.categories.length > 0
            ? t("Category: {{category}}", { category: book.categories.join(", ") })
            : t("No category")}
        </div>

        {book.price ? (
          <div className="book__price">
            {`${t("Price:")} ${book.price} ${t("CZK")}`}
          </div>
        ) : (
          <div className="book__price">
            {t("Not in stock")}
          </div>
        )}

        {user && (
          <div className="book__buttons">
            <button
              className="book__add-to-cart"
              onClick={handleAddToCartClick}
            >
              {t("Add to cart")}
            </button>
            <button
              className="book__add-to-favorites"
              onClick={handleClick}
            >
              {isFavorite ? t("Remove from Favorites") : t("Add to Favorites")}
            </button>
          </div>
        )}

        <div className={`book__average book__average--${getClassByRate(book.average_rating)}`}>
          {book.average_rating || t("No rating available")}
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
    price: PropTypes.number,
  }).isRequired,
  onFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  user: PropTypes.object,
  addToCart: PropTypes.func.isRequired,
};

export default Book;