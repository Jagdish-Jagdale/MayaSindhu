/**
 * File: dateHelper.js
 * Description: Utility helper functions managing currency styling, cloudinary uploads, data formatting, and catalog paths.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

/**
 * Standardizes date formatting across the application to DD/MM/YYYY
 * @param {any} dateValue - Firestore timestamp, Date object, or date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';

  let date;
  
  // Handle Firestore Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    date = dateValue.toDate();
  } 
  // Handle already valid Date object or string
  else {
    date = new Date(dateValue);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
