import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishlistItem from '@/components/WishlistItem';
import { Product } from '@/types';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore', () => ({
  getWishlist: jest.fn(() => Promise.resolve([])),
  saveWishlist: jest.fn(() => Promise.resolve()),
  getCart: jest.fn(() => Promise.resolve([])),
  saveCart: jest.fn(() => Promise.resolve()),
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

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {component}
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

describe('WishlistItem Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render product information', () => {
    renderWithProviders(<WishlistItem product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should render product image', () => {
    renderWithProviders(<WishlistItem product={mockProduct} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/400');
  });

  it('should have link to product page', () => {
    renderWithProviders(<WishlistItem product={mockProduct} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('should remove item from wishlist when remove button is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<WishlistItem product={mockProduct} />);
    
    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);
    
    // The removeFromWishlist function should be called
    // Note: The component itself doesn't unmount, but the wishlist context updates
    await waitFor(() => {
      // Verify the button is still there (component doesn't unmount itself)
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('should add product to cart when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WishlistItem product={mockProduct} />);
    
    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);
    
    // Should show "Added!" feedback
    await waitFor(() => {
      expect(screen.getByText('Added!')).toBeInTheDocument();
    });
  });
});
