import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PRODUCTS } from '../../data/products';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    
    let title = 'Home';
    
    if (pathname !== '/') {
      const segments = pathname.split('/').filter(Boolean);
      
      // Special handling for Product Detail pages
      if (segments[0] === 'product' && segments[1]) {
        const slug = segments[1];
        const product = PRODUCTS.find(p => p.slug === slug);
        title = product ? product.name : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      } 
      // Special handling for Category pages
      else if (segments[0] === 'category' && segments[1]) {
        title = `Category: ${segments[1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
      }
      // General handling for other pages (about, shop, cart, etc.)
      else {
        const lastSegment = segments[segments.length - 1];
        // Convert kbab-case to Title Case (e.g., about-us -> About Us)
        title = lastSegment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    document.title = `${title} | MayaSindhu`;
  }, [location]);

  return null;
};

export default TitleUpdater;
