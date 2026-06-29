import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Loader2, 
  User, 
  Calendar, 
  Settings, 
  Plus, 
  Trash2, 
  Search,
  ChevronDown,
  Info,
  Circle,
  FileText
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import StoreCustomerModal from './StoreCustomerModal';
import BulkItemModal from './BulkItemModal';
import CustomSelect from '../../common/CustomSelect';

const InvoiceModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Invoice Number Settings
  const [invoiceSettings, setInvoiceSettings] = useState({
    mode: 'auto',
    prefix: 'INV-',
    nextNumber: '00001'
  });

  // Form Data
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    invoiceNumber: '',
    orderNumber: '',
    invoiceDate: new Date().toLocaleDateString('en-GB'), // dd/mm/yyyy
    items: [],
    subTotal: 0,
    tax: 18, // Default 18%
    adjustment: 0,
    total: 0,
    customerNotes: ''
  });

  const customerRef = useRef(null);
  const orderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
      if (orderRef.current && !orderRef.current.contains(event.target)) {
        setShowOrderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
      fetchOrders();
      if (invoiceSettings.mode === 'auto') {
        generateInvoiceNumber();
      }
    }
  }, [isOpen, fetchCustomers, fetchProducts, fetchOrders, generateInvoiceNumber, invoiceSettings.mode]);

  const fetchCustomers = useCallback(async () => {
    try {
      let snapshot;
      try {
        const q = query(collection(db, 'storeCustomers'), orderBy('fullName'));
        snapshot = await getDocs(q);
      } catch (err) {
        snapshot = await getDocs(collection(db, 'storeCustomers'));
      }
      let fetchedCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedCustomers.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      setCustomers(fetchedCustomers);
    } catch (error) {
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      let snapshot;
      try {
        const q = query(collection(db, 'storeOrders'), orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (err) {
        snapshot = await getDocs(collection(db, 'storeOrders'));
      }
      let fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      setOrders(fetchedOrders);
    } catch (error) {
    }
  }, []);

  const handleOrderSelect = (order) => {
    const mappedItems = order.items.map(item => ({
      ...item,
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({
      ...prev,
      orderNumber: order.saleOrderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      items: mappedItems,
      subTotal: order.subTotal || 0,
      tax: order.tax || 18,
      adjustment: order.adjustment || 0,
      total: order.total || 0,
      customerNotes: order.customerNotes || ''
    }));
    setSearchOrder(order.saleOrderNumber);
    setSearchCustomer(order.customerName);
    setShowOrderDropdown(false);
    toast.success(`Items from Order ${order.saleOrderNumber} loaded`);
  };

  const generateInvoiceNumber = useCallback(async () => {
    try {
      const q = query(collection(db, 'storeInvoices'), orderBy('createdAt', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      let nextNum = 1;
      
      if (!snapshot.empty) {
        const lastInv = snapshot.docs[0].data();
        if (lastInv.invoiceNumber && lastInv.invoiceNumber.includes(invoiceSettings.prefix)) {
           const numPart = lastInv.invoiceNumber.split(invoiceSettings.prefix)[1];
           nextNum = (parseInt(numPart) || 0) + 1;
        }
      } else {
        nextNum = parseInt(invoiceSettings.nextNumber) || 1;
      }
      
      const formattedNum = `${invoiceSettings.prefix}${nextNum.toString().padStart(invoiceSettings.nextNumber.length, '0')}`;
      setFormData(prev => ({ ...prev, invoiceNumber: formattedNum }));
    } catch (error) {
      const fallback = `${invoiceSettings.prefix}${invoiceSettings.nextNumber}`;
      setFormData(prev => ({ ...prev, invoiceNumber: fallback }));
    }
  }, [invoiceSettings.prefix, invoiceSettings.nextNumber]);

  const handleBulkAdd = (selectedProducts) => {
    const newItems = selectedProducts.map(p => ({
      id: Date.now() + Math.random(),
      productId: p.id,
      name: p.name,
      quantity: 1,
      rate: p.price || 0,
      discount: 0,
      amount: p.price || 0
    }));

    setFormData(prev => {
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
            updatedItem.rate = prod.price || 0;
          }
        }
        const baseAmount = updatedItem.rate * updatedItem.quantity;
        updatedItem.amount = baseAmount - (baseAmount * (updatedItem.discount / 100));
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
      toast.error("Please select a customer");
      return;
    }
    if (formData.items.length === 0 || formData.items.every(item => !item.productId)) {
      toast.error("Please select at least one product");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'storeInvoices'), {
        ...formData,
        items: formData.items.filter(item => item.productId),
        createdAt: serverTimestamp(),
        status: 'Paid'
      });
      toast.success("Invoice generated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCustomer = () => {
    setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
    setSearchCustomer('');
  };

  const handleClearOrder = () => {
    setFormData(prev => ({ 
      ...prev, 
      orderNumber: '',
      items: [{ id: Date.now(), productId: '', name: '', quantity: 1, rate: 0, discount: 0, amount: 0 }]
    }));
    setSearchOrder('');
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    if (invoiceSettings.mode === 'auto') {
      generateInvoiceNumber();
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
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">New Invoice</h2>
            <p className="text-[12px] text-gray-400 font-medium">Create an invoice for walk-in customers</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Customer Selection */}
            <div className="space-y-2 relative md:col-span-1" ref={customerRef}>
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer Name *</label>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCustomerDropdown(false);
                    setIsCustomerModalOpen(true);
                  }}
                  className="w-5 h-5 flex items-center justify-center bg-[#1BAFAF] text-white rounded-md hover:bg-[#158e8e] transition-colors"
                >
                  <Plus size={12} strokeWidth={3} />
                </button>
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
                  placeholder="Select Customer"
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
                    .filter(c => (c.fullName || '').toLowerCase().includes(searchCustomer.toLowerCase()))
                    .map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, customerId: c.id, customerName: c.fullName || '' });
                          setSearchCustomer(c.fullName || '');
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#EAF6F6] hover:text-[#1BAFAF] text-[14px] font-bold text-gray-700 transition-all flex items-center justify-between group"
                      >
                        <span>{c.fullName || 'No Name'}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1BAFAF] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Invoice # */}
            <div className="space-y-2 relative">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                Invoice No * <Info size={12} className="text-gray-300" />
              </label>
              <div className="relative group">
                <Settings 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1BAFAF] cursor-pointer hover:rotate-90 transition-transform z-10" 
                />
                <input
                  type="text"
                  required
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  readOnly={invoiceSettings.mode === 'auto'}
                  className={`w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-900 rounded-2xl outline-none ${invoiceSettings.mode === 'auto' ? 'cursor-not-allowed' : 'focus:bg-white focus:border-[#1BAFAF]/20'}`}
                />
              </div>

              {/* Settings Popup */}
              {isSettingsOpen && (
                <div className="absolute top-full right-0 mt-2 w-[400px] bg-white border border-gray-100 rounded-3xl shadow-2xl z-[120] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-6 space-y-6">
                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                      Your invoice numbers are set on auto-generate mode. Are you sure about changing this setting?
                    </p>
                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-0.5">
                          <input 
                            type="radio" 
                            name="inv_mode"
                            checked={invoiceSettings.mode === 'auto'}
                            onChange={() => setInvoiceSettings({ ...invoiceSettings, mode: 'auto' })}
                            className="hidden" 
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${invoiceSettings.mode === 'auto' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                            {invoiceSettings.mode === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[13px] font-bold text-gray-700">Continue auto-generating invoice numbers</span>
                          </div>
                          {invoiceSettings.mode === 'auto' && (
                            <div className="space-y-3 animate-in fade-in duration-200">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Prefix</span>
                                <input 
                                  type="text" 
                                  value={invoiceSettings.prefix}
                                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-medium focus:bg-white outline-none" 
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Next Number</span>
                                <input 
                                  type="text" 
                                  value={invoiceSettings.nextNumber}
                                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, nextNumber: e.target.value })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-medium focus:bg-white outline-none" 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="inv_mode"
                          checked={invoiceSettings.mode === 'manual'}
                          onChange={() => setInvoiceSettings({ ...invoiceSettings, mode: 'manual' })}
                          className="hidden" 
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${invoiceSettings.mode === 'manual' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                          {invoiceSettings.mode === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                        </div>
                        <span className="text-[13px] font-bold text-gray-700">Enter invoice numbers manually</span>
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={handleSettingsSave} className="flex-1 bg-[#1BAFAF] text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#158e8e] transition-all">Save</button>
                      <button onClick={() => setIsSettingsOpen(false)} className="flex-1 bg-gray-50 text-gray-500 py-2.5 rounded-xl text-[12px] font-bold hover:bg-gray-100 transition-all">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order # */}
            <div className="space-y-2 relative" ref={orderRef}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Order Number</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchOrder || formData.orderNumber}
                  onChange={(e) => {
                    setSearchOrder(e.target.value);
                    setShowOrderDropdown(true);
                  }}
                  onFocus={() => setShowOrderDropdown(true)}
                  placeholder="Type to search orders..."
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-10 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
                {(formData.orderNumber || searchOrder) && (
                  <button 
                    type="button"
                    onClick={handleClearOrder}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {showOrderDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[110] py-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {orders
                    .filter(o => {
                      const matchesSearch = (o.saleOrderNumber || '').toLowerCase().includes(searchOrder.toLowerCase());
                      return matchesSearch;
                    })
                    .map(o => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => handleOrderSelect(o)}
                        className="w-full text-left px-4 py-3 hover:bg-[#EAF6F6] text-[14px] font-bold text-gray-700 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold group-hover:text-[#1BAFAF] transition-colors">{o.saleOrderNumber}</p>
                          <p className="text-[11px] text-gray-400 group-hover:text-[#1BAFAF]/60 transition-colors">{o.customerName}</p>
                        </div>
                        <span className="text-[12px] font-black text-[#1BAFAF] bg-white px-2 py-1 rounded-lg">₹{o.total?.toLocaleString()}</span>
                      </button>
                    ))}
                  {orders.filter(o => {
                    const matchesSearch = (o.saleOrderNumber || '').toLowerCase().includes(searchOrder.toLowerCase());
                    return matchesSearch;
                  }).length === 0 && (
                    <p className="px-4 py-3 text-[12px] text-gray-400 text-center font-medium">
                      No matching orders found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Invoice Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={formData.invoiceDate}
                  readOnly
                  className="w-full bg-gray-100 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Item Table Card */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider">Item Table</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4 w-24 text-center">Quantity</th>
                    <th className="px-6 py-4 w-32 text-center">Rate</th>
                    <th className="px-6 py-4 w-32 text-center">Discount (%)</th>
                    <th className="px-6 py-4 w-32 text-right">Amount</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {formData.items.map((item) => (
                    <tr key={item.id} className="group transition-colors hover:bg-gray-50/30">
                      <td className="px-6 py-4">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-gray-700 appearance-none cursor-pointer"
                        >
                          <option value="">Select an item</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-12 bg-transparent text-center border-none outline-none text-[14px] font-bold text-gray-900"
                          />
                          <span className="text-[14px] text-gray-400">%</span>
                        </div>
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
                </tbody>
              </table>
            </div>

          </div>

          {/* Bottom Section */}
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
                   value={formData.tax === 0 ? 'No Tax' : `GST ${formData.tax}%`}
                   onChange={(val) => {
                     const num = val === 'No Tax' ? 0 : parseFloat(val.replace('GST ', '').replace('%', '')) || 0;
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
                />
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[16px] font-black text-gray-900">Total ( ₹ )</span>
                <span className="text-[20px] font-black text-[#1BAFAF]">₹{formData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-8 py-3 text-[14px] font-bold text-gray-500 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 text-[14px] font-bold text-white bg-[#1BAFAF] rounded-2xl hover:bg-[#158e8e] transition-all shadow-lg shadow-[#1BAFAF]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>

      <StoreCustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          fetchCustomers();
        }}
      />

      <BulkItemModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        products={products}
        onAdd={handleBulkAdd}
      />
    </div>
  );
};

export default InvoiceModal;
