import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    
    // Default title
    let title = 'Home';
    
    if (pathname !== '/') {
      const segments = pathname.split('/').filter(Boolean);
      
      // Special handling for Product Detail pages
      if (segments[0] === 'product' && segments[1]) {
        const slug = segments[1];
        const product = PRODUCTS.find(p => p.slug === slug);
        title = product ? product.name : formatSegment(slug);
      } 
      // Special handling for Category pages
      else if (segments[0] === 'category' && segments[1]) {
        title = `Category: ${formatSegment(segments[1])}`;
      }
      // General handling for other segments
      else {
        // If it's an admin path, we might want to take the last segment or the rest
        // e.g., /admin/settings/banner -> Banner
        const lastSegment = segments[segments.length - 1];
        title = formatSegment(lastSegment);
      }
    }

    document.title = `${title} | MayaSindhu`;
  }, [location]);

  // Helper to convert kbab-case to Title Case
  const formatSegment = (segment) => {
    if (!segment) return '';
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return null;
};

export default TitleUpdater;
