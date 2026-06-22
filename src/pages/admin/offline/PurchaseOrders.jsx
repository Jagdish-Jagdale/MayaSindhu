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
  ArrowUpRight,
  MoreVertical,
  X,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight
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
import StoreOrderModal from '../../../components/admin/offline/StoreOrderModal';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination & Sort state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });

  const rowOptions = [5, 10, 20, 50];

  useEffect(() => {
    const handler = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // Note: We use 'purchaseOrders' as requested
    const q = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load order data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, 'purchaseOrders', id));
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const SortIcon = ({ colKey }) => {
    const isActive = sortConfig.key === colKey;
    const isDesc = isActive && sortConfig.dir === 'desc';
    return (
      <ChevronDown
        size={13}
        strokeWidth={3}
        className={`transition-all duration-200 ${isActive ? 'text-[#1BAFAF]' : 'text-gray-300'} ${isDesc ? 'rotate-180' : 'rotate-0'}`}
      />
    );
  };

  const processedOrders = (() => {
    let list = orders.filter(o => 
      (o.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.purchaseOrderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (sortConfig.key === 'createdAt') {
          if (aVal?.toDate) aVal = aVal.toDate();
          if (bVal?.toDate) bVal = bVal.toDate();
        } else if (sortConfig.key === 'total') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const totalRecords = processedOrders.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentOrders = processedOrders.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Purchase Orders</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage purchase orders from vendors</p>
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
              New Purchase Order
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
               placeholder="Search by PO number or vendor..."
               value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
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
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-50 bg-white">
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('purchaseOrderNumber')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Record ID <SortIcon colKey="purchaseOrderNumber" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('vendorName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Vendor <SortIcon colKey="vendorName" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Date <SortIcon colKey="createdAt" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('total')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Amount <SortIcon colKey="total" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Status <SortIcon colKey="status" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50/50">
                  {currentOrders.length > 0 ? currentOrders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-gray-50 group transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                          {(startIndex + idx + 1).toString().padStart(2, '0')}
                       </td>
                       <td className="px-6 py-4 min-w-[150px]">
                          <span className="text-[14px] font-bold text-gray-900 uppercase">
                            {order.purchaseOrderNumber || `#${order.id.slice(-6)}`}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[14px] text-gray-500 font-medium">{order.vendorName || 'Vendor'}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                          {order.purchaseOrderDate || formatDate(order.createdAt)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[14px] text-gray-500 font-medium">₹{(order.total || 0).toFixed(2)}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                            (order.status || 'Confirmed').toLowerCase() === 'confirmed' ? 'text-[#1BAFAF] bg-[#eaf6f6]' :
                            'text-amber-500 bg-amber-50'
                          }`}>
                            {order.status || 'Confirmed'}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => handleDelete(order.id)}
                             className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                           >
                             <Trash2 size={14} strokeWidth={2.5} />
                           </button>
                         </div>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="6" className="py-20 text-center">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                             <ShoppingBag size={32} />
                          </div>
                          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No Purchase Orders found</p>
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
      

      <StoreOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
