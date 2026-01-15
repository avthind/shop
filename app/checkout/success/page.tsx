import Link from 'next/link';
import { Metadata } from 'next';
import Button from '@/components/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Order Confirmed | Modern Storefront',
  description: 'Your order has been successfully placed. Thank you for your purchase!',
  robots: 'noindex, nofollow',
};

export default function CheckoutSuccessPage() {
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
          <div className={styles.successActions}>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
            <Link href="/account">
              <Button variant="secondary">View Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
