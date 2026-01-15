'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/Button';
import styles from './page.module.css';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name';

export default function ShopPage() {
  const [sortOption, setSortOption] = useState<SortOption>('default');

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
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Welcome to Shop</h1>
            <p className={styles.heroDescription}>
              Discover quality products with a clean, minimal shopping experience.
            </p>
            <div className={styles.heroActions}>
              <Link href="#products">
                <Button>Shop Now</Button>
              </Link>
            </div>
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
