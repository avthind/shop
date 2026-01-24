'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/lib/firestore';
import {
  validateEmail,
  validateName,
  validateAddress,
  validateCity,
  validateZipCode,
  sanitizeEmail,
  sanitizeName,
  sanitizeAddress,
} from '@/lib/validation';
import Link from 'next/link';
import Button from '@/components/Button';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import styles from './page.module.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Payment form component
function PaymentForm({
  onPaymentSuccess,
  isSubmitting,
  total,
  paymentIntentId,
}: {
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  isSubmitting: boolean;
  total: number;
  paymentIntentId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntentId) {
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message || 'Payment form validation failed');
        setIsProcessingPayment(false);
        return;
      }

      // Confirm payment with the existing payment intent
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed');
        setIsProcessingPayment(false);
        return;
      }

      // Payment succeeded
      await onPaymentSuccess(paymentIntentId);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred during payment');
      setIsProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} className={styles.paymentForm}>
      <div className={styles.formGroup}>
        <PaymentElement />
        {paymentError && (
          <span className={styles.errorMessage}>{paymentError}</span>
        )}
      </div>
      <Button
        type="submit"
        className={styles.submitButton}
        disabled={!stripe || isSubmitting || isProcessingPayment}
      >
        {isProcessingPayment
          ? 'Processing Payment...'
          : isSubmitting
          ? 'Creating Order...'
          : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
}

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const total = getTotalPrice();

  // Create payment intent when component mounts or total changes
  useEffect(() => {
    if (total > 0) {
      fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        })
        .catch((error) => {
          console.error('Error creating payment intent:', error);
        });
    }
  }, [total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    // Validate name
    const nameValidation = validateName(formData.name, 'Full name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Invalid name';
    }

    // Validate address
    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error || 'Invalid address';
    }

    // Validate city
    const cityValidation = validateCity(formData.city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.error || 'Invalid city';
    }

    // Validate ZIP code
    const zipValidation = validateZipCode(formData.zipCode, formData.country);
    if (!zipValidation.isValid) {
      newErrors.zipCode = zipValidation.error || 'Invalid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment success - create order after payment is confirmed
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Validate form before creating order
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize form data before storing
      const sanitizedData = {
        email: sanitizeEmail(formData.email),
        name: sanitizeName(formData.name),
        address: sanitizeAddress(formData.address),
        city: sanitizeAddress(formData.city), // Using address sanitizer for city
        zipCode: formData.zipCode.trim(), // ZIP codes should remain as-is
        country: formData.country,
      };

      // Create order in Firestore with sanitized data
      const orderData = {
        items,
        total: getTotalPrice(),
        date: new Date().toISOString(),
        status: 'pending' as const,
        customerEmail: sanitizedData.email,
        customerName: sanitizedData.name,
        shippingAddress: {
          name: sanitizedData.name,
          address: sanitizedData.address,
          city: sanitizedData.city,
          state: '', // Add state field if needed
          zip: sanitizedData.zipCode,
          country: sanitizedData.country,
        },
        paymentIntentId,
        paymentStatus: 'succeeded' as const,
        paymentMethod: 'stripe',
      };
      
      // Create order with userId (null for guests)
      const orderId = await createOrder(currentUser?.uid || null, orderData);
      
      // Update payment intent metadata with order ID
      try {
        await fetch('/api/payment/update-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            metadata: { orderId },
          }),
        });
      } catch (updateError) {
        console.error('Failed to update payment intent metadata:', updateError);
      }
      
      // Send order confirmation email
      try {
        await fetch('/api/email/order-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: { ...orderData, id: orderId },
            customerEmail: sanitizedData.email,
            customerName: sanitizedData.name,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        // Don't block order creation if email fails
      }
      
      // Clear cart
      await clearCart();
      
      // Clear localStorage cart for guests
      if (!currentUser) {
        localStorage.removeItem('cart');
      }
      
      // Redirect to success page with order info
      router.push(`/checkout/success?orderId=${orderId}&email=${encodeURIComponent(sanitizedData.email)}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    <div className={styles.checkoutPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Checkout</h1>

        {!currentUser && (
          <div className={styles.guestNotice}>
            <p>Checking out as a guest? <Link href="/login">Sign in</Link> or <Link href="/signup">create an account</Link> to save your information for faster checkout next time.</p>
          </div>
        )}

        <div className={styles.checkoutContent}>
          <form className={styles.checkoutForm}>
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
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  required
                />
                {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
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
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  required
                />
                {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
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
                  className={`${styles.input} ${errors.address ? styles.inputError : ''}`}
                  required
                />
                {errors.address && <span className={styles.errorMessage}>{errors.address}</span>}
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
                    className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                    required
                  />
                  {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
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
                    className={`${styles.input} ${errors.zipCode ? styles.inputError : ''}`}
                    required
                  />
                  {errors.zipCode && <span className={styles.errorMessage}>{errors.zipCode}</span>}
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
              <h2 className={styles.sectionTitle}>Payment</h2>
              {clientSecret && paymentIntentId ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <PaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    isSubmitting={isSubmitting}
                    total={total}
                    paymentIntentId={paymentIntentId}
                  />
                </Elements>
              ) : (
                <div className={styles.loadingPayment}>
                  <p>Loading payment form...</p>
                </div>
              )}
            </section>
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
  );
}
