import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            &copy; 2026 inxvinx. all rights reserved.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://www.etsy.com/shop/inxvinx?ref=seller-platform-mcnav#items" aria-label="Etsy" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              etsy
            </a>
            <a href="mailto:inxvinx@gmail.com" aria-label="Email" className={styles.socialLink}>
              email
            </a>
            <Link href="/contact" className={styles.socialLink}>
              contact
            </Link>
            <Link href="/privacy" className={styles.socialLink}>
              privacy policy
            </Link>
            <Link href="/terms" className={styles.socialLink}>
              terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

