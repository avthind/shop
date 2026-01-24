import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Product } from '@/types';
import * as firestore from '@/lib/firestore';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore');

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(),
  })),
}));

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  description: 'Test description',
  images: ['https://via.placeholder.com/400'],
  category: 'electronics',
  inStock: true,
};

const CheckoutTestComponent = () => {
  const { items, addToCart, getTotalPrice, clearCart } = useCart();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Simulate checkout process
    const total = getTotalPrice();
    
    // Create payment intent
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });

    if (response.ok) {
      const { paymentIntentId } = await response.json();
      
      // Create order
      const order = {
        items,
        total,
        date: new Date().toISOString(),
        status: 'pending' as const,
        paymentIntentId,
      };

      await firestore.createOrder(null, order);
      clearCart();
    }
  };

  return (
    <div>
      <div data-testid="cart-items-count">{items.length}</div>
      <div data-testid="cart-total">{getTotalPrice().toFixed(2)}</div>
      <button onClick={() => addToCart(mockProduct, 2)}>Add to Cart</button>
      <button onClick={handleCheckout} data-testid="checkout-button">
        Checkout
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <CartProvider>
        {component}
      </CartProvider>
    </AuthProvider>
  );
};

describe('Checkout Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (firestore.getCart as jest.Mock).mockResolvedValue([]);
    (firestore.saveCart as jest.Mock).mockResolvedValue(undefined);
    (firestore.createOrder as jest.Mock).mockResolvedValue('order123');

    // Mock fetch for payment intent
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      }),
    });
  });

  it('should complete checkout flow', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutTestComponent />);

    // Add items to cart
    await user.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('59.98'); // 29.99 * 2
    });

    // Proceed to checkout
    await user.click(screen.getByTestId('checkout-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/payment/create-intent',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ amount: 59.98 }),
        })
      );
      expect(firestore.createOrder).toHaveBeenCalled();
    });

    // Cart should be cleared after checkout
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
    });
  });

  it('should not checkout with empty cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutTestComponent />);

    await user.click(screen.getByTestId('checkout-button'));

    // Should not call payment API
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('should handle payment intent creation failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Payment failed' }),
    });

    const user = userEvent.setup();
    renderWithProviders(<CheckoutTestComponent />);

    await user.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1');
    });

    await user.click(screen.getByTestId('checkout-button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      // Order should not be created if payment fails
      expect(firestore.createOrder).not.toHaveBeenCalled();
      // Cart should not be cleared
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1');
    });
  });
});
