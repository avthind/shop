'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { products as localProducts } from '@/data/products';
import { getAllProducts } from '@/lib/firestore';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

const bannerMessages = [
  'bts world tour merch dropping soon',
  'new pc holders incoming',
  'svt shot glasses on sale',
  'custom requests welcome',
  'worldwide shipping',
];

export default function ShopPage() {
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const firestoreProducts = await getAllProducts();
        if (firestoreProducts.length > 0) {
          setProducts(firestoreProducts);
        }
      } catch (error) {
        console.error('Error loading products from Firestore:', error);
        // Fallback to local products
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [sortOption]);

  return (
    <div className={styles.shopPage}>
      {/* Banner Section */}
      <section className={styles.banner}>
        <div className={styles.bannerWrapper}>
          <div className={styles.bannerContent}>
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className={styles.bannerText} aria-hidden={copyIndex === 1}>
                {bannerMessages.map((message, index) => (
                  <React.Fragment key={index}>
                    <span>{message}</span>
                    {index < bannerMessages.length - 1 && (
                      <span className={styles.separator}> • </span>
                    )}
                  </React.Fragment>
                ))}
                <span className={styles.separator}> • </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" id="products">
        <div className={styles.shopHeader}>
          <h2 className={styles.pageTitle}>Shop</h2>
          <div className={styles.sortContainer}>
            <label htmlFor="sort" className={styles.sortLabel}>
              Sort by:
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={styles.sortSelect}
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className={styles.emptyState}>
            <p>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
