import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const addToCart = async (user, product, quantity = 1, selectedVariant = null) => {
  if (!user || !product) throw new Error("User or Product missing");

  const productId = product.id?.toString();
  if (!productId) throw new Error("Product ID missing");

  const variantId = selectedVariant?.id;
  const cartItemId = variantId ? `${productId}_${variantId}` : productId;

  
  const cartItemRef = doc(db, 'users', user.uid, 'cart', cartItemId);
  const cartItemSnap = await getDoc(cartItemRef);

  // Fetch fresh product/variant details
  let stockVal = 15;
  let isUnique = product.isUniquePiece === true || product.productType === 'Unique';
  let itemPrice = product.discountedPrice || product.price || 0;
  let itemImage = product.image || product.imageUrl || (product.images && product.images[0]) || '';
  let itemSku = product.sku || '';

  if (selectedVariant) {
    // If a variant is selected, fetch the latest variant data from Firestore
    try {
      const varSnap = await getDoc(doc(db, 'products', productId, 'variants', variantId));
      if (varSnap.exists()) {
        const varData = varSnap.data();
        stockVal = typeof varData.stock === 'number' ? varData.stock : 0;
        itemPrice = varData.price || varData.actualPrice || 0;
        itemImage = (varData.images && varData.images[0]) || itemImage;
        itemSku = varData.sku || '';
        isUnique = varData.productType === 'Unique';
      } else {
        stockVal = typeof selectedVariant.stock === 'number' ? selectedVariant.stock : 0;
        itemPrice = selectedVariant.price || selectedVariant.actualPrice || 0;
        itemImage = (selectedVariant.images && selectedVariant.images[0]) || itemImage;
        itemSku = selectedVariant.sku || '';
        isUnique = selectedVariant.productType === 'Unique';
      }
    } catch (err) {
      stockVal = typeof selectedVariant.stock === 'number' ? selectedVariant.stock : 0;
      isUnique = selectedVariant.productType === 'Unique';
    }
  } else {
    // Fetch parent product document
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    const productData = productSnap.exists() ? productSnap.data() : product;
    isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
    stockVal = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);
  }

  if (stockVal === 0) {
    throw new Error("This product/variant is currently out of stock.");
  }

  const itemName = selectedVariant
    ? `${product.name || 'Handcrafted Treasure'} (${selectedVariant.color}${selectedVariant.size ? ` - ${selectedVariant.size}` : (selectedVariant.design ? ` - ${selectedVariant.design}` : '')})`
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
      color: selectedVariant?.color || '',
      design: selectedVariant?.design || '',
      size: selectedVariant?.size || '',
      sku: itemSku,
      addedAt: serverTimestamp()
    });
    return { type: 'added' };
  }
};
