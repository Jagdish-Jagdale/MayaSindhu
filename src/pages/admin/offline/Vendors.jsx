import React, { useState, useEffect } from 'react';
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
  ArrowUpRight
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

  useEffect(() => {
    const q = query(collection(db, 'storeVendors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vendors:", error);
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
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const filteredVendors = vendors.filter(v => 
    (v.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Vendors</h1>
          <p className="text-[12px] text-gray-400 font-medium tracking-tight">Monitor and manage all supplier and vendor accounts</p>
        </div>
        <button 
          onClick={() => {
            setSelectedVendor(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95"
        >
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
            <input 
               type="text" 
               placeholder="Search by name, company or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"><Filter size={18} /></button>
            <div className="h-6 w-[1px] bg-gray-100 mx-1" />
            <button className="flex items-center gap-2 px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-[#1BAFAF] transition-all">
               <Download size={16} />
               Export
            </button>
         </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sr No</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Company</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone</th>
                     <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                     <th className="px-8 py-5 text-right px-10">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredVendors.length > 0 ? filteredVendors.map((vendor, idx) => (
                    <tr key={vendor.id} className="hover:bg-gray-50/50 transition-all group">
                       <td className="px-8 py-5">
                          <span className="text-[12px] font-black text-gray-300 group-hover:text-gray-500 transition-colors uppercase">{(idx + 1).toString().padStart(2, '0')}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-[14px] font-bold text-gray-900">{vendor.vendorName}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-[13px] font-medium text-gray-500">{vendor.companyName || '---'}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-[13px] text-gray-500 font-medium">{vendor.email}</span>
                       </td>
                       <td className="px-8 py-5 text-[13px] text-gray-400 font-medium">{vendor.phone || '---'}</td>
                       <td className="px-8 py-5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                            vendor.status === 'Active' ? 'text-[#1BAFAF] bg-[#1BAFAF]/10' : 'text-red-500 bg-red-50'
                          }`}>
                            {vendor.status || 'Active'}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-right pr-10">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleEdit(vendor)}
                              className="p-2 text-gray-300 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-xl transition-all"
                            >
                               <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(vendor.id)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                               <Trash2 size={16} />
                            </button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr>
                       <td colSpan="7" className="py-20 text-center">
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
      </div>
      

      <VendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
      />

    </div>
  );
}
