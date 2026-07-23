/**
 * File: cartUtils.js
 * Description: Utility helper functions managing currency styling, cloudinary uploads, data formatting, and catalog paths.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs, limit, query } from 'firebase/firestore';

export const addToCart = async (user, product, quantity = 1, selectedVariant = null) => {
  if (!user || !product) throw new Error("User or Product missing");

  const productId = product.id?.toString();
  if (!productId) throw new Error("Product ID missing");

  let activeVariant = selectedVariant;

  // If no variant was explicitly provided, try to find the default one in Firestore
  if (!activeVariant) {
    try {
      const variantsRef = collection(db, 'products', productId, 'variants');
      const variantsSnap = await getDocs(query(variantsRef, limit(1)));
      if (!variantsSnap.empty) {
        const varData = variantsSnap.docs[0].data();
        activeVariant = { 
          id: variantsSnap.docs[0].id, 
          ...varData,
          size: varData.sizes?.[0] || varData.size || ''
        };
      }
    } catch (e) {
      // fallback to null
    }
  }

  const variantId = activeVariant?.id;
  const sizeSuffix = activeVariant?.size ? `_${activeVariant.size}` : '';
  const cartItemId = variantId ? `${productId}_${variantId}${sizeSuffix}` : productId;
  
  const cartItemRef = doc(db, 'users', user.uid, 'cart', cartItemId);
  let cartItemSnap = null;
  try {
    cartItemSnap = await getDoc(cartItemRef);
  } catch (err) {
    console.warn("Could not check existing cart item doc:", err);
  }

  // Fetch fresh product/variant details
  let stockVal = 15;
  let isUnique = product.isUniquePiece === true || product.productType === 'Unique';
  let itemPrice = product.discountedPrice || product.price || 0;
  let itemImage = product.image || product.imageUrl || (product.images && product.images[0]) || '';
  let itemSku = product.sku || '';

  if (activeVariant) {
    // If a variant is selected, fetch the latest variant data from Firestore if accessible
    try {
      const varSnap = await getDoc(doc(db, 'products', productId, 'variants', variantId));
      if (varSnap.exists()) {
        const varData = varSnap.data();
        stockVal = Number(varData.stock) || 0;
        itemPrice = varData.price || varData.actualPrice || itemPrice;
        itemImage = (varData.images && varData.images[0]) || itemImage;
        itemSku = varData.sku || '';
        isUnique = varData.productType === 'Unique';
      } else {
        stockVal = Number(activeVariant.stock) || 0;
        itemPrice = activeVariant.price || activeVariant.actualPrice || itemPrice;
        itemImage = (activeVariant.images && activeVariant.images[0]) || itemImage;
        itemSku = activeVariant.sku || '';
        isUnique = activeVariant.productType === 'Unique';
      }
    } catch (err) {
      stockVal = Number(activeVariant.stock) || 0;
      itemPrice = activeVariant.price || activeVariant.actualPrice || itemPrice;
      itemImage = (activeVariant.images && activeVariant.images[0]) || itemImage;
      itemSku = activeVariant.sku || '';
      isUnique = activeVariant.productType === 'Unique';
    }
  } else {
    // Fetch parent product document if accessible
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      const productData = (productSnap && productSnap.exists()) ? productSnap.data() : product;
      isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
      stockVal = typeof productData.stock !== 'undefined' && productData.stock !== '' && !isNaN(Number(productData.stock)) ? Number(productData.stock) : (isUnique ? 1 : 15);
    } catch (err) {
      isUnique = product.isUniquePiece === true || product.productType === 'Unique';
      stockVal = typeof product.stock !== 'undefined' && product.stock !== '' && !isNaN(Number(product.stock)) ? Number(product.stock) : (isUnique ? 1 : 15);
    }
  }

  if (stockVal === 0) {
    throw new Error("This product/variant is currently out of stock.");
  }

  const itemName = activeVariant
    ? `${product.name || 'Handcrafted Treasure'} (${activeVariant.color}${activeVariant.size ? ` - ${activeVariant.size}` : (activeVariant.design ? ` - ${activeVariant.design}` : '')})`
    : (product.name || 'Handcrafted Treasure');

  if (cartItemSnap.exists()) {
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
      variantId: variantId || '',
      slug: product.slug || productId,
      name: itemName,
      price: Number(itemPrice),
      image: itemImage,
      qty: targetQty,
      productType: isUnique ? 'Unique' : (product.productType || 'Standard'),
      color: activeVariant?.color || '',
      design: activeVariant?.design || '',
      size: activeVariant?.size || '',
      sku: itemSku,
      addedAt: serverTimestamp()
    });
    return { type: 'added' };
  }
};
