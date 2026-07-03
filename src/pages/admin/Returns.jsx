/**
 * File: Returns.jsx
 * Description: Admin online manager page rendering e-commerce customer lists, returns tables, review grids, and system config settings.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Search, 
  Loader2, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Ticket as TicketIcon
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import CustomSelect from '../../components/common/CustomSelect';

export default function Returns() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Sorting states
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'exchangeTickets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(data);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load exchange tickets.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (ticketId, orderId, actionType) => {
    try {
      const ticketStatus = actionType === 'Approve' ? 'Accepted' : 'Rejected';
      const orderStatus = actionType === 'Approve' ? 'Exchange Req Accept' : 'Exchange Req Reject';

      // 1. Update exchange ticket
      await updateDoc(doc(db, 'exchangeTickets', ticketId), {
        status: ticketStatus
      });

      // 2. Update reference order
      await updateDoc(doc(db, 'orders', orderId), {
        status: orderStatus
      });

      toast.success(`Exchange request ticket successfully ${ticketStatus.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

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
      return (
        <ChevronDown size={12} className="text-gray-300 ml-1 inline-block" strokeWidth={2.5} />
      );
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
    ) : (
      <ChevronDown size={12} className="text-[#1BAFAF] ml-1 inline-block" strokeWidth={3} />
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

  // Filter logic
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.ticketId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.orderDisplayId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      if (t.createdAt) {
        const ticketDate = t.createdAt.toDate();
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = ticketDate >= startDate && ticketDate <= endDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'createdAt') {
      valA = a.createdAt?.seconds || 0;
      valB = b.createdAt?.seconds || 0;
    }

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalRecords = filteredTickets.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentItems = sortedTickets.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, rowsPerPage]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading exchange tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-20" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Exchange Tickets</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Monitor and manage product exchange tickets raised by users</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL TICKETS: {totalRecords}
            </span>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md p-2 flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative group w-full xl:max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Order ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2.5 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#1BAFAF]/30 transition-all font-medium"
          />
        </div>

        {/* Filters inline */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Date Range */}
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-transparent text-[12px] font-medium px-2 py-1.5 rounded-lg border-none outline-none transition-all cursor-pointer text-gray-600 focus:text-gray-900"
            />
            <span className="text-gray-300">-</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-transparent text-[12px] font-medium px-2 py-1.5 rounded-lg border-none outline-none transition-all cursor-pointer text-gray-600 focus:text-gray-900"
            />
          </div>

          {/* Status Dropdown */}
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
            className="w-[140px]"
            minimal={true}
          />

          {/* Clear Filters (only show if active) */}
          {(dateRange.start || dateRange.end || statusFilter !== 'All') && (
            <button 
              onClick={() => {
                setDateRange({ start: '', end: '' });
                setStatusFilter('All');
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Clear Filters"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

          {/* Rows */}
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
      </div>

      {/* Tickets Table */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('ticketId')}>
                  <div className="flex items-center gap-1">
                    Ticket ID
                    <SortIndicator field="ticketId" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('orderDisplayId')}>
                  <div className="flex items-center gap-1">
                    Order ID
                    <SortIndicator field="orderDisplayId" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center gap-1">
                    Customer Name
                    <SortIndicator field="customerName" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    Date Raised
                    <SortIndicator field="createdAt" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF] cursor-pointer select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    <SortIndicator field="status" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Details</th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {currentItems.length > 0 ? currentItems.map((item, idx) => {
                return (
                  <tr key={item.id} className="hover:bg-gray-50 group transition-colors">
                    <td className="px-6 py-5">
                      <span className="text-[13px] font-bold text-gray-300">{(startIndex + idx + 1).toString().padStart(2, '0')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-semibold text-gray-800">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#1BAFAF]/10 text-[#1BAFAF] border border-[#1BAFAF]/20 uppercase tracking-wider">
                        {item.ticketId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-bold text-gray-500">
                      {item.orderDisplayId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-gray-500 font-medium">{item.customerName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        item.status === 'Accepted' ? 'bg-green-50 text-green-600 border border-green-100' :
                        'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedTicket(item);
                          setIsPreviewOpen(true);
                        }}
                        className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(item.id, item.orderId, 'Approve')}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(item.id, item.orderId, 'Reject')}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <TicketIcon size={32} />
                    </div>
                    <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No exchange tickets found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-end px-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-semibold text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Preview Modal */}
      {isPreviewOpen && selectedTicket && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsPreviewOpen(false); closeFn(); } }}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Ticket: {selectedTicket.ticketId}</h2>
                <p className="text-[12px] text-gray-400 font-medium">Order Reference: {selectedTicket.orderDisplayId}</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-[14px]">
              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</p>
                  <p className="font-bold text-gray-900">{selectedTicket.customerName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ticket Status</p>
                  <p className="font-bold text-gray-900">{selectedTicket.status}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Requested Items</p>
                <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  {selectedTicket.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-b-0">
                      <div>
                        <p className="font-bold text-gray-800 text-[13px]">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty || item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-800 text-[13px]">₹{item.price || item.rate}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              {selectedTicket.reason && (
                <div className="space-y-1 bg-amber-50/30 p-5 rounded-2xl border border-amber-100/30">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Reason for Exchange</p>
                  <p className="text-gray-700 font-medium text-xs leading-relaxed">{selectedTicket.reason}</p>
                </div>
              )}

              {/* Image Preview */}
              {selectedTicket.image && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product Condition Image</p>
                  <div className="max-w-md rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={selectedTicket.image} alt="Exchange product condition" className="w-full h-auto object-contain max-h-[300px]" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-8 py-3 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white text-[12px] font-bold uppercase tracking-widest rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
