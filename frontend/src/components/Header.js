import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import SortingOptions from "./SortingOptions";
import LanguageSwitcher from "./LanguageSwitcher";
import "../i18n.js";

function Header({
  getBooks,
  user,
  setUser,
  setTotalPages,
  setTotalBooks,
  setCurrentPage,
  categories,
  toggleCart,
  cartItems
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const location = useLocation();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state to toggle category visibility
  const [showCategories, setShowCategories] = useState(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://wea.nti.tul.cz:8009";

  const isFavoritesPage = location.pathname === "/favorites";

  const handleSubmit = (e) => {
    e.preventDefault();
    getBooksBySearch();
  };
  useEffect(() => {
    console.log("Header - cartItems:", cartItems);
    console.log("Header - toggleCart:", toggleCart);
  }, [cartItems, toggleCart]);
  const getBooksBySearch = async (sortBy = "title_asc") => {
    try {
      const queryParams = new URLSearchParams({
        title,
        author,
        category: selectedCategories.join(","),
        isbn13,
        sort_by: sortBy,
        page: 1, // Reset to first page on new search
        page_size: 50
      });
      const response = await fetch(`${API_URL}/books/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      const data = await response.json();
      if (data.books.length === 0) {
        alert(t("No books found"));
      }
      getBooks(data.books);
      setTotalPages(data.totalPages);
      setTotalBooks(data.totalBooks);
      setCurrentPage(1);
    } catch (error) {
      console.error(t("Error searching for books"), error);
      getBooks([]);
      setTotalPages(0);
      setTotalBooks(0);
      setCurrentPage(1);
    }
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryName)
        ? prevSelected.filter((name) => name !== categoryName) // Remove category
        : [...prevSelected, categoryName] // Add category
    );
  };

  useEffect(() => {
    if (categories.length > 0 && typeof categories[0] === "string") {
      const mappedCategories = categories.map((cat, index) => ({
        id: index, // Use index as unique id
        name: cat  // Category name
      }));
      setMappedCategories(mappedCategories);
    }
  }, [categories]);

  const [mappedCategories, setMappedCategories] = useState([]);

  const handleSortChange = (newSortBy) => {
    getBooksBySearch(newSortBy);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setUser(null);
    } catch (error) {
      console.error(t("Error logging out"), error);
    }
  };

  const isLoginOrRegister = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="header__filters">
      <Link to="/" className="header__logo">{t("Books")}</Link>
      {user && (
          <div className="header__cart" onClick={toggleCart}>
            <span className="header__cart-icon">🛒</span>
            <span className="header__cart-count">{cartItems}</span>
          </div>
        )}
      <LanguageSwitcher/>
      {user ? (
        <div>
          <span>{t("Hello")}, {user.username}!</span>
          <Link to="/user-profile">
            <button>{t("User Profile")}</button>
          </Link>
          <button onClick={handleLogout}>{t("Logout")}</button>
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/login">{t("Login")}</Link>
          <Link to="/register">{t("Register")}</Link>
        </div>
      )}
      {user && (
        <Link to="/favorites">
          <button className="favorites-button">{t("Favorite Books")}</button>
        </Link>
      )}<br/><br/>

      {!isFavoritesPage && (
        <>
          <SortingOptions onSortChange={(newSortBy) => getBooksBySearch(newSortBy)} />
          <form onSubmit={handleSubmit}>
            <p>{t("Title")}</p>
            <input
                className="header__search"
                type="text"
                placeholder={t("Search by title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <p>{t("Author")}</p>
            <input
                className="header__search"
                type="text"
                placeholder={t("Search by author")}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
            />
            <p>{t("ISBN13")}</p>
            <input
                className="header__search"
                type="text"
                placeholder={t("Search by ISBN13")}
                value={isbn13}
                onChange={(e) => setIsbn13(e.target.value)}
            />
            <p>{t("Category")}</p>
            {/* Button to toggle category visibility */}
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className="toggle-categories-btn"
            >
              {showCategories ? t("Hide Categories") : t("Show Categories")}
            </button>

            {/* Conditionally render categories */}
            {showCategories && (
              <div className="category-checkboxes">
                {mappedCategories.map((cat) => (
                  <div key={cat.id}>
                    <label>
                      {" "}
                      <input
                          type="checkbox"
                          value={cat.name}
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleCategoryChange(cat.name)}
                      />
                      {" " + cat.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
            <button type="submit">{t("Search")}</button>
          </form>
        </>
      )}
    </header>
  );
}

export default Header;