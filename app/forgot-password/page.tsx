'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, sanitizeEmail } from '@/lib/validation';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    if (message) {
      setMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.error || 'Invalid email' });
      return;
    }

    setLoading(true);

    try {
      // Sanitize email before sending
      const sanitizedEmail = sanitizeEmail(email);
      await resetPassword(sanitizedEmail);
      setMessage('Check your email for password reset instructions');
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className="container">
        <div className={styles.authContent}>
          <h1 className={styles.title}>Reset Password</h1>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}
          {message && <div className={styles.message}>{message}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                required
                autoComplete="email"
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>
            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
