import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = variant === 'primary' ? 'button-primary' : 'button-secondary';
  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}

