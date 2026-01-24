'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, sanitizeEmail } from '@/lib/validation';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

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
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
    // Clear confirm password error if passwords match
    if (value === confirmPassword && errors.confirmPassword) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    // Validate password
    const passwordValidation = validatePassword(password, 6);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error || 'Invalid password';
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Sanitize email before signup
      const sanitizedEmail = sanitizeEmail(email);
      await signup(sanitizedEmail, password, displayName.trim() || undefined);
      router.push('/account');
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors({});
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      router.push('/account');
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to sign up with Google' });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className="container">
        <div className={styles.authContent}>
          <h1 className={styles.title}>sign up</h1>
          {errors.submit && <div className={styles.error}>{errors.submit}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="displayName" className={styles.label}>
                name (optional)
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={styles.input}
                autoComplete="name"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                email
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
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                required
                autoComplete="new-password"
                minLength={6}
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                required
                autoComplete="new-password"
                minLength={6}
              />
              {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
            </div>
            <Button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'creating account...' : 'sign up'}
            </Button>
            <div className={styles.links}>
              <Link href="/login" className={styles.link}>
                already have an account? sign in
              </Link>
            </div>
          </form>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className={styles.googleButton}
            disabled={googleLoading || loading}
            variant="secondary"
          >
            <span className={styles.googleButtonContent}>
              <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? 'signing up...' : 'continue with google'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
