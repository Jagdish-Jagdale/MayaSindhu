import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, ArrowUpRight, X, ChevronDown, Grid2X2 } from 'lucide-react';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [rowsOpen, setRowsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const filterRef = useRef(null);
  const rowsRef = useRef(null);

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

  const categories = [
    { name: 'Banarasi Heritage', description: 'Traditional Banarasi weave sarees with gold & silver zari', count: 42, type: 'Silk', created_at: '10/01/2024' },
    { name: 'Kanjeevaram Silks', description: 'Pure South Indian silk with vibrant temple borders', count: 28, type: 'Silk', created_at: '15/01/2024' },
    { name: 'Ikat Masterpieces', description: 'Resist-dyed woven patterns from Odisha and Telangana', count: 35, type: 'Cotton', created_at: '01/02/2024' },
    { name: 'Cotton Silk Blends', description: 'Lightweight fusion fabrics for everyday elegance', count: 56, type: 'Blend', created_at: '14/02/2024' },
    { name: 'Designer Blouses', description: 'Artisan embroidered and woven blouse pieces', count: 18, type: 'Accessory', created_at: '05/03/2024' },
    { name: 'Bridal Collection', description: 'Exclusive heavy-weight bridal sarees for weddings', count: 12, type: 'Silk', created_at: '20/03/2024' },
    { name: 'Chanderi Weaves', description: 'Diaphanous textures from Madhya Pradesh', count: 24, type: 'Cotton', created_at: '22/03/2024' },
    { name: 'Paithani Borders', description: 'Intricate peacock motifs and silk borders', count: 15, type: 'Silk', created_at: '25/03/2024' },
    { name: 'Linen Collection', description: 'Breathable and modern linen-silk sarees', count: 30, type: 'Blend', created_at: '28/03/2024' },
    { name: 'Tussar Wild Silk', description: 'Naturally golden deep-textured silk', count: 22, type: 'Silk', created_at: '01/04/2024' },
    { name: 'Hand-Block Prints', description: 'Traditional block printing techniques', count: 45, type: 'Cotton', created_at: '05/04/2024' },
    { name: 'Zardosi Work', description: 'Heavy metallic embroidery for special occasions', count: 10, type: 'Embroidery', created_at: '10/04/2024' },
  ];

  const filterOptions = ['All', 'Silk', 'Cotton', 'Blend', 'Accessory', 'Embroidery'];

  const filteredCategories = (() => {
    let list = categories.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || c.type === activeFilter;
      return matchesSearch && matchesFilter;
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
    <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Categories
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Organize your collection by technique and textile heritage</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
            <Plus size={16} strokeWidth={2.5} />
            Add Category
          </button>
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

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold transition-colors rounded-lg ${
                activeFilter !== 'All' ? 'text-[#1BAFAF] bg-[#1BAFAF]/10' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Filter size={14} strokeWidth={2.5} />
              {activeFilter !== 'All' ? `Type: ${activeFilter}` : 'Filters'}
              {activeFilter !== 'All' && (
                <span onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }} className="ml-1 hover:text-red-400">
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Type</p>
                {filterOptions.map(opt => (
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

      {/* Table + Footer */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Category <SortIcon colKey="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('description')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Description <SortIcon colKey="description" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('type')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Type <SortIcon colKey="type" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('count')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Products <SortIcon colKey="count" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Created At <SortIcon colKey="created_at" />
                  </button>
                </th>
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
                    <td className="px-6 py-4 max-w-[220px]"><span className="block text-[14px] text-gray-500 font-normal truncate" title={cat.description}>{cat.description}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-[#1BAFAF] bg-[#eaf6f6]">
                        {cat.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{cat.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{cat.created_at}</td>
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
                      <span className="text-gray-400 font-medium">No categories found for "{searchTerm || activeFilter}"</span>
                      <button onClick={() => { setSearchTerm(''); setActiveFilter('All'); }} className="text-[#1BAFAF] text-[13px] font-semibold hover:underline">
                        Clear filters
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
