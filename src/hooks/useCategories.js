import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const FALLBACK_CATEGORIES = [
  { id: 'cat1', name: 'Apparels', parentId: null, level: 0 },
  { id: 'cat1-1', name: 'Sarees', parentId: 'cat1', level: 1 },
  { id: 'cat1-2', name: 'Dress Materials', parentId: 'cat1', level: 1 },
  { id: 'cat2', name: 'Jewellery', parentId: null, level: 0 },
  { id: 'cat2-1', name: 'Fabric Jewellery', parentId: 'cat2', level: 1 },
  { id: 'cat2-2', name: 'Clay Jewellery', parentId: 'cat2', level: 1 },
  { id: 'cat2-3', name: 'Tribal Jewellery', parentId: 'cat2', level: 1 },
  { id: 'cat3', name: 'Festive', parentId: null, level: 0 },
  { id: 'cat3-1', name: 'Torans', parentId: 'cat3', level: 1 },
  { id: 'cat3-2', name: 'Rakhis', parentId: 'cat3', level: 1 },
  { id: 'cat3-3', name: 'Diyas', parentId: 'cat3', level: 1 },
  { id: 'cat4', name: 'Bags', parentId: null, level: 0 },
  { id: 'cat4-1', name: 'Wallets', parentId: 'cat4', level: 1 },
  { id: 'cat4-2', name: 'Slings', parentId: 'cat4', level: 1 },
  { id: 'cat4-3', name: 'Tote Bags', parentId: 'cat4', level: 1 },
  { id: 'cat5', name: 'Others', parentId: null, level: 0 },
  { id: 'cat5-1', name: 'Keychains', parentId: 'cat5', level: 1 },
  { id: 'cat5-2', name: 'Diaries', parentId: 'cat5', level: 1 },
];

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to build hierarchy
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildHierarchy(items, item.id)
        }));
    };

    if (!db) {
      console.log("Using fallback categories (Firebase not configured)");
      setCategories(buildHierarchy(FALLBACK_CATEGORIES));
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flatCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategories(buildHierarchy(flatCategories, null));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories: ", error);
      // On error, use fallback
      setCategories(buildHierarchy(FALLBACK_CATEGORIES));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categories, loading };
};

export default useCategories;
