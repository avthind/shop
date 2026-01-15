'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import styles from './CartItem.module.css';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQuantity(product.id, parseInt(e.target.value));
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  return (
    <div className={styles.cartItem}>
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <Image
          src={product.images[0]}
          alt={product.name}
          width={120}
          height={120}
          className={styles.image}
        />
      </Link>

      <div className={styles.cartItemContent}>
        <div className={styles.cartItemInfo}>
          <Link href={`/product/${product.id}`} className={styles.productName}>
            {product.name}
          </Link>
          <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
        </div>

        <div className={styles.cartItemActions}>
          <div className={styles.quantitySelector}>
            <label htmlFor={`quantity-${product.id}`} className="sr-only">
              Quantity
            </label>
            <select
              id={`quantity-${product.id}`}
              value={quantity}
              onChange={handleQuantityChange}
              className={styles.quantitySelect}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.itemTotal}>
            ${(product.price * quantity).toFixed(2)}
          </div>

          <button
            onClick={handleRemove}
            className={styles.removeButton}
            aria-label={`Remove ${product.name} from cart`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

