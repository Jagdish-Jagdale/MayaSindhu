import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

export const addToCart = async (user, product, quantity = 1) => {
  if (!user || !product) throw new Error("User or Product missing");

  const productId = product.id?.toString();
  if (!productId) throw new Error("Product ID missing");

  console.log(`CartUtil: Adding product ${productId} for user ${user.uid} with quantity ${quantity}`);
  
  const cartItemRef = doc(db, 'users', user.uid, 'cart', productId);
  const cartItemSnap = await getDoc(cartItemRef);

  // Fetch fresh product document from products collection to get exact real-time stock/type info
  const productRef = doc(db, 'products', productId);
  const productSnap = await getDoc(productRef);
  const productData = productSnap.exists() ? productSnap.data() : product;

  const isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
  const stockVal = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);

  if (stockVal === 0) {
    throw new Error("This product is currently out of stock.");
  }

  if (cartItemSnap.exists()) {
    // If product is unique, do not increment quantity
    if (isUnique) {
      return { type: 'already_in_cart' };
    }
    const currentQtyInCart = cartItemSnap.data().qty || 1;
    const targetQty = currentQtyInCart + quantity;
    if (targetQty > stockVal) {
      throw new Error(`Cannot add more items. Only ${stockVal} available in stock.`);
    }
    await updateDoc(cartItemRef, {
      qty: targetQty,
      updatedAt: serverTimestamp()
    });
    return { type: 'updated' };
  } else {
    const targetQty = isUnique ? 1 : quantity;
    if (targetQty > stockVal) {
      throw new Error(`Cannot add more items. Only ${stockVal} available in stock.`);
    }
    await setDoc(cartItemRef, {
      id: productId,
      productId: product.productId || '',
      slug: product.slug || productId,
      name: product.name || 'Handcrafted Treasure',
      price: product.price || 0,
      image: product.image || product.imageUrl || (product.images && product.images[0]) || '',
      qty: targetQty,
      productType: isUnique ? 'Unique' : (product.productType || 'Standard'),
      addedAt: serverTimestamp()
    });
    return { type: 'added' };
  }
};
