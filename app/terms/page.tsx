import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service | inxvinx',
  description: 'Read our terms of service to understand the rules and regulations for using our website and services.',
  robots: 'index, follow',
};

export default function TermsPage() {
  return (
    <div className={styles.termsPage}>
      <div className="container">
        <div className={styles.termsContent}>
          <h1 className={styles.pageTitle}>Terms of Service</h1>
          <div className={`${styles.content} preserve-case`}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Agreement to Terms</h2>
              <p>
                By accessing or using our website, you agree to be bound by these Terms of
                Service and all applicable laws and regulations.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Use License</h2>
              <p>
                Permission is granted to temporarily access the materials on our website for
                personal, non-commercial use only.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Product Information</h2>
              <p>
                We strive to provide accurate product descriptions and images, but we do not
                warrant that product descriptions or other content on this site is accurate,
                complete, reliable, current, or error-free.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Orders and Payment</h2>
              <p>
                All orders are subject to product availability and our acceptance of your order.
                We reserve the right to refuse or cancel any order at our discretion.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Returns and Refunds</h2>
              <p>
                Please review our return policy before making a purchase. Returns must be made
                within the specified time period and in accordance with our return policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Us</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at
                inxvinx@gmail.com
              </p>
            </section>

            <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
