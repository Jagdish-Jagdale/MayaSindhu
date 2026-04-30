export const uploadToCloudinary = async (file, folder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'); 
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  // Organize images into folders inside Cloudinary
  if (folder) {
    formData.append('folder', `MayaSindhu/${folder}`);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
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
    console.error('Cloudinary upload error:', error);
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
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
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
 * Delete a single image from Cloudinary using the destroy API (signed request)
 */
export const deleteFromCloudinary = async (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return; // Not a Cloudinary URL, skip silently

  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Generate signature: SHA1(public_id=xxx&timestamp=xxx + api_secret)
  const signature = await generateSHA1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (data.result !== 'ok' && data.result !== 'not found') {
      console.warn('Cloudinary delete warning:', data);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    // Don't throw — deletion from Cloudinary is best-effort
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
