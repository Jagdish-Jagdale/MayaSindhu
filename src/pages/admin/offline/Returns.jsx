import React, { useState, useEffect } from 'react';
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
  Trash2
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

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, 'offlineReturns'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReturns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching returns:", error);
      toast.error("Failed to load return records.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this return record?")) return;
    try {
      await deleteDoc(doc(db, 'offlineReturns', id));
      toast.success("Return record deleted successfully");
    } catch (error) {
      console.error("Error deleting return:", error);
      toast.error("Failed to delete record");
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

  // Filter and Pagination Logic
  const filteredReturns = returns.filter(r => 
    (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.returnId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReturns.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Sales Returns</h1>
          <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage and track product returns from customers</p>
        </div>
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
            <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-[#1BAFAF] transition-all">
               <Download size={16} />
               Export
            </button>
         </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Sr No</th>
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Return ID</th>
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Customer</th>
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Order #</th>
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Date</th>
                     <th className="px-8 py-5 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Amount</th>
                     <th className="px-8 py-5 text-right px-10 text-[11px] font-black text-[#1BAFAF] uppercase tracking-[0.2em]">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {currentItems.length > 0 ? currentItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                       <td className="px-8 py-5">
                          <span className="text-[12px] font-bold text-gray-400">
                             {(startIndex + idx + 1).toString().padStart(2, '0')}
                          </span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-[12px] font-black text-gray-700 uppercase tracking-wider">{item.returnId || `#RET-${item.id.slice(-6)}`}</span>
                       </td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <User size={14} />
                             </div>
                             <span className="text-[14px] font-bold text-gray-900">{item.customerName || 'Customer'}</span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-[13px] font-semibold text-gray-500">{item.orderNumber || '---'}</td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-400">
                             <Clock size={12} />
                             <span className="text-[12px] font-medium">
                                {formatDate(item.createdAt)}
                             </span>
                          </div>
                       </td>
                       <td className="px-8 py-5 text-[14px] font-black text-gray-900">₹{(item.amount || 0).toFixed(2)}</td>
                       <td className="px-8 py-5 text-right pr-10">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-all active:scale-90"
                          >
                             <Trash2 size={16} />
                          </button>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="7" className="py-20 text-center">
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
         {filteredReturns.length > 0 && (
           <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                 Page {currentPage} of {totalPages || 1}
              </span>
              <div className="flex items-center gap-3">
                 <button 
                   onClick={handlePrevPage}
                   disabled={currentPage === 1}
                   className="flex items-center gap-1 px-4 py-2 text-[12px] font-bold text-gray-500 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                 >
                    <ChevronLeft size={16} />
                    Prev
                 </button>
                 <button 
                   onClick={handleNextPage}
                   disabled={currentPage === totalPages || totalPages === 0}
                   className="flex items-center gap-1 px-4 py-2 text-[12px] font-bold text-white bg-[#1BAFAF] rounded-xl hover:bg-[#158e8e] disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-[#1BAFAF]/10"
                 >
                    Next
                    <ChevronRight size={16} />
                 </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
