'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, getUserProfile, updateUserProfile } from '@/lib/firestore';
import { Order } from '@/types';
import Button from '@/components/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './page.module.css';

export default function AccountPage() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Load user profile
      const loadProfile = async () => {
        setProfileLoading(true);
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setProfileData({
              name: profile.name || currentUser.displayName || '',
              email: profile.email || currentUser.email || '',
              phone: profile.phone || '',
              address: profile.address || '',
            });
          } else {
            // Initialize with Firebase user data
            setProfileData({
              name: currentUser.displayName || '',
              email: currentUser.email || '',
              phone: '',
              address: '',
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setProfileLoading(false);
        }
      };

      // Load orders
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          const userOrders = await getUserOrders(currentUser.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error('Error loading orders:', error);
        } finally {
          setOrdersLoading(false);
        }
      };

      loadProfile();
      loadOrders();
    }
  }, [currentUser]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, profileData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.accountPage}>
        <div className="container">
          <div className={styles.accountHeader}>
            <h1 className={styles.pageTitle}>My Account</h1>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Sign Out
            </button>
          </div>

          <div className={styles.accountTabs}>
            <button
              className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </div>

          <div className={styles.accountContent}>
            {activeTab === 'profile' && (
              <section className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Profile Information</h2>
                {profileLoading ? (
                  <p>Loading profile...</p>
                ) : (
                  <form onSubmit={handleProfileSubmit} className={styles.profileForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.label}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={styles.input}
                        required
                        disabled
                      />
                      <p className={styles.helpText}>Email cannot be changed</p>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="phone" className={styles.label}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={styles.input}
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
                        value={profileData.address}
                        onChange={handleProfileChange}
                        className={styles.input}
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                )}
              </section>
            )}

            {activeTab === 'orders' && (
              <section className={styles.ordersSection}>
                <h2 className={styles.sectionTitle}>Order History</h2>
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className={styles.emptyOrders}>
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className={styles.ordersList}>
                    {orders.map((order) => (
                      <div key={order.id} className={styles.orderItem}>
                        <div className={styles.orderHeader}>
                          <div>
                            <p className={styles.orderId}>Order #{order.id.slice(0, 8)}</p>
                            <p className={styles.orderDate}>
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={styles.orderInfo}>
                            <p className={styles.orderTotal}>${order.total.toFixed(2)}</p>
                            <span className={`${styles.orderStatus} ${styles[`orderStatus${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`]}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
