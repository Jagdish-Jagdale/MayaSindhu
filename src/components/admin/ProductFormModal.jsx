import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, Settings, Info } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
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

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    productType: 'Repeat', // Unique or Repeat
    discountedPrice: '',
    actualPrice: '',
    stock: '',
    isAvailable: true,
    description: '',
    tagline: '',
    care: '',
    sku: '',
    size: '',
    images: [], // Will store Cloudinary URLs
    productId: '',
    stockAlertThreshold: 5
  });

  const [selectedPathIds, setSelectedPathIds] = useState([]);

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const fileInputRef = useRef(null);

  const generateProductId = () => {
    const random10Digits = Math.floor(1000000000 + Math.random() * 9000000000);
    return `PRD${random10Digits}`;
  };

  const generateSKU = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `MS-${year}-${randomNum}`;
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || '',
        productType: product.productType || 'Repeat',
        discountedPrice: product.discountedPrice || product.price || '',
        actualPrice: product.actualPrice || product.costPrice || '',
        stock: product.stock || '',
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        description: product.description || '',
        tagline: product.tagline || '',
        care: product.care || '',
        sku: product.sku || generateSKU(),
        size: product.size || '',
        images: product.images || [],
        productId: product.productId || '',
        stockAlertThreshold: product.stockAlertThreshold !== undefined ? product.stockAlertThreshold : 5
      });

      if (product.categoryId) {
        const path = findPathToCategory(product.categoryId, heirarchy);
        setSelectedPathIds(path || []);
      } else {
        setSelectedPathIds([]);
      }

      setPreviews(product.images || []);
      setImageFiles([]);
    } else {
      setFormData({
        name: '',
        categoryId: initialCategoryId || '',
        productType: 'Repeat',
        discountedPrice: '',
        actualPrice: '',
        stock: '',
        isAvailable: true,
        description: '',
        tagline: '',
        care: '',
        sku: generateSKU(),
        size: '',
        images: [],
        productId: generateProductId(),
        stockAlertThreshold: 5
      });

      if (initialCategoryId) {
        const path = findPathToCategory(initialCategoryId, heirarchy);
        setSelectedPathIds(path || []);
      } else {
        setSelectedPathIds([]);
      }

      setPreviews([]);
      setImageFiles([]);
      setRemovedImageUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isOpen, heirarchy, initialCategoryId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Ensure numeric fields are not negative
    if ((name === 'stock' || name === 'discountedPrice' || name === 'actualPrice') && value < 0) {
      return;
    }
    if (name === 'stockAlertThreshold' && value !== '' && Number(value) < 1) {
      return;
    }

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Force stock to 1 if productType is switched to Unique
      if (name === 'productType' && value === 'Unique') {
        newData.stock = '1';
      }

      return newData;
    });
  };

  const handleKeyPress = (e) => {
    const { name } = e.target;

    // List of allowed control keys
    const controlKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];

    if (controlKeys.includes(e.key)) return;

    if (name === 'stock' || name === 'stockAlertThreshold') {
      // ONLY digits for stock and threshold
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    } else if (name === 'discountedPrice' || name === 'actualPrice') {
      // Digits and one decimal point for pricing
      if (!/[0-9.]/.test(e.key)) {
        e.preventDefault();
      }
      // Prevent multiple decimal points
      if (e.key === '.' && e.target.value.includes('.')) {
        e.preventDefault();
      }
    }
  };

  const handleLevelChange = (level, id) => {
    if (!id) {
      const newPath = selectedPathIds.slice(0, level);
      setSelectedPathIds(newPath);
      setFormData(prev => ({ ...prev, categoryId: newPath[newPath.length - 1] || '' }));
      return;
    }

    const newPath = [...selectedPathIds.slice(0, level), id];
    setSelectedPathIds(newPath);

    // Check if this category has children
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

    // Only set the final categoryId if it's a leaf node
    if (!hasChildren) {
      setFormData(prev => ({ ...prev, categoryId: id }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter out files that are too large (limit to 5MB for Cloudinary)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error('Some images were skipped as they exceed 5MB');
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removePreview = (index) => {
    const previewToRemove = previews[index];
    const isExistingImage = formData.images.includes(previewToRemove);

    if (isExistingImage) {
      // Track Cloudinary URLs for deletion on save
      if (previewToRemove.includes('res.cloudinary.com')) {
        setRemovedImageUrls(prev => [...prev, previewToRemove]);
      }
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => prev.images[i] !== previewToRemove)
      }));
    } else {
      // Find position among new files
      const newFileIndex = previews.slice(0, index).filter(p => !formData.images.includes(p)).length;
      setImageFiles(prev => prev.filter((_, i) => i !== newFileIndex));
    }

    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
  };


  const createSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  };

  const getCategoryName = (id) => {
    const findCat = (items) => {
      if (!items) return null;
      for (const item of items) {
        if (item.id === id) return item.name;
        if (item.children) {
          const found = findCat(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCat(heirarchy);
  };

  const getCategoryShowSizes = (id) => {
    const findCat = (items) => {
      if (!items) return null;
      for (const item of items) {
        if (item.id === id) return item.showSizes || false;
        if (item.children) {
          const found = findCat(item.children);
          if (found !== null) return found;
        }
      }
      return null;
    };
    return findCat(heirarchy) || false;
  };

  const isApparelReadymade = formData.categoryId ? getCategoryShowSizes(formData.categoryId) : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.discountedPrice || !formData.sku) {
      toast.error('Please fill required fields (Name, Category, Discounted Price, SKU)', { id: 'form-validation-error' });
      return;
    }

    if (isApparelReadymade && !formData.size) {
      toast.error('Please select a size for this product', { id: 'size-validation-error' });
      return;
    }

    if (formData.sku) {
      try {
        const skuQuery = query(collection(db, 'products'), where('sku', '==', formData.sku));
        const skuSnapshot = await getDocs(skuQuery);
        const existingProducts = skuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // If product already exists and its id isn't the current product's id
        if (existingProducts.length > 0) {
          const isDuplicate = existingProducts.some(p => !product || p.id !== product.id);
          if (isDuplicate) {
            toast.error('This SKU is already in use by another product.', { id: 'sku-duplicate-error' });
            return;
          }
        }
      } catch (err) {
        console.error("Error checking SKU:", err);
      }
    }

    const dPrice = Number(formData.discountedPrice);
    const aPrice = Number(formData.actualPrice || 0);

    if (aPrice > 0 && dPrice > aPrice) {
      toast.error('Discounted Price cannot be higher than Original Price', { id: 'price-validation-error' });
      return;
    }

    if (formData.stockAlertThreshold !== undefined && formData.stockAlertThreshold !== '' && Number(formData.stockAlertThreshold) < 1) {
      toast.error('Stock Alert threshold must be at least 1', { id: 'stock-alert-validation-error' });
      return;
    }

    setLoading(true);
    try {
      // Upload new image files to Cloudinary
      const uploadPromises = imageFiles.map(file => uploadToCloudinary(file, 'Products'));
      const uploadedImageUrls = await Promise.all(uploadPromises);

      const finalImages = [...formData.images, ...uploadedImageUrls];

      const productData = {
        ...formData,
        slug: createSlug(formData.name),
        images: finalImages,
        stock: formData.productType === 'Unique' ? 1 : Number(formData.stock),
        stockAlertThreshold: Number(formData.stockAlertThreshold !== undefined ? formData.stockAlertThreshold : 5),
        discountedPrice: Number(formData.discountedPrice),
        actualPrice: Number(formData.actualPrice || 0),
        updatedAt: serverTimestamp()
      };

      if (!isApparelReadymade) {
        delete productData.size;
      }

      // Set isShow for Unique products based on stock (1 = true, 0 = false)
      if (formData.productType === 'Unique') {
        productData.isShow = productData.stock > 0;
      }

      if (product) {
        await updateDoc(doc(db, 'products', product.id), productData);
        toast.success("Product updated successfully");
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
        toast.success(`Product added with ID: ${productData.productId}`);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }

    // Delete removed images from Cloudinary (best-effort, after save)
    if (removedImageUrls.length > 0) {
      deleteMultipleFromCloudinary(removedImageUrls);
      setRemovedImageUrls([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight flex items-center">
              {product ? (
                <>
                  <span>Edit Product</span>
                  <span className="mx-3 text-gray-200 font-light">|</span>
                  <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#1BAFAF]/10 px-3 py-1 rounded-full border border-[#1BAFAF]/10 tracking-wider">
                    {product.productId || '---'}
                  </span>
                </>
              ) : (
                'Add Product'
              )}
            </h2>
            <p className="text-[12px] text-gray-400 font-medium">Capture the essence of your creation</p>
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
          <div className="p-8 pb-32 space-y-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Left Column: Basic Details */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Basic Information</h3>
                  </div>
                  <hr className="border-gray-200 -mt-2 mb-3" />

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
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Product Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Banarasi Silk Saree"
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

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Care Instructions</label>
                    <input
                      type="text"
                      name="care"
                      value={formData.care}
                      onChange={handleInputChange}
                      placeholder="e.g. Dry clean only"
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

                        // Always show level 0 and 1. Hide level 2+ if no options.
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

                  {isApparelReadymade && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[13px] font-bold text-gray-700 ml-1 mb-1.5 block">Size *</label>
                      <CustomSelect
                        value={formData.size}
                        onChange={(val) => setFormData(prev => ({ ...prev, size: val }))}
                        options={['xs', 'sm', 'm', 'l', 'xl', 'xxl', 'others']}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[13px] font-bold text-gray-700 ml-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell the story of this product..."
                      rows={4}
                      className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing, Media, Inventory */}
              <div className="space-y-6">
                {/* Inventory & Status Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Inventory & Status</h3>
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
                  <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5 relative">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.sku}
                        className="w-full bg-gray-100 border-none px-4 py-3 rounded-xl text-[14px] outline-none text-gray-500 font-bold cursor-not-allowed uppercase"
                      />
                    </div>
                    <div className="space-y-1.5 relative">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">
                        Stock Alert Below *
                      </label>
                      <input
                        required={formData.productType !== 'Unique'}
                        type="number"
                        min="1"
                        name="stockAlertThreshold"
                        value={formData.productType === 'Unique' ? '' : formData.stockAlertThreshold}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        disabled={formData.productType === 'Unique'}
                        placeholder={formData.productType === 'Unique' ? 'N/A' : 'e.g. 5'}
                        className={`w-full border-none px-4 py-3 rounded-xl text-[14px] outline-none transition-all font-bold ${formData.productType === 'Unique'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white'
                          }`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Product Type</label>
                      <CustomSelect
                        value={formData.productType}
                        onChange={(val) => setFormData(prev => ({ ...prev, productType: val, stock: val === 'Unique' ? '1' : prev.stock }))}
                        options={['Repeat', 'Unique']}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Stock Quantity</label>
                      <input
                        required={formData.productType !== 'Unique'}
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        disabled={formData.productType === 'Unique'}
                        placeholder={formData.productType === 'Unique' ? '1' : '0'}
                        className={`w-full border-none px-4 py-3 rounded-xl text-[14px] outline-none transition-all font-bold ${formData.productType === 'Unique'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Pricing</h3>
                  <hr className="border-gray-200 -mt-2 mb-3" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Discounted Price (₹) *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        name="discountedPrice"
                        value={formData.discountedPrice}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="0.00"
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-bold text-[#1BAFAF]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 ml-1">Original Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        name="actualPrice"
                        value={formData.actualPrice}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="0.00"
                        className="w-full bg-gray-50 border-none px-4 py-3 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-[#1BAFAF]/20 focus:bg-white transition-all font-medium text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[14px] font-bold text-[#1BAFAF] uppercase tracking-wider">Product Media</h3>
                    <span className="text-[11px] font-bold text-gray-300 uppercase">{previews.length} Files</span>
                  </div>
                  <hr className="border-gray-200 -mt-2 mb-5" />

                  <div className="flex flex-col gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {/* Dropzone */}
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className={`border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#1BAFAF]/30 hover:bg-[#1BAFAF]/5 transition-all group ${previews.length === 0 ? '' : 'hidden'}`}
                    >
                      <div className="w-12 h-12 bg-[#eaf6f6] rounded-xl flex items-center justify-center text-[#1BAFAF] group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-bold text-gray-700">Click to upload images</p>
                        <p className="text-[11px] text-gray-400 font-medium">PNG, JPG or WebP (Max 5MB each)</p>
                      </div>
                    </div>

                    {/* Previews */}
                    {previews.length > 0 && (
                      <div className="flex overflow-x-auto custom-scrollbar gap-3 pb-2 items-start">
                        {previews.map((src, index) => (
                          <div key={index} className="relative group w-[110px] h-[110px] flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                            <img src={src} alt="Preview" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => removePreview(index)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="w-[110px] h-[110px] flex-shrink-0 rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[#1BAFAF] hover:border-[#1BAFAF]/30 hover:bg-[#1BAFAF]/5 transition-all bg-gray-50/50"
                        >
                          <Plus size={24} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
            disabled={loading}
            className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-8 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {product ? 'Update' : 'Add Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
