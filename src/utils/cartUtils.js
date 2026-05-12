import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

export const addToCart = async (user, product) => {
  if (!user || !product) throw new Error("User or Product missing");

  const productId = product.id?.toString();
  if (!productId) throw new Error("Product ID missing");

  console.log(`CartUtil: Adding product ${productId} for user ${user.uid}`);
  
  const cartItemRef = doc(db, 'users', user.uid, 'cart', productId);
  const cartItemSnap = await getDoc(cartItemRef);

  if (cartItemSnap.exists()) {
    // If product is unique, do not increment quantity
    if (product.productType === 'Unique') {
      return { type: 'already_in_cart' };
    }
    await updateDoc(cartItemRef, {
      qty: (cartItemSnap.data().qty || 1) + 1,
      updatedAt: serverTimestamp()
    });
    return { type: 'updated' };
  } else {
    await setDoc(cartItemRef, {
      id: productId,
      slug: product.slug || productId,
      name: product.name || 'Handcrafted Treasure',
      price: product.price || 0,
      image: product.image || product.imageUrl || (product.images && product.images[0]) || '',
      qty: 1,
      productType: product.productType || 'Standard',
      addedAt: serverTimestamp()
    });
    return { type: 'added' };
  }
};
