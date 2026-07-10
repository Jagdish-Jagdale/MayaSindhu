/**
 * File: WorkshopBookings.jsx
 * Description: Admin management details view page displaying customers who have booked slots for a specific artisan workshop.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import {
  doc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import {
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Clock,
  Ticket,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateHelper';
import CustomSelect from '../../../components/common/CustomSelect';

export default function WorkshopBookings() {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const { isCollapsed } = useAdminUI();

  // Workshop Details State
  const [workshop, setWorkshop] = useState(null);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);

  // Bookings List State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, free
  const [participantsFilter, setParticipantsFilter] = useState('all'); // all, 1, 2, 3, 4, 5+
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, nameAsc, nameDesc
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, participantsFilter, sortBy, rowsPerPage]);

  // Load Workshop details
  useEffect(() => {
    if (!workshopId) return;
    const docRef = doc(db, 'workshops', workshopId);
    const unsubWorkshop = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setWorkshop({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error("Workshop not found");
        navigate('/admin/settings/workshops');
      }
      setLoadingWorkshop(false);
    }, (err) => {
      console.error("Error loading workshop details:", err);
      toast.error("Error loading workshop details");
      setLoadingWorkshop(false);
    });

    return () => unsubWorkshop();
  }, [workshopId, navigate]);

  // Load bookings for this workshop name
  useEffect(() => {
    if (!workshop?.name) return;
    setLoadingBookings(true);

    const bookingsRef = collection(db, 'workshopBookings');
    // First, try standard query with ordering (requires composite index)
    const q = query(
      bookingsRef,
      where('workshopName', '==', workshop.name),
      orderBy('createdAt', 'desc')
    );

    const unsubBookings = onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setBookings(list);
      setLoadingBookings(false);
    }, (err) => {
      console.warn("Index not found or sorting failed, falling back to client-side sorting", err);

      // Fallback query matching only workshopName (doesn't require composite index)
      const fallbackQ = query(
        bookingsRef,
        where('workshopName', '==', workshop.name)
      );

      const unsubFallback = onSnapshot(fallbackQ, (snap) => {
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        // Client side sort descending by createdAt
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setBookings(list);
        setLoadingBookings(false);
      }, (fallbackErr) => {
        console.error("Fallback error loading bookings:", fallbackErr);
        toast.error("Failed to load bookings");
        setLoadingBookings(false);
      });

      return () => unsubFallback();
    });

    return () => unsubBookings();
  }, [workshop?.name]);

  // Format Date for booking creation timestamp
  const formatBookingDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculations for Stats
  const totalBookings = bookings.length;
  const totalSeatsBooked = bookings.reduce((sum, b) => sum + (parseInt(b.participants) || 1), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmountPaid) || 0), 0);
  const ticketFee = workshop?.fees && Number(workshop.fees) > 0 ? `₹${workshop.fees}` : 'Free';

  // Search & Filtering Logic
  const filteredBookings = bookings.filter(b => {
    const nameMatch = b.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const emailMatch = b.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const phoneMatch = b.phone?.includes(searchTerm) || false;
    const addressMatch = b.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = nameMatch || emailMatch || phoneMatch || addressMatch;

    const matchesStatus = statusFilter === 'all' ? true : b.status === statusFilter;

    let matchesParticipants = true;
    const pCount = parseInt(b.participants) || 1;
    if (participantsFilter !== 'all') {
      if (participantsFilter === '5+') {
        matchesParticipants = pCount >= 5;
      } else {
        matchesParticipants = pCount === parseInt(participantsFilter);
      }
    }

    return matchesSearch && matchesStatus && matchesParticipants;
  });

  // Sorting Logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'newest') {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    }
    if (sortBy === 'oldest') {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    }
    if (sortBy === 'nameAsc') {
      return (a.fullName || '').localeCompare(b.fullName || '');
    }
    if (sortBy === 'nameDesc') {
      return (b.fullName || '').localeCompare(a.fullName || '');
    }
    return 0;
  });

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedBookings.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedBookings.length / rowsPerPage) || 1;

  if (loadingWorkshop || loadingBookings) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading booking records...</p>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`}
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/settings/workshops')}
            className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-gray-600 transition-all"
            title="Back to Workshops List"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight truncate block max-w-[300px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]" title={workshop?.name}>
              {workshop?.name}
            </h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={13} /> {workshop?.date ? formatDate(workshop.date) : 'No Date'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-gray-600">
                <Ticket size={13} /> Price: {ticketFee}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Total Bookings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Ticket size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</h3>
          </div>
        </div>

        {/* Card 2: Total Seats Booked */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Slots Registered</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSeatsBooked}</h3>
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <DollarSign size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-center gap-4 transition-all hover:shadow-md">
        {/* Search */}
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white border border-transparent focus:border-gray-200 transition-all font-medium text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Filters and Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Participants Filter */}
          <div className="w-full sm:w-40">
            <CustomSelect
              value={participantsFilter}
              onChange={setParticipantsFilter}
              options={[
                { value: 'all', label: 'All Participants' },
                { value: '1', label: '1 Participant' },
                { value: '2', label: '2 Participants' },
                { value: '3', label: '3 Participants' },
                { value: '4', label: '4 Participants' },
                { value: '5+', label: '5+ Participants' }
              ]}
              valuePrefix="Guests:"
              minimal={true}
              className="w-full"
            />
          </div>

          {/* Sort By Filter */}
          <div className="w-full sm:w-44">
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'newest', label: 'Newest Booked' },
                { value: 'oldest', label: 'Oldest Booked' },
                { value: 'nameAsc', label: 'Name (A-Z)' },
                { value: 'nameDesc', label: 'Name (Z-A)' }
              ]}
              valuePrefix="Sort:"
              minimal={true}
              className="w-full"
            />
          </div>

          {/* Rows Per Page */}
          <div className="w-full sm:w-32">
            <CustomSelect
              value={rowsPerPage}
              onChange={(val) => setRowsPerPage(Number(val))}
              options={[
                { value: 5, label: '5 rows' },
                { value: 10, label: '10 rows' },
                { value: 25, label: '25 rows' },
                { value: 50, label: '50 rows' }
              ]}
              valuePrefix="Rows:"
              minimal={true}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/20">
                <th className="pl-8 pr-4 py-5 text-[13px] font-bold text-[#1BAFAF] whitespace-nowrap w-[70px]">Sr No</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] min-w-[200px]">Customer Details</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] min-w-[180px]">Contact Info</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] whitespace-nowrap">Date Booked</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] text-center whitespace-nowrap w-[100px]">Guests</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] text-right whitespace-nowrap w-[120px]">Total Paid</th>
                <th className="px-4 py-5 text-[13px] font-bold text-[#1BAFAF] text-center whitespace-nowrap w-[110px]">Status</th>
                <th className="pl-4 pr-8 py-5 text-[13px] font-bold text-[#1BAFAF] min-w-[150px]">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {currentRows.length > 0 ? (
                currentRows.map((booking, idx) => {
                  const displayIndex = indexOfFirstRow + idx + 1;
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/40 transition-colors group">
                      <td className="pl-8 pr-4 py-5 text-[13px] font-medium text-gray-400 whitespace-nowrap">
                        {displayIndex.toString().padStart(2, '0')}
                      </td>
                      <td className="px-4 py-5 max-w-[160px]">
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#1BAFAF] transition-colors truncate block w-full" title={booking.fullName || 'Anonymous Client'}>
                            {booking.fullName}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5 min-w-0" title={booking.address || 'No Address Provided'}>
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate block w-full">{booking.address}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 max-w-[150px]">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12px] text-gray-600 font-semibold flex items-center gap-1 min-w-0" title={booking.email || 'N/A'}>
                            <Mail size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate block w-full">{booking.email}</span>
                          </span>
                          <span className="text-[12px] text-gray-600 font-semibold flex items-center gap-1 min-w-0" title={booking.phone || 'N/A'}>
                            <Phone size={11} className="text-gray-400 shrink-0" />
                            <span className="truncate block w-full">{booking.phone}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 whitespace-nowrap">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-1">
                          <Clock size={11} className="text-gray-400 shrink-0" />
                          {formatBookingDate(booking.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 text-[12px] font-bold text-gray-700 bg-gray-100 rounded-full inline-block">
                          {booking.participants || 1}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-right whitespace-nowrap">
                        <span className="text-[13px] font-bold text-gray-900">
                          ₹{(Number(booking.totalAmountPaid) || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center whitespace-nowrap">
                        {booking.status === 'paid' ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="pl-4 pr-8 py-5">
                        {booking.razorpayPaymentId ? (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-lg w-fit transition-colors">
                            <span>{booking.razorpayPaymentId}</span>
                            <a
                              href={`https://dashboard.razorpay.com/app/payments/${booking.razorpayPaymentId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-[#1BAFAF] transition-colors shrink-0"
                              title="View in Razorpay"
                            >
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText size={40} className="text-gray-100" />
                      <p className="text-[14px] font-medium text-gray-400 tracking-wide">
                        {searchTerm || statusFilter !== 'all' || participantsFilter !== 'all'
                          ? 'No bookings match your filter criteria.'
                          : 'No bookings received for this workshop yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-100">
        <div className="text-[12px] text-gray-400 font-semibold">
          Showing {sortedBookings.length > 0 ? indexOfFirstRow + 1 : 0} to {Math.min(indexOfLastRow, sortedBookings.length)} of {sortedBookings.length} records
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${currentPage === i + 1
                    ? 'bg-[#1BAFAF] text-white shadow-sm shadow-[#1BAFAF]/20'
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
        )}
      </div>
    </div>
  );
}
