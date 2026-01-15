'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCarousel from '@/components/ProductCarousel';
import Button from '@/components/Button';
import styles from './page.module.css';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className={styles.productPage}>
      <div className="container">
        <div className={styles.productContent}>
          <div className={styles.productImage}>
            <ProductCarousel images={product.images} productName={product.name} />
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.productPrice}>${product.price.toFixed(2)}</p>

            <div className={styles.productDescription}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p>{product.description}</p>
            </div>

            <div className={styles.productActions}>
              <div className={styles.quantitySelector}>
                <label htmlFor="quantity" className={styles.quantityLabel}>
                  Quantity:
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className={styles.quantitySelect}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.actionButtons}>
                <Button onClick={handleAddToCart}>Add to Cart</Button>
                <button
                  onClick={handleWishlistToggle}
                  className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlistButtonActive : ''}`}
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
                  {isWishlisted ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {product.inStock !== false && (
              <p className={styles.stockInfo}>In Stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
