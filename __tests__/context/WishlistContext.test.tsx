import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
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

const TestComponent = () => {
  const { items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist } = useWishlist();

  return (
    <div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="is-in-wishlist">{isInWishlist('1') ? 'true' : 'false'}</div>
      <button onClick={() => addToWishlist(mockProduct)}>Add to Wishlist</button>
      <button onClick={() => removeFromWishlist('1')}>Remove from Wishlist</button>
      <button onClick={() => clearWishlist()}>Clear Wishlist</button>
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

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (firestore.getWishlist as jest.Mock).mockResolvedValue([]);
    (firestore.saveWishlist as jest.Mock).mockResolvedValue(undefined);
  });

  it('should provide wishlist context', () => {
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('items-count')).toBeInTheDocument();
  });

  it('should add product to wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Wishlist'));
    
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');
    });
  });

  it('should not add duplicate product to wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Wishlist'));
    await user.click(screen.getByText('Add to Wishlist'));
    
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
  });

  it('should remove product from wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Remove from Wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');
    });
  });

  it('should check if product is in wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('false');
    
    await user.click(screen.getByText('Add to Wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('is-in-wishlist')).toHaveTextContent('true');
    });
  });

  it('should clear wishlist', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Clear Wishlist'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  it('should load wishlist from localStorage for guest users', async () => {
    localStorage.setItem('wishlist', JSON.stringify([mockProduct]));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useWishlist must be used within a WishlistProvider');
    
    consoleSpy.mockRestore();
  });
});
