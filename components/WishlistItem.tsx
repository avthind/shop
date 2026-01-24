'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import Button from './Button';
import styles from './WishlistItem.module.css';

interface WishlistItemProps {
  product: Product;
}

export default function WishlistItem({ product }: WishlistItemProps) {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleRemove = () => {
    removeFromWishlist(product.id);
  };

  return (
    <div className={styles.wishlistItem}>
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <Image
          src={product.images[0]}
          alt={product.name}
          width={200}
          height={200}
          className={styles.image}
        />
      </Link>

      <div className={styles.wishlistItemContent}>
        <div className={styles.wishlistItemInfo}>
          <Link href={`/product/${product.id}`} className={styles.productName}>
            {product.name}
          </Link>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
          <p className={styles.productDescription}>{product.description}</p>
        </div>

        <div className={styles.wishlistItemActions}>
          <Button 
            onClick={handleAddToCart}
            className={justAdded ? styles.addedToCart : ''}
          >
            {justAdded ? (
              <span className={styles.addToCartContent}>
                <svg 
                  className={styles.checkmarkIcon}
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Added!</span>
              </span>
            ) : (
              'Add to Cart'
            )}
          </Button>
          <button
            onClick={handleRemove}
            className={styles.removeButton}
            aria-label={`Remove ${product.name} from wishlist`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

