import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Disable browser native scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Save current scroll position on unmount/route-change
    return () => {
      const key = `scroll_pos_${location.pathname}${location.search}`;
      sessionStorage.setItem(key, JSON.stringify({ x: window.scrollX, y: window.scrollY }));
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    const key = `scroll_pos_${location.pathname}${location.search}`;
    
    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        try {
          const { x, y } = JSON.parse(saved);
          const restore = () => {
            window.scrollTo({ left: x, top: y, behavior: 'instant' });
            document.documentElement.scrollTo({ left: x, top: y, behavior: 'instant' });
            document.body.scrollTo({ left: x, top: y, behavior: 'instant' });
          };
          
          restore();
          const t1 = setTimeout(restore, 0);
          const t2 = setTimeout(restore, 50);
          const t3 = setTimeout(restore, 150);
          const t4 = setTimeout(restore, 300);
          const t5 = setTimeout(restore, 600);
          
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
          };
        } catch (e) {
          console.error("Scroll restoration failed:", e);
        }
      }
    } else {
      const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      };

      scrollToTop();
      const t1 = setTimeout(scrollToTop, 0);
      const t2 = setTimeout(scrollToTop, 100);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.pathname, location.search, navigationType]);

  return null;
}
