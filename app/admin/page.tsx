'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/firestore';
import { getAllOrders } from '@/lib/firestore';
import { Product, Order } from '@/types';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          getAllProducts(),
          getAllOrders(),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getFilteredOrders = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders;
    }

    return orders.filter((order) => new Date(order.date) >= startDate);
  };

  const filteredOrders = getFilteredOrders();
  const openOrders = orders.filter((o) => ['pending', 'processing'].includes(o.status));
  const totalRevenue = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const activeProducts = products.filter((p) => p.inStock !== false).length;
  const soldOutProducts = products.filter((p) => p.inStock === false).length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.dateRangeSelector}>
          <button
            className={dateRange === 'today' ? styles.active : ''}
            onClick={() => setDateRange('today')}
          >
            today
          </button>
          <button
            className={dateRange === 'week' ? styles.active : ''}
            onClick={() => setDateRange('week')}
          >
            this week
          </button>
          <button
            className={dateRange === 'month' ? styles.active : ''}
            onClick={() => setDateRange('month')}
          >
            this month
          </button>
          <button
            className={dateRange === 'all' ? styles.active : ''}
            onClick={() => setDateRange('all')}
          >
            all time
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Revenue</div>
          <div className={styles.statValue}>${totalRevenue.toFixed(2)}</div>
          <div className={styles.statSubtext}>
            {filteredOrders.filter((o) => o.status !== 'cancelled').length} orders
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open Orders</div>
          <div className={styles.statValue}>{openOrders.length}</div>
          <div className={styles.statSubtext}>
            {orders.filter((o) => o.status === 'pending').length} pending
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Listings</div>
          <div className={styles.statValue}>{activeProducts}</div>
          <div className={styles.statSubtext}>
            {soldOutProducts} sold out
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Orders</div>
          <div className={styles.statValue}>{orders.length}</div>
          <div className={styles.statSubtext}>
            {orders.filter((o) => o.status === 'completed').length} completed
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Open Orders */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Your Open Orders</h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              View all orders
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          {openOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No open orders</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {openOrders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className={styles.orderItem}
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderId}>#{order.id.slice(0, 8)}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.orderTotal}>${order.total.toFixed(2)}</div>
                  <div className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {order.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Listings Summary */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Your Listings</h2>
            <Link href="/admin/products" className={styles.viewAllLink}>
              Manage listings
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          <div className={styles.listingsSummary}>
            <div className={styles.listingStat}>
              <div className={styles.listingStatValue}>{activeProducts}</div>
              <div className={styles.listingStatLabel}>Active</div>
            </div>
            <div className={styles.listingStat}>
              <div className={styles.listingStatValue}>{soldOutProducts}</div>
              <div className={styles.listingStatLabel}>Sold Out</div>
            </div>
            <div className={styles.listingStat}>
              <div className={styles.listingStatValue}>{products.length}</div>
              <div className={styles.listingStatLabel}>Total</div>
            </div>
          </div>
          <Link href="/admin/products/new" className={styles.addProductButton}>
            + Add New Listing
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.section}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          {orders.slice(0, 10).map((order) => (
            <div key={order.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>📦</div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>
                  New order <strong>#{order.id.slice(0, 8)}</strong> - ${order.total.toFixed(2)}
                </div>
                <div className={styles.activityDate}>
                  {new Date(order.date).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className={styles.emptyState}>
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
