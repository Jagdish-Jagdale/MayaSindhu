import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, Settings, Info } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import useCategories from '../../hooks/useCategories';
import toast from 'react-hot-toast';
import { uploadToCloudinary, deleteMultipleFromCloudinary } from '../../utils/cloudinary';
import CustomSelect from '../common/CustomSelect';

// Helper to find the full path of category IDs for a given leaf category ID
const findPathToCategory = (id, items, currentPath = []) => {
  for (const item of items) {
    if (item.id === id) return [...currentPath, item.id];
    if (item.children && item.children.length > 0) {
      const found = findPathToCategory(id, item.children, [...currentPath, item.id]);
      if (found) return found;
    }
  }
  return null;
};

export default function ProductFormModal({ isOpen, onClose, product = null, initialCategoryId = null }) {
  const { categories: heirarchy } = useCategories();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    isAvailable: true,
    description: '',
    tagline: '',
    care: '',
    productDetails: '',
    disclaimer: '',
    brand: '',
    productId: '',
    faqs: [{ question: '', answer: '' }]
  });

  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);
  const [selectedPathIds, setSelectedPathIds] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);

  const generateProductId = () => {
    const random10Digits = Math.floor(1000000000 + Math.random() * 9000000000);
    return `PRD${random10Digits}`;
  };

  const generateSKU = (color = '', design = '') => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const colCode = color ? color.substring(0, 3).toUpperCase() : 'DEF';
    const desCode = design ? design.substring(0, 2).toUpperCase() : 'PL';
    return `MS-${year}-${colCode}-${desCode}-${randomNum}`;
  };

  // Fetch variants if editing
  useEffect(() => {
    const initForm = async () => {
      if (product) {
        setFormData({
          name: product.name || '',
          categoryId: product.categoryId || '',
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
          description: product.description || '',
          tagline: product.tagline || '',
          care: product.care || '',
          productDetails: product.productDetails || '',
          disclaimer: product.disclaimer || '',
          brand: product.brand || '',
          productId: product.productId || '',
          faqs: product.faqs && product.faqs.length > 0 ? product.faqs : [{ question: '', answer: '' }]
        });

        if (product.categoryId) {
          const path = findPathToCategory(product.categoryId, heirarchy);
          setSelectedPathIds(path || []);
        } else {
          setSelectedPathIds([]);
        }

        setDeletedVariantIds([]);
        setRemovedImageUrls([]);
        setLoading(true);

        try {
          const variantsSnap = await getDocs(collection(db, 'products', product.id, 'variants'));
          const fetchedVariants = variantsSnap.docs.map(doc => {
            const data = doc.data();
            const actual = Number(data.actualPrice || data.price || 0);
            const discounted = Number(data.price || 0);
            let initialDiscount = 0;
            if (actual > 0 && discounted < actual) {
              initialDiscount = Math.round(((actual - discounted) / actual) * 100);
            }
            return {
              id: doc.id,
              color: data.color || '',
              design: data.design || '',
              size: data.size || '',
              sizes: data.sizes || (data.size ? [data.size] : []),
              sku: data.sku || '',
              price: discounted || '',
              actualPrice: actual || '',
              discountPercent: initialDiscount,
              stock: data.stock || 0,
              images: data.images || [],
              previews: data.images || [],
              newImageFiles: [],
              productType: data.productType || product.productType || 'Repeat',
              stockAlertThreshold: data.stockAlertThreshold !== undefined ? data.stockAlertThreshold : (product.stockAlertThreshold !== undefined ? product.stockAlertThreshold : 5)
            };
          });
          
          if (fetchedVariants.length > 0) {
            setVariants(fetchedVariants);
          } else {
            // Fallback: create a variant from parent details if no subcollection found
            setVariants([
              {
                id: 'temp_fallback',
                color: 'Default',
                design: 'Default',
                size: product.size || '',
                sizes: product.sizes || (product.size ? [product.size] : []),
                sku: product.sku || generateSKU(),
                price: product.discountedPrice || product.price || '',
                actualPrice: product.actualPrice || product.price || '',
                discountPercent: 0,
                stock: product.stock || 0,
                images: product.images || [],
                previews: product.images || [],
                newImageFiles: [],
                productType: product.productType || 'Repeat',
                stockAlertThreshold: product.stockAlertThreshold !== undefined ? product.stockAlertThreshold : 5
              }
            ]);
          }
        } catch (error) {
          toast.error("Failed to load variants");
        } finally {
          setLoading(false);
        }
        setIsDirty(false);
      } else {
        setFormData({
          name: '',
          categoryId: initialCategoryId || '',
          isAvailable: true,
          description: '',
          tagline: '',
          care: '',
          productDetails: '',
          disclaimer: '',
          brand: '',
          productId: generateProductId(),
          faqs: [{ question: '', answer: '' }]
        });

        if (initialCategoryId) {
          const path = findPathToCategory(initialCategoryId, heirarchy);
          setSelectedPathIds(path || []);
        } else {
          setSelectedPathIds([]);
        }

        setVariants([
          {
            id: 'temp_' + Date.now(),
            color: 'Default',
            design: 'Default',
            size: '',
            sizes: [],
            sku: generateSKU('Default', 'Default'),
            price: '',
            actualPrice: '',
            discountPercent: 0,
            stock: '',
            images: [],
            previews: [],
            newImageFiles: [],
            productType: 'Repeat',
            stockAlertThreshold: 5
          }
        ]);
        setDeletedVariantIds([]);
        setRemovedImageUrls([]);
        setIsDirty(false);
      }
    };

    if (isOpen) {
      initForm();
    }
  }, [product, isOpen, heirarchy, initialCategoryId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleKeyPress = (e) => {
    const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
    if (controlKeys.includes(e.key)) return;

    if (e.target.name.includes('Threshold') || e.target.name.includes('stock')) {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    } else if (e.target.name.includes('Price') || e.target.name.includes('discount')) {
      if (!/[0-9.]/.test(e.key)) {
        e.preventDefault();
      }
      if (e.key === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    }
  };

  const handleLevelChange = (level, id) => {
    setIsDirty(true);
    if (!id) {
      const newPath = selectedPathIds.slice(0, level);
      setSelectedPathIds(newPath);
      setFormData(prev => ({ ...prev, categoryId: newPath[newPath.length - 1] || '' }));
      return;
    }

    const newPath = [...selectedPathIds.slice(0, level), id];
    setSelectedPathIds(newPath);

    const findCategory = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.children) {
          const found = findCategory(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedCategory = findCategory(heirarchy, id);
    const hasChildren = selectedCategory?.children && selectedCategory.children.length > 0;

    if (!hasChildren) {
      setFormData(prev => ({ ...prev, categoryId: id }));
    } else {
      setFormData(prev => ({ ...prev, categoryId: '' }));
    }
  };

  const handleVariantChange = (variantId, field, value) => {
    setIsDirty(true);
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        const updated = { ...v, [field]: value };
        if (field === 'actualPrice' || field === 'discountPercent') {
          const actual = Number(field === 'actualPrice' ? value : v.actualPrice) || 0;
          const discount = Number(field === 'discountPercent' ? value : v.discountPercent) || 0;
          const discounted = actual - (actual * discount / 100);
          updated.price = discounted > 0 ? discounted.toFixed(2) : actual.toString();
        }
        return updated;
      }
      return v;
    }));
  };

  const handleAddVariant = () => {
    setIsDirty(true);
    const col = '';
    const des = '';
    setVariants(prev => [
      ...prev,
      {
        id: 'temp_' + Date.now(),
        color: col,
        design: des,
        size: '',
        sizes: [],
        sku: generateSKU(col, des),
        price: '',
        actualPrice: '',
        discountPercent: 0,
        stock: '',
        images: [],
        previews: [],
        newImageFiles: [],
        productType: 'Repeat',
        stockAlertThreshold: 5
      }
    ]);
  };

  const handleDeleteVariant = (variantId) => {
    if (variants.length <= 1) {
      toast.error("A product must have at least one variant.");
      return;
    }
    setIsDirty(true);
    if (!variantId.startsWith('temp_')) {
      setDeletedVariantIds(prev => [...prev, variantId]);
    }
    setVariants(prev => prev.filter(v => v.id !== variantId));
  };

  const handleVariantImageChange = (variantId, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error('Some images were skipped as they exceed 5MB');
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));

    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        return {
          ...v,
          previews: [...v.previews, ...newPreviews],
          newImageFiles: [...(v.newImageFiles || []), ...validFiles]
        };
      }
      return v;
    }));
    setIsDirty(true);
  };

  const removeVariantPreview = (variantId, index) => {
    setIsDirty(true);
    setVariants(prev => prev.map(v => {
      if (v.id === variantId) {
        const previewToRemove = v.previews[index];
        const isExistingImage = v.images && v.images.includes(previewToRemove);

        let newImages = v.images || [];
        let newImageFiles = v.newImageFiles || [];

        if (isExistingImage) {
          if (previewToRemove.includes('res.cloudinary.com')) {
            setRemovedImageUrls(prevRemoved => [...prevRemoved, previewToRemove]);
          }
          newImages = newImages.filter(img => img !== previewToRemove);
        } else {
          const newFileIndex = v.previews.slice(0, index).filter(p => !newImages.includes(p)).length;
          newImageFiles = newImageFiles.filter((_, i) => i !== newFileIndex);
        }

        const newPreviews = v.previews.filter((_, i) => i !== index);
        if (previewToRemove.startsWith('blob:')) {
          URL.revokeObjectURL(previewToRemove);
        }

        return {
          ...v,
          images: newImages,
          previews: newPreviews,
          newImageFiles: newImageFiles
        };
      }
      return v;
    }));
  };

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getCategoryShowSizes = (id) => {
    const findCategory = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) return item;
        if (item.children) {
          const found = findCategory(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const findParent = (items, targetParentId) => {
      for (const item of items) {
        if (item.id === targetParentId) return item;
        if (item.children) {
          const found = findParent(item.children, targetParentId);
          if (found) return found;
        }
      }
      return null;
    };

    const cat = findCategory(heirarchy, id);
    if (!cat) return false;
    if (cat.showSizes === true) return true;

    let parent = cat.parentId ? findParent(heirarchy, cat.parentId) : null;
    while (parent) {
      if (parent.showSizes === true) return true;
      parent = parent.parentId ? findParent(heirarchy, parent.parentId) : null;
    }
    return false;
  };

  const lastSelectedCategoryId = selectedPathIds.filter(Boolean).pop();
  const isApparelReadymade = lastSelectedCategoryId ? getCategoryShowSizes(lastSelectedCategoryId) : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast.error('Please fill required fields (Name, Category)', { id: 'form-validation-error' });
      return;
    }

    // Validate variants
    for (const v of variants) {
      if (!v.sku || !v.actualPrice) {
        toast.error(`Please complete Price and SKU fields for all variants.`, { id: 'variant-validation-error' });
        return;
      }
    }

    setLoading(true);
    try {
      // Upload images for each variant
      const updatedVariants = await Promise.all(variants.map(async (v) => {
        let uploadedImageUrls = [];
        if (v.newImageFiles && v.newImageFiles.length > 0) {
          const uploadPromises = v.newImageFiles.map(file => uploadToCloudinary(file, 'Products'));
          uploadedImageUrls = await Promise.all(uploadPromises);
        }
        const finalImages = [...(v.images || []), ...uploadedImageUrls];
        return {
          ...v,
          images: finalImages
        };
      }));

      const firstVariant = updatedVariants[0];
      const totalStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      const allImages = Array.from(new Set(updatedVariants.flatMap(v => v.images || [])));

      const cleanFaqs = (formData.faqs || [])
        .map(item => ({ question: item.question.trim(), answer: item.answer.trim() }))
        .filter(item => item.question || item.answer);

      const allSizes = isApparelReadymade
        ? Array.from(new Set(updatedVariants.map(v => v.size).filter(Boolean)))
        : [];

      const productData = {
        name: formData.name,
        categoryId: formData.categoryId,
        productType: firstVariant?.productType || 'Repeat',
        isAvailable: formData.isAvailable,
        status: formData.isAvailable,
        description: formData.description,
        tagline: formData.tagline,
        care: formData.care,
        productDetails: formData.productDetails || '',
        disclaimer: formData.disclaimer || '',
        brand: formData.brand || 'MayaSindhu',
        productId: formData.productId,
        stockAlertThreshold: firstVariant?.stockAlertThreshold !== undefined ? Number(firstVariant.stockAlertThreshold) : 5,
        faqs: cleanFaqs,
        updatedAt: serverTimestamp(),

        // Denormalized/derived fields
        slug: createSlug(formData.name),
        defaultImage: firstVariant?.images[0] || '',
        price: Number(firstVariant?.price || 0),
        discountedPrice: Number(firstVariant?.price || 0),
        actualPrice: Number(firstVariant?.actualPrice || 0),
        stock: firstVariant?.productType === 'Unique' ? 1 : totalStock,
        images: allImages,
        sku: firstVariant?.sku || '',
        sizes: allSizes,
        size: allSizes[0] || ''
      };

      let parentProductId = '';

      if (product) {
        parentProductId = product.id;
        await updateDoc(doc(db, 'products', parentProductId), productData);

        // Delete deleted variants
        for (const idToDelete of deletedVariantIds) {
          await deleteDoc(doc(db, 'products', parentProductId, 'variants', idToDelete));
        }

        // Save remaining variants
        for (const v of updatedVariants) {
          const variantData = {
            color: v.color || '',
            design: v.design || '',
            size: v.sizes?.[0] || v.size || '',
            sizes: v.sizes || [],
            sku: v.sku || '',
            price: Number(v.price || 0),
            actualPrice: Number(v.actualPrice || 0),
            stock: Number(v.stock || 0),
            images: v.images || [],
            productType: v.productType || 'Repeat',
            stockAlertThreshold: Number(v.stockAlertThreshold !== undefined ? v.stockAlertThreshold : 5)
          };

          if (v.id.startsWith('temp_')) {
            await addDoc(collection(db, 'products', parentProductId, 'variants'), variantData);
          } else {
            await updateDoc(doc(db, 'products', parentProductId, 'variants', v.id), variantData);
          }
        }
        toast.success("Product and variants updated successfully");
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
        parentProductId = docRef.id;

        // Save all variants
        for (const v of updatedVariants) {
          const variantData = {
            color: v.color || '',
            design: v.design || '',
            size: v.sizes?.[0] || v.size || '',
            sizes: v.sizes || [],
            sku: v.sku || '',
            price: Number(v.price || 0),
            actualPrice: Number(v.actualPrice || 0),
            stock: Number(v.stock || 0),
            images: v.images || [],
            productType: v.productType || 'Repeat',
            stockAlertThreshold: Number(v.stockAlertThreshold !== undefined ? v.stockAlertThreshold : 5)
          };
          await addDoc(collection(db, 'products', parentProductId, 'variants'), variantData);
        }
        toast.success(`Product added with variants. ID: ${productData.productId}`);
      }

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }

    if (removedImageUrls.length > 0) {
      deleteMultipleFromCloudinary(removedImageUrls);
      setRemovedImageUrls([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight flex items-center">
              {product ? (
                <>
                  <span>Edit Product (With Variants)</span>
                  <span className="mx-3 text-gray-200 font-light">|</span>
                  <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#1BAFAF]/10 px-3 py-1 rounded-full border border-[#1BAFAF]/10 tracking-wider">
                    {product.productId || '---'}
                  </span>
                </>
              ) : (
                'Add Product (With Variants)'
              )}
            </h2>
            <p className="text-[12px] text-gray-400 font-medium">Capture the variety of your creation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900 active:scale-95"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAFAFA]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-[250] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
              <p className="text-[14px] font-medium text-gray-500">Processing changes, please wait...</p>
            </div>
          )}
          <div className="p-8 pb-32 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Basic Details */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Basic Information</h3>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-[#1BAFAF]' : 'bg-gray-200'}`} />
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${formData.isAvailable ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className={`text-[13px] font-bold transition-colors ${formData.isAvailable ? 'text-[#1BAFAF]' : 'text-gray-400'}`}>
                        {formData.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </label>
                  </div>
                  <hr className="border-gray-200 -mt-2 mb-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Product ID</label>
                      <input
                        type="text"
                        readOnly
                        value={formData.productId}
                        className="w-full bg-gray-100 border-none px-4 py-3 rounded-xl text-[14px] outline-none text-gray-500 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="e.g. Nike, MayaSindhu"
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Product Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Men's Cotton T-Shirt"
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Tagline</label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      placeholder="Short catchy phrase"
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const levels = [0, ...selectedPathIds];
                      const renderSelect = (level) => {
                        const selectedId = selectedPathIds[level];
                        let options = [];
                        if (level === 0) {
                          options = heirarchy;
                        } else {
                          const parentId = selectedPathIds[level - 1];
                          const findChildren = (items, targetId) => {
                            for (const item of items) {
                              if (item.id === targetId) return item.children || [];
                              if (item.children) {
                                const found = findChildren(item.children, targetId);
                                if (found) return found;
                              }
                            }
                            return null;
                          };
                          options = parentId ? (findChildren(heirarchy, parentId) || []) : [];
                        }

                        if (level > 1 && options.length === 0) return null;
                        const isDisabled = level > 0 && !selectedPathIds[level - 1];

                        return (
                          <div
                            key={level}
                            className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300 relative"
                            onClick={() => {
                              if (isDisabled) {
                                toast.error('Please select Main Category first', { id: 'category-select-error' });
                              }
                            }}
                          >
                            <div className={`relative ${isDisabled ? 'cursor-pointer' : ''}`}>
                              <label className="text-[13px] font-bold text-gray-700 ml-1 mb-1.5 block">
                                {level === 0 ? 'Main Category *' : `Sub Category ${level} ${level === 1 ? '*' : ''}`}
                              </label>
                              <CustomSelect
                                value={selectedId || ''}
                                onChange={(val) => handleLevelChange(level, val)}
                                options={options}
                              />
                            </div>
                          </div>
                        );
                      };

                      const mainCat = renderSelect(0);
                      const sub1 = renderSelect(1);
                      const remaining = levels.slice(2).map((_, i) => renderSelect(i + 2)).filter(Boolean);

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {mainCat}
                            {sub1}
                          </div>
                          {remaining.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                              {remaining}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Care Instructions</label>
                    <textarea
                      name="care"
                      value={formData.care}
                      onChange={handleInputChange}
                      placeholder="e.g. Dry clean only"
                      rows={3}
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Disclaimer</label>
                    <textarea
                      name="disclaimer"
                      value={formData.disclaimer}
                      onChange={handleInputChange}
                      placeholder="Product specific disclaimer. Leave blank to use the global disclaimer."
                      rows={3}
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Product Details</label>
                    <textarea
                      name="productDetails"
                      value={formData.productDetails}
                      onChange={handleInputChange}
                      placeholder="Material, fit, styling tips, etc."
                      rows={3}
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell the story of this product..."
                      rows={5}
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column: Variant Management */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Product Variants</h3>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-1 text-[12px] font-bold text-[#1BAFAF] hover:text-[#17a0a0] transition-colors"
                    >
                      <Plus size={16} /> Add Variant
                    </button>
                  </div>
                  <hr className="border-gray-200 -mt-2 mb-2" />

                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="p-5 bg-gray-50/50 rounded-2xl relative space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#1BAFAF]/10 px-2.5 py-0.5 rounded-full">
                            Variant #{index + 1}
                          </span>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                         {/* Color & Design */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Color *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Red, Blue"
                              value={variant.color}
                              onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Design</label>
                            <input
                              type="text"
                              placeholder="e.g. Plain, Printed"
                              value={variant.design}
                              onChange={(e) => handleVariantChange(variant.id, 'design', e.target.value)}
                              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium"
                            />
                          </div>
                        </div>

                        {/* Sizes Selection Checkboxes */}
                        {isApparelReadymade && (
                          <div className="space-y-1.5 bg-white border border-gray-200/60 p-3.5 rounded-xl">
                            <label className="text-[11px] font-bold text-[#1BAFAF] uppercase tracking-wider block mb-1">Available Sizes *</label>
                            <div className="flex flex-wrap gap-2">
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                                const sizesArray = variant.sizes || [];
                                const isChecked = sizesArray.includes(sz);
                                return (
                                  <label key={sz} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black cursor-pointer border select-none transition-all ${
                                    isChecked
                                      ? 'bg-[#1BAFAF]/5 border-[#1BAFAF] text-[#1BAFAF] ring-1 ring-[#1BAFAF]/20'
                                      : 'bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-50'
                                  }`}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const newSizes = e.target.checked
                                          ? [...sizesArray, sz]
                                          : sizesArray.filter(s => s !== sz);
                                        handleVariantChange(variant.id, 'sizes', newSizes);
                                      }}
                                      className="rounded border-gray-300 text-[#1BAFAF] focus:ring-[#1BAFAF] w-3.5 h-3.5"
                                    />
                                    <span>{sz}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Product Type & Stock Alert Threshold */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Product Type</label>
                            <CustomSelect
                              value={variant.productType || 'Repeat'}
                              onChange={(val) => {
                                handleVariantChange(variant.id, 'productType', val);
                                if (val === 'Unique') {
                                  handleVariantChange(variant.id, 'stock', 1);
                                }
                              }}
                              options={['Repeat', 'Unique']}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Stock Alert Threshold</label>
                            <input
                              type="number"
                              min="1"
                              disabled={variant.productType === 'Unique'}
                              value={variant.productType === 'Unique' ? '' : (variant.stockAlertThreshold !== undefined ? variant.stockAlertThreshold : 5)}
                              onChange={(e) => handleVariantChange(variant.id, 'stockAlertThreshold', Number(e.target.value))}
                              onKeyDown={handleKeyPress}
                              className={`w-full border px-3 py-2 rounded-lg text-[13px] outline-none transition-all font-medium ${
                                variant.productType === 'Unique'
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-white text-gray-700 border-gray-200 focus:ring-2 focus:ring-[#1BAFAF]/20'
                              }`}
                            />
                          </div>
                        </div>

                        {/* SKU & Stock */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">SKU *</label>
                            <input
                              type="text"
                              required
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium uppercase"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Stock Qty *</label>
                            <input
                              type="number"
                              required
                              placeholder="0"
                              min="0"
                              disabled={variant.productType === 'Unique'}
                              value={variant.productType === 'Unique' ? 1 : variant.stock}
                              onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                              onKeyDown={handleKeyPress}
                              className={`w-full border px-3 py-2 rounded-lg text-[13px] outline-none transition-all font-medium ${
                                variant.productType === 'Unique'
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : 'bg-white text-gray-700 border-gray-200 focus:ring-2 focus:ring-[#1BAFAF]/20'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Original Price *</label>
                            <input
                              type="number"
                              required
                              placeholder="0.00"
                              value={variant.actualPrice}
                              onChange={(e) => handleVariantChange(variant.id, 'actualPrice', e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium text-gray-900"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 ml-1">Discount (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={variant.discountPercent}
                              onChange={(e) => handleVariantChange(variant.id, 'discountPercent', e.target.value)}
                              onKeyDown={handleKeyPress}
                              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium text-gray-750"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-400 ml-1">Sale Price</label>
                            <div className="w-full bg-[#E8F7F7] px-3 py-2 rounded-lg text-[13px] font-bold text-[#1BAFAF] border border-[#1BAFAF]/10 overflow-hidden text-ellipsis whitespace-nowrap">
                              ₹ {variant.price || '0.00'}
                            </div>
                          </div>
                        </div>

                        {/* Variant Media */}
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-gray-500 ml-1 block">Variant Photos ({variant.previews?.length || 0})</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            id={`file-${variant.id}`}
                            onChange={(e) => handleVariantImageChange(variant.id, e)}
                            className="hidden"
                          />
                          <div className="flex flex-wrap gap-2 items-center">
                            {variant.previews?.map((src, idx) => (
                              <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeVariantPreview(variant.id, idx)}
                                  className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X size={12} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => document.getElementById(`file-${variant.id}`).click()}
                              className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:border-[#1BAFAF]/30 hover:bg-[#1BAFAF]/5 transition-all bg-white"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Questionnaire Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 flex flex-col w-full mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Product Questionnaire (FAQ)</h3>
                <button
                  type="button"
                  onClick={() => { setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] })); setIsDirty(true); }}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#1BAFAF] hover:text-[#17a0a0] transition-colors"
                >
                  <Plus size={16} /> Add Question
                </button>
              </div>
              <hr className="border-gray-200 -mt-2 mb-3" />

              <div className="space-y-4 w-full">
                {formData.faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100/80 relative space-y-3 w-full animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#1BAFAF]/10 px-2.5 py-0.5 rounded-full border border-[#1BAFAF]/10">
                        Question #{index + 1}
                      </span>
                      {formData.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) })); setIsDirty(true); }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].question = e.target.value;
                          setFormData(prev => ({ ...prev, faqs: newFaqs }));
                          setIsDirty(true);
                        }}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium"
                      />
                      <textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...formData.faqs];
                          newFaqs[index].answer = e.target.value;
                          setFormData(prev => ({ ...prev, faqs: newFaqs }));
                          setIsDirty(true);
                        }}
                        rows={2}
                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-50 bg-white flex items-center justify-end gap-4 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-bold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isDirty}
            className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {product ? 'Update Product' : 'Add Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
