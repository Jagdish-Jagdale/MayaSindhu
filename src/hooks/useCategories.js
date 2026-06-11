import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
};

const buildHierarchy = (items, parentId = null, parentPath = '/c', inheritedTrendy = false) => {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => {
      const slug = item.slug || slugify(item.name);
      const fullPath = `${parentPath}/${slug}`;
      const isTrendy = item.isTrendy || inheritedTrendy;
      return {
        ...item,
        slug,
        fullPath,
        isTrendy,
        children: buildHierarchy(items, item.id, fullPath, isTrendy)
      };
    });
};

// Global cache variables to share state across hook instances
let cachedCategories = null;
let globalLoading = true;
let listeners = new Set();
let unsubscribeGlobal = null;

const startGlobalListener = () => {
  if (unsubscribeGlobal || !db) return;

  const q = query(collection(db, 'categories'), orderBy('name', 'asc'));

  unsubscribeGlobal = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      cachedCategories = [];
    } else {
      const flatCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by position (if exists), then name
      flatCategories.sort((a, b) => {
        const posA = typeof a.position === 'number' ? a.position : 999999;
        const posB = typeof b.position === 'number' ? b.position : 999999;
        if (posA !== posB) return posA - posB;
        return (a.name || '').localeCompare(b.name || '');
      });
      cachedCategories = buildHierarchy(flatCategories, null);
    }
    globalLoading = false;
    
    // Notify all active hook instances of the new state
    listeners.forEach(listener => {
      listener({
        categories: cachedCategories,
        loading: false
      });
    });
  }, (error) => {
    console.error("Error fetching categories: ", error);
    cachedCategories = [];
    globalLoading = false;
    listeners.forEach(listener => {
      listener({
        categories: [],
        loading: false
      });
    });
  });
};

const useCategories = () => {
  const [state, setState] = useState(() => {
    // Synchronously initialize state from global cache if already loaded
    return {
      categories: cachedCategories || [],
      loading: globalLoading
    };
  });

  useEffect(() => {
    // Initialize/start the global Firestore listener if not already listening
    startGlobalListener();

    // Register this instance's setter to receive updates
    listeners.add(setState);

    return () => {
      listeners.delete(setState);
      // We keep unsubscribeGlobal active so that cached categories stay fresh
      // across navigation without re-triggering loading states on every mount.
    };
  }, []);

  return state;
};

export default useCategories;
