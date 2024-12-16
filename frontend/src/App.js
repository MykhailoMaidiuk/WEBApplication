// src/App.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import BooksList from "./components/BooksList";
import Login from "./components/Login";
import Register from "./components/Register";
import FavoriteBooks from "./components/FavoriteBooks";
import UserProfile from "./components/UserProfile";
import Cart from "./components/Cart";
import OrderConfirmation from "./components/OrderConfirmation";
import "./index.css";
import "./i18n";

function App() {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize] = useState(50);
  const [favorites, setFavorites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  // States for order confirmation logic
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate user auth

  // States for order submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8009"
      : "http://backend:8009";

  // Save and load cart from localStorage
  const saveCartToStorage = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  // Save and load user data (for order confirmation form)
  const saveUserData = (data) => {
    setUserData(data);
    localStorage.setItem("userData", JSON.stringify(data));
  };

  const loadUserData = () => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  };

  useEffect(() => {
    loadCartFromStorage();
    loadUserData();
  }, []);

  // Fetch books from the server
  const getBooks = async (page = currentPage) => {
    try {
      const response = await fetch(`${API_URL}/books?page=${page}&page_size=${pageSize}`);
      if (!response.ok) throw new Error(t("Failed to fetch books"));
      const data = await response.json();
      setBooks(data.books);
      setTotalBooks(data.totalBooks);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error(t("Error fetching books"), error);
    }
  };

  const addToCart = (book) => {
    if (!isAuthenticated) {
      alert(t("Please log in to add items to the cart."));
      return;
    }
    const newCart = [...cart, book];
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const toggleCart = () => {
    if (!isAuthenticated) {
      alert(t("Please log in to view the cart."));
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  // Proceed to checkout: close cart, open order form
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert(t("Your cart is empty."));
      return;
    }
    setIsCartOpen(false);
    setIsOrderFormOpen(true);
  };

  // Toggle order confirmation form
  const toggleOrderConfirmation = () => {
    setIsOrderFormOpen(false);
  };

  const checkCurrentUser = async () => {
    try {
      const userResponse = await fetch(`${API_URL}/current_user`, {
        method: "GET",
        credentials: "include",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user || null);

        if (userData.user) {
          const response = await fetch(`${API_URL}/user`, {
            method: "GET",
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            console.error(t("Error fetching user details"));
            setUser(userData.user);
          }
        } else {
          setFavorites([]);
        }
      } else {
        setUser(null);
        setFavorites([]);
      }
    } catch (error) {
      console.error(t("Error checking current user"), error);
      setUser(null);
      setFavorites([]);
    }
  };

  // Update user profile
  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Split full_name into firstName and lastName
    let firstName = "";
    let lastName = "";
    if (updatedUser.full_name) {
      const parts = updatedUser.full_name.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    const formData = {
      firstName: firstName,
      lastName: lastName,
      email: updatedUser.email || "",
      personalAddress: updatedUser.personal_address || "",
      billingAddress: updatedUser.billing_address || "",
      consent: false,
      paymentMethod: ""
    };

    // Save userData so OrderConfirmation can pre-fill the form
    saveUserData(formData);
  };

  const toggleFavorite = async (book) => {
    const isAlreadyFavorite = favorites.some((fav) => fav.isbn13 === book.isbn13);
    try {
      if (isAlreadyFavorite) {
        const response = await fetch(`${API_URL}/remove_from_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13: book.isbn13 }),
          credentials: "include",
        });

        if (response.ok) {
          setFavorites((prevFavorites) =>
            prevFavorites.filter((fav) => fav.isbn13 !== book.isbn13)
          );
        } else {
          console.error(t("Error removing from favorites"), await response.text());
        }
      } else {
        const response = await fetch(`${API_URL}/add_to_favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13: book.isbn13 }),
          credentials: "include",
        });

        if (response.ok) {
          setFavorites((prevFavorites) => [...prevFavorites, book]);
        } else {
          console.error(t("Error adding to favorites"), await response.text());
        }
      }
    } catch (error) {
      console.error(t("Error toggling favorite"), error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error(t("Failed to fetch categories"));
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error(t("Error fetching categories:"), error);
      }
    };
    fetchCategories();
  }, [API_URL, t]);

  useEffect(() => {
    checkCurrentUser();
    getBooks(currentPage);
  }, [i18n.language, currentPage]); // Re-fetch books on language change or page change

  // Kompletní submitOrder funkce
  const submitOrder = async (formData) => {
    // Vypočítání příplatků
    let surcharge = 0;
    if (formData.paymentMethod === "dobirka") {
      surcharge = 50; // Dobírka fixní příplatek
    } else if (formData.paymentMethod === "card") {
      const totalPrice = cart.reduce((sum, book) => sum + (book.price || 0), 0);
      surcharge = totalPrice * 0.01; // 1% příplatek za platbu kartou
    }

    const totalPrice = cart.reduce((sum, book) => sum + (book.price || 0), 0) + surcharge;

    // Připravíme data pro backend
    const orderData = {
      paymentMethod: formData.paymentMethod,
      items: cart.map((book) => ({
        isbn13: book.isbn13,
        quantity: 1, // Předpokládáme, že každý kus je jednou položkou. Můžete upravit dle potřeby
      })),
      // Můžete přidat další informace, pokud jsou potřebné na backendu
    };

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
        credentials: "include", // Pro odesílání cookies s autentizací
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("Failed to submit order"));
      }

      const data = await response.json();
      //setSuccessMessage(t("Order placed successfully! Order ID: {{id}}", { id: data.order.id }));

      // Vymažeme košík
      setCart([]);
      saveCartToStorage([]);

      // Zavřeme formulář
      setIsOrderFormOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <Header
            getBooks={setBooks}
            user={user}
            setUser={setUser}
            setTotalPages={setTotalPages}
            setTotalBooks={setTotalBooks}
            setCurrentPage={setCurrentPage}
            categories={categories}
            cartItems={cart.length}
            toggleCart={toggleCart}
          />
        </aside>
        <main className="main-content">
          {isCartOpen && (
            <Cart
              cartItems={cart}
              toggleCart={toggleCart}
              removeFromCart={removeFromCart}
              proceedToCheckout={proceedToCheckout} // "Accept order" button calls this
            />
          )}
          {isOrderFormOpen && (
            <OrderConfirmation
              cartItems={cart}
              toggleOrderConfirmation={toggleOrderConfirmation}
              userData={userData}
              saveUserData={saveUserData}
              submitOrder={submitOrder}
              user={user}
              isSubmitting={isSubmitting}
              error={error}
              successMessage={successMessage}
            />
          )}
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route
              path="/user-profile"
              element={
                <UserProfile
                  user={user}
                  updateUserProfile={updateUserProfile}
                  onProfileUpdate={checkCurrentUser}
                />
              }
            />

            <Route
              path="/"
              element={
                <BooksList
                  books={books}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={getBooks}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                  user={user}
                  addToCart={addToCart}
                />
              }
            />
            <Route
              path="/favorites"
              element={
                <FavoriteBooks
                  favorites={favorites || []}
                  user={user}
                  setFavorites={setFavorites}
                  toggleFavorite={toggleFavorite}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
