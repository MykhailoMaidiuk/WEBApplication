import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../i18n.js";
import "../index.css"; // Ensure CSS is applied

function BookDetail({ isbn13, onBack }) {
  const { t } = useTranslation();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/books/${isbn13}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
        } else {
          setError(t("Error: Unable to fetch book details."));
        }
      } catch (error) {
        setError(t("Network error: {{message}}", { message: error.message }));
      } finally {
        setIsLoading(false);
      }
    };

    if (isbn13) {
      fetchBookDetail();
    } else {
      setError(t("No ISBN provided"));
      setIsLoading(false);
    }
  }, [isbn13, t]);

  if (isLoading) return <div className="text-lg text-white">{t("Loading...")}</div>;

  if (error) return <div className="text-red-500">{error}</div>;

  if (!book) return null;

  return (
    <div>
      <button
        onClick={onBack}
        className="px-4 py-2 mt-4 mb-6 bg-gray-700 rounded hover:bg-gray-600 text-center mx-auto block"
      >
        {t("Back to List")}
      </button>

      <div className="book-detail__content">
        <div className="book-detail__cover-container">
          <img
            src={book.thumbnail || "https://via.placeholder.com/200"}
            alt={t("Book cover for {{title}}", { title: book.title || t("Untitled") })}
            className="book-detail__cover"
          />
        </div>

        <div className="book-detail__info text-center">
          <h1 className="book__title text-3xl font-bold mt-4">{book.title}</h1>
          {book.subtitle && (
            <h2 className="text-xl text-gray-300 italic mt-2">{book.subtitle}</h2>
          )}

          <div className="mt-4">
            <p className="text-lg">
              <span className="font-semibold">{t("Author(s):")}</span>{" "}
              {book.authors || t("Unknown Author")}
            </p>
            <p>
              <span className="font-semibold">{t("Published Year:")}</span> {book.published_year}
            </p>
            <p className="text-yellow-500">
              <span className="font-semibold">{t("Category:")}</span>{" "}
              {Array.isArray(book.categories) && book.categories.length
                  ? book.categories.join(", ")
                  : t("No category")}
            </p>
            <p className="mt-2">
              <span className="font-semibold">{t("Rating:")}</span>{" "}
              {book.average_rating || t("No rating available")}
            </p>
          </div>

          {book.description && (
              <div className="book-detail__description-box mt-6 p-4 border border-gray-600 rounded-lg">
              <h3 className="text-xl font-bold text-yellow-500 mb-3">{t("Description")}</h3>
              <p className="text-gray-300 leading-relaxed">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

BookDetail.propTypes = {
  isbn13: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default BookDetail;
