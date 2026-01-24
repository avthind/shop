import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import * as firestore from '@/lib/firestore';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore');

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  description: 'Test description',
  images: ['https://via.placeholder.com/400'],
  category: 'electronics',
  inStock: true,
};

const WishlistTestComponent = () => {
  const { items, isInWishlist } = useWishlist();

  return (
    <div>
      <div data-testid="wishlist-items-count">{items.length}</div>
      <div data-testid="is-in-wishlist">{isInWishlist('1') ? 'true' : 'false'}</div>
      <ProductCard product={mockProduct} />
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <WishlistProvider>
        {component}
      </WishlistProvider>
    </AuthProvider>
  );
};

describe('Wishlist Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (firestore.getWishlist as jest.Mock).mockResolvedValue([]);
    (firestore.saveWishlist as jest.Mock).mockResolvedValue(undefined);
  });

  it('should add product to wishlist via ProductCard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WishlistTestComponent />);

    const wishlistButton = screen.getByLabelText('Add to wishlist');
    await user.click(wishlistButton);

    await waitFor(() => {
      expect(screen.getByTestId('wishlist-items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');
      expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
    });
  });

  it('should remove product from wishlist via ProductCard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WishlistTestComponent />);

    // Add to wishlist
    await user.click(screen.getByLabelText('Add to wishlist'));
    await waitFor(() => {
      expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
    });

    // Remove from wishlist
    await user.click(screen.getByLabelText('Remove from wishlist'));

    await waitFor(() => {
      expect(screen.getByTestId('wishlist-items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');
      expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument();
    });
  });

  it('should persist wishlist to localStorage for guest users', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WishlistTestComponent />);

    await user.click(screen.getByLabelText('Add to wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('wishlist-items-count')).toHaveTextContent('1');
    });

    // Check localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    expect(savedWishlist).toBeTruthy();
    const parsedWishlist = JSON.parse(savedWishlist!);
    expect(parsedWishlist).toHaveLength(1);
    expect(parsedWishlist[0].id).toBe('1');
  });

  it('should not add duplicate products to wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<WishlistTestComponent />);

    await user.click(screen.getByLabelText('Add to wishlist'));
    await user.click(screen.getByLabelText('Remove from wishlist'));
    await user.click(screen.getByLabelText('Add to wishlist'));

    await waitFor(() => {
      expect(screen.getByTestId('wishlist-items-count')).toHaveTextContent('1');
    });
  });
});
