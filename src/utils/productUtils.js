/**
 * File: productUtils.js
 * Description: Utility helper functions managing currency styling, cloudinary uploads, data formatting, and catalog paths.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import { db } from '../firebase';
import { getDocs, collection } from 'firebase/firestore';

/**
 * Generates a clean URL path for a product detail page.
 * Format: /product/randomgeneratedid/slugified-product-name
 */
export const getProductPath = (id, name, slug) => {
  if (!id) return '/collections';
  
  const cleanSlug = slug || name
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
    .replace(/(^-|-$)+/g, '') // Trim leading/trailing hyphens
    || 'item';

  return `/product/${id}/${cleanSlug}`;
};

/**
 * Fetches variants for a product by its ID
 */
export const fetchProductVariants = async (productId) => {
  if (!productId) return [];
  try {
    const snap = await getDocs(collection(db, 'products', productId, 'variants'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching variants:', error);
    return [];
  }
};

/**
 * Fetches variants for multiple products in batch
 */
export const fetchMultipleProductVariants = async (productIds) => {
  if (!productIds || productIds.length === 0) return {};
  
  const variantsMap = {};
  const promises = productIds.map(async (productId) => {
    const variants = await fetchProductVariants(productId);
    if (variants.length > 0) {
      variantsMap[productId] = variants;
    }
  });
  
  await Promise.all(promises);
  return variantsMap;
};
