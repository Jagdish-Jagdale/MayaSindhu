import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Loader2, 
  User, 
  Calendar, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronDown,
  Info,
  Circle
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  where,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import BulkItemModal from './BulkItemModal';
import ProductFormModal from '../ProductFormModal';
import CustomSelect from '../../common/CustomSelect';

const OfflineOrderModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Order Number Settings
  const [orderSettings, setOrderSettings] = useState({
    mode: 'auto',
    prefix: 'SO-',
    nextNumber: '00001'
  });

  // Form Data
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    saleOrderNumber: '',
    saleOrderDate: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
    deliveryDate: new Date().toLocaleDateString('en-GB'),
    items: [],
    subTotal: 0,
    tax: 18, // Default 18%
    adjustment: 0,
    total: 0,
    customerNotes: ''
  });

  const customerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerId: '',
        customerName: '',
        saleOrderNumber: '',
        saleOrderDate: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
        deliveryDate: new Date().toLocaleDateString('en-GB'),
        items: [],
        subTotal: 0,
        tax: 18,
        adjustment: 0,
        total: 0,
        customerNotes: ''
      });
      setSearchCustomer('');
      setLoading(false);
      fetchCustomers();
      fetchProducts();
      if (orderSettings.mode === 'auto') {
        generateSONumber();
      }
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const q = query(collection(db, 'storeCustomers'), orderBy('fullName'));
      const snapshot = await getDocs(q);
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const generateSONumber = async () => {
    try {
      const q = query(collection(db, 'storeOrders'), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      let nextNum = 1;
      
      if (!snapshot.empty) {
        const lastOrder = snapshot.docs[0].data();
        if (lastOrder.saleOrderNumber && lastOrder.saleOrderNumber.includes(orderSettings.prefix)) {
           const numPart = lastOrder.saleOrderNumber.split(orderSettings.prefix)[1];
           nextNum = (parseInt(numPart) || 0) + 1;
        }
      } else {
        nextNum = parseInt(orderSettings.nextNumber) || 1;
      }
      
      const formattedNum = `${orderSettings.prefix}${nextNum.toString().padStart(orderSettings.nextNumber.length, '0')}`;
      setFormData(prev => ({ ...prev, saleOrderNumber: formattedNum }));
    } catch (error) {
      console.error("Error generating PO number:", error);
      const fallback = `${orderSettings.prefix}${orderSettings.nextNumber}`;
      setFormData(prev => ({ ...prev, saleOrderNumber: fallback }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), productId: '', name: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleBulkAdd = (selectedProducts) => {
    const newItems = selectedProducts.map(p => ({
      id: Date.now() + Math.random(),
      productId: p.id,
      name: p.name,
      quantity: 1,
      rate: p.discountedPrice || p.price || 0,
      amount: p.discountedPrice || p.price || 0
    }));

    setFormData(prev => {
      // Remove empty row if it exists
      const filteredItems = prev.items.filter(item => item.productId !== '');
      return {
        ...prev,
        items: [...filteredItems, ...newItems]
      };
    });
    toast.success(`${selectedProducts.length} items added`);
  };

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (id, field, value) => {
    const newItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          if (prod) {
            updatedItem.name = prod.name;
            updatedItem.rate = prod.discountedPrice || prod.price || 0;
          }
        }
        updatedItem.amount = updatedItem.rate * updatedItem.quantity;
        return updatedItem;
      }
      return item;
    });
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  useEffect(() => {
    const subTotal = formData.items.reduce((acc, item) => acc + item.amount, 0);
    const total = subTotal + (subTotal * (formData.tax / 100)) + parseFloat(formData.adjustment || 0);
    setFormData(prev => ({ ...prev, subTotal, total }));
  }, [formData.items, formData.tax, formData.adjustment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      toast.error("Please select a Customer");
      return;
    }
    if (formData.items.length === 0 || formData.items.every(item => !item.productId)) {
      toast.error("Please select at least one product");
      return;
    }

    setLoading(true);
    try {
      const orderItems = formData.items.filter(item => item.productId);

      // Save order to storeOrders collection
      await addDoc(collection(db, 'storeOrders'), {
        ...formData,
        items: orderItems,
        createdAt: serverTimestamp(),
        status: 'Confirmed'
      });

      // Reduce product stock in products collection
      const updatePromises = orderItems.map(async (item) => {
        try {
          const productRef = doc(db, 'products', item.productId);
          await updateDoc(productRef, {
            stock: increment(-Number(item.quantity || 0))
          });
        } catch (err) {
          console.error(`Error updating stock for product ${item.productId}:`, err);
        }
      });
      await Promise.all(updatePromises);

      toast.success("sales order created successfully!");
      onClose();
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCustomer = () => {
    setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
    setSearchCustomer('');
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    if (orderSettings.mode === 'auto') {
      generateSONumber();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">New Sales Order</h2>
            <p className="text-[12px] text-gray-400 font-medium">Create a manual sales order for customers</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Top Section: Customer & Details */}
          <div className="space-y-8">
            {/* Sales Order# & Sale Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* sales order # */}
              <div className="space-y-2 relative">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  sales order# * 
                  <Info size={12} className="text-gray-300" />
                </label>
                <div className="relative group">
                  <Settings 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1BAFAF] cursor-pointer hover:rotate-90 transition-transform z-10" 
                  />
                  <input
                    type="text"
                    required
                    value={formData.saleOrderNumber}
                    onChange={(e) => setFormData({ ...formData, saleOrderNumber: e.target.value })}
                    readOnly={orderSettings.mode === 'auto'}
                    className={`w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-900 rounded-2xl outline-none ${orderSettings.mode === 'auto' ? 'cursor-not-allowed' : 'focus:bg-white focus:border-[#1BAFAF]/20'}`}
                  />
                </div>

                {/* Order Number Settings Popup */}
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-gray-100 rounded-3xl shadow-2xl z-[120] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-6 space-y-6">
                      <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                        Your sales order numbers are set on auto-generate mode to save your time. Are you sure about changing this setting?
                      </p>
                      
                      <div className="space-y-4">
                        {/* Auto Generate Option */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="pt-0.5">
                            <input 
                              type="radio" 
                              name="po_mode"
                              checked={orderSettings.mode === 'auto'}
                              onChange={() => setOrderSettings({ ...orderSettings, mode: 'auto' })}
                              className="hidden" 
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${orderSettings.mode === 'auto' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                              {orderSettings.mode === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[13px] font-bold text-gray-700">Continue auto-generating sales order numbers</span>
                              <Info size={12} className="text-gray-300" />
                            </div>
                            
                            {orderSettings.mode === 'auto' && (
                              <div className="space-y-3 animate-in fade-in duration-200">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Prefix</span>
                                  <input 
                                    type="text" 
                                    value={orderSettings.prefix}
                                    onChange={(e) => setOrderSettings({ ...orderSettings, prefix: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-medium focus:bg-white outline-none" 
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Next Number</span>
                                  <input 
                                    type="text" 
                                    value={orderSettings.nextNumber}
                                    onChange={(e) => setOrderSettings({ ...orderSettings, nextNumber: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-medium focus:bg-white outline-none" 
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </label>

                        {/* Manual Option */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="po_mode"
                            checked={orderSettings.mode === 'manual'}
                            onChange={() => setOrderSettings({ ...orderSettings, mode: 'manual' })}
                            className="hidden" 
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${orderSettings.mode === 'manual' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                            {orderSettings.mode === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                          </div>
                          <span className="text-[13px] font-bold text-gray-700">Enter sales order numbers manually</span>
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleSettingsSave}
                          className="flex-1 bg-[#1BAFAF] text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#158e8e] transition-all"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex-1 bg-gray-50 text-gray-500 py-2.5 rounded-xl text-[12px] font-bold hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sale Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sale Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    value={formData.deliveryDate}
                    readOnly
                    className="w-full bg-gray-100 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection (Full Width) */}
            <div className="space-y-2 relative" ref={customerRef}>
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer Name *</label>
              </div>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                <input
                  type="text"
                  value={searchCustomer || formData.customerName}
                  onChange={(e) => {
                    setSearchCustomer(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Select or Search Customer"
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-10 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
                {(formData.customerId || searchCustomer) && (
                  <button 
                    type="button"
                    onClick={handleClearCustomer}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[110] py-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {customers
                    .filter(v => v.fullName?.toLowerCase().includes(searchCustomer.toLowerCase()))
                    .map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, customerId: v.id, customerName: v.fullName });
                          setSearchCustomer(v.fullName);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#EAF6F6] hover:text-[#1BAFAF] text-[14px] font-bold text-gray-700 transition-all flex items-center justify-between group"
                      >
                        <span>{v.fullName}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1BAFAF] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  {customers.length === 0 && (
                    <p className="px-4 py-2 text-[12px] text-gray-400">No customers found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Item Table Card */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Item Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4 w-24 text-center">Quantity</th>
                    <th className="px-6 py-4 w-32 text-center">Rate</th>
                    <th className="px-6 py-4 w-32 text-right">Amount</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="group transition-colors hover:bg-gray-50/30">
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-gray-700">{item.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-center border-none outline-none text-[14px] font-bold text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-center border-none outline-none text-[14px] font-bold text-gray-900"
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-black text-gray-900">₹{item.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-200 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Add Items — last row of table */}
                  <tr>
                    <td colSpan={5} className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                      >
                        <Plus size={14} className="text-[#1BAFAF]" />
                        Add Items
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Summary */}
          <div className="pt-4">
            <div className="bg-gray-50/50 rounded-[32px] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-gray-500">Sub Total</span>
                <span className="text-[14px] font-black text-gray-900">₹{formData.subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <Circle className="w-4 h-4 fill-[#1BAFAF] text-[#1BAFAF]" />
                     <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">TDS</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Circle className="w-4 h-4 text-gray-300" />
                     <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">TCS</span>
                   </div>
                </div>
                <CustomSelect
                  value={`GST ${formData.tax}%`}
                  onChange={(val) => {
                    const num = parseFloat(val.replace('GST ', '').replace('%', '')) || 0;
                    setFormData({ ...formData, tax: num });
                  }}
                  options={['GST 18%', 'GST 5%', 'No Tax']}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between gap-8">
                <div className="flex-1 max-w-[120px]">
                  <div className="border border-dashed border-gray-200 rounded-xl px-3 py-2 text-[12px] font-bold text-gray-400 bg-white">
                    Adjustment
                  </div>
                </div>
                <input
                  type="number"
                  value={formData.adjustment}
                  onChange={(e) => setFormData({ ...formData, adjustment: parseFloat(e.target.value) || 0 })}
                  className="w-24 bg-white border border-gray-100 rounded-xl px-3 py-2 text-[14px] font-bold text-gray-900 outline-none text-right"
                  placeholder="0.00"
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[16px] font-black text-gray-900">Total ( ₹ )</span>
                <span className="text-[20px] font-black text-[#1BAFAF]">₹{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-8 border-t border-gray-50 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-[14px] font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 text-[14px] font-bold text-white bg-[#1BAFAF] rounded-2xl hover:bg-[#158e8e] transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Item Selection Modal */}
      <BulkItemModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        products={products}
        onAdd={handleBulkAdd}
        onAddProduct={() => setIsProductModalOpen(true)}
        alreadyAddedIds={formData.items.map(item => item.productId).filter(Boolean)}
      />

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          fetchProducts();
        }}
      />
    </div>
  );
};

export default OfflineOrderModal;
