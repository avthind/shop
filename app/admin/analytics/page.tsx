'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders, getAllProducts } from '@/lib/firestore';
import { Order, Product } from '@/types';
import styles from './page.module.css';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return orders;
    }

    return orders.filter((order) => new Date(order.date) >= startDate);
  };

  const filteredOrders = getFilteredOrders();
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate daily revenue for chart
  const dailyRevenue = filteredOrders
    .filter((o) => o.status === 'completed')
    .reduce((acc, order) => {
      const date = new Date(order.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

  const dailyRevenueData = Object.entries(dailyRevenue)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-7); // Last 7 days

  // Top products
  const productSales = filteredOrders
    .filter((o) => o.status === 'completed')
    .flatMap((order) => order.items)
    .reduce((acc, item) => {
      acc[item.product.id] = (acc[item.product.id] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

  const topProducts = Object.entries(productSales)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return { product, quantity };
    })
    .filter((item) => item.product)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Order status distribution
  const statusDistribution = {
    pending: filteredOrders.filter((o) => o.status === 'pending').length,
    processing: filteredOrders.filter((o) => o.status === 'processing').length,
    shipped: filteredOrders.filter((o) => o.status === 'shipped').length,
    completed: filteredOrders.filter((o) => o.status === 'completed').length,
    cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.header}>
        <h1>Stats</h1>
        <div className={styles.dateRangeSelector}>
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
            className={dateRange === 'year' ? styles.active : ''}
            onClick={() => setDateRange('year')}
          >
            this year
          </button>
          <button
            className={dateRange === 'all' ? styles.active : ''}
            onClick={() => setDateRange('all')}
          >
            all time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Revenue</div>
          <div className={styles.metricValue}>${totalRevenue.toFixed(2)}</div>
          <div className={styles.metricSubtext}>
            {completedOrders.length} completed orders
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Orders</div>
          <div className={styles.metricValue}>{filteredOrders.length}</div>
          <div className={styles.metricSubtext}>
            {completedOrders.length} completed
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average Order Value</div>
          <div className={styles.metricValue}>${averageOrderValue.toFixed(2)}</div>
          <div className={styles.metricSubtext}>
            Per completed order
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Products</div>
          <div className={styles.metricValue}>{products.length}</div>
          <div className={styles.metricSubtext}>
            {products.filter((p) => p.inStock !== false).length} active
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h2>Revenue Over Time</h2>
          <div className={styles.chart}>
            {dailyRevenueData.length > 0 ? (
              <div className={styles.barChart}>
                {dailyRevenueData.map(([date, revenue], index) => {
                  const maxRevenue = Math.max(...dailyRevenueData.map(([, r]) => r));
                  const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={index} className={styles.barContainer}>
                      <div
                        className={styles.bar}
                        style={{ height: `${height}%` }}
                        title={`${date}: $${revenue.toFixed(2)}`}
                      />
                      <div className={styles.barLabel}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noData}>No revenue data for selected period</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className={styles.chartCard}>
          <h2>Order Status</h2>
          <div className={styles.statusChart}>
            {Object.entries(statusDistribution).map(([status, count]) => {
              const total = Object.values(statusDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status} className={styles.statusBar}>
                  <div className={styles.statusBarHeader}>
                    <span className={styles.statusLabel}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    <span className={styles.statusCount}>{count}</span>
                  </div>
                  <div className={styles.statusBarTrack}>
                    <div
                      className={`${styles.statusBarFill} ${styles[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className={styles.section}>
        <h2>Top Selling Products</h2>
        {topProducts.length > 0 ? (
          <div className={styles.topProductsList}>
            {topProducts.map(({ product, quantity }, index) => (
              <div key={product!.id} className={styles.topProductItem}>
                <div className={styles.rank}>#{index + 1}</div>
                <div className={styles.productImage}>
                  {product!.images && product!.images.length > 0 ? (
                    <img src={product!.images[0]} alt={product!.name} />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{product!.name}</div>
                  <div className={styles.productSales}>{quantity} sold</div>
                </div>
                <div className={styles.productRevenue}>
                  ${(product!.price * quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noData}>No sales data for selected period</div>
        )}
      </div>
    </div>
  );
}
