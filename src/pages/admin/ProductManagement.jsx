import { useAdminUI } from '../../context/AdminUIContext';

export default function ProductManagement() {
  const { isCollapsed } = useAdminUI();
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

  const products = [
    { name: 'Banarasi Silk Saree', category: 'Silk', price: '₹12,500', stock: 12, status: 'in stock', updated: '12/04/2024', image: 'https://picsum.photos/seed/banarasi/80/80', sku: 'MS-BS-001' },
    { name: 'Kanjeevaram Classic', category: 'Traditional', price: '₹18,200', stock: 5, status: 'low stock', updated: '12/04/2024', image: 'https://picsum.photos/seed/kanjee/80/80', sku: 'MS-KJ-042' },
    { name: 'Chanderi Handloom', category: 'Handloom', price: '₹6,800', stock: 0, status: 'out of stock', updated: '11/04/2024', image: 'https://picsum.photos/seed/chanderi/80/80', sku: 'MS-CH-015' },
    { name: 'Paithani Heritage', category: 'Silk', price: '₹22,500', stock: 8, status: 'in stock', updated: '10/04/2024', image: 'https://picsum.photos/seed/paithani/80/80', sku: 'MS-PH-088' },
    { name: 'Cotton Sambalpuri', category: 'Cotton', price: '₹4,500', stock: 24, status: 'in stock', updated: '10/04/2024', image: 'https://picsum.photos/seed/sambal/80/80', sku: 'MS-CS-022' },
    { name: 'Tussar Embroidered', category: 'Embroidery', price: '₹9,200', stock: 3, status: 'low stock', updated: '08/04/2024', image: 'https://picsum.photos/seed/tussar/80/80', sku: 'MS-TE-019' },
    { name: 'South Silk Fusion', category: 'Traditional', price: '₹14,000', stock: 15, status: 'in stock', updated: '07/04/2024', image: 'https://picsum.photos/seed/south/80/80', sku: 'MS-SS-033' },
    { name: 'Hand-Painted Kalamkari', category: 'Artisan', price: '₹11,500', stock: 2, status: 'low stock', updated: '07/04/2024', image: 'https://picsum.photos/seed/kalam/80/80', sku: 'MS-HP-011' },
    { name: 'Bandhani Georgette', category: 'Traditional', price: '₹7,900', stock: 20, status: 'in stock', updated: '06/04/2024', image: 'https://picsum.photos/seed/bandh/80/80', sku: 'MS-BG-005' },
    { name: 'Patan Patola', category: 'Handloom', price: '₹45,000', stock: 1, status: 'low stock', updated: '05/04/2024', image: 'https://picsum.photos/seed/patola/80/80', sku: 'MS-PP-099' },
    { name: 'Lucknowi Chikankari', category: 'Cotton', price: '₹9,500', stock: 10, status: 'in stock', updated: '05/04/2024', image: 'https://picsum.photos/seed/luck/80/80', sku: 'MS-LC-014' },
    { name: 'Kasavu Traditional', category: 'Traditional', price: '₹5,200', stock: 30, status: 'in stock', updated: '04/04/2024', image: 'https://picsum.photos/seed/kasav/80/80', sku: 'MS-KT-021' },
  ];

  const filterOptions = ['All', 'Silk', 'Traditional', 'Handloom', 'Cotton', 'Embroidery', 'Artisan'];

  const filteredProducts = (() => {
    let list = products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || p.category === activeFilter;
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
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Product Management
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Manage your collection of handmade sarees and textiles</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
            <Plus size={16} strokeWidth={2.5} />
            Add Product
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
            placeholder="Search by name, SKU or category..."
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
              {activeFilter !== 'All' ? `Category: ${activeFilter}` : 'Filters'}
              {activeFilter !== 'All' && (
                <span onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }} className="ml-1 hover:text-red-400">
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by Category</p>
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
                    Product <SortIcon colKey="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Category <SortIcon colKey="category" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('price')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Price <SortIcon colKey="price" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Stock <SortIcon colKey="stock" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Status <SortIcon colKey="status" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('updated')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Last Updated <SortIcon colKey="updated" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, rowsPerPage).map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-50 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900 truncate" title={product.name}>{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[120px]"><span className="block text-[14px] text-gray-500 font-normal truncate" title={product.category}>{product.category}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{String(product.stock).padStart(2, '0')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        product.status === 'in stock' ? 'text-[#1BAFAF] bg-[#eaf6f6]' :
                        product.status === 'low stock' ? 'text-orange-500 bg-orange-50' :
                        'text-red-500 bg-red-50'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{product.updated}</td>
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
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-gray-400 font-medium">No products found for "{searchTerm || activeFilter}"</span>
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
            Showing 1-{Math.min(rowsPerPage, filteredProducts.length)} of {filteredProducts.length}
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
}
