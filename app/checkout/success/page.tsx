'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const orderId = searchParams.get('orderId');
  const email = searchParams.get('email');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Extract short order number from full ID (first 8 characters)
    if (orderId) {
      setOrderNumber(orderId.substring(0, 8).toUpperCase());
    }
  }, [orderId]);

  const isGuest = !currentUser;

  return (
    <div className={styles.successPage}>
      <div className="container">
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className={styles.successTitle}>Order Placed Successfully!</h1>
          <p className={styles.successMessage}>
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          
          {orderNumber && (
            <div className={styles.orderInfo}>
              <p className={styles.orderNumber}>
                <strong>Order Number:</strong> {orderNumber}
              </p>
              {isGuest && email && (
                <p className={styles.trackingNote}>
                  Use your email ({email}) and order number to <Link href="/order-tracking">track your order</Link>.
                </p>
              )}
            </div>
          )}

          <div className={styles.successActions}>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
            {currentUser ? (
              <Link href="/account">
                <Button variant="secondary">View Orders</Button>
              </Link>
            ) : (
              <Link href="/order-tracking">
                <Button variant="secondary">Track Order</Button>
              </Link>
            )}
            {isGuest && (
              <Link href="/signup">
                <Button variant="secondary">Create Account</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.successPage}>
        <div className="container">
          <div className={styles.successContent}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
