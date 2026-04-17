import React, { useState, useEffect, useRef } from 'react';
import { useAdminUI } from '../../context/AdminUIContext';
import { Plus, Search, ChevronDown, Filter, X, Grid2X2, Pencil, Trash2, ArrowUpRight, Database } from 'lucide-react';
import useCategories from '../../hooks/useCategories';
import { seedCategories } from '../../utils/seedFirestore';

const Categories = () => {
  const { isCollapsed } = useAdminUI();
  const { categories: heirarchy, loading } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const filterRef = useRef(null);
  const rowsRef = useRef(null);

  // Flatten hierarchy for table view
  const flatten = (items) => {
    let result = [];
    items.forEach(item => {
      result.push({ ...item });
      if (item.children) {
        result = result.concat(flatten(item.children));
      }
    });
    return result;
  };

  const categories = flatten(heirarchy);

  const filterOptions = ['All', 'Silk', 'Cotton', 'Blend', 'Accessory', 'Embroidery'];

  const filteredCategories = (() => {
    let list = categories.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        const cmp = aVal.toString().localeCompare(bVal.toString(), undefined, { numeric: true });
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  })();

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Categories
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Organize your collection by technique and textile heritage</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={seedCategories}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95"
            >
              <Database size={16} strokeWidth={2.5} />
              Seed Database
            </button>
            <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
              <Plus size={16} strokeWidth={2.5} />
              Add Category
            </button>
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
            placeholder="Search by name or type..."
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
              className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Rows: <span className="text-[#1BAFAF]">{rowsPerPage}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${rowsOpen ? 'rotate-180' : ''}`} />
            </button>
            {rowsOpen && (
              <div className="absolute right-0 top-full mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {[5, 10, 20, 50].map(opt => (
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
        </div>
      </div>

      {/* Table + Footer */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Category</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Parent ID</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Level</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Created At</th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredCategories.length > 0 ? (
                filteredCategories.slice(0, rowsPerPage).map((cat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 max-w-[180px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-[#eaf6f6] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Grid2X2 size={16} className="text-[#1BAFAF]" />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900 truncate" title={cat.name}>{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{cat.parentId || 'None (Root)'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{cat.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{cat.created_at ? new Date(cat.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90" title="Edit">
                          <Pencil size={14} strokeWidth={2.5} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90" title="Delete">
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-gray-400 font-medium">No categories found for "{searchTerm}"</span>
                      <button onClick={() => setSearchTerm('')} className="text-[#1BAFAF] text-[13px] font-semibold hover:underline">
                        Clear search
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Page Footer */}
        <div className="flex items-center justify-between px-2 pt-3">
          <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
            Showing 1-{Math.min(rowsPerPage, filteredCategories.length)} of {filteredCategories.length}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 transition-all cursor-not-allowed">
              <ArrowUpRight size={14} className="rotate-[225deg]" />
            </div>
            <button className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-900 hover:shadow-sm hover:text-[#1BAFAF] transition-all">
              <ArrowUpRight size={14} className="rotate-45" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Categories;
