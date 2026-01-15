'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';
import { getWishlist, saveWishlist } from '@/lib/firestore';

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load wishlist from Firestore (if logged in) or localStorage (if not)
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          // Load from Firestore
          const firestoreWishlist = await getWishlist(currentUser.uid);
          setItems(firestoreWishlist);
        } else {
          // Load from localStorage
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              setItems(JSON.parse(savedWishlist));
            } catch (error) {
              console.error('Error loading wishlist from localStorage:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [currentUser]);

  // Save wishlist to Firestore (if logged in) or localStorage (if not)
  useEffect(() => {
    if (loading) return;

    const saveWishlistData = async () => {
      try {
        if (currentUser) {
          // Save to Firestore
          await saveWishlist(currentUser.uid, items);
        } else {
          // Save to localStorage
          localStorage.setItem('wishlist', JSON.stringify(items));
        }
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    };

    saveWishlistData();
  }, [items, currentUser, loading]);

  const addToWishlist = (product: Product) => {
    setItems(prevItems => {
      if (prevItems.find(item => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
