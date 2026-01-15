'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import WishlistItem from '@/components/WishlistItem';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className={styles.wishlistPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>wishlist</h1>

        {items.length === 0 ? (
          <div className={styles.emptyWishlist}>
            <p className={styles.emptyText}>your wishlist is empty.</p>
            <Link href="/shop">
              <Button>continue shopping</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.wishlistContent}>
            <div className={styles.wishlistItems}>
              {items.map((product) => (
                <WishlistItem key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

