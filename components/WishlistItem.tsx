'use client';

import React from 'react';
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

  const handleAddToCart = () => {
    addToCart(product, 1);
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
          <Button onClick={handleAddToCart}>Add to Cart</Button>
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

