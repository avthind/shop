import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Product } from '@/types';
import CartItem from '@/components/CartItem';
import * as firestore from '@/lib/firestore';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore');

const mockProduct1: Product = {
  id: '1',
  name: 'Product 1',
  price: 29.99,
  description: 'Description 1',
  images: ['https://via.placeholder.com/400'],
  category: 'electronics',
  inStock: true,
};

const mockProduct2: Product = {
  id: '2',
  name: 'Product 2',
  price: 49.99,
  description: 'Description 2',
  images: ['https://via.placeholder.com/400'],
  category: 'clothing',
  inStock: true,
};

const CartTestComponent = () => {
  const { items, addToCart, getTotalPrice, getTotalItems } = useCart();

  return (
    <div>
      <div data-testid="cart-items-count">{items.length}</div>
      <div data-testid="cart-total-price">{getTotalPrice().toFixed(2)}</div>
      <div data-testid="cart-total-items">{getTotalItems()}</div>
      <button onClick={() => addToCart(mockProduct1, 1)}>Add Product 1</button>
      <button onClick={() => addToCart(mockProduct2, 2)}>Add Product 2</button>
      <div data-testid="cart-items">
        {items.map((item) => (
          <CartItem key={item.product.id} item={item} />
        ))}
      </div>
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

describe('Cart Flow Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (firestore.getCart as jest.Mock).mockResolvedValue([]);
    (firestore.saveCart as jest.Mock).mockResolvedValue(undefined);
  });

  it('should add multiple products to cart and calculate totals', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartTestComponent />);

    // Add first product
    await user.click(screen.getByText('Add Product 1'));
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('29.99');
    });

    // Add second product
    await user.click(screen.getByText('Add Product 2'));
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('129.97'); // 29.99 + (49.99 * 2)
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('3'); // 1 + 2
    });
  });

  it('should display cart items correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartTestComponent />);

    await user.click(screen.getByText('Add Product 1'));
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });
  });

  it('should update quantity in cart item', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartTestComponent />);

    await user.click(screen.getByText('Add Product 1'));
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const quantitySelect = screen.getByLabelText('Quantity');
    await user.selectOptions(quantitySelect, '5');

    await waitFor(() => {
      expect(screen.getByTestId('cart-total-items')).toHaveTextContent('5');
      expect(screen.getByTestId('cart-total-price')).toHaveTextContent('149.95'); // 29.99 * 5
    });
  });

  it('should remove item from cart', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartTestComponent />);

    await user.click(screen.getByText('Add Product 1'));
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove Product 1 from cart');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0');
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    });
  });

  it('should persist cart to localStorage for guest users', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartTestComponent />);

    await user.click(screen.getByText('Add Product 1'));
    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1');
    });

    // Check localStorage
    const savedCart = localStorage.getItem('cart');
    expect(savedCart).toBeTruthy();
    const parsedCart = JSON.parse(savedCart!);
    expect(parsedCart).toHaveLength(1);
    expect(parsedCart[0].product.id).toBe('1');
  });
});
