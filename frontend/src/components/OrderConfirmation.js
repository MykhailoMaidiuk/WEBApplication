import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function OrderConfirmation({ cartItems, toggleOrderConfirmation, userData, saveUserData, submitOrder, user }) {
  const { t } = useTranslation();
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const missingFields = [];

    // Kontrola povinných polí
    if (!formData.full_name.trim()) missingFields.push(t('Full Name'));
    if (!formData.email.trim()) missingFields.push(t('Email'));
    if (!formData.personal_address.trim()) missingFields.push(t('Personal Address'));
    if (!formData.billing_same_as_personal && !formData.billing_address.trim()) missingFields.push(t('Billing Address'));
    if (!formData.marketing_consent) missingFields.push(t('Marketing Consent'));
    if (!formData.age) missingFields.push(t('Age'));
    if (!formData.paymentMethod.trim()) missingFields.push(t('Payment Method'));

    if (missingFields.length > 0) {
      setError(t('Please fill in the following required fields: {{fields}}', { fields: missingFields.join(', ') }));
      return;
    }

    saveUserData(formData);
    submitOrder(formData);
    setError(null);
  };

  return (
    <div className="order-overlay">
      <div className="order-form">
        <button className="order-form__close" onClick={toggleOrderConfirmation}>
          {t('Close')}
        </button>
        <h2>{t('Order Confirmation')}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            {t('Full Name')}:
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('Email')}:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('Phone')}:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
          <label>
            {t('Personal Address')}:
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
              {t('Billing Address')}:
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
            {t('Billing Same as Personal')}:
            <input
              type="checkbox"
              name="billing_same_as_personal"
              checked={formData.billing_same_as_personal}
              onChange={handleChange}
            />
          </label>
          <label>
            {t('Age')}:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </label>
          <label className="consent-label">
            {t('Marketing Consent')}:
            <input
              type="checkbox"
              name="marketing_consent"
              checked={formData.marketing_consent}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            {t('Payment Method')}:
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">{t('Select Payment Method')}</option>
              <option value="dobirka">{t('Cash on Delivery (+50 Kč)')}</option>
              <option value="bank">{t('Bank Transfer')}</option>
              <option value="card">{t('Online Card Payment (+1%)')}</option>
            </select>
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">{t('Place Order')}</button>
        </form>
      </div>
    </div>
  );
}

export default OrderConfirmation;
