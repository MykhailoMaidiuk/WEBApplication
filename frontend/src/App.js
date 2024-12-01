// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BooksList from './components/BooksList';
import Cart from './components/Cart';
import OrderConfirmation from './components/OrderConfirmation'; // Import the OrderConfirmation component
import './index.css';

function App() {
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false); // State to manage Order Confirmation Form
  const [userData, setUserData] = useState(null); // State to store user data
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Simulate an authenticated user

  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8009'
      : 'http://backend:8009';

  useEffect(() => {
    getBooks();
    loadCartFromStorage();
    loadUserData();
  }, []);

  // Fetch books from the API
  const getBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();
      // Assign a random price if not available
      const booksWithPrice = data.map((book) => ({
        ...book,
        price: book.price || Math.floor(Math.random() * 500) + 100, // Price between 100 and 600 Kč
      }));
      setBooks(booksWithPrice);
    } catch (error) {
      console.error('Error while receiving books:', error);
    }
  };

  // Add a book to the cart
  const addToCart = (book) => {
    if (!isAuthenticated) {
      alert('Please log in to add items to the cart.');
      return;
    }
    const newCart = [...cart, book];
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  // Remove a book from the cart by index
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  // Toggle the visibility of the cart
  const toggleCart = () => {
    if (!isAuthenticated) {
      alert('Please log in to view the cart.');
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  // Proceed to checkout by opening the order confirmation form
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    setIsCartOpen(false);
    setIsOrderFormOpen(true);
  };

  // Toggle the visibility of the order confirmation form
  const toggleOrderConfirmation = () => {
    setIsOrderFormOpen(false);
  };

  // Save cart items to localStorage
  const saveCartToStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Load cart items from localStorage
  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  // Save user data to state and localStorage
  const saveUserData = (data) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  // Load user data from localStorage
  const loadUserData = () => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    }
  };

  // Submit the order with surcharge calculations
  const submitOrder = (formData) => {
    // Calculate surcharge based on payment method
    let surcharge = 0;
    if (formData.paymentMethod === 'dobirka') {
      surcharge = 50; // Cash on Delivery - fixed surcharge of 50 Kč
    } else if (formData.paymentMethod === 'card') {
      const totalPrice = cart.reduce((sum, book) => sum + book.price, 0);
      surcharge = totalPrice * 0.01; // Online Card Payment - 1% surcharge
    }
    const totalPrice =
      cart.reduce((sum, book) => sum + book.price, 0) + surcharge;

    // Process the order (e.g., send data to the server)
    alert(`Order placed! Total amount: ${totalPrice.toFixed(2)} Kč`);

    // Clear the cart after order
    setCart([]);
    localStorage.removeItem('cart');
    setIsOrderFormOpen(false);
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
          proceedToCheckout={proceedToCheckout} // Pass the checkout function to Cart
        />
      )}
      {isOrderFormOpen && (
        <OrderConfirmation
          cartItems={cart}
          toggleOrderConfirmation={toggleOrderConfirmation}
          userData={userData}
          saveUserData={saveUserData}
          submitOrder={submitOrder}
        />
      )}
    </div>
  );
}

export default App;
