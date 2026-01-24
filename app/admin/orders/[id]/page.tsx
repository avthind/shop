'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '@/lib/firestore';
import { Order } from '@/types';
import styles from './page.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return;

    try {
      const oldStatus = order.status;
      await updateOrderStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });

      // Send status update email if status changed and customer email exists
      if (oldStatus !== newStatus && order.customerEmail) {
        try {
          await fetch('/api/email/order-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              order: { ...order, status: newStatus },
              customerEmail: order.customerEmail,
              customerName: order.customerName,
              oldStatus,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Don't block status update if email fails
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.error}>
        <p>Order not found.</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back to Orders</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.orderDetailPage}>
      <div className={styles.header}>
        <div>
          <button onClick={() => router.back()} className={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Back to Orders</span>
          </button>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <div className={styles.orderMeta}>
            <span>Placed on {new Date(order.date).toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.statusSection}>
          <label htmlFor="status">Order Status:</label>
          <select
            id="status"
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
            className={`${styles.statusSelect} ${styles[order.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.section}>
          <h2>Order Items</h2>
          <div className={styles.itemsList}>
            {order.items.map((item, index) => (
              <div key={index} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  {item.product.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemPrice}>
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.orderTotal}>
            <div className={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span className={styles.grandTotal}>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Customer Information</h2>
          <div className={styles.customerDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Name:</span>
              <span className={styles.detailValue}>{order.customerName || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email:</span>
              <span className={styles.detailValue}>{order.customerEmail || 'N/A'}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <>
              <h2>Shipping Address</h2>
              <div className={styles.shippingAddress}>
                <div>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.address}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
