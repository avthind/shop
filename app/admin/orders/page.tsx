'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllOrders, updateOrderStatus } from '@/lib/firestore';
import { Order } from '@/types';
import styles from './page.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const oldStatus = order.status;
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );

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

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className={styles.header}>
        <h1>Orders</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.statusFilters}>
          {(['all', 'pending', 'processing', 'shipped', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              className={statusFilter === status ? styles.filterActive : ''}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{searchTerm || statusFilter !== 'all' ? 'No orders found matching your filters.' : 'No orders yet.'}</p>
        </div>
      ) : (
        <div className={styles.ordersTable}>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className={styles.orderIdLink}>
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td>
                    <div className={styles.customerInfo}>
                      <div className={styles.customerName}>
                        {order.customerName || 'N/A'}
                      </div>
                      <div className={styles.customerEmail}>
                        {order.customerEmail || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className={styles.itemsCell}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className={styles.totalCell}>
                    ${order.total.toFixed(2)}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      className={`${styles.statusSelect} ${styles[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className={styles.viewButton}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
