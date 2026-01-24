import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

// Mock Firebase for all tests
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore', () => ({
  getCart: jest.fn(() => Promise.resolve([])),
  saveCart: jest.fn(() => Promise.resolve()),
  clearCart: jest.fn(() => Promise.resolve()),
  getWishlist: jest.fn(() => Promise.resolve([])),
  saveWishlist: jest.fn(() => Promise.resolve()),
  createOrder: jest.fn(() => Promise.resolve('order123')),
  getUserOrders: jest.fn(() => Promise.resolve([])),
  getOrderById: jest.fn(() => Promise.resolve(null)),
  updateOrderStatus: jest.fn(() => Promise.resolve()),
  getAllProducts: jest.fn(() => Promise.resolve([])),
  getProductById: jest.fn(() => Promise.resolve(null)),
  createProduct: jest.fn(() => Promise.resolve('product123')),
  updateProduct: jest.fn(() => Promise.resolve()),
  deleteProduct: jest.fn(() => Promise.resolve()),
  getAllOrders: jest.fn(() => Promise.resolve([])),
  getOrdersByDateRange: jest.fn(() => Promise.resolve([])),
  getUserProfile: jest.fn(() => Promise.resolve(null)),
  updateUserProfile: jest.fn(() => Promise.resolve()),
  deleteUserAccount: jest.fn(() => Promise.resolve()),
}));

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
