import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          children: buildHierarchy(items, item.id)
        }));
    };

    if (!db) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setCategories([]);
        setLoading(false);
        return;
      }

      const flatCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategories(buildHierarchy(flatCategories, null));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories: ", error);
      setCategories([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { categories, loading };
};

export default useCategories;
