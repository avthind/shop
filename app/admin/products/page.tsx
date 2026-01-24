'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllProducts, deleteProduct } from '@/lib/firestore';
import { Product } from '@/types';
import styles from './page.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'soldout'>('all');
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') {
      return matchesSearch && product.inStock !== false;
    } else if (filter === 'soldout') {
      return matchesSearch && product.inStock === false;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading listings...</p>
      </div>
    );
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.header}>
        <h1>Listings</h1>
        <Link href="/admin/products/new" className={styles.addButton}>
          + Add New Listing
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filters}>
          <button
            className={filter === 'all' ? styles.filterActive : ''}
            onClick={() => setFilter('all')}
          >
            All ({products.length})
          </button>
          <button
            className={filter === 'active' ? styles.filterActive : ''}
            onClick={() => setFilter('active')}
          >
            Active ({products.filter((p) => p.inStock !== false).length})
          </button>
          <button
            className={filter === 'soldout' ? styles.filterActive : ''}
            onClick={() => setFilter('soldout')}
          >
            Sold Out ({products.filter((p) => p.inStock === false).length})
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{searchTerm ? 'No listings found matching your search.' : 'No listings yet.'}</p>
          <Link href="/admin/products/new" className={styles.addButton}>
            + Add Your First Listing
          </Link>
        </div>
      ) : (
        <div className={styles.productsTable}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Listing</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className={styles.noImage}>No Image</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.productInfo}>
                      <Link href={`/admin/products/${product.id}`} className={styles.productName}>
                        {product.name}
                      </Link>
                      <div className={styles.productDescription}>
                        {product.description?.substring(0, 60)}
                        {product.description && product.description.length > 60 ? '...' : ''}
                      </div>
                    </div>
                  </td>
                  <td className={styles.priceCell}>
                    ${product.price.toFixed(2)}
                  </td>
                  <td>
                    <span className={`${styles.stockBadge} ${product.inStock === false ? styles.soldOut : styles.inStock}`}>
                      {product.inStock === false ? 'Sold Out' : 'In Stock'}
                    </span>
                  </td>
                  <td className={styles.categoryCell}>
                    {product.category || '—'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className={styles.actionButton}
                        title="Edit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
