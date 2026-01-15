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
export async function createOrder(userId: string, order: Omit<Order, 'id'>): Promise<string> {
  const ordersRef = collection(db, 'orders');
  const orderDoc = doc(ordersRef);
  const orderId = orderDoc.id;
  
  await setDoc(orderDoc, {
    ...order,
    id: orderId,
    userId,
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

