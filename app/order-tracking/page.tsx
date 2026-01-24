'use client';

import { useState } from 'react';
import { Order } from '@/types';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function OrderTrackingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim() || !orderId.trim()) {
        setError('Please enter both email and order number.');
        setLoading(false);
        return;
      }

      // Fetch order by ID
      const foundOrder = await getOrderById(orderId.trim());

      if (!foundOrder) {
        setError('Order not found. Please check your order number and try again.');
        setLoading(false);
        return;
      }

      // Verify email matches
      if (foundOrder.customerEmail?.toLowerCase() !== email.trim().toLowerCase()) {
        setError('Email does not match this order. Please check your email address.');
        setLoading(false);
        return;
      }

      setOrder(foundOrder);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'shipped':
        return '#17a2b8';
      case 'processing':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className={styles.trackingPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>Track Your Order</h1>

        <div className={styles.trackingContent}>
          <form onSubmit={handleSubmit} className={styles.trackingForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Enter the email used for your order"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="orderId" className={styles.label}>
                Order Number
              </label>
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className={styles.input}
                placeholder="Enter your order number"
                required
              />
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Searching...' : 'Track Order'}
            </Button>
          </form>

          {order && (
            <div className={styles.orderDetails}>
              <h2 className={styles.orderTitle}>Order Details</h2>
              
              <div className={styles.orderInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Order Number:</span>
                  <span className={styles.infoValue}>{order.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Order Date:</span>
                  <span className={styles.infoValue}>
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Status:</span>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Total:</span>
                  <span className={styles.infoValue}>${order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className={styles.shippingInfo}>
                  <h3 className={styles.sectionTitle}>Shipping Address</h3>
                  <p className={styles.address}>
                    {order.shippingAddress.name}<br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.zip}<br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}

              <div className={styles.itemsList}>
                <h3 className={styles.sectionTitle}>Order Items</h3>
                <div className={styles.items}>
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <span className={styles.itemName}>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className={styles.itemPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
