// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BooksList from './components/BooksList';
import Cart from './components/Cart';
import './index.css';

function App() {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  useEffect(() => {
    getBooks();
    loadCartFromStorage();
  }, []);

  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Mistake while receiving book:', error);
    }
  };

  const addToCart = (book) => {
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
    setIsCartOpen(!isCartOpen);
  };

  const saveCartToStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  return (
    <div>
      <Header
        getBooks={setBooks}
        cartItems={cart.length}
        toggleCart={toggleCart}
        isAuthenticated={isAuthenticated}
      />
      <div className="container">
        <BooksList books={books} addToCart={addToCart} />
      </div>
      {isCartOpen && (
        <Cart
          cartItems={cart}
          toggleCart={toggleCart}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
}

export default App;
