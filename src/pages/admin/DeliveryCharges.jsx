/**
 * File: DeliveryCharges.jsx
 * Description: Admin online manager page rendering e-commerce customer lists, returns tables, review grids, and system config settings.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Pencil, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Truck,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import * as XLSX from 'xlsx';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  deleteDoc, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';

export default function DeliveryCharges() {
  const { isCollapsed } = useAdminUI();
  const [deliveryRates, setDeliveryRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('pincode');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({ pincodes: [''], charge: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rateToDelete, setRateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time listener for delivery rates
  useEffect(() => {
    const q = query(collection(db, 'deliverychargers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeliveryRates(data);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load delivery charges");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      return <ChevronDown size={12} className="text-gray-300 ml-1 inline-block" strokeWidth={2.5} />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    ) : (
      <ChevronDown size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'charge') {
      const cleanVal = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanVal }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePincodeChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(0, 6);
    const newPincodes = [...formData.pincodes];
    newPincodes[index] = cleanVal;
    setFormData(prev => ({ ...prev, pincodes: newPincodes }));
    if (formErrors.pincodes) {
      setFormErrors(prev => ({ ...prev, pincodes: '' }));
    }
  };

  const addPincodeField = () => {
    setFormData(prev => ({ ...prev, pincodes: [...prev.pincodes, ''] }));
  };

  const removePincodeField = (index) => {
    if (formData.pincodes.length > 1) {
      const newPincodes = formData.pincodes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, pincodes: newPincodes }));
    }
  };

  const handleExcelImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const importedPincodes = [];
        json.forEach(row => {
          if (Array.isArray(row)) {
            row.forEach(cell => {
              if (cell !== null && cell !== undefined) {
                const valStr = cell.toString().trim();
                // Ensure it is numeric-only and exactly 6 digits (no characters)
                if (/^\d{6}$/.test(valStr)) {
                  importedPincodes.push(valStr);
                }
              }
            });
          }
        });

        const uniqueImported = [...new Set(importedPincodes)];

        if (uniqueImported.length === 0) {
          toast.error("No valid 6-digit numeric pincodes found in the Excel file");
          return;
        }

        setFormData(prev => {
          const existingFiltered = prev.pincodes.filter(pin => pin && pin.trim().length === 6);
          const combined = [...existingFiltered, ...uniqueImported];
          const finalUnique = [...new Set(combined)];
          return {
            ...prev,
            pincodes: finalUnique.length > 0 ? finalUnique : ['']
          };
        });

        toast.success(`Successfully imported ${uniqueImported.length} unique pincode(s)`);
      } catch (err) {
        toast.error("Failed to parse Excel file");
      }
      e.target.value = '';
    };

    reader.readAsBinaryString(file);
  };

  const openAddModal = () => {
    setEditingRate(null);
    setFormData({ pincodes: [''], charge: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (rate) => {
    setEditingRate(rate);
    setFormData({ pincodes: rate.pincodes || [rate.pincode], charge: rate.charge.toString() });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validate pincodes
    const emptyPincode = formData.pincodes.some(pin => !pin);
    const invalidLength = formData.pincodes.some(pin => pin && pin.length !== 6);

    if (emptyPincode) {
      errors.pincodes = "All pincodes are required";
    } else if (invalidLength) {
      errors.pincodes = "All pincodes must be exactly 6 digits";
    }

    if (!formData.charge) {
      errors.charge = "Charges are required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      // Check for duplicate pincodes in the entered list
      const duplicatesInList = formData.pincodes.filter((item, index) => formData.pincodes.indexOf(item) !== index);
      if (duplicatesInList.length > 0) {
        setFormErrors({ pincodes: `Duplicate pincode found in list: ${duplicatesInList.join(', ')}` });
        setIsSaving(false);
        return;
      }

      // Query all Firestore documents to check duplicates safely across mixed array/string types
      const querySnapshot = await getDocs(collection(db, 'deliverychargers'));
      const allRates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const duplicatePincodes = [];
      formData.pincodes.forEach(pincode => {
        const conflict = allRates.find(rate => {
          if (editingRate && rate.id === editingRate.id) return false;
          const pins = rate.pincodes || [rate.pincode] || [];
          return pins.includes(pincode);
        });
        if (conflict) {
          duplicatePincodes.push(pincode);
        }
      });

      if (duplicatePincodes.length > 0) {
        setFormErrors({ pincodes: `The following pincodes already exist: ${duplicatePincodes.join(', ')}` });
        setIsSaving(false);
        return;
      }

      const rateData = {
        pincodes: formData.pincodes,
        charge: Number(formData.charge),
        updatedAt: serverTimestamp()
      };

      if (editingRate) {
        await updateDoc(doc(db, 'deliverychargers', editingRate.id), rateData);
        toast.success("Delivery charge updated successfully");
      } else {
        await addDoc(collection(db, 'deliverychargers'), {
          ...rateData,
          createdAt: serverTimestamp()
        });
        toast.success("Delivery charges added successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save delivery charge configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (rate) => {
    setRateToDelete(rate);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rateToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'deliverychargers', rateToDelete.id));
      toast.success("Delivery charge deleted successfully");
      setIsDeleteModalOpen(false);
      setRateToDelete(null);
    } catch (error) {
      toast.error("Failed to delete delivery charge configuration");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & sort rates
  const filteredRates = (() => {
    let list = deliveryRates.filter(rate => {
      const pins = rate.pincodes || [rate.pincode] || [];
      return pins.some(pin => (pin || '').includes(searchTerm));
    });

    if (sortField) {
      list = [...list].sort((a, b) => {
        if (sortField === 'pincode') {
          const valA = (a.pincodes && a.pincodes[0]) || a.pincode || '';
          const valB = (b.pincodes && b.pincodes[0]) || b.pincode || '';
          return sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else {
          const valA = a[sortField];
          const valB = b[sortField];
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
      });
    }
    return list;
  })();

  const totalPages = Math.ceil(filteredRates.length / rowsPerPage);
  const paginatedRates = filteredRates.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in duration-500 transition-all ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Delivery Charges
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Configure and manage location-based delivery charges</p>
          </div>
          <div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Delivery
            </button>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter and Rows Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative group w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by pincode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.replace(/\D/g, ''));
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <CustomSelect
            value={rowsPerPage}
            onChange={(val) => {
              setRowsPerPage(Number(val));
              setCurrentPage(1);
            }}
            options={[5, 10, 20, 50].map(opt => ({ value: opt, label: `${opt} rows` }))}
            className="w-28"
            minimal={true}
            valuePrefix="Rows:"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] whitespace-nowrap">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('pincode')} className="flex items-center hover:opacity-75 transition-opacity">
                    Delivery Pincode <SortIndicator field="pincode" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('charge')} className="flex items-center hover:opacity-75 transition-opacity">
                    Charges <SortIndicator field="charge" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF] whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {paginatedRates.length > 0 ? (
                paginatedRates.map((rate, idx) => (
                  <tr key={rate.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                      {((currentPage - 1) * rowsPerPage + idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-700 font-bold font-mono">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {(rate.pincodes || [rate.pincode] || []).map((pin) => (
                          <span key={pin} className="px-2.5 py-0.5 text-xs bg-[#1BAFAF]/10 text-[#1BAFAF] rounded-lg font-bold border border-[#1BAFAF]/20 shadow-sm whitespace-nowrap">
                            {pin}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#1BAFAF] font-bold">
                      ₹{rate.charge.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(rate)}
                          className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
                          title="Edit"
                        >
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(rate)}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Delete"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400 text-sm font-medium">
                    No delivery charge configurations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <span className="text-[12px] font-semibold text-gray-400">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#1BAFAF] text-white shadow-sm'
                      : 'border border-gray-100 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsModalOpen(false); closeFn(); } }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">
                    {editingRate ? "Edit Delivery Charge" : "Add Delivery Charge"}
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium">Configure location-based shipping cost</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="p-6 bg-[#FAFAFA] space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[13px] font-bold text-gray-700">Delivery Pincode(s) *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-[12px] font-bold text-[#1BAFAF] hover:text-[#17a0a0] cursor-pointer transition-colors">
                        <Upload size={14} strokeWidth={2.5} /> Import Excel
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleExcelImport}
                          className="hidden"
                        />
                      </label>
                      <span className="text-gray-200 text-xs">|</span>
                      <button
                        type="button"
                        onClick={addPincodeField}
                        className="flex items-center gap-1 text-[12px] font-bold text-[#1BAFAF] hover:text-[#17a0a0] transition-colors"
                      >
                        <Plus size={14} strokeWidth={2.5} /> Add Pincode
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2">
                    {formData.pincodes.map((pincode, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => handlePincodeChange(index, e.target.value)}
                          placeholder={`Pincode ${index + 1}`}
                          className="flex-1 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[14px] outline-none focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all font-bold font-mono"
                        />
                        {formData.pincodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePincodeField(index)}
                            className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formErrors.pincodes && (
                    <span className="text-red-500 text-xs mt-1 ml-1 block">{formErrors.pincodes}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-gray-700 ml-1">Charges (₹) *</label>
                  <input
                    type="text"
                    name="charge"
                    value={formData.charge}
                    onChange={handleInputChange}
                    placeholder="e.g. 50"
                    className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-[14px] outline-none focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/10 transition-all font-bold"
                  />
                  {formErrors.charge && (
                    <span className="text-red-500 text-xs mt-1 ml-1 block">{formErrors.charge}</span>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 bg-[#FAFAFA]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-[13px] font-bold text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingRate ? "Update" : "Add Charge"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsDeleteModalOpen(false); closeFn(); } }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">Delete Delivery Charge?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete delivery charges for pincode(s): <span className="font-bold">{rateToDelete?.pincode || (rateToDelete?.pincodes && rateToDelete.pincodes.join(', '))}</span>?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
