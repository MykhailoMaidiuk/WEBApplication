import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import "../i18n.js";
import "../index.css";
import BookComments from "./BookComments"; // Ensure CSS is applied

let rat1ng=0;
function getClassByRate(rating) {
  return rating >= 4 ? "green" : rating >= 2.5 ? "orange" : "red";
}

function BookRating({ isbn13, averageRating, ratingsCount, onUpdateRating, user}) {
  const { t } = useTranslation(); // Použití pro překlady
  const [userRating, setUserRating] = useState(0);
  const [currentUserRating, setCurrentUserRating] = useState(null);
  const [rating, setRating] = useState(averageRating);
  const [count, setCount] = useState(ratingsCount);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://wea.nti.tul.cz:8009";

  useEffect(() => {
    if(user){const fetchUserRating = async () => {
      try {
        const response = await fetch(`${API_URL}/books/${isbn13}/user-rating`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUserRating(data.user_rating);
        } else {
          console.error(t("Failed to fetch user rating"));
        }
      } catch (error) {
        console.error(t("Error fetching user rating: {{error}}", { error: error.message }));
      }
    };

    fetchUserRating();
    }
  }, [isbn13, user, t]);

  const handleRatingSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/books/${isbn13}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: userRating }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setRating(data.average_rating);
        setCount(data.ratings_count);
        setCurrentUserRating(userRating);

        onUpdateRating(data.average_rating);
      } else {
        const errorData = await response.json();
        alert(t("Failed to submit rating: {{error}}", { error: errorData.error || response.statusText }));
      }
    } catch (error) {
      alert(t("An error occurred: {{error}}", { error: error.message }));
    }
  };

  return (
    <div>
      {/* Podmíněné zobrazení pro hodnocení pouze pro přihlášené uživatele */}
      {user && (
        <div>
          <h3>{t("Your Rating")}</h3>
          <input
            type="number"
            min="1"
            max="5"
            value={userRating}
            onChange={(e) => setUserRating(Number(e.target.value))}
            className="p-2 border border-gray-400 rounded"
          />
          <button
            onClick={handleRatingSubmit}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {t("Submit")}
          </button>
          <p style={{ color: "#ffffff" }}>
            {currentUserRating !== null
              ? t("You rated: {{rating}}", { rating: currentUserRating })
              : t("You haven't rated this book yet")}{" "}
            ({t("{{count}} votes", { count })})
          </p>
        </div>
      )}
    </div>
  );
}

BookRating.propTypes = {
  isbn13: PropTypes.string.isRequired,
  averageRating: PropTypes.number.isRequired,
  ratingsCount: PropTypes.number.isRequired,
  onUpdateRating: PropTypes.func.isRequired,
  user: PropTypes.object,
};

function BookDetail({ isbn13, onBack, user }) {
  const { t } = useTranslation();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0); // Додаємо стан для рейтингу

  const updateAverageRating = (newRating) => {
    setAverageRating(newRating); // Оновлюємо стан
  };

  useEffect(() => {
    const fetchBookDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/books/${isbn13}`);
        if (response.ok) {
          const data = await response.json();
          setBook(data);
          setAverageRating(data.average_rating); // Ініціалізуємо середній рейтинг
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

      <div className="book">
        <div className="book-detail__content">
          <div className="book-detail__cover-container">
            <img
              src={book.thumbnail || "https://via.placeholder.com/200"}
              alt={t("Book cover for {{title}}", {
                title: book.title || t("Untitled"),
              })}
              className="book-detail__cover"
            />
          </div>
          <div
            className={`book__average book__average--${getClassByRate(
              averageRating
            )}`}
          >
            {averageRating} {/* Використовуємо стан для середнього рейтингу */}
          </div>
        </div>

        <div className="book-detail__info text-center">
          <h1 className="book__title text-3xl font-bold mt-4">{book.title}</h1>
          {book.subtitle && (
            <h2 className="text-xl text-gray-300 italic mt-2">
              {book.subtitle}
            </h2>
          )}

          <div className="mt-4">
            <p className="text-lg">
              <span className="font-semibold">{t("Author(s):")}</span>{" "}
              {book.authors || t("Unknown Author")}
            </p>
            <p>
              <span className="font-semibold">{t("Published Year:")}</span>{" "}
              {book.published_year}
            </p>
            <p className="text-yellow-500">
              <span className="font-semibold">{t("Category:")}</span>{" "}
              {Array.isArray(book.categories) && book.categories.length
                ? book.categories.join(", ")
                : t("No category")}
            </p>
          </div>

          {book.description && (
            <div className="book-detail__description-box mt-6 p-4 border border-gray-600 rounded-lg">
              <h3 className="text-xl font-bold text-yellow-500 mb-3">
                {t("Description")}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <BookRating
        isbn13={isbn13}
        averageRating={averageRating}
        ratingsCount={book.ratings_count}
        onUpdateRating={updateAverageRating}
        user={user}// Передаємо функцію для оновлення
      />
      <div className="mt-6">
        <BookComments isbn13={isbn13} />
      </div>
    </div>
  );
}

BookDetail.propTypes = {
  isbn13: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  user: PropTypes.object, // Пропс для залогіненого користувача
};

export default BookDetail;