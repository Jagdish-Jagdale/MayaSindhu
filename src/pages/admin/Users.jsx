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
  Calendar
} from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  deleteDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';

import { useAdminUI } from '../../context/AdminUIContext';

const Users = () => {
  const { isCollapsed } = useAdminUI();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', dir: 'desc' });

  const filterRef = useRef(null);
  const rowsRef = useRef(null);

  // Real-time Firestore Listener
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              User Directory
            </h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Monitor and manage all registered accounts in the system</p>
          </div>
        </div>
        <hr className="border-gray-100" />
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
          {/* Rows Selection */}
          <div className="relative" ref={rowsRef}>
            <button
              onClick={() => setRowsOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors border-r border-gray-100"
            >
              Rows: <span className="text-[#1BAFAF]">{rowsPerPage}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${rowsOpen ? 'rotate-180' : ''}`} />
            </button>
            {rowsOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {rowOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setRowsPerPage(opt); setRowsOpen(false); }}
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
                {['All', 'Active', 'Inactive', 'Suspended'].map(opt => (
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
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
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
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, rowsPerPage).map((user, idx) => (
                  <tr key={user.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-50 flex-shrink-0 flex items-center justify-center">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                        <span className="text-[14px] font-bold text-gray-900">{user.fullName}</span>
                      </div>
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
                        <button className="w-8 h-8 flex items-center justify-center text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all active:scale-90">
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90">
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
            Total Records: {filteredUsers.length}
          </span>
          <div className="flex items-center gap-2">
             <p className="text-[11px] text-gray-400 italic">Showing top {Math.min(rowsPerPage, filteredUsers.length)} results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
