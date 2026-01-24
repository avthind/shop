// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category?: string;
  inStock?: boolean;
}

// Cart item type
export interface CartItem {
  product: Product;
  quantity: number;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
}

// Order type
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  userId?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  customerEmail?: string;
  customerName?: string;
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paymentMethod?: string;
}

