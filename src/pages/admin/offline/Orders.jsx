/**
 * File: Orders.jsx
 * Description: Offline POS store orders database registry with search filters, date ranges, and invoice download configurations.
 * Work Done: Modularized local print logic (~280 lines of duplicate code) to route invoice printing through the unified global invoiceHelper utility.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  Loader2,
  Calendar,
  Filter,
  Download,
  User,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import OfflineOrderModal from '../../../components/admin/offline/OfflineOrderModal';
import { handleDownloadInvoice as printInvoice } from '../../../utils/invoiceHelper';

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'saleOrderNumber', dir: 'asc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef(null);

  const rowOptions = [5, 10, 20, 50];

  useEffect(() => {
    const handler = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [storeCustomers, setStoreCustomers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'storeCustomers'), (snapshot) => {
      setStoreCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'storeOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load order data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? numToWords(n % 10000000) : '');
    };

    const totalStr = Math.round(num).toString();
    const parsedNum = parseInt(totalStr, 10);
    if (parsedNum === 0) return 'Zero';
    return 'Indian Rupee ' + numToWords(parsedNum).trim() + ' Only';
  };

  const formatA4Date = (val) => {
    if (!val) return '---';
    let date;
    if (val.toDate) {
      date = val.toDate();
    } else {
      if (typeof val === 'string' && val.includes('/')) {
        const [d, m, y] = val.split('/');
        date = new Date(`${y}-${m}-${d}`);
      } else {
        date = new Date(val);
      }
    }
    if (isNaN(date.getTime())) return val;
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDownloadInvoice = (invoice) => {
    const customerObj = storeCustomers.find(c => c.id === invoice.customerId || c.fullName === invoice.customerName) || {};
    printInvoice(invoice, true, customerObj);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading order records...</p>
      </div>
    );
  }

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };


  const parseDateToMs = (dateStr) => {
    if (!dateStr) return 0;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
    }
    return 0;
  };

  const parseInputDateToMs = (dateStr, isEndOfDay) => {
    if (!dateStr) return 0;
    const timeStr = isEndOfDay ? 'T23:59:59' : 'T00:00:00';
    return new Date(`${dateStr}${timeStr}`).getTime();
  };

  const filteredOrders = (() => {
    let list = orders.filter(o => {
      const matchesSearch = (o.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.orderNumber || o.saleOrderNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (startDate || endDate) {
        const orderMs = o.saleOrderDate 
          ? parseDateToMs(o.saleOrderDate) 
          : (o.createdAt?.toDate ? o.createdAt.toDate().getTime() : new Date(o.createdAt).getTime());

        const startMs = startDate ? parseInputDateToMs(startDate, false) : 0;
        const endMs = endDate ? parseInputDateToMs(endDate, true) : Infinity;

        matchesDate = orderMs >= startMs && orderMs <= endMs;
      }

      return matchesSearch && matchesDate;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (sortConfig.key === 'createdAt') {
          if (aVal?.toDate) aVal = aVal.toDate();
          if (bVal?.toDate) bVal = bVal.toDate();
        } else if (sortConfig.key === 'total') {
          aVal = Number(a.pricing?.grandTotal || a.total || 0);
          bVal = Number(b.pricing?.grandTotal || b.total || 0);
        } else if (sortConfig.key === 'saleOrderNumber') {
          aVal = a.orderNumber || a.saleOrderNumber || '';
          bVal = b.orderNumber || b.saleOrderNumber || '';
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  // Pagination logic
  const totalRecords = filteredOrders.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Sales Orders</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage sales orders from customers</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
               TOTAL RECORDS: {totalRecords}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#1BAFAF] text-white rounded-2xl text-[13px] font-bold shadow-lg shadow-[#1BAFAF]/20 hover:bg-[#158e8e] transition-all active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              New Sales Order
            </button>
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
               placeholder="Search by SO number or customer..."
               value={searchTerm}
               onChange={(e) => {
                 setSearchTerm(e.target.value);
                 setCurrentPage(1); // Reset to first page on search
               }}
               className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
            />
         </div>
         <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-gray-900 relative">
               <Calendar size={16} className={(startDate || endDate) ? 'text-[#1BAFAF]' : 'text-gray-400'} />
               <div className="flex items-center gap-1">
                 <input 
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-500 focus:text-[#1BAFAF] cursor-pointer w-28"
                 />
                 <span className="text-gray-300">-</span>
                 <input 
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-500 focus:text-[#1BAFAF] cursor-pointer w-28"
                 />
               </div>
               {(startDate || endDate) && (
                  <button 
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setCurrentPage(1);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-900"
                  >
                    <X size={12} />
                  </button>
               )}
            </div>

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
                        setCurrentPage(1); // Reset to page 1 when changing row count
                        setRowsOpen(false); 
                      }}
                      className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                        rowsPerPage === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
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

      {/* Orders Grid/Table */}
      <div className="space-y-3">
         <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="border-b border-gray-50 bg-white">
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('saleOrderNumber')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Order ID <SortIcon sortConfig={sortConfig} colKey="saleOrderNumber" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('customerName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Customer <SortIcon sortConfig={sortConfig} colKey="customerName" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Date <SortIcon sortConfig={sortConfig} colKey="createdAt" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('total')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Amount <SortIcon sortConfig={sortConfig} colKey="total" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Download</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50/50">
                  {currentOrders.length > 0 ? currentOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsPreviewOpen(true);
                      }}
                      className="hover:bg-gray-50 group transition-colors cursor-pointer"
                    >
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                          {String(startIndex + index + 1).padStart(2, '0')}
                       </td>
                       <td className="px-6 py-4 min-w-[150px]">
                          <span className="text-[14px] font-bold text-gray-900 uppercase">
                            {order.orderNumber || order.saleOrderNumber || `#${order.id.slice(-6)}`}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[14px] text-gray-500 font-medium">{order.customerName || 'Customer'}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                          {order.createdAt ? formatDate(order.createdAt) : (order.saleOrderDate || '---')}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[14px] text-gray-500 font-medium">₹{(order.pricing?.grandTotal || order.total || 0).toFixed(2)}</span>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadInvoice(order);
                              }}
                              className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all active:scale-90"
                              title="Download Invoice"
                            >
                              <Download size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="7" className="py-20 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                             <ShoppingBag size={32} />
                          </div>
                          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No Sales Orders found</p>
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
                 onClick={handlePrevPage}
                 disabled={currentPage === 1}
                 className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
               >
                 <ChevronLeft size={16} strokeWidth={2.5} />
               </button>
               <span className="text-[12px] font-semibold text-gray-400">
                  Page {currentPage} of {totalPages}
               </span>
               <button 
                 onClick={handleNextPage}
                 disabled={currentPage === totalPages}
                 className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
               >
                 <ChevronRight size={16} strokeWidth={2.5} />
               </button>
            </div>
         </div>
      </div>
      
      <OfflineOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* View Preview Modal */}
      {isPreviewOpen && selectedOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsPreviewOpen(false); closeFn(); } }}>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Sales Order Details</h2>
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
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order ID</p>
                  <p className="font-bold text-gray-900 uppercase">{selectedOrder.orderNumber || selectedOrder.invoiceNumber || selectedOrder.saleOrderNumber || '---'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="font-bold text-gray-700">{selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : (selectedOrder.invoiceDate || selectedOrder.saleOrderDate || '---')}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</p>
                  <p className="font-bold text-gray-700">{selectedOrder.customerName || '---'}</p>
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
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, index) => (
                          <tr key={index} className="text-gray-700 font-medium">
                            <td className="px-4 py-3">{item.productName || item.name || '---'}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-4 py-3 text-right">₹{(item.price || item.rate || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{(item.subtotal || item.amount || 0).toFixed(2)}</td>
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
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sub Total</span>
                  <span className="text-gray-900">₹{(selectedOrder.pricing?.subtotal || selectedOrder.subTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tax (GST)</span>
                  <span className="text-gray-900">{selectedOrder.pricing?.tax || selectedOrder.tax || 0}%</span>
                </div>
                <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-3">
                  <span className="text-gray-900">Total ( ₹ )</span>
                  <span className="text-[#1BAFAF]">₹{(selectedOrder.pricing?.grandTotal || selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end bg-gray-50 flex-shrink-0">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-8 py-2.5 bg-[#1BAFAF] text-white rounded-xl text-[13px] font-bold hover:bg-[#158e8e] transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

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
