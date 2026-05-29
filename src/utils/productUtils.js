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
