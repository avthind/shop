import Link from 'next/link';
import Button from '@/components/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>Product Not Found</h1>
          <p className={styles.notFoundText}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

