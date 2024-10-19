import React from "react";
import { useTranslation } from "react-i18next";
import "../i18n.js";

function getClassByRate(rating) {
  if (rating >= 4) {
    return "green";
  } else if (rating >= 2.5) {
    return "orange";
  } else {
    return "red";
  }
}

function Book({ book }) {
  const { t } = useTranslation();

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
          {Array.isArray(book.categories) && book.categories.length
            ? t("Category: {{category}}", { category: book.categories.join(", ") })
            : t("No category")}
        </div>
        <div
          className={`book__average book__average--${getClassByRate(book.average_rating)}`}
        >
          {book.average_rating}
        </div>
      </div>
    </div>
  );
}

// Prop Types Validation
Book.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string,
    authors: PropTypes.string,
    categories: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    average_rating: PropTypes.number,
    thumbnail: PropTypes.string,
  }).isRequired,
};

export default Book;
