// Header.js
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import SortingOptions from "./SortingOptions";
import LanguageSwitcher from "./LanguageSwitcher";
import "../i18n.js";

function Header({ getBooks, user, setUser }) {
  const { t } = useTranslation();
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

  const getBooksBySearch = async (query, sortBy = "title_asc") => {
  try {
    const response = await fetch(
      `${API_URL}/books/search?query=${encodeURIComponent(query)}&sort_by=${sortBy}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    const data = await response.json();
    getBooks(data.books);
  } catch (error) {
    console.error(t("Error searching for books"), error);
    getBooks([]); // Pass an empty array if there's an error, to stop loading
  }
};

  const handleSortChange = (newSortBy) => {
    getBooksBySearch(searchTerm, newSortBy);
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
          {t("Books")}
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
        <LanguageSwitcher />
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
              <span> | </span>
              <Link to="/register">{t("Register")}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
