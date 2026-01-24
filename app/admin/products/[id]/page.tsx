'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProductById, updateProduct, createProduct } from '@/lib/firestore';
import { Product } from '@/types';
import styles from './page.module.css';

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const productId = params.id as string;
  const isNew = productId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    inStock: true,
    images: [] as string[],
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!isNew) {
      loadProduct();
    }
  }, [productId, isNew]);

  const loadProduct = async () => {
    try {
      const product = await getProductById(productId);
      if (product) {
        setFormData({
          name: product.name,
          price: product.price.toString(),
          description: product.description,
          category: product.category || '',
          inStock: product.inStock !== false,
          images: product.images || [],
        });
        setImageUrls(product.images || []);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setImageUrls((prev) => [...prev, url.trim()]);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageReorder = (index: number, direction: 'up' | 'down') => {
    const newImages = [...imageUrls];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setImageUrls(newImages);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to save products.');
      return;
    }

    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const productData: Omit<Product, 'id'> = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: formData.category.trim() || undefined,
        inStock: formData.inStock,
        images: imageUrls,
      };

      if (isNew) {
        const newId = await createProduct(productData, currentUser.uid);
        router.push(`/admin/products/${newId}`);
      } else {
        await updateProduct(productId, productData, currentUser.uid);
        alert('Product updated successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className={styles.productEditPage}>
      <div className={styles.header}>
        <h1>{isNew ? 'Add New Listing' : 'Edit Listing'}</h1>
        <button onClick={() => router.back()} className={styles.backButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2>Basic Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Listing Title *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Minimalist Art Print"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="24.99"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Prints, Canvas"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Describe your product..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
              />
              <span>In Stock</span>
            </label>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Images</h2>
          <p className={styles.helpText}>Add image URLs. The first image will be the main product image.</p>
          
          <div className={styles.imagesGrid}>
            {imageUrls.map((url, index) => (
              <div key={index} className={styles.imageItem}>
                <img src={url} alt={`Product ${index + 1}`} onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
                <div className={styles.imageActions}>
                  <button
                    type="button"
                    onClick={() => handleImageReorder(index, 'up')}
                    disabled={index === 0}
                    className={styles.imageButton}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageReorder(index, 'down')}
                    disabled={index === imageUrls.length - 1}
                    className={styles.imageButton}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className={`${styles.imageButton} ${styles.deleteButton}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleImageUrlAdd}
            className={styles.addImageButton}
          >
            + Add Image URL
          </button>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={styles.saveButton}
          >
            {saving ? 'Saving...' : isNew ? 'Create Listing' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
