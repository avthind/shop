'use client';

import React, { useState } from 'react';
import { validateEmail, validateName, sanitizeEmail, sanitizeName, sanitizeString } from '@/lib/validation';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate name
    const nameValidation = validateName(formData.name, 'Name');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Invalid name';
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    // Validate subject
    if (!formData.subject || formData.subject.trim() === '') {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    // Validate message
    if (!formData.message || formData.message.trim() === '') {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      // Sanitize data
      const sanitizedData = {
        name: sanitizeName(formData.name),
        email: sanitizeEmail(formData.email),
        subject: sanitizeString(formData.subject),
        message: sanitizeString(formData.message),
      };

      // Send email via API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <div className="container">
        <div className={styles.contactContent}>
          <div className={styles.aboutSection}>
            <h1 className={styles.pageTitle}>About</h1>
            <div className={styles.aboutContent}>
              <p>
                Welcome to inxvinx, your destination for unique and thoughtfully designed products.
                We're passionate about creating items that bring beauty and functionality into your everyday life.
              </p>
              <p>
                Our mission is to offer high-quality products with a focus on clean, minimal design
                that stands the test of time. Each item is carefully curated to ensure it meets our
                standards for quality and aesthetics.
              </p>
              <p>
                Thank you for being part of our community. We're here to help and would love to hear
                from you if you have any questions, feedback, or suggestions.
              </p>
            </div>
          </div>

          <div className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            {submitted ? (
              <div className={styles.successMessage}>
                <p>Thank you for your message! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                {errors.submit && <div className={styles.error}>{errors.submit}</div>}
                
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    required
                  />
                  {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    required
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.label}>
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                    required
                  />
                  {errors.subject && <span className={styles.errorMessage}>{errors.subject}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    required
                  />
                  {errors.message && <span className={styles.errorMessage}>{errors.message}</span>}
                </div>

                <Button type="submit" disabled={submitting} className={styles.submitButton}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
