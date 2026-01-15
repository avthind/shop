'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/lib/firestore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US',
    paymentMethod: 'stripe',
  });

  const total = getTotalPrice();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      // Create order in Firestore
      const order = {
        items,
        total: getTotalPrice(),
        date: new Date().toISOString(),
        status: 'pending' as const,
      };
      
      await createOrder(currentUser.uid, order);
      
      // Clear cart
      await clearCart();
      
      // In production, integrate payment processing here (Stripe/PayPal)
      // For now, just redirect to success page
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <div className="container">
          <div className={styles.emptyCart}>
            <p>Your cart is empty.</p>
            <Button onClick={() => router.push('/shop')}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={styles.checkoutPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Checkout</h1>

        <div className={styles.checkoutContent}>
          <form onSubmit={handleSubmit} className={styles.checkoutForm}>
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
            </section>

            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="address" className={styles.label}>
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city" className={styles.label}>
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="zipCode" className={styles.label}>
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            </section>

            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.formGroup}>
                <label htmlFor="paymentMethod" className={styles.label}>
                  Payment Provider
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="stripe">Stripe (Credit Card)</option>
                  <option value="paypal">PayPal</option>
                </select>
                <p className={styles.formNote}>
                  Payment processing integration placeholder. In production, connect to Stripe or PayPal API.
                </p>
              </div>
            </section>

            <Button type="submit" className={styles.submitButton}>
              Place Order
            </Button>
          </form>

          <div className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.product.id} className={styles.summaryItem}>
                  <span className={styles.summaryItemName}>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className={styles.summaryItemPrice}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryTotal}>
              <span className={styles.summaryTotalLabel}>Total</span>
              <span className={styles.summaryTotalValue}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
