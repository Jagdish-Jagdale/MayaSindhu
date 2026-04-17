import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CATEGORIES_DATA = [
  // Level 0: Main Nav
  { id: 'app', name: 'Apparels', parentId: null, level: 0 },
  { id: 'jewel', name: 'Jewellery', parentId: null, level: 0 },
  { id: 'fest', name: 'Festive', parentId: null, level: 0 },
  { id: 'bags', name: 'Bags', parentId: null, level: 0 },
  { id: 'oth', name: 'Others', parentId: null, level: 0 },

  // Level 1: Apparels
  { id: 'app-sar', name: 'Sarees', parentId: 'app', level: 1 },
  { id: 'app-dress', name: 'Dress Materials', parentId: 'app', level: 1 },

  // Level 2: Apparels -> Sarees
  { id: 'app-sar-1', name: 'Handmade Sarees', parentId: 'app-sar', level: 2 },
  { id: 'app-sar-2', name: 'Printed Sarees', parentId: 'app-sar', level: 2 },
  { id: 'app-sar-3', name: 'Silk Sarees', parentId: 'app-sar', level: 2 },
  { id: 'app-sar-4', name: 'Cotton Sarees', parentId: 'app-sar', level: 2 },

  // Level 1: Jewellery
  { id: 'jewel-ear', name: 'Earrings', parentId: 'jewel', level: 1 },
  { id: 'jewel-neck', name: 'Necklaces', parentId: 'jewel', level: 1 },
  { id: 'jewel-bang', name: 'Bangles', parentId: 'jewel', level: 1 },

  // Level 1: Festive
  { id: 'fest-tor', name: 'Torans', parentId: 'fest', level: 1 },
  { id: 'fest-rak', name: 'Rakhis', parentId: 'fest', level: 1 },
  { id: 'fest-diy', name: 'Diyas', parentId: 'fest', level: 1 },
  { id: 'fest-leaf', name: 'Banana Leaf for Naivedya', parentId: 'fest', level: 1 },

  // Level 1: Bags
  { id: 'bags-wal', name: 'Wallets', parentId: 'bags', level: 1 },
  { id: 'bags-sling', name: 'Slings', parentId: 'bags', level: 1 },
  { id: 'bags-tote', name: 'Tote Bags', parentId: 'bags', level: 1 },
  { id: 'bags-pock', name: 'Saree Pockets', parentId: 'bags', level: 1 },
  { id: 'bags-boho', name: 'Boho Bags', parentId: 'bags', level: 1 },

  // Level 1: Others
  { id: 'oth-key', name: 'Keychains', parentId: 'oth', level: 1 },
  { id: 'oth-dia', name: 'Diaries', parentId: 'oth', level: 1 },
  { id: 'oth-pou', name: 'Pouches', parentId: 'oth', level: 1 },
  { id: 'oth-coa', name: 'Coasters', parentId: 'oth', level: 1 },
  { id: 'oth-slv', name: 'Laptop Sleeves', parentId: 'oth', level: 1 },
];

export const seedCategories = async () => {
  if (!db) return;

  const batch = writeBatch(db);
  const categoriesRef = collection(db, 'categories');

  try {
    CATEGORIES_DATA.forEach((cat) => {
      const docRef = doc(categoriesRef, cat.id);
      batch.set(docRef, {
        name: cat.name,
        parentId: cat.parentId,
        level: cat.level,
        created_at: new Date().toISOString()
      });
    });

    await batch.commit();
    toast.success('Categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    toast.error('Failed to seed categories.');
  }
};
