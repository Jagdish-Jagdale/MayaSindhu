import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  ArrowUpRight, 
  X, 
  ChevronDown, 
  Eye, 
  EyeOff,
  User as UserIcon,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  UserCheck,
  UserMinus,
  UserPlus
} from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';

import { useAdminUI } from '../../context/AdminUIContext';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import UserModal from '../../components/admin/UserModal';
import UserViewModal from '../../components/admin/UserViewModal';

const Users = () => {
  const { isCollapsed } = useAdminUI();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, rowsPerPage]);

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add/Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  const filterRef = useRef(null);
  const rowsRef = useRef(null);

  // Real-time Firestore Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load users data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleView = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const userId = userToDelete.id;

      // Subcollections to clean up
      const subcollections = ['wishlist', 'cart', 'paymentMethods', 'bankAccounts', 'addresses'];

      for (const sub of subcollections) {
        const subColRef = collection(db, 'users', userId, sub);
        const snapshot = await getDocs(subColRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Finally delete the parent user document
      await deleteDoc(doc(db, 'users', userId));

      toast.success(`User "${userToDelete.fullName || userToDelete.email}" and all associated data removed`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user profile and data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const rowOptions = [5, 10, 20, 50];

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

  const formatDate = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredUsers = (() => {
    let list = users.filter(user => {
      const matchesSearch =
        (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || (user.status || 'Active') === activeFilter;
      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        // Handle Firestore Timestamps for sorting
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
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

  // Close filter/rows dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading user database...</p>
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
              User Directory
            </h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter tracking-tight">Monitor and manage all registered accounts in the system</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
          { name: 'Active Users', value: users.filter(u => (u.status || 'Active') === 'Active').length, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { name: 'Inactive Users', value: users.filter(u => u.status === 'Inactive').length, icon: UserMinus, color: 'text-amber-500', bg: 'bg-amber-50' },
          { 
            name: 'New Users (30d)', 
            value: users.filter(u => {
              if (!u.createdAt) return false;
              const date = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return date > thirtyDaysAgo;
            }).length, 
            icon: UserPlus, 
            color: 'text-purple-500', 
            bg: 'bg-purple-50' 
          },
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center px-3 border-r border-gray-100">
            <CustomSelect
              value={rowsPerPage}
              onChange={(val) => setRowsPerPage(Number(val))}
              options={rowOptions.map(opt => ({ value: opt, label: `${opt} rows` }))}
              className="w-28"
              minimal={true}
              valuePrefix="Rows:"
            />
          </div>

          {/* Filters Selection */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold transition-colors rounded-lg ${
                activeFilter !== 'All' ? 'text-[#1BAFAF] bg-[#1BAFAF]/10' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Filter size={14} strokeWidth={2.5} />
              {activeFilter !== 'All' ? `Status: ${activeFilter}` : 'Filters'}
              {activeFilter !== 'All' && (
                <span onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }} className="ml-1 hover:text-red-400">
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Status</p>
                {['All', 'Active', 'Inactive'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setActiveFilter(opt); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                      activeFilter === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] whitespace-nowrap">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('fullName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Full Name <SortIcon colKey="fullName" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Email Address <SortIcon colKey="email" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Phone Number <SortIcon colKey="phone" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Status <SortIcon colKey="status" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Registered <SortIcon colKey="createdAt" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              <AnimatePresence custom={direction}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((user, idx) => (
                      <motion.tr 
                      key={user.id} 
                      custom={{ direction, index: idx }}
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      onClick={() => handleView(user)}
                      className="hover:bg-gray-50 group transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                        {((currentPage - 1) * rowsPerPage + idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <span className="text-[14px] font-bold text-gray-900">{user.fullName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-gray-500 font-medium">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] text-gray-500 font-medium">{user.phone || '---'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          (user.status || 'Active') === 'Active' ? 'text-[#1BAFAF] bg-[#eaf6f6]' :
                          'text-red-500 bg-red-50'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                            className="w-8 h-8 flex items-center justify-center text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all active:scale-90"
                            title="Edit User"
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                            title="Delete User"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </AnimatePresence>
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
                 Page {currentPage} of {Math.ceil(filteredUsers.length / rowsPerPage) || 1}
              </span>
              <button 
                onClick={() => currentPage < Math.ceil(filteredUsers.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(filteredUsers.length / rowsPerPage)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
           </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={userToDelete?.fullName || userToDelete?.email}
        loading={isDeleting}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />

      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={userToView}
      />
    </div>
  );
};

export default Users;
