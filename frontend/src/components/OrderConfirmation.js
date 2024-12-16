// src/components/OrderConfirmation.js
import React, { useState } from 'react';

function OrderConfirmation({ cartItems, toggleOrderConfirmation, userData, saveUserData, submitOrder, user }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    email: user?.email || '',
    personal_address: user?.personal_address || '',
    billing_address: user?.billing_address || '',
    billing_same_as_personal: user?.billing_same_as_personal || false,
    phone: user?.phone || '',
    marketing_consent: user?.marketing_consent || false,
    age: user?.age || '',
    paymentMethod: '',
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];

    // Kontrola povinných polí
    if (!formData.full_name.trim()) missingFields.push('Full Name');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.personal_address.trim()) missingFields.push('Personal Address');
    if (!formData.billing_same_as_personal && !formData.billing_address.trim()) missingFields.push('Billing Address');
    if (!formData.marketing_consent) missingFields.push('Marketing Consent');
    if (!formData.age) missingFields.push('Age');
    if (!formData.paymentMethod.trim()) missingFields.push('Payment Method');

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Připravíme data pro backend
      const orderData = {
        paymentMethod: formData.paymentMethod,
        items: cartItems.map((item) => ({
          isbn13: item.isbn13,
          quantity: 1, // Předpokládáme, že každý kus je jednou položkou. Můžete upravit dle potřeby
        })),
      };

      const response = await fetch('http://localhost:8009/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include', // Pro odesílání cookies s autentizací
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit order');
      }

      const data = await response.json();
      setSuccessMessage(`Order placed successfully! Order ID: ${data.order.id}`);

      // Zavoláme backend funkci pro zpracování objednávky
      submitOrder(formData);

      // Vymažeme košík
      setCart([]);
      localStorage.removeItem('cart');

      // Zavřeme formulář
      toggleOrderConfirmation();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-overlay">
      <div className="order-form">
        <button className="order-form__close" onClick={toggleOrderConfirmation}>
          Close
        </button>
        <h2>Order Confirmation</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Full Name:
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
          <label>
            Personal Address:
            <input
              type="text"
              name="personal_address"
              value={formData.personal_address}
              onChange={handleChange}
              required
            />
          </label>
          {!formData.billing_same_as_personal && (
            <label>
              Billing Address:
              <input
                type="text"
                name="billing_address"
                value={formData.billing_address}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <label>
            Billing Same as Personal:
            <input
              type="checkbox"
              name="billing_same_as_personal"
              checked={formData.billing_same_as_personal}
              onChange={handleChange}
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </label>
          <label className="consent-label">
            Marketing Consent:
            <input
              type="checkbox"
              name="marketing_consent"
              checked={formData.marketing_consent}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Payment Method:
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="dobirka">Cash on Delivery (+50 Kč)</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Online Card Payment (+1%)</option>
            </select>
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderConfirmation;
