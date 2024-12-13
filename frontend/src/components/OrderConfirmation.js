// src/components/OrderConfirmation.js
import React, { useState, useEffect } from 'react';

function OrderConfirmation({ cartItems, toggleOrderConfirmation, userData, saveUserData, submitOrder }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personalAddress: '',
    billingAddress: '',
    consent: false,
    paymentMethod: '',
  });

  useEffect(() => {
    // Предзаполнение формы данными пользователя
    if (userData) {
      setFormData({ ...formData, ...userData });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Проверка обязательных полей
    if (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.personalAddress &&
      formData.billingAddress &&
      formData.consent &&
      formData.paymentMethod
    ) {
      saveUserData(formData);
      submitOrder(formData);
    } else {
      alert('Please fill in all required fields.');
    }
  };

  return (
    <div className="order-overlay">
      <div className="order-form">
        <button className="order-form__close" onClick={toggleOrderConfirmation}>
          Close
        </button>
        <h2>Order confirmation</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Surname:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Mail:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Adress:
            <input
              type="text"
              name="personalAddress"
              value={formData.personalAddress}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Card number:
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              required
            />
          </label>
          <label className="consent-label">
            Consent to data processing:
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Payment method:
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select payment method</option>
              <option value="dobirka">Additional payment (cash on delivery) +50 Kč</option>
              <option value="bank">Bank transfer</option>
              <option value="card">Online card payment +1%</option>
            </select>
          </label>
          <button type="submit">Place an order</button>
        </form>
      </div>
    </div>
  );
}

export default OrderConfirmation;