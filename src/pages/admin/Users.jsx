import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, ArrowUpRight, X, ChevronDown } from 'lucide-react';

const Users = () => {
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

  const customers = [
    { name: 'John Smith', address: '123 Maple St, NY', phone: '+1 234-567-8901', registered_at: '12/03/2024', avatar: 'https://i.pravatar.cc/150?u=john', city: 'NY' },
    { name: 'Jane Doe', address: '456 Oak Ave, CA', phone: '+1 987-654-3210', registered_at: '15/03/2024', avatar: 'https://i.pravatar.cc/150?u=jane', city: 'CA' },
    { name: 'Bob Johnson', address: '789 Pine Rd, TX', phone: '+1 555-012-3456', registered_at: '18/03/2024', avatar: 'https://i.pravatar.cc/150?u=bob', city: 'TX' },
    { name: 'Aditi Sharma', address: 'B-402 Green Valey, Mumbai', phone: '+91 98223 34455', registered_at: '01/04/2024', avatar: 'https://i.pravatar.cc/150?u=aditi', city: 'Mumbai' },
    { name: 'Rahul Varma', address: 'Flat 10, Sunrise Apts, Pune', phone: '+91 77665 54433', registered_at: '05/04/2024', avatar: 'https://i.pravatar.cc/150?u=rahul', city: 'Pune' },
    { name: 'Priya Iyer', address: 'H-12 Hillside, Bangalore', phone: '+91 99001 12233', registered_at: '10/04/2024', avatar: 'https://i.pravatar.cc/150?u=priya', city: 'Bangalore' },
    { name: 'Sanjay Gupta', address: 'Sector 15, Gurgaon', phone: '+91 98110 55667', registered_at: '12/04/2024', avatar: 'https://i.pravatar.cc/150?u=sanjay', city: 'Gurgaon' },
    { name: 'Megha Rao', address: 'Jupiter Apts, Hyderabad', phone: '+91 94400 33221', registered_at: '13/04/2024', avatar: 'https://i.pravatar.cc/150?u=megha', city: 'Hyderabad' },
    { name: 'Karthik S.', address: 'Old Market St, Chennai', phone: '+91 98400 77889', registered_at: '14/04/2024', avatar: 'https://i.pravatar.cc/150?u=karthik', city: 'Chennai' },
    { name: 'Deepa Patel', address: 'Navrangpura, Ahmedabad', phone: '+91 98250 99887', registered_at: '15/04/2024', avatar: 'https://i.pravatar.cc/150?u=deepa', city: 'Ahmedabad' },
    { name: 'Vikram Singh', address: 'Civil Lines, Jaipur', phone: '+91 94140 11223', registered_at: '15/04/2024', avatar: 'https://i.pravatar.cc/150?u=vikram', city: 'Jaipur' },
    { name: 'Anjali Das', address: 'Salt Lake City, Kolkata', phone: '+91 98310 44556', registered_at: '15/04/2024', avatar: 'https://i.pravatar.cc/150?u=anjali', city: 'Kolkata' },
  ];

  const filterOptions = ['All', 'NY', 'CA', 'TX', 'Mumbai', 'Pune', 'Bangalore', 'Gurgaon', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Jaipur', 'Kolkata'];

  const filteredCustomers = (() => {
    let list = customers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || customer.city === activeFilter;
      return matchesSearch && matchesFilter;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        const cmp = aVal.toString().localeCompare(bVal.toString());
        return sortConfig.dir === 'asc' ? cmp : -cmp;
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

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              Registered Customers
            </h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Manage your e-commerce customer database and profiles</p>
          </div>

          <button className="flex items-center gap-2 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white px-4 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-sm shadow-[#1BAFAF]/10 active:scale-95">
            <Plus size={16} strokeWidth={2.5} />
            Add Customer
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
            placeholder="Search by name, phone or address..."
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
              {activeFilter !== 'All' ? `City: ${activeFilter}` : 'Filters'}
              {activeFilter !== 'All' && (
                <span
                  onClick={(e) => { e.stopPropagation(); setActiveFilter('All'); }}
                  className="ml-1 hover:text-red-400"
                >
                  <X size={12} strokeWidth={2.5} />
                </span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter by City</p>
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

      {/* Content Container with tighter spacing */}
      <div className="space-y-3">
        {/* Robust HTML Table Structure */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Customer <SortIcon colKey="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('address')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Address <SortIcon colKey="address" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Phone <SortIcon colKey="phone" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('registered_at')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Registered at <SortIcon colKey="registered_at" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.slice(0, rowsPerPage).map((customer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 max-w-[180px]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-50 flex-shrink-0">
                          <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900 truncate" title={customer.name}>{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[180px]"><span className="block text-[14px] text-gray-500 font-normal truncate" title={customer.address}>{customer.address}</span></td>
                    <td className="px-6 py-4 max-w-[140px]"><span className="block text-[14px] text-gray-500 font-normal truncate" title={customer.phone}>{customer.phone}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-normal">{customer.registered_at}</td>
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
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-gray-400 font-medium">No results found for "{searchTerm}"</span>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-[#1BAFAF] text-[13px] font-semibold hover:underline"
                      >
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
            Showing 1-{Math.min(rowsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
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

export default Users;
