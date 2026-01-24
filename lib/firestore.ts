import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { CartItem, Product, Order } from '@/types';

// Cart operations
export async function getCart(userId: string): Promise<CartItem[]> {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);
  
  if (cartSnap.exists()) {
    return cartSnap.data().items || [];
  }
  return [];
}

export async function saveCart(userId: string, items: CartItem[]): Promise<void> {
  const cartRef = doc(db, 'carts', userId);
  await setDoc(cartRef, { items, updatedAt: Timestamp.now() }, { merge: true });
}

export async function clearCart(userId: string): Promise<void> {
  const cartRef = doc(db, 'carts', userId);
  await setDoc(cartRef, { items: [], updatedAt: Timestamp.now() }, { merge: true });
}

// Wishlist operations
export async function getWishlist(userId: string): Promise<Product[]> {
  const wishlistRef = doc(db, 'wishlists', userId);
  const wishlistSnap = await getDoc(wishlistRef);
  
  if (wishlistSnap.exists()) {
    return wishlistSnap.data().items || [];
  }
  return [];
}

export async function saveWishlist(userId: string, items: Product[]): Promise<void> {
  const wishlistRef = doc(db, 'wishlists', userId);
  await setDoc(wishlistRef, { items, updatedAt: Timestamp.now() }, { merge: true });
}

// Orders operations
export async function createOrder(userId: string | null, order: Omit<Order, 'id'>): Promise<string> {
  const ordersRef = collection(db, 'orders');
  const orderDoc = doc(ordersRef);
  const orderId = orderDoc.id;
  
  await setDoc(orderDoc, {
    ...order,
    id: orderId,
    userId: userId || null,
    isGuest: userId === null,
    createdAt: Timestamp.now(),
  });
  
  return orderId;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      date: data.createdAt?.toDate().toISOString() || data.date,
    } as Order;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// User profile operations
export async function getUserProfile(userId: string) {
  const profileRef = doc(db, 'profiles', userId);
  const profileSnap = await getDoc(profileRef);
  
  if (profileSnap.exists()) {
    return profileSnap.data();
  }
  return null;
}

export async function updateUserProfile(userId: string, data: any): Promise<void> {
  const profileRef = doc(db, 'profiles', userId);
  await setDoc(profileRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

// Delete user account and all associated data
export async function deleteUserAccount(userId: string): Promise<void> {
  // Delete user profile
  const profileRef = doc(db, 'profiles', userId);
  await deleteDoc(profileRef);

  // Delete user cart
  const cartRef = doc(db, 'carts', userId);
  await deleteDoc(cartRef);

  // Delete user wishlist
  const wishlistRef = doc(db, 'wishlists', userId);
  await deleteDoc(wishlistRef);

  // Note: Orders are typically kept for legal/tax purposes
  // but can be anonymized if needed
  // You may want to update orders to remove personal information
  // instead of deleting them entirely
}

// Admin: Product operations
export async function getAllProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products');
  const querySnapshot = await getDocs(productsRef);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Product)).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProductById(productId: string): Promise<Product | null> {
  const productRef = doc(db, 'products', productId);
  const productSnap = await getDoc(productRef);
  
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() } as Product;
  }
  return null;
}

export async function createProduct(product: Omit<Product, 'id'>, adminId: string): Promise<string> {
  const productsRef = collection(db, 'products');
  const productDoc = doc(productsRef);
  const productId = productDoc.id;
  
  await setDoc(productDoc, {
    ...product,
    id: productId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: adminId,
  });
  
  return productId;
}

export async function updateProduct(productId: string, updates: Partial<Product>, adminId: string): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await updateDoc(productRef, {
    ...updates,
    updatedAt: Timestamp.now(),
    updatedBy: adminId,
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  const productRef = doc(db, 'products', productId);
  await deleteDoc(productRef);
}

// Admin: Order operations
export async function getAllOrders(): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const querySnapshot = await getDocs(ordersRef);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      date: data.createdAt?.toDate().toISOString() || data.date,
    } as Order;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (orderSnap.exists()) {
    const data = orderSnap.data();
    return {
      ...data,
      id: orderSnap.id,
      date: data.createdAt?.toDate().toISOString() || data.date,
    } as Order;
  }
  return null;
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: Timestamp.now(),
  });
}

// Admin: Analytics
export async function getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
  const ordersRef = collection(db, 'orders');
  const querySnapshot = await getDocs(ordersRef);
  
  return querySnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.createdAt?.toDate().toISOString() || data.date,
      } as Order;
    })
    .filter((order) => {
      const orderDate = new Date(order.date);
      return orderDate >= startDate && orderDate <= endDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

