import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCcw,
  Loader2,
  Calendar,
  Filter,
  Download,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Undo2,
  X,
  Settings,
  Info,
  Eye
} from 'lucide-react';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  limit,
  updateDoc,
  increment
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [offlineReturns, setOfflineReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'saleOrderNumber', dir: 'asc' });
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState({
    title: 'Confirm Deletion',
    itemName: '',
    message: null,
    onConfirm: null
  });
  const [isReturnFormOpen, setIsReturnFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [returnSettings, setReturnSettings] = useState({
    mode: 'auto',
    prefix: 'RET-',
    nextNumber: '10000'
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnFormData, setReturnFormData] = useState({
    returnId: '',
    returnDate: '',
    customerId: '',
    customerName: '',
    customerMobile: '',
    items: [],
    actualPrice: 0,
    returnAmount: 0,
    total: 0
  });
  const rowOptions = [5, 10, 20, 50];

  const handleOpenReturnForm = async (order) => {
    setSelectedOrder(order);
    const today = new Date().toISOString().split('T')[0];

    const existingReturns = offlineReturns.filter(ret => ret.originalOrderId === order.id);

    const initializedItems = (order.items || []).map(item => {
      const previouslyReturned = existingReturns.reduce((sum, ret) => {
        const retItem = (ret.items || []).find(ri =>
          (ri.productId && item.productId && ri.productId === item.productId) ||
          (ri.name === item.name)
        );
        return sum + (retItem ? Number(retItem.quantity || 0) : 0);
      }, 0);

      const remainingQty = Math.max(0, Number(item.quantity || 0) - previouslyReturned);

      return {
        ...item,
        originalOrderedQty: item.originalOrderedQty || item.quantity,
        quantity: remainingQty,
        returnQty: 0,
        reason: ''
      };
    });

    const totalPreviouslyReturnedAmount = existingReturns.reduce((sum, ret) => sum + Number(ret.returnAmount || 0), 0);
    const remainingActualPrice = Math.max(0, (order.total || 0) - totalPreviouslyReturnedAmount);

    setReturnFormData({
      returnId: '',
      returnDate: today,
      customerId: order.customerId || '---',
      customerName: order.customerName || '---',
      customerMobile: order.customerPhone || order.phone || '---',
      items: initializedItems,
      actualPrice: remainingActualPrice,
      returnAmount: 0,
      total: remainingActualPrice
    });

    if (returnSettings.mode === 'auto') {
      try {
        const q = query(collection(db, 'offlineReturns'), orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        let nextNum = 1;

        if (!snapshot.empty) {
          const lastReturn = snapshot.docs[0].data();
          if (lastReturn.returnId && lastReturn.returnId.includes(returnSettings.prefix)) {
            const numPart = lastReturn.returnId.split(returnSettings.prefix)[1];
            nextNum = (parseInt(numPart) || 0) + 1;
          }
        } else {
          nextNum = parseInt(returnSettings.nextNumber) || 1;
        }

        const formattedNum = `${returnSettings.prefix}${nextNum.toString().padStart(returnSettings.nextNumber.length, '0')}`;
        setReturnFormData(prev => ({ ...prev, returnId: formattedNum }));
      } catch (error) {
        const fallback = `${returnSettings.prefix}${returnSettings.nextNumber}`;
        setReturnFormData(prev => ({ ...prev, returnId: fallback }));
      }
    }

    if (order.customerId && order.customerId !== '---') {
      const fetchCustomerPhone = async () => {
        try {
          const docRef = doc(db, 'storeCustomers', order.customerId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const customerData = docSnap.data();
            setReturnFormData(prev => ({
              ...prev,
              customerMobile: customerData.phone || customerData.mobile || prev.customerMobile
            }));
          }
        } catch (error) {
        }
      };
      fetchCustomerPhone();
    }

    setIsReturnFormOpen(true);
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setIsSettingsOpen(false);
    if (returnSettings.mode === 'auto') {
      try {
        const q = query(collection(db, 'offlineReturns'), orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        let nextNum = 1;

        if (!snapshot.empty) {
          const lastReturn = snapshot.docs[0].data();
          if (lastReturn.returnId && lastReturn.returnId.includes(returnSettings.prefix)) {
            const numPart = lastReturn.returnId.split(returnSettings.prefix)[1];
            nextNum = (parseInt(numPart) || 0) + 1;
          }
        } else {
          nextNum = parseInt(returnSettings.nextNumber) || 1;
        }

        const formattedNum = `${returnSettings.prefix}${nextNum.toString().padStart(returnSettings.nextNumber.length, '0')}`;
        setReturnFormData(prev => ({ ...prev, returnId: formattedNum }));
      } catch (error) {
        const fallback = `${returnSettings.prefix}${returnSettings.nextNumber}`;
        setReturnFormData(prev => ({ ...prev, returnId: fallback }));
      }
    }
  };

  const handleItemReturnQtyChange = (index, value) => {
    const qty = Math.max(0, Math.min(Number(value) || 0, returnFormData.items[index].quantity || 0));
    const updatedItems = [...returnFormData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      returnQty: qty
    };

    const newReturnAmount = updatedItems.reduce((sum, item) => sum + (item.returnQty * (item.rate || 0)), 0);
    const newTotal = Math.max(0, returnFormData.actualPrice - newReturnAmount);

    setReturnFormData(prev => ({
      ...prev,
      items: updatedItems,
      returnAmount: newReturnAmount,
      total: newTotal
    }));
  };

  const handleItemReasonChange = (index, value) => {
    const updatedItems = [...returnFormData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      reason: value
    };
    setReturnFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const returnedItems = returnFormData.items.filter(item => item.returnQty > 0);

    if (returnedItems.length === 0) {
      toast.error("Please specify a return quantity of at least 1 for any product.");
      return;
    }

    const missingReason = returnedItems.some(item => !item.reason || item.reason.trim() === '');
    if (missingReason) {
      toast.error("Please enter a reason for all returned items.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'offlineReturns'), {
        returnId: returnFormData.returnId,
        returnDate: returnFormData.returnDate,
        customerId: returnFormData.customerId,
        customerName: returnFormData.customerName,
        customerMobile: returnFormData.customerMobile,
        orderNumber: selectedOrder.saleOrderNumber || '---',
        originalOrderId: selectedOrder.id,
        items: returnedItems.map(item => ({
          productId: item.productId || '',
          name: item.name || '',
          quantity: item.returnQty,
          rate: item.rate || 0,
          amount: item.returnQty * (item.rate || 0),
          reason: item.reason
        })),
        actualPrice: returnFormData.actualPrice,
        returnAmount: returnFormData.returnAmount,
        total: returnFormData.total,
        createdAt: serverTimestamp()
      });

      // Replenish stock in products collection
      const updatePromises = returnedItems.map(async (item) => {
        try {
          const productRef = doc(db, 'products', item.productId);
          await updateDoc(productRef, {
            stock: increment(Number(item.returnQty || 0))
          });
        } catch (err) {
        }
      });
      await Promise.all(updatePromises);

      toast.success("Return processed successfully!");
      setIsReturnFormOpen(false);
    } catch (error) {
      toast.error("Failed to process return.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
      if (!e.target.closest('.return-dropdown-container')) {
        setActiveDropdownOrderId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'storeOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReturns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load return records.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'offlineReturns'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOfflineReturns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id, customerName) => {
    setDeleteConfirmData({
      title: 'Confirm Deletion',
      itemName: customerName || 'this record',
      message: (
        <>
          Are you sure you want to delete the return record of <span className="font-bold text-[#111827]">"{customerName || 'this record'}"</span>?
        </>
      ),
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          await deleteDoc(doc(db, 'storeOrders', id));
          const matched = offlineReturns.filter(r => r.originalOrderId === id);
          const deletePromises = matched.map(m => deleteDoc(doc(db, 'offlineReturns', m.id)));
          await Promise.all(deletePromises);
          toast.success("Return record deleted successfully");
          setDeleteConfirmOpen(false);
        } catch (error) {
          toast.error("Failed to delete record");
        } finally {
          setDeleteLoading(false);
        }
      }
    });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteReturn = (ret) => {
    setDeleteConfirmData({
      title: 'Confirm Deletion',
      itemName: ret.returnId,
      message: (
        <div className="space-y-1">
          <p>
            Are you sure you want to delete return record <span className="font-bold text-[#111827]">"{ret.returnId}"</span>?
          </p>
          <p className="text-[13px] text-amber-600 font-semibold mt-1">
            This will also reverse the stock updates.
          </p>
        </div>
      ),
      onConfirm: async () => {
        setDeleteLoading(true);
        try {
          // 1. Revert stock updates in products collection
          const revertPromises = (ret.items || []).map(async (item) => {
            if (!item.productId) return;
            try {
              const productRef = doc(db, 'products', item.productId);
              await updateDoc(productRef, {
                stock: increment(-Number(item.quantity || 0))
              });
            } catch (err) {
            }
          });
          await Promise.all(revertPromises);

          // 2. Delete offlineReturns document
          await deleteDoc(doc(db, 'offlineReturns', ret.id));

          toast.success(`Return ${ret.returnId} deleted successfully`);
          setIsPreviewOpen(false);
          setSelectedReturn(null);
          setDeleteConfirmOpen(false);
        } catch (error) {
          toast.error("Failed to delete return record.");
        } finally {
          setDeleteLoading(false);
        }
      }
    });
    setDeleteConfirmOpen(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter and Pagination Logic
  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };


  const processedReturns = (() => {
    let list = returns.filter(r => {
      const matchedReturnsForOrder = offlineReturns.filter(ret => ret.originalOrderId === r.id);
      const returnIdsStr = matchedReturnsForOrder.map(ret => ret.returnId).join(', ');
      return (
        (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (returnIdsStr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.saleOrderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.orderNumber || r.saleOrderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] ?? '';
        let bVal = b[sortConfig.key] ?? '';

        if (sortConfig.key === 'createdAt') {
          if (aVal?.toDate) aVal = aVal.toDate();
          if (bVal?.toDate) bVal = bVal.toDate();
        } else if (sortConfig.key === 'amount') {
          aVal = Number(a.amount || a.total) || 0;
          bVal = Number(b.amount || b.total) || 0;
        } else if (sortConfig.key === 'returnId') {
          const matchedA = offlineReturns.filter(ret => ret.originalOrderId === a.id);
          const matchedB = offlineReturns.filter(ret => ret.originalOrderId === b.id);
          aVal = matchedA.map(ret => ret.returnId).join(', ');
          bVal = matchedB.map(ret => ret.returnId).join(', ');
        } else if (sortConfig.key === 'saleOrderNumber' || sortConfig.key === 'invoiceNumber') {
          // Numeric suffix ordering so SO-00002 > SO-00001
          const numA = parseInt((String(aVal || '')).replace(/\D+/g, '')) || 0;
          const numB = parseInt((String(bVal || '')).replace(/\D+/g, '')) || 0;
          return sortConfig.dir === 'asc' ? numA - numB : numB - numA;
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const totalRecords = processedReturns.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = processedReturns.slice(startIndex, startIndex + rowsPerPage);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading return records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Sales Returns</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage and track product returns from customers</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL RECORDS: {totalRecords}
            </span>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Return ID, Customer or Order #..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"><Calendar size={18} /></button>
          <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"><Filter size={18} /></button>
          <div className="h-6 w-[1px] bg-gray-100 mx-1" />
          <div className="relative" ref={rowsRef}>
            <button
              onClick={() => setRowsOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Rows: <span className="text-[#1BAFAF]">{rowsPerPage}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${rowsOpen ? 'rotate-180' : ''}`} />
            </button>
            {rowsOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {rowOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRowsPerPage(opt);
                      setCurrentPage(1);
                      setRowsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${rowsPerPage === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {opt} rows
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('returnId')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Return ID <SortIcon sortConfig={sortConfig} colKey="returnId" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Customer Name <SortIcon sortConfig={sortConfig} colKey="customerName" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('orderNumber')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Order ID <SortIcon sortConfig={sortConfig} colKey="orderNumber" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Date <SortIcon sortConfig={sortConfig} colKey="createdAt" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('amount')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Amount <SortIcon sortConfig={sortConfig} colKey="amount" />
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Preview</th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {currentItems.length > 0 ? currentItems.map((item, idx) => {
                const matchedReturns = offlineReturns.filter(ret => ret.originalOrderId === item.id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                      {(startIndex + idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {matchedReturns.length > 0 ? (
                          matchedReturns.map(ret => (
                            <span
                              key={ret.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#1BAFAF]/10 text-[#1BAFAF] border border-[#1BAFAF]/20 uppercase tracking-wider"
                            >
                              {ret.returnId}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 font-medium">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-gray-500 font-medium">{item.customerName || 'Customer'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-gray-500">{item.saleOrderNumber || item.orderNumber || '---'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                      {item.saleOrderDate || formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">₹{(item.amount || item.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {matchedReturns.length > 0 && (
                          <div className="relative return-dropdown-container">
                            <button
                              onClick={() => {
                                if (matchedReturns.length === 1) {
                                  setSelectedReturn(matchedReturns[0]);
                                  setIsPreviewOpen(true);
                                } else {
                                  setActiveDropdownOrderId(prev => prev === item.id ? null : item.id);
                                }
                              }}
                              className={`w-8 h-8 inline-flex items-center justify-center rounded-lg transition-all active:scale-90 ${activeDropdownOrderId === item.id
                                ? 'text-[#1BAFAF] bg-[#1BAFAF]/10 border border-[#1BAFAF]/20'
                                : 'text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 border border-transparent'
                                }`}
                              title={matchedReturns.length === 1 ? `View Return Details (${matchedReturns[0].returnId})` : 'Select Return to View'}
                              type="button"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>

                            {/* Dropdown Menu for Multiple Returns */}
                            {matchedReturns.length > 1 && activeDropdownOrderId === item.id && (
                              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-[100] py-1.5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                                <div className="px-3 py-1 border-b border-gray-50 mb-1 text-left">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Return ID</span>
                                </div>
                                {matchedReturns.map(ret => (
                                  <button
                                    key={ret.id}
                                    onClick={() => {
                                      setSelectedReturn(ret);
                                      setIsPreviewOpen(true);
                                      setActiveDropdownOrderId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-600 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-colors flex items-center justify-between"
                                    type="button"
                                  >
                                    <span>{ret.returnId}</span>
                                    <Eye size={12} className="text-gray-400" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {(() => {
                          const hasReturnableItems = (item.items || []).some(orderItem => {
                            const previouslyReturned = matchedReturns.reduce((sum, ret) => {
                              const retItem = (ret.items || []).find(ri =>
                                (ri.productId && orderItem.productId && ri.productId === orderItem.productId) ||
                                (ri.name === orderItem.name)
                              );
                              return sum + (retItem ? Number(retItem.quantity || 0) : 0);
                            }, 0);
                            return Number(orderItem.quantity || 0) - previouslyReturned > 0;
                          });

                          if (hasReturnableItems) {
                            return (
                              <button
                                onClick={() => handleOpenReturnForm(item)}
                                className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all active:scale-90"
                                title="Process Return"
                                type="button"
                              >
                                <Undo2 size={16} strokeWidth={2.5} />
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(item.id, item.customerName)}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          type="button"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <RotateCcw size={32} />
                    </div>
                    <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No returns found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-end px-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-semibold text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* View Preview Modal */}
      {isPreviewOpen && selectedReturn && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsPreviewOpen(false); closeFn(); } }}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
                  {selectedReturn.returnId ? 'Return Details' : 'Order Details'}
                </h2>
                <p className="text-[12px] text-gray-400 font-medium">Record Information</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-[14px]">
              {/* Summary Info */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {selectedReturn.returnId ? 'Return ID' : 'Order ID'}
                  </p>
                  <p className="font-bold text-gray-900 uppercase">
                    {selectedReturn.returnId || selectedReturn.saleOrderNumber || '---'}
                  </p>
                </div>
                {selectedReturn.returnId ? (
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                    <p className="font-bold text-gray-900 uppercase">{selectedReturn.orderNumber || '---'}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${(selectedReturn.status || 'Confirmed').toLowerCase() === 'paid' || (selectedReturn.status || 'Confirmed').toLowerCase() === 'confirmed' ? 'text-[#1BAFAF] bg-[#eaf6f6]' :
                      'text-amber-500 bg-amber-50'
                      }`}>
                      {selectedReturn.status || 'Confirmed'}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</p>
                  <p className="font-bold text-gray-700">{selectedReturn.customerName || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="font-bold text-gray-700">
                    {selectedReturn.returnDate || selectedReturn.saleOrderDate || formatDate(selectedReturn.createdAt)}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Items Breakdown</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-4 py-3">Item Details</th>
                        <th className="px-4 py-3 text-center w-20">Qty</th>
                        <th className="px-4 py-3 text-right w-24">Rate</th>
                        <th className="px-4 py-3 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedReturn.items && selectedReturn.items.length > 0 ? (
                        selectedReturn.items.map((item, index) => (
                          <tr key={index} className="text-gray-700 font-medium">
                            <td className="px-4 py-3">{item.name || '---'}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-4 py-3 text-right">₹{(item.rate || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3 max-w-sm ml-auto">
                {selectedReturn.returnId ? (
                  <>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Actual Price</span>
                      <span className="text-gray-900 font-bold">₹{(selectedReturn.actualPrice || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500 font-semibold bg-red-50/50 p-3 rounded-2xl border border-red-100/50">
                      <span>Return Amount</span>
                      <span>- ₹{(selectedReturn.returnAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-3">
                      <span className="text-gray-900">Total ( ₹ )</span>
                      <span className="text-[#1BAFAF]">₹{(selectedReturn.total || 0).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Sub Total</span>
                      <span className="text-gray-900">₹{(selectedReturn.subTotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Tax (GST)</span>
                      <span className="text-gray-900">{selectedReturn.tax || 0}%</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Adjustment</span>
                      <span className="text-gray-900">₹{(selectedReturn.adjustment || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-3">
                      <span className="text-gray-900">Total ( ₹ )</span>
                      <span className="text-[#1BAFAF]">₹{(selectedReturn.total || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-between bg-gray-50 flex-shrink-0">
              {selectedReturn.returnId ? (
                <button
                  onClick={() => handleDeleteReturn(selectedReturn)}
                  className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-[13px] font-bold hover:bg-red-100 transition-all flex items-center gap-1.5 active:scale-95"
                  type="button"
                >
                  <Trash2 size={14} />
                  Delete Return
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-8 py-2.5 bg-[#1BAFAF] text-white rounded-xl text-[13px] font-bold hover:bg-[#158e8e] transition-all"
                type="button"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Form Modal */}
      {isReturnFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsReturnFormOpen(false); closeFn(); } }}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsReturnFormOpen(false)}
          />
          <form
            onSubmit={handleReturnSubmit}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Create Return</h2>
                <p className="text-[12px] text-gray-400 font-medium">Process returned items from customer</p>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnFormOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-[14px]">

              {/* Row 1: Return ID & Return Date */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Return ID *
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
                      value={returnFormData.returnId}
                      onChange={(e) => setReturnFormData({ ...returnFormData, returnId: e.target.value })}
                      readOnly={returnSettings.mode === 'auto'}
                      className={`w-full bg-gray-50 border border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-900 rounded-2xl outline-none ${returnSettings.mode === 'auto' ? 'cursor-not-allowed' : 'focus:bg-white focus:border-[#1BAFAF]/20'}`}
                    />
                  </div>

                  {/* Return Number Settings Popup */}
                  {isSettingsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white border border-gray-100 rounded-3xl shadow-2xl z-[120] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-6 space-y-6">
                        <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                          Your return numbers are set on auto-generate mode to save your time. Are you sure about changing this setting?
                        </p>

                        <div className="space-y-4 text-left">
                          {/* Auto Generate Option */}
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="pt-0.5">
                              <input
                                type="radio"
                                name="return_mode"
                                checked={returnSettings.mode === 'auto'}
                                onChange={() => setReturnSettings({ ...returnSettings, mode: 'auto' })}
                                className="hidden"
                              />
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${returnSettings.mode === 'auto' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                                {returnSettings.mode === 'auto' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[13px] font-bold text-gray-700">Continue auto-generating return numbers</span>
                                <Info size={12} className="text-gray-300" />
                              </div>

                              {returnSettings.mode === 'auto' && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Prefix</span>
                                    <input
                                      type="text"
                                      value={returnSettings.prefix}
                                      onChange={(e) => setReturnSettings({ ...returnSettings, prefix: e.target.value })}
                                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-medium focus:bg-white outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Next Number</span>
                                    <input
                                      type="text"
                                      value={returnSettings.nextNumber}
                                      onChange={(e) => setReturnSettings({ ...returnSettings, nextNumber: e.target.value })}
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
                              name="return_mode"
                              checked={returnSettings.mode === 'manual'}
                              onChange={() => setReturnSettings({ ...returnSettings, mode: 'manual' })}
                              className="hidden"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${returnSettings.mode === 'manual' ? 'border-[#1BAFAF]' : 'border-gray-200'}`}>
                              {returnSettings.mode === 'manual' && <div className="w-2.5 h-2.5 rounded-full bg-[#1BAFAF]" />}
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">Enter return numbers manually</span>
                          </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleSettingsSave}
                            className="flex-1 bg-[#1BAFAF] text-white py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#158e8e] transition-all"
                          >
                            Save
                          </button>
                          <button
                            type="button"
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
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Return Date</label>
                  <input
                    type="date"
                    value={returnFormData.returnDate}
                    onChange={(e) => setReturnFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full bg-gray-50 border border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-700 rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Customer Name & Customer Mobile No */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <input
                    type="text"
                    value={returnFormData.customerName}
                    readOnly
                    className="w-full bg-gray-50 border border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-900 rounded-2xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Customer Mobile No</label>
                  <input
                    type="text"
                    value={returnFormData.customerMobile}
                    readOnly
                    className="w-full bg-gray-50 border border-transparent py-3.5 px-4 text-[14px] font-bold text-gray-700 rounded-2xl outline-none"
                  />
                </div>
              </div>

              {/* Item Table: Name, Original Qty, Return Qty, Reason */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Item Table</label>
                <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-4 whitespace-nowrap">Item Details</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap w-28">Original Qty</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap w-32">Return Qty</th>
                        <th className="px-6 py-4 whitespace-nowrap w-60">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {returnFormData.items.map((item, index) => (
                        <tr key={index} className="text-gray-700 font-medium hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900">{item.name || '---'}</p>
                              <p className="text-[11px] text-[#1BAFAF] font-semibold">₹{(item.rate || 0).toFixed(2)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400 font-bold">{item.quantity || 0}</td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.returnQty}
                              onChange={(e) => handleItemReturnQtyChange(index, e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#1BAFAF]/20 py-2.5 px-3 text-[13px] font-bold text-center text-gray-900 rounded-xl outline-none transition-all"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder="Reason for return"
                              value={item.reason}
                              onChange={(e) => handleItemReasonChange(index, e.target.value)}
                              className="w-full bg-gray-50 border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#1BAFAF]/20 py-2.5 px-4 text-[13px] font-medium text-gray-700 rounded-xl outline-none transition-all"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3 max-w-sm ml-auto text-[14px]">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Actual Price</span>
                  <span className="text-gray-900 font-bold">₹{returnFormData.actualPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-500 font-semibold bg-red-50/50 p-3 rounded-2xl border border-red-100/50">
                  <span>Return Product Price</span>
                  <span>- ₹{returnFormData.returnAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-4">
                  <span className="text-gray-900">Total ( ₹ )</span>
                  <span className="text-[#1BAFAF] text-[18px]">₹{returnFormData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsReturnFormOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-[#1BAFAF] text-white rounded-xl text-[13px] font-bold hover:bg-[#158e8e] transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-[#1BAFAF]/20"
              >
                Submit Return
              </button>
            </div>
          </form>
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={deleteConfirmData.onConfirm}
        title={deleteConfirmData.title}
        message={deleteConfirmData.message}
        itemName={deleteConfirmData.itemName}
        loading={deleteLoading}
      />
    </div>
  );
}

const SortIcon = ({ colKey, sortConfig }) => {
  const isActive = sortConfig.key === colKey;
  const isDesc = isActive && sortConfig.dir === 'desc';
  return (
    <ChevronDown
      size={13}
      strokeWidth={3}
      className={`transition-all duration-200 ${isActive ? 'text-[#1BAFAF]' : 'text-gray-300'} ${isDesc ? 'rotate-180' : 'rotate-0'}`}
    />
  );
}
