export const uploadToCloudinary = async (file, folder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw error;
  }
};

/**
 * Extract the public_id from a Cloudinary secure_url.
 * Example URL: https://res.cloudinary.com/.../MayaSindhu/Products/abc123.jpg
 * Returns: MayaSindhu/Products/abc123
 */
export const extractPublicId = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  try {
    // Match everything after /upload/vXXXXX/ and remove file extension
    // Handles image/upload, video/upload, etc.
    const match = url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[2] : null;
  } catch {
    return null;
  }
};

/**
 * Detect resource type from Cloudinary URL
 */
export const getResourceType = (url) => {
  if (!url) return 'image';
  if (url.includes('/video/upload/')) return 'video';
  if (url.includes('/raw/upload/')) return 'raw';
  return 'image';
};

/**
 * Delete a single item from Cloudinary using the destroy API
 * Note: Signed deletions are disabled on the frontend to prevent exposing the API Secret.
 */
export const deleteFromCloudinary = async (url) => {
  // Cloudinary deletion requires a signed request with the API secret.
  // Performing this on the frontend would expose the API Secret, posing a severe security risk.
  // Therefore, client-side deletion is disabled to maintain project security.
  console.warn("Cloudinary asset deletion skipped: Client-side deletion is disabled to prevent exposing the API Secret.");
  return;
};

/**
 * Delete multiple images from Cloudinary (best-effort, won't block on failure)
 */
export const deleteMultipleFromCloudinary = async (imageUrls = []) => {
  const urls = imageUrls.filter(url => url && url.includes('res.cloudinary.com'));
  if (urls.length === 0) return;
  await Promise.allSettled(urls.map(url => deleteFromCloudinary(url)));
};
