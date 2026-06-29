/**
 * File: Vendors.jsx
 * Description: Admin offline storefront manager page rendering metrics overview tables, orders trackers, and vendor registers.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Loader2,
  Filter,
  Download,
  Mail,
  Phone,
  Trash2,
  Edit2,
  MoreVertical,
  ArrowUpRight,
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
import VendorModal from '../../../components/admin/offline/VendorModal';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

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
    const q = query(collection(db, 'storeVendors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load vendor data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await deleteDoc(doc(db, 'storeVendors', id));
      toast.success("Vendor removed successfully");
    } catch (error) {
      toast.error("Failed to delete vendor");
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };


  const processedVendors = (() => {
    let list = vendors.filter(v => 
      (v.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        if (sortConfig.key === 'createdAt') {
          if (aVal?.toDate) aVal = aVal.toDate();
          if (bVal?.toDate) bVal = bVal.toDate();
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const totalRecords = processedVendors.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentVendors = processedVendors.slice(startIndex, startIndex + rowsPerPage);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading vendor records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Vendors</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Monitor and manage all supplier and vendor accounts</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
               TOTAL RECORDS: {totalRecords}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <button 
              onClick={() => {
                setSelectedVendor(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Vendor
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
               placeholder="Search by name, company or email..."
               value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
            />
         </div>
         <div className="flex items-center gap-2">
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

      {/* Vendors Table */}
      <div className="space-y-3">
         <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-50 bg-white">
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('vendorName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Full Name <SortIcon sortConfig={sortConfig} colKey="vendorName" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('companyName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Company <SortIcon sortConfig={sortConfig} colKey="companyName" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Email Address <SortIcon sortConfig={sortConfig} colKey="email" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                       <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                         Phone <SortIcon sortConfig={sortConfig} colKey="phone" />
                       </button>
                     </th>
                     <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50/50">
                  {currentVendors.length > 0 ? currentVendors.map((vendor, idx) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 group transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                          {(startIndex + idx + 1).toString().padStart(2, '0')}
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[14px] font-bold text-gray-900">{vendor.vendorName}</span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[14px] text-gray-500 font-medium">{vendor.companyName || '---'}</span>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[14px] text-gray-500 font-medium">{vendor.email}</span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">{vendor.phone || '---'}</td>
                       <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button 
                               onClick={() => handleEdit(vendor)}
                               className="w-8 h-8 flex items-center justify-center text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all"
                             >
                                <Edit2 size={14} strokeWidth={2.5} />
                             </button>
                             <button 
                               onClick={() => handleDelete(vendor.id)}
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
                             <Building2 size={32} />
                          </div>
                          <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No Vendors found</p>
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
      

      <VendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
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
