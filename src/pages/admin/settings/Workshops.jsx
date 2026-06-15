import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Loader2,
  FileText,
  X,
  Calendar,
  Type,
  Send,
  Info,
  Camera,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateHelper';
import CustomSelect from '../../../components/common/CustomSelect';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../utils/cloudinary';
import DeleteConfirmationModal from '../../../components/admin/DeleteConfirmationModal';

export default function Workshops() {
  const { isCollapsed } = useAdminUI();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, rowsPerPage]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    date: new Date().toISOString().split('T')[0],
    details: '',
    image: '',
    fees: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Load Workshops
  useEffect(() => {
    const q = query(collection(db, 'workshops'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setWorkshops(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load workshops");
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (workshop = null) => {
    setSelectedFile(null);
    if (workshop) {
      setEditingWorkshop(workshop);
      setFormData({
        name: workshop.name || '',
        summary: workshop.summary || '',
        date: workshop.date || '',
        details: workshop.details || '',
        image: workshop.image || '',
        fees: workshop.fees !== undefined ? workshop.fees.toString() : '0'
      });
    } else {
      setEditingWorkshop(null);
      setFormData({
        name: '',
        summary: '',
        date: new Date().toISOString().split('T')[0],
        details: '',
        image: '',
        fees: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.summary || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);
      let imageUrl = formData.image;

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile, 'Workshops');
      }

      if (editingWorkshop) {
        // If image changed and old image was from cloudinary, delete old one
        if (imageUrl !== editingWorkshop.image && editingWorkshop.image?.includes('cloudinary')) {
          await deleteFromCloudinary(editingWorkshop.image);
        }

        await updateDoc(doc(db, 'workshops', editingWorkshop.id), {
          ...formData,
          fees: Number(formData.fees) || 0,
          image: imageUrl,
          updatedAt: serverTimestamp()
        });
        toast.success("Workshop updated successfully!");
      } else {
        await addDoc(collection(db, 'workshops'), {
          ...formData,
          fees: Number(formData.fees) || 0,
          image: imageUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Workshop added successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save workshop");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (workshop) => {
    setWorkshopToDelete(workshop);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!workshopToDelete) return;
    try {
      setIsDeleting(true);
      if (workshopToDelete.image?.includes('cloudinary')) {
        await deleteFromCloudinary(workshopToDelete.image);
      }
      await deleteDoc(doc(db, 'workshops', workshopToDelete.id));
      toast.success("Workshop deleted");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete workshop");
    } finally {
      setIsDeleting(false);
      setWorkshopToDelete(null);
    }
  };

  const filteredWorkshops = workshops.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? w.date === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading workshops...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Artician Workshop Management
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage workshops and artisan events</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL RECORDS: {filteredWorkshops.length}
            </span>
            <span className="text-gray-200 text-sm">|</span>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
              Add Workshop
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm flex flex-col md:flex-row items-center gap-4 transition-all hover:shadow-md">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search workshops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium text-gray-600"
          />
        </div>

        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center px-3 border-r border-gray-100">
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

          <div className="flex items-center gap-2 px-3 text-[12px] font-semibold text-gray-500 relative group/filter">
            <Filter size={14} strokeWidth={2.5} className={dateFilter ? 'text-[#1BAFAF]' : ''} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-500 focus:text-[#1BAFAF] cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pl-10 pr-4 py-6 text-[14px] font-bold text-[#1BAFAF] whitespace-nowrap">Sr No</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF]">Image</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF] min-w-[200px]">Workshop Name</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF]">Date</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF] max-w-[300px]">Summary</th>
                <th className="px-4 py-6 text-[14px] font-bold text-[#1BAFAF]">Fees</th>
                <th className="px-10 py-6 text-[14px] font-bold text-[#1BAFAF] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredWorkshops.length > 0 ? filteredWorkshops.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((workshop, idx) => (
                <tr key={workshop.id} className="hover:bg-gray-50/40 transition-colors group cursor-pointer">
                  <td className="pl-10 pr-4 py-6 text-[14px] font-medium text-gray-400">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-4 py-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                      {workshop.image ? (
                        <img src={workshop.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <ImageIcon size={18} className="text-gray-200" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-6 min-w-[200px]">
                    <span className="text-[14px] font-bold text-gray-900" title={workshop.name}>
                      {workshop.name?.length > 30 ? `${workshop.name.substring(0, 30)}...` : workshop.name}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
                      {formatDate(workshop.date)}
                    </span>
                  </td>
                  <td className="px-4 py-6 max-w-[300px]">
                    <span className="text-[13px] text-gray-500 font-medium" title={workshop.summary}>
                      {workshop.summary?.length > 50 ? `${workshop.summary.substring(0, 50)}...` : workshop.summary}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[13px] text-gray-900 font-bold whitespace-nowrap">
                      {workshop.fees && Number(workshop.fees) > 0 ? `₹${workshop.fees}` : 'Free'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(workshop)}
                        className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all active:scale-90"
                        title="Edit Workshop"
                      >
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDelete(workshop)}
                        className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all active:scale-90"
                        title="Delete Workshop"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={40} className="text-gray-100" />
                      <p className="text-[14px] font-medium text-gray-400 tracking-wide">No workshops found.</p>
                    </div>
                  </td>
                </tr>
              )}
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <span className="text-[12px] font-semibold text-gray-400">
            Page {currentPage} of {Math.ceil(filteredWorkshops.length / rowsPerPage) || 1}
          </span>
          <button
            onClick={() => currentPage < Math.ceil(filteredWorkshops.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
            disabled={currentPage >= Math.ceil(filteredWorkshops.length / rowsPerPage)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Add/Edit Workshop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                  {editingWorkshop ? 'Edit Workshop' : 'Add Workshop'}
                </h2>
                <p className="text-[13px] text-gray-400 font-medium">Enter the details of the workshop</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Info */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">Workshop Name</label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          placeholder="Enter workshop name..."
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-gray-50 border-none pl-11 pr-5 py-3.5 text-[14px] font-semibold text-gray-800 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">Workshop Summary</label>
                      <div className="relative">
                        <Info className="absolute left-4 top-4 w-4 h-4 text-gray-300" />
                        <textarea
                          placeholder="Enter short summary..."
                          rows={2}
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          className="w-full bg-gray-50 border-none pl-11 pr-5 py-3.5 text-[14px] font-medium text-gray-600 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 ml-1">Workshop Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-gray-50 border-none pl-11 pr-5 py-3.5 text-[14px] font-bold text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-500 ml-1">Workshop Fees (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0 (Free)"
                            value={formData.fees}
                            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                            className="w-full bg-gray-50 border-none pl-11 pr-5 py-3.5 text-[14px] font-bold text-gray-700 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">Details of Workshop</label>
                      <textarea
                        rows={3}
                        placeholder="Enter full workshop details..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        className="w-full bg-gray-50 border-none px-6 py-4 text-[14px] font-medium text-gray-700 rounded-2xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Image */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 px-1">
                      <ImageIcon size={14} className="text-[#1BAFAF]" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workshop Image</span>
                    </div>

                    <div
                      className="relative flex-1 rounded-2xl bg-white border-2 border-dashed border-gray-100 hover:border-[#1BAFAF]/30 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group overflow-hidden shadow-sm min-h-[250px]"
                    >
                      {formData.image ? (
                        <>
                          <img src={formData.image} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-[2px]">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                              title="Change Image"
                            >
                              <Camera size={20} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, image: '' });
                                setSelectedFile(null);
                              }}
                              className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl text-red-200 transition-all active:scale-95"
                              title="Remove Image"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center gap-3"
                        >
                          <div className="p-3 bg-gray-50 rounded-full group-hover:bg-[#1BAFAF]/5 transition-colors">
                            <Plus size={20} className="text-gray-300 group-hover:text-[#1BAFAF]" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Image</span>
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors">
                        <LinkIcon size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="Or paste image link..."
                        value={formData.image?.startsWith('blob:') ? '' : formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setSelectedFile(null);
                        }}
                        className="w-full bg-white border-none pl-10 pr-4 py-3.5 text-[12px] font-medium text-gray-500 rounded-xl focus:ring-2 focus:ring-[#1BAFAF]/10 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-10 py-3 rounded-2xl text-[14px] font-bold transition-all shadow-xl shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSaving ? 'Saving...' : (editingWorkshop ? 'Update Workshop' : 'Add Workshop')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={workshopToDelete?.name}
        loading={isDeleting}
      />

    </div>
  );
}
