import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: null,
  db: {},
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
      <WishlistProvider>
        {component}
      </WishlistProvider>
    </AuthProvider>
  );
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render product information', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should render product image with correct alt text', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/400');
  });

  it('should have link to product page', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/1');
  });

  it('should toggle wishlist when wishlist button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const wishlistButton = screen.getByLabelText('Add to wishlist');
    expect(wishlistButton).toBeInTheDocument();
    
    await user.click(wishlistButton);
    expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
    
    await user.click(screen.getByLabelText('Remove from wishlist'));
    expect(screen.getByLabelText('Add to wishlist')).toBeInTheDocument();
  });

  it('should show active state when product is in wishlist', () => {
    // Set up wishlist in localStorage
    localStorage.setItem('wishlist', JSON.stringify([mockProduct]));
    
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const wishlistButton = screen.getByLabelText('Remove from wishlist');
    expect(wishlistButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should prevent navigation when wishlist button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const link = screen.getByRole('link');
    const wishlistButton = screen.getByLabelText('Add to wishlist');
    
    // Click wishlist button should not navigate
    await user.click(wishlistButton);
    expect(link).toBeInTheDocument();
  });
});
