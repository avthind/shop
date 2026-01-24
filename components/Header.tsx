'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import styles from './Header.module.css';

export default function Header() {
  const { getTotalItems } = useCart();
  const { currentUser, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = getTotalItems();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            inxvinx
          </Link>

          <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/shop" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
              shop
            </Link>
            <Link href="/wishlist" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
              wishlist
            </Link>
            {currentUser ? (
              <>
                <Link href="/account" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
                  account
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
                    admin
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>
                sign in
              </Link>
            )}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/cart" className={styles.cartLink} aria-label="Shopping cart">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
            </Link>

            {currentUser && (
              <div className={styles.userMenu}>
                <span className={styles.userName}>{currentUser.displayName || currentUser.email}</span>
                <button onClick={handleLogout} className={styles.logoutButton} aria-label="Sign out">
                  sign out
                </button>
              </div>
            )}

            <button
              className={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
