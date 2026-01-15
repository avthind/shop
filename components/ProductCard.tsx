'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <article className={styles.card}>
      <Link href={`/product/${product.id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className={styles.image}
          />
          <button
            className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlistButtonActive : ''}`}
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWishlisted}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </article>
  );
}

