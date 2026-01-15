import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | inxvinx',
  description: 'Read our privacy policy to learn how we collect, use, and protect your personal information.',
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return (
    <div className={styles.privacyPage}>
      <div className="container">
        <div className={styles.privacyContent}>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <div className={`${styles.content} preserve-case`}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Introduction</h2>
              <p>
                This Privacy Policy describes how we collect, use, and protect your personal
                information when you use our website.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, including when you
                create an account, make a purchase, or contact us for support.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
              <p>
                We use the information we collect to process your orders, communicate with you,
                and improve our services.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Data Protection</h2>
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at
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
