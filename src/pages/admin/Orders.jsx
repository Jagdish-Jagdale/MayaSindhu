/**
 * File: Orders.jsx
 * Description: Online e-commerce platform orders list registry, sorting filters, status modifiers, and invoice triggers.
 * Work Done: Refactored local handleDownloadInvoice code to import and use the global print utility, reducing code bloat by ~320 lines.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  Calendar,
  Layers,
  SearchX,
  ChevronDown,
  XCircle,
  X,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  User,
  ShoppingBag as BagIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  TrendingUp,
  Download
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';
import { handleDownloadInvoice } from '../../utils/invoiceHelper';
import useEscapeKey from '../../hooks/useEscapeKey';

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const parsed = Number(val.toString().replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const formatIndianCurrency = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

const STATUS_CONFIG = {
  'Pending': { color: 'text-amber-500 bg-amber-50', icon: Clock },
  'Confirmed': { color: 'text-blue-500 bg-blue-50', icon: PackageCheck },
  'Shipped': { color: 'text-indigo-500 bg-indigo-50', icon: Truck },
  'Delivered': { color: 'text-[#1BAFAF] bg-[#eaf6f6]', icon: CheckCircle2 },
  'Cancelled': { color: 'text-red-500 bg-red-50', icon: XCircle },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const direction = 0;



  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortField !== field) {
      return (
        <ChevronDown size={12} className="text-gray-300 ml-1 inline-block" strokeWidth={2.5} />
      );
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    ) : (
      <ChevronDown size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate();
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = orderDate >= startDate && orderDate <= endDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedOrders = (() => {
    let list = [...filteredOrders];
    if (sortField) {
      list.sort((a, b) => {
        let valA, valB;
        if (sortField === 'orderId') {
          valA = a.orderId || '';
          valB = b.orderId || '';
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'customerName') {
          valA = a.customerName || '';
          valB = b.customerName || '';
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'productName') {
          valA = a.productName || (a.items?.[0]?.name) || '';
          valB = b.productName || (b.items?.[0]?.name) || '';
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortField === 'quantity') {
          valA = a.quantity || 1;
          valB = b.quantity || 1;
        } else if (sortField === 'total') {
          valA = a.total || 0;
          valB = b.total || 0;
        } else if (sortField === 'createdAt') {
          valA = a.createdAt?.seconds || 0;
          valB = b.createdAt?.seconds || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const updateStatus = async (orderId, orderNo, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#1BAFAF] rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <p className="text-[13px] font-semibold text-gray-800">
              Order {orderNo} status successfully updated to {newStatus}
            </p>
          </div>
        ),
        {
          duration: 4000,
          style: {
            background: '#fff',
            borderRadius: '20px',
            padding: '12px 20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '400px',
            border: '1px solid rgba(0,0,0,0.05)'
          },
          icon: null
        }
      );
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const OrderStatusDropdown = ({ order, currentStatus, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openAbove: false });
    const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['Pending'];

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          const portalEl = document.getElementById(`portal-${order.id}`);
          if (portalEl && portalEl.contains(event.target)) return;
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [order.id]);

    const updateCoords = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openAbove = spaceBelow < 200;
        setCoords({
          top: openAbove ? rect.top : rect.bottom,
          left: rect.left,
          width: rect.width,
          openAbove
        });
      }
    };

    useEffect(() => {
      if (isOpen) {
        updateCoords();
        window.addEventListener('resize', updateCoords);
        const scrollableParents = [];
        let parent = buttonRef.current;
        while (parent) {
          scrollableParents.push(parent);
          parent = parent.parentElement;
        }
        scrollableParents.forEach(p => p.addEventListener('scroll', updateCoords));
        
        return () => {
          window.removeEventListener('resize', updateCoords);
          scrollableParents.forEach(p => p.removeEventListener('scroll', updateCoords));
        };
      }
    }, [isOpen]);

    return (
      <div className="relative w-fit" ref={containerRef}>
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest pl-8 pr-6 py-1.5 rounded-xl border transition-all shadow-sm outline-none ${config.color} border-current/10 hover:shadow-md min-w-[105px] relative`}
        >
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-80">
            <config.icon size={11} strokeWidth={2.5} className={config.color.split(' ')[0]} />
          </div>
          <span>{currentStatus || 'Pending'}</span>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40">
            <ChevronDown size={8} strokeWidth={3} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                id={`portal-${order.id}`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                style={{
                  position: 'fixed',
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  transform: coords.openAbove ? 'translateY(-100%) translateY(-5px)' : 'translateY(5px)',
                  fontFamily: "'Inter', -apple-system, sans-serif"
                }}
                className="z-[200] min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 overflow-hidden"
              >
                {Object.keys(STATUS_CONFIG).map((status) => {
                  const sCfg = STATUS_CONFIG[status];
                  const Icon = sCfg.icon;
                  return (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate(order.id, order.orderId, status);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors text-left
                        ${currentStatus === status ? 'bg-[#1BAFAF] text-white shadow-sm' : 'text-gray-600 hover:bg-[#1BAFAF]/10 hover:text-[#1BAFAF]'}
                      `}
                    >
                      <Icon size={10} strokeWidth={2.5} />
                      {status}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    );
  };

  const rowVariants = {
    initial: ({ direction }) => ({ opacity: 0, x: direction * 30 }),
    animate: ({ index }) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: index * 0.03,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: ({ direction }) => ({ 
      opacity: 0, 
      x: direction * -30,
      transition: { duration: 0.2 }
    })
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage and monitor all customer orders in real-time</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Revenue', value: formatIndianCurrency(orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + parseCurrency(o.total) : sum, 0)), icon: TrendingUp, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
          { name: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
          { name: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
          { name: 'Delivered Orders', value: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                {stat.name}
              </p>
              <p className="text-xl font-black text-gray-900 tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md p-2 flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative group w-full xl:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2.5 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#1BAFAF]/30 transition-all font-medium"
          />
        </div>

        {/* Filters inline */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent text-[12px] font-medium px-2 py-1.5 rounded-lg border-none outline-none transition-all cursor-pointer text-gray-600 focus:text-gray-900"
            />
            <span className="text-gray-300">-</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent text-[12px] font-medium px-2 py-1.5 rounded-lg border-none outline-none transition-all cursor-pointer text-gray-600 focus:text-gray-900"
            />
          </div>

          {/* Status Dropdown */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              ...Object.keys(STATUS_CONFIG).map(s => ({ value: s, label: s }))
            ]}
            className="w-[140px]"
            minimal={true}
          />

          {/* Clear Filters (only show if active) */}
          {(dateRange.start || dateRange.end || statusFilter !== 'All') && (
            <button 
              onClick={() => {
                setDateRange({ start: '', end: '' });
                setStatusFilter('All');
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Clear Filters"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

          {/* Rows */}
          <CustomSelect
            value={rowsPerPage}
            onChange={(val) => setRowsPerPage(Number(val))}
            options={[
              { value: 5, label: '5 rows' },
              { value: 10, label: '10 rows' },
              { value: 20, label: '20 rows' },
              { value: 50, label: '50 rows' }
            ]}
            className="w-28"
            minimal={true}
            valuePrefix="Rows:"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-5 text-center text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('orderId')}>
                  <div className="flex items-center justify-center gap-1">
                    Order ID
                    <SortIndicator field="orderId" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center gap-1">
                    Customer Name
                    <SortIndicator field="customerName" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('productName')}>
                  <div className="flex items-center gap-1">
                    Product Name
                    <SortIndicator field="productName" />
                  </div>
                </th>
                <th className="px-6 py-5 text-center text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-center gap-1">
                    Quantity
                    <SortIndicator field="quantity" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('total')}>
                  <div className="flex items-center gap-1">
                    Total
                    <SortIndicator field="total" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Date
                    <SortIndicator field="createdAt" />
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <div className="flex items-center gap-1">
                    Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              <AnimatePresence custom={direction}>
                {sortedOrders.length > 0 ? (
                  sortedOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((order, index) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
                    return (
                      <motion.tr 
                        custom={{ direction, index }}
                        variants={rowVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        key={order.id} 
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewModalOpen(true);
                        }}
                        className="hover:bg-gray-50/80 group transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-bold text-gray-300">{((currentPage - 1) * rowsPerPage + index + 1).toString().padStart(2, '0')}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <span className="px-3 py-1 bg-[#1BAFAF]/5 text-[#1BAFAF] text-[11px] font-bold rounded-full border border-[#1BAFAF]/10 uppercase tracking-wider group-hover:bg-[#1BAFAF]/10 transition-colors">
                            {order.orderId?.replace('#', '')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center text-[10px] font-black shrink-0">
                              {order.customerName?.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <span className="text-[13px] font-semibold text-gray-800">{order.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[13px] text-gray-600 font-medium line-clamp-1">
                            {order.productName || (order.items?.[0]?.name) || (order.quantity > 1 ? 'Multiple Items' : 'Handmade Creation')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-[13px] text-gray-800 font-bold">{order.quantity || 1}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-[13px] font-bold text-gray-900">₹{order.total}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                           <span className="text-[13px] text-gray-500 font-medium">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <OrderStatusDropdown 
                              order={order} 
                              currentStatus={order.status} 
                              onUpdate={updateStatus} 
                            />
                            {order.status === 'Confirmed' && (
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
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <SearchX size={40} className="text-gray-200" />
                        <p className="text-[14px] font-semibold text-gray-400">No orders found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
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
            Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage) || 1}
          </span>
          <button 
            onClick={() => currentPage < Math.ceil(filteredOrders.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(filteredOrders.length / rowsPerPage)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#1BAFAF]/20 border-t-[#1BAFAF] rounded-full animate-spin" />
        </div>
      )}

      <OrderViewModal 
        order={selectedOrder} 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        formatDate={formatDate}
      />
    </div>
  );
}

const OrderViewModal = ({ order, isOpen, onClose, formatDate }) => {
  useEscapeKey(onClose, isOpen);

  if (!order) return null;
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsOpen(false); closeFn(); } }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-gray-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center">
                  <BagIcon size={24} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 leading-none">Order Details</h2>
                    <span className="text-gray-200 font-light text-lg">|</span>
                    <span className="px-3 py-1 bg-gray-50 text-[#1BAFAF] text-[10px] font-bold rounded-full border border-gray-100 uppercase tracking-widest">
                      {order.orderId?.replace('#', '')}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    Order Placed: {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all hover:bg-gray-100 active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="p-6 bg-white border border-gray-100 rounded-[28px] space-y-5">
                  <h3 className="text-sm font-bold text-[#1BAFAF] uppercase tracking-widest">Customer Info</h3>
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 text-gray-600">
                      <User size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{order.customerName || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{order.email || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone size={16} className="text-gray-300" />
                      <span className="text-sm font-medium">{order.shippingAddress?.phone || order.phone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#1BAFAF] uppercase tracking-widest">Shipping Address</h3>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin size={16} className="text-gray-300 mt-1 shrink-0" />
                    <span className="text-sm font-medium leading-relaxed">
                      {order.shippingAddress ? (
                        <>
                          {order.shippingAddress.address && <div>{order.shippingAddress.address}</div>}
                          {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.zip) && (
                            <div>
                              {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </>
                      ) : order.address || 'No address provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white border border-gray-100 rounded-[28px] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1BAFAF] uppercase tracking-widest">Order Item</h3>
                  <span className="text-xs font-bold text-gray-400">1 Item</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100/30 border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Sr. No</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">Quantity</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest w-32">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-6 py-5">
                          <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[11px] font-black text-[#1BAFAF] shadow-sm">01</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[13px] font-bold text-gray-900 tracking-tight leading-tight">
                            {order.productName || (order.items?.[0]?.name) || 'Handmade Creation'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-[12px] font-black text-gray-500">{order.quantity || 1}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-[13px] font-black text-gray-900">₹{order.total}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Product Count</span>
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{order.quantity || 1} Item(s)</span>
                </div>
                
                <div className="flex justify-between items-center p-5 rounded-[22px] bg-[#1BAFAF]/5 border border-[#1BAFAF]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#1BAFAF]">Final Amount Paid</span>
                  </div>
                  <span className="text-2xl font-black text-[#1BAFAF] tracking-tighter">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <Calendar size={14} />
                Ordered on {formatDate(order.createdAt)}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-[#1BAFAF]/10"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
