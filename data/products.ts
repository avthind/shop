import { Product } from '@/types';

// Placeholder product data - replace with real Etsy/Printify data
export const products: Product[] = [
  {
    id: '1',
    name: 'Minimalist Art Print',
    price: 24.99,
    description: 'A beautiful minimalist art print perfect for modern interiors. Printed on high-quality paper with vibrant colors that last.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=800&fit=crop',
    ],
    category: 'Prints',
    inStock: true,
  },
  {
    id: '2',
    name: 'Abstract Canvas Art',
    price: 49.99,
    description: 'Large abstract canvas art piece that adds a touch of sophistication to any room. Handcrafted with attention to detail.',
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=800&fit=crop',
    ],
    category: 'Canvas',
    inStock: true,
  },
  {
    id: '3',
    name: 'Botanical Poster',
    price: 19.99,
    description: 'Elegant botanical poster featuring detailed illustrations. Perfect for nature lovers and plant enthusiasts.',
    images: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop',
    ],
    category: 'Prints',
    inStock: true,
  },
  {
    id: '4',
    name: 'Geometric Wall Art',
    price: 34.99,
    description: 'Modern geometric design wall art that creates a striking focal point. Available in multiple sizes to fit your space.',
    images: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop',
    ],
    category: 'Wall Art',
    inStock: true,
  },
  {
    id: '5',
    name: 'Inspirational Quote Print',
    price: 16.99,
    description: 'Motivational quote print designed with elegant typography. A daily reminder of positivity and inspiration.',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop',
    ],
    category: 'Prints',
    inStock: true,
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

