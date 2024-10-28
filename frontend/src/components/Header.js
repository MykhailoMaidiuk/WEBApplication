import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import "../i18n.js";

const SortingOptions = ({ onSortChange }) => {
  const { t } = useTranslation();
  const [selectedSort, setSelectedSort] = useState("title_asc");

  const handleSortChange = (event) => {
    setSelectedSort(event.target.value);
    onSortChange(event.target.value);
  };

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="sort-by" className="font-medium">
        {t("Sort by")}:
      </label>
      <select
        id="sort-by"
        value={selectedSort}
        onChange={handleSortChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="title_asc">{t("Title (A-Z)")}</option>
        <option value="title_desc">{t("Title (Z-A)")}</option>
        <option value="author_asc">{t("Author (A-Z)")}</option>
        <option value="author_desc">{t("Author (Z-A)")}</option>
        <option value="rating_asc">{t("Rating (Low to High)")}</option>
        <option value="rating_desc">{t("Rating (High to Low)")}</option>
        <option value="year_asc">{t("Year (Oldest to Newest)")}</option>
        <option value="year_desc">{t("Year (Newest to Oldest)")}</option>
      </select>
    </div>
  );
};

function Header({ getBooks, user, setUser }) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  const handleSubmit = (e) => {
    e.preventDefault();
    getBooksBySearch(searchTerm);
    setSearchTerm("");
  };

  const getBooksBySearch = async (query, page = 1, sortBy = "title_asc") => {
    try {
      const response = await fetch(
        `${API_URL}/books/search?query=${encodeURIComponent(query)}&page=${page}&limit=10&sort_by=${sortBy}`,
      );
      const data = await response.json();
      getBooks(data.books);
    } catch (error) {
      console.error(t("Error searching for books"), error);
    }
  };

  const handleSortChange = (newSortBy) => {
    getBooksBySearch(searchTerm, 1, newSortBy);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST" });
      setUser(null); // Clear user state on logout
    } catch (error) {
      console.error(t("Error logging out"), error);
    }
  };

  const isLoginOrRegister =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="container">
      <div className="header__content">
        <Link to="/" className="header__logo">
          {" "}
          {t("Books")} {/* Translated "Books" */}
        </Link>
        <form
          onSubmit={handleSubmit}
          className={isLoginOrRegister ? "hidden" : ""}
        >
          <input
            className="header__search"
            type="text"
            placeholder={t("Search...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <SortingOptions onSortChange={handleSortChange} />
        <div className="language-switcher">
          <button onClick={() => changeLanguage("en")}>EN</button>
          <button onClick={() => changeLanguage("cs")}>CS</button>
        </div>
        <div className="user-section">
          {user ? (
            <div>
              <span className="user-greeting">
                {t("Hello")}, {user.username}!
              </span>
              <span>&nbsp;&nbsp;</span>
              <button onClick={handleLogout}>{t("Logout")}</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">{t("Login")}</Link>
              <span> | </span> {/* Optional separator */}
              <Link to="/register">{t("Register")}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
