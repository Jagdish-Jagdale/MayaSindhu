import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  Pencil, 
  Trash2, 
  Loader2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import { db, firebaseConfig } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function SuperAdmins() {
  const { isCollapsed } = useAdminUI();

  // State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [formData, setFormData] = useState({ 
    id: null, name: '', email: '', password: '', confirmPassword: '', role: 'Super Admin', status: 'Active'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Admins
  useEffect(() => {
    const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(list);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching super admins:", error);
      toast.error("Failed to load super admin team");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ 
      id: null, name: '', email: '', password: '', confirmPassword: '', role: 'Super Admin', status: 'Active'
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setModalMode('edit');
    setFormData({ 
      id: admin.id, 
      name: admin.name || '', 
      email: admin.email || '', 
      password: admin.password || '', // Displaying original password as requested
      confirmPassword: admin.password || '',
      role: 'Super Admin', 
      status: admin.status || 'Active'
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Name & Email Validation
    if (!formData.name || formData.name.trim() === '') {
      return toast.error("Full Name is mandatory");
    }
    if (!formData.email || formData.email.trim() === '') {
      return toast.error("Email Address is mandatory");
    }

    // Password Validation Logic
    const isCheckingPassword = modalMode === 'add' || (modalMode === 'edit' && formData.password);
    
    if (isCheckingPassword) {
      if (!formData.password) {
        return toast.error("Password is mandatory");
      }
      if (!formData.confirmPassword) {
        return toast.error("Confirm Password is mandatory");
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      // Strong Password Rules: min 6 chars, 1 uppercase, 1 number, 1 symbol
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        return toast.error("Password must be at least 6 characters, contain 1 uppercase letter, 1 number, and 1 symbol.");
      }
    }

    try {
      setIsSaving(true);
      if (modalMode === 'add') {
        
        // Secondary App Instantiation avoids logging out the active superadmin
        const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp_${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        
        await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        
        // Save to DB
        await addDoc(collection(db, 'admins'), {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Super Administrator created successfully");

      } else {
        const updateData = {
          name: formData.name,
          role: formData.role,
          status: formData.status,
          updatedAt: serverTimestamp()
        };
        // In a real environment, changing email/password requires admin SDK or complex re-auth flows.
        if (formData.password) updateData.password = formData.password;
        
        await updateDoc(doc(db, 'admins', formData.id), updateData);
        toast.success("Super Administrator updated successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save error: ", error);
      toast.error(error.message || "Failed to save super administrator");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'admins', adminToDelete.id));
      toast.success(`Super Admin "${adminToDelete.name || adminToDelete.email}" removed`);
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error("Error deleting super admin:", error);
      toast.error("Failed to remove super administrator");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.role === 'Super Admin' &&
    ((a.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading super administrative hierarchy...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-[#1BAFAF]" size={24} />
              Super Administrative Team
            </h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Manage top-level access and system super administrators.</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#1BAFAF] hover:bg-[#178E8E] text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Super Admin
          </button>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search super admins by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500 w-24">Sr. No.</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">Email Address</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">Assigned Role</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">Status</th>
              <th className="px-6 py-4 text-right text-[14px] font-bold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin, index) => (
                <tr key={admin.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-bold text-gray-900">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] text-gray-900 font-bold">{admin.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[11px] font-bold border uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#1BAFAF]/10 text-[#1BAFAF] border-[#1BAFAF]/20`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      admin.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                    }`}>
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(admin)}
                        className="w-8 h-8 flex items-center justify-center text-[#1BAFAF] hover:bg-[#1BAFAF]/10 rounded-lg transition-all active:scale-90"
                      >
                        <Pencil size={14} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(admin)}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                  No super administrators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9990] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-[16px] font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Super Admin' : 'Update Super Admin'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium text-gray-900"
                  placeholder="e.g. Ramesh Singh"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  disabled={modalMode === 'edit'} // Usually, editing email requires complex auth changes
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] outline-none transition-all font-medium text-gray-900 ${modalMode === 'edit' ? 'bg-gray-50 opacity-60 cursor-not-allowed' : 'focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/20'}`}
                  placeholder="superadmin@mayasindhu.com"
                />
                {modalMode === 'edit' && <p className="text-[10px] text-gray-400 ml-1 mt-1">Email cannot be changed after creation.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-white border border-gray-200 pl-4 pr-10 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-medium text-gray-900"
                      placeholder="Enter password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={`w-full bg-white border px-4 py-2.5 rounded-xl text-[13px] outline-none transition-all font-medium text-gray-900 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                          : 'border-gray-200 focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/20'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Assigned Role</label>
                  <input
                    type="text"
                    disabled
                    value="Super Admin"
                    className="w-full bg-gray-50/80 border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] outline-none transition-all font-bold text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5 ml-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[13px] outline-none focus:border-[#1BAFAF] focus:ring-2 focus:ring-[#1BAFAF]/20 transition-all font-semibold text-gray-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-[13px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1BAFAF] hover:bg-[#178E8E] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {isSaving ? 'Processing...' : modalMode === 'add' ? 'Create Super Admin' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={adminToDelete?.name || adminToDelete?.email}
        loading={isDeleting}
      />
    </div>
  );
}
