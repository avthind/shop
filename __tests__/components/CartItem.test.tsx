import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItem from '@/components/CartItem';
import { CartItem as CartItemType } from '@/types';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
}));

jest.mock('@/lib/firestore', () => ({
  getCart: jest.fn(() => Promise.resolve([])),
  saveCart: jest.fn(() => Promise.resolve()),
  clearCart: jest.fn(() => Promise.resolve()),
}));

const mockCartItem: CartItemType = {
  product: {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    description: 'Test description',
    images: ['https://via.placeholder.com/400'],
    category: 'electronics',
    inStock: true,
  },
  quantity: 2,
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

describe('CartItem Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render product information', () => {
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should display correct quantity', () => {
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    const select = screen.getByLabelText('Quantity');
    expect(select).toHaveValue('2');
  });

  it('should display correct item total', () => {
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    // 29.99 * 2 = 59.98
    expect(screen.getByText('$59.98')).toBeInTheDocument();
  });

  it('should update quantity when select changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    const select = screen.getByLabelText('Quantity');
    await user.selectOptions(select, '5');
    
    expect(select).toHaveValue('5');
  });

  it('should remove item when remove button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    const removeButton = screen.getByLabelText('Remove Test Product from cart');
    await user.click(removeButton);
    
    // Item should be removed from cart
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('should have link to product page', () => {
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    const links = screen.getAllByRole('link');
    const productLink = links.find(link => link.getAttribute('href') === '/product/1');
    expect(productLink).toBeInTheDocument();
  });

  it('should display product image', () => {
    renderWithProviders(<CartItem item={mockCartItem} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
  });
});
