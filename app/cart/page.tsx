'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/CartItem';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function CartPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const total = getTotalPrice();

  return (
    <div className={styles.cartPage}>
      <div className="container">
        <h1 className={styles.pageTitle}>shopping cart</h1>

        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <p className={styles.emptyCartText}>your cart is empty.</p>
            <Link href="/shop">
              <Button>continue shopping</Button>
            </Link>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.summaryContent}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>subtotal</span>
                  <span className={styles.summaryValue}>${total.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>shipping</span>
                  <span className={styles.summaryValue}>calculated at checkout</span>
                </div>
                <div className={styles.summaryDivider}></div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabelTotal}>total</span>
                  <span className={styles.summaryValueTotal}>${total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className={styles.checkoutButton}>
                  <Button>proceed to checkout</Button>
                </Link>
                <button onClick={clearCart} className={styles.clearCartButton}>
                  clear cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
