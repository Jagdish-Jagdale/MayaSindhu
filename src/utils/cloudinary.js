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
 * Example URL: https://res.cloudinary.com/ddph5s2u4/image/upload/v1234567890/MayaSindhu/Products/abc123.jpg
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
 * Generate SHA-1 hash for Cloudinary API signature
 */
const generateSHA1 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Delete a single item from Cloudinary using the destroy API (signed request)
 */
export const deleteFromCloudinary = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;

  const resourceType = getResourceType(url);
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const signature = await generateSHA1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (data.result !== 'ok' && data.result !== 'not found') {
    }
  } catch (error) {
  }
};

/**
 * Delete multiple images from Cloudinary (best-effort, won't block on failure)
 */
export const deleteMultipleFromCloudinary = async (imageUrls = []) => {
  const urls = imageUrls.filter(url => url && url.includes('res.cloudinary.com'));
  if (urls.length === 0) return;
  await Promise.allSettled(urls.map(url => deleteFromCloudinary(url)));
};
