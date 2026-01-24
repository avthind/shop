import {
  getCart,
  saveCart,
  clearCart,
  getWishlist,
  saveWishlist,
  createOrder,
  getUserOrders,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByDateRange,
} from '@/lib/firestore';
import { CartItem, Product, Order } from '@/types';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('Firestore Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cart Operations', () => {
    it('should get cart for user', async () => {
      const mockCart: CartItem[] = [
        {
          product: {
            id: '1',
            name: 'Test Product',
            price: 29.99,
            description: 'Test',
            images: ['image.jpg'],
          },
          quantity: 2,
        },
      ];

      const mockDoc = {
        exists: () => true,
        data: () => ({ items: mockCart }),
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getCart('user123');
      expect(result).toEqual(mockCart);
      expect(doc).toHaveBeenCalledWith(db, 'carts', 'user123');
    });

    it('should return empty array if cart does not exist', async () => {
      const mockDoc = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getCart('user123');
      expect(result).toEqual([]);
    });

    it('should save cart for user', async () => {
      const mockCart: CartItem[] = [];
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await saveCart('user123', mockCart);
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { items: mockCart, updatedAt: expect.any(Object) },
        { merge: true }
      );
    });

    it('should clear cart for user', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await clearCart('user123');
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { items: [], updatedAt: expect.any(Object) },
        { merge: true }
      );
    });
  });

  describe('Wishlist Operations', () => {
    it('should get wishlist for user', async () => {
      const mockWishlist: Product[] = [
        {
          id: '1',
          name: 'Test Product',
          price: 29.99,
          description: 'Test',
          images: ['image.jpg'],
        },
      ];

      const mockDoc = {
        exists: () => true,
        data: () => ({ items: mockWishlist }),
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockDoc);

      const result = await getWishlist('user123');
      expect(result).toEqual(mockWishlist);
    });

    it('should save wishlist for user', async () => {
      const mockWishlist: Product[] = [];
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await saveWishlist('user123', mockWishlist);
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('Order Operations', () => {
    it('should create order', async () => {
      const mockOrder: Omit<Order, 'id'> = {
        items: [],
        total: 100,
        date: new Date().toISOString(),
        status: 'pending',
      };

      (collection as jest.Mock).mockReturnValue({});
      (doc as jest.Mock).mockReturnValue({ id: 'order123' });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await createOrder('user123', mockOrder);
      expect(result).toBe('order123');
      expect(setDoc).toHaveBeenCalled();
    });

    it('should get user orders', async () => {
      const mockDate = new Date();
      const mockTimestamp = {
        seconds: Math.floor(mockDate.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => mockDate,
      };

      const mockOrders = [
        {
          id: 'order1',
          data: () => ({
            userId: 'user123',
            items: [],
            total: 100,
            date: mockDate.toISOString(),
            status: 'pending',
            createdAt: mockTimestamp,
          }),
        },
      ];

      (collection as jest.Mock).mockReturnValue({});
      (query as jest.Mock).mockReturnValue({});
      (where as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockOrders,
      });

      const result = await getUserOrders('user123');
      expect(result).toHaveLength(1);
      expect(query).toHaveBeenCalled();
    });
  });

  describe('Product Operations', () => {
    it('should get all products', async () => {
      const mockProducts = [
        {
          id: '1',
          data: () => ({
            name: 'Product 1',
            price: 29.99,
            description: 'Test',
            images: ['image.jpg'],
          }),
        },
        {
          id: '2',
          data: () => ({
            name: 'Product 2',
            price: 39.99,
            description: 'Test',
            images: ['image2.jpg'],
          }),
        },
      ];

      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockProducts,
      });

      const result = await getAllProducts();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Product 1');
    });

    it('should get product by id', async () => {
      const mockProduct = {
        id: '1',
        exists: () => true,
        data: () => ({
          name: 'Test Product',
          price: 29.99,
          description: 'Test',
          images: ['image.jpg'],
        }),
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockProduct);

      const result = await getProductById('1');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('Test Product');
    });

    it('should return null if product does not exist', async () => {
      const mockProduct = {
        id: '1',
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockProduct);

      const result = await getProductById('1');
      expect(result).toBeNull();
    });

    it('should create product', async () => {
      const mockProduct: Omit<Product, 'id'> = {
        name: 'New Product',
        price: 29.99,
        description: 'Test',
        images: ['image.jpg'],
      };

      (collection as jest.Mock).mockReturnValue({});
      (doc as jest.Mock).mockReturnValue({ id: 'product123' });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await createProduct(mockProduct, 'admin123');
      expect(result).toBe('product123');
      expect(setDoc).toHaveBeenCalled();
    });

    it('should update product', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateProduct('product123', { price: 39.99 }, 'admin123');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should delete product', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteProduct('product123');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('Order Management', () => {
    it('should get all orders', async () => {
      const mockDate = new Date();
      const mockTimestamp = {
        seconds: Math.floor(mockDate.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => mockDate,
      };

      const mockOrders = [
        {
          id: 'order1',
          data: () => ({
            items: [],
            total: 100,
            date: mockDate.toISOString(),
            status: 'pending',
            createdAt: mockTimestamp,
          }),
        },
      ];

      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockOrders,
      });

      const result = await getAllOrders();
      expect(result).toHaveLength(1);
    });

    it('should get order by id', async () => {
      const mockDate = new Date();
      const mockTimestamp = {
        seconds: Math.floor(mockDate.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => mockDate,
      };

      const mockOrder = {
        id: 'order123',
        exists: () => true,
        data: () => ({
          items: [],
          total: 100,
          date: mockDate.toISOString(),
          status: 'pending',
          createdAt: mockTimestamp,
        }),
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockOrder);

      const result = await getOrderById('order123');
      expect(result).toBeTruthy();
      expect(result?.id).toBe('order123');
    });

    it('should update order status', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      await updateOrderStatus('order123', 'shipped');
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should get orders by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockDate = new Date('2024-06-15');
      const mockTimestamp = {
        seconds: Math.floor(mockDate.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => mockDate,
      };

      const mockOrders = [
        {
          id: 'order1',
          data: () => ({
            items: [],
            total: 100,
            date: '2024-06-15T00:00:00.000Z',
            status: 'pending',
            createdAt: mockTimestamp,
          }),
        },
      ];

      (collection as jest.Mock).mockReturnValue({});
      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockOrders,
      });

      const result = await getOrdersByDateRange(startDate, endDate);
      expect(result).toHaveLength(1);
    });
  });

  describe('User Profile Operations', () => {
    it('should get user profile', async () => {
      const mockProfile = {
        exists: () => true,
        data: () => ({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockProfile);

      const result = await getUserProfile('user123');
      expect(result).toBeTruthy();
      expect(result?.name).toBe('John Doe');
    });

    it('should return null if profile does not exist', async () => {
      const mockProfile = {
        exists: () => false,
      };

      (doc as jest.Mock).mockReturnValue({});
      (getDoc as jest.Mock).mockResolvedValue(mockProfile);

      const result = await getUserProfile('user123');
      expect(result).toBeNull();
    });

    it('should update user profile', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await updateUserProfile('user123', { name: 'Jane Doe' });
      expect(setDoc).toHaveBeenCalled();
    });

    it('should delete user account', async () => {
      (doc as jest.Mock).mockReturnValue({});
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteUserAccount('user123');
      expect(deleteDoc).toHaveBeenCalledTimes(3); // profile, cart, wishlist
    });
  });
});
