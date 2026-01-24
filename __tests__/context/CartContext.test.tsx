import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Product, CartItem } from '@/types';
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
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();

  return (
    <div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="total-price">{getTotalPrice().toFixed(2)}</div>
      <div data-testid="total-items">{getTotalItems()}</div>
      <button onClick={() => addToCart(mockProduct, 1)}>Add to Cart</button>
      <button onClick={() => addToCart(mockProduct, 2)}>Add 2 to Cart</button>
      <button onClick={() => removeFromCart('1')}>Remove from Cart</button>
      <button onClick={() => updateQuantity('1', 5)}>Update Quantity</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
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

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (firestore.getCart as jest.Mock).mockResolvedValue([]);
    (firestore.saveCart as jest.Mock).mockResolvedValue(undefined);
    (firestore.clearCart as jest.Mock).mockResolvedValue(undefined);
  });

  it('should provide cart context', () => {
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('items-count')).toBeInTheDocument();
  });

  it('should add product to cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    const addButton = screen.getByText('Add to Cart');
    await user.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
  });

  it('should add multiple quantities of same product', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Cart'));
    await user.click(screen.getByText('Add 2 to Cart'));
    
    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('3');
    });
  });

  it('should remove product from cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Remove from Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  it('should update product quantity', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Cart'));
    await user.click(screen.getByText('Update Quantity'));
    
    await waitFor(() => {
      expect(screen.getByTestId('total-items')).toHaveTextContent('5');
    });
  });

  it('should calculate total price correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add 2 to Cart'));
    
    await waitFor(() => {
      // 29.99 * 2 = 59.98
      expect(screen.getByTestId('total-price')).toHaveTextContent('59.98');
    });
  });

  it('should clear cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);
    
    await user.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
    
    await user.click(screen.getByText('Clear Cart'));
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  it('should load cart from localStorage for guest users', async () => {
    const savedCart: CartItem[] = [
      { product: mockProduct, quantity: 2 }
    ];
    localStorage.setItem('cart', JSON.stringify(savedCart));
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });
  });

  it('should load cart from Firestore for authenticated users', async () => {
    const mockUser = { uid: 'user123' };
    const savedCart: CartItem[] = [
      { product: mockProduct, quantity: 3 }
    ];
    
    (firestore.getCart as jest.Mock).mockResolvedValue(savedCart);
    
    // Mock auth context to return user
    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === require('@/context/AuthContext').AuthContext) {
        return { currentUser: mockUser, loading: false };
      }
      return undefined;
    });
    
    renderWithProviders(<TestComponent />);
    
    await waitFor(() => {
      expect(firestore.getCart).toHaveBeenCalledWith('user123');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleSpy.mockRestore();
  });
});
