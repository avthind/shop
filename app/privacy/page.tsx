import { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | inxvinx',
  description: 'Read our privacy policy to learn how we collect, use, and protect your personal information in compliance with GDPR.',
  robots: 'index, follow',
};

export default function PrivacyPage() {
  const lastUpdated = 'January 24, 2025';

  return (
    <div className={styles.privacyPage}>
      <div className="container">
        <div className={styles.privacyContent}>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: {lastUpdated}</p>

          <div className={`${styles.content} preserve-case`}>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Introduction</h2>
              <p>
                This Privacy Policy describes how inxvinx ("we", "our", or "us") collects, uses, 
                and protects your personal information when you use our website and services. 
                We are committed to protecting your privacy and ensuring compliance with the 
                General Data Protection Regulation (GDPR) and other applicable data protection laws.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Data Controller</h2>
              <p>
                The data controller responsible for your personal information is:
              </p>
              <p>
                <strong>inxvinx</strong><br />
                Email: inxvinx@gmail.com
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Information We Collect</h2>
              
              <h3 className={styles.subsectionTitle}>3.1 Information You Provide</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Order Information:</strong> Shipping address, billing address, phone number, and payment information</li>
                <li><strong>Profile Information:</strong> Name, email, phone number, and address in your account profile</li>
                <li><strong>Communication:</strong> Messages and inquiries you send to us</li>
              </ul>

              <h3 className={styles.subsectionTitle}>3.2 Automatically Collected Information</h3>
              <p>When you visit our website, we automatically collect certain information, including:</p>
              <ul>
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>4. How We Use Your Information</h2>
              <p>We use the information we collect for the following purposes:</p>
              <ul>
                <li><strong>Order Processing:</strong> To process and fulfill your orders, including shipping and customer service</li>
                <li><strong>Account Management:</strong> To create and manage your account, process transactions, and provide customer support</li>
                <li><strong>Communication:</strong> To send you order confirmations, shipping updates, and respond to your inquiries</li>
                <li><strong>Website Improvement:</strong> To analyze usage patterns, improve our website functionality, and enhance user experience</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights and interests</li>
                <li><strong>Marketing (with consent):</strong> To send you promotional communications if you have opted in</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Legal Basis for Processing (GDPR)</h2>
              <p>We process your personal data based on the following legal grounds:</p>
              <ul>
                <li><strong>Contract Performance:</strong> To fulfill our contract with you (processing orders, providing services)</li>
                <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, and ensure website security</li>
                <li><strong>Consent:</strong> For marketing communications and non-essential cookies (you can withdraw consent at any time)</li>
                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>6. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>Service Providers:</strong> With third-party service providers who assist us in operating our website, processing payments, and fulfilling orders (e.g., payment processors, shipping companies)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>7. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or destruction. 
                These measures include:
              </p>
              <ul>
                <li>Encryption of data in transit (HTTPS/SSL)</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
              <p>
                Your data is stored on secure servers provided by Firebase (Google Cloud Platform). 
                We retain your personal information only for as long as necessary to fulfill the 
                purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>8. Your Rights (GDPR)</h2>
              <p>Under GDPR and other applicable data protection laws, you have the following rights:</p>
              <ul>
                <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at inxvinx@gmail.com. 
                We will respond to your request within 30 days.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>9. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your browsing experience, 
                analyze website traffic, and personalize content. You can control cookies through your 
                browser settings. For more information, please see our Cookie Policy (if applicable).
              </p>
              <p>
                <strong>Essential Cookies:</strong> Required for the website to function properly (cannot be disabled)
              </p>
              <p>
                <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (can be disabled)
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>10. International Data Transfers</h2>
              <p>
                Your personal information may be transferred to and processed in countries outside 
                the European Economic Area (EEA). We ensure that such transfers comply with GDPR 
                requirements through appropriate safeguards, such as Standard Contractual Clauses 
                or adequacy decisions.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>11. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 16. We do not 
                knowingly collect personal information from children. If you believe we have 
                collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>12. Data Retention</h2>
              <p>We retain your personal information for the following periods:</p>
              <ul>
                <li><strong>Account Data:</strong> Until you delete your account or request deletion</li>
                <li><strong>Order Data:</strong> 7 years (for tax and legal compliance purposes)</li>
                <li><strong>Marketing Data:</strong> Until you unsubscribe or withdraw consent</li>
                <li><strong>Analytics Data:</strong> 26 months (Google Analytics default)</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>13. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the "Last updated" 
                date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>14. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy 
                or our data practices, please contact us:
              </p>
              <p>
                <strong>Email:</strong> inxvinx@gmail.com<br />
                <strong>Subject Line:</strong> Privacy Policy Inquiry
              </p>
              <p>
                For EU residents, you also have the right to contact your local data protection 
                authority if you have concerns about how we handle your personal data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
