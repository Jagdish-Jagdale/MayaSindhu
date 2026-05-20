import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  FileText,
  Loader2,
  Calendar,
  Filter,
  Download,
  User,
  Clock,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import { db } from '../../../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import InvoiceModal from '../../../components/admin/offline/InvoiceModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [storeCustomers, setStoreCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pagination & Sort state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsOpen, setRowsOpen] = useState(false);
  const rowsRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'invoiceNumber', dir: 'asc' });
  const [dateFilter, setDateFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('All');
  const [amountFilterOpen, setAmountFilterOpen] = useState(false);
  const amountFilterRef = useRef(null);

  const rowOptions = [5, 10, 20, 50];

  useEffect(() => {
    const handler = (e) => {
      if (rowsRef.current && !rowsRef.current.contains(e.target)) setRowsOpen(false);
      if (amountFilterRef.current && !amountFilterRef.current.contains(e.target)) setAmountFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'storeOrders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching store orders:", error);
      toast.error("Failed to load invoice data.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'storeCustomers'), (snapshot) => {
      setStoreCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteDoc(doc(db, 'storeOrders', id));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? numToWords(n % 10000000) : '');
    };

    const totalStr = Math.round(num).toString();
    const parsedNum = parseInt(totalStr, 10);
    if (parsedNum === 0) return 'Zero';
    return 'Indian Rupee ' + numToWords(parsedNum).trim() + ' Only';
  };

  const formatA4Date = (val) => {
    if (!val) return '---';
    let date;
    if (val.toDate) {
      date = val.toDate();
    } else {
      if (typeof val === 'string' && val.includes('/')) {
        const [d, m, y] = val.split('/');
        date = new Date(`${y}-${m}-${d}`);
      } else {
        date = new Date(val);
      }
    }
    if (isNaN(date.getTime())) return val;
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleDownloadInvoice = (invoice) => {
    if (!invoice) return;

    const customerObj = storeCustomers.find(c => c.id === invoice.customerId || c.fullName === invoice.customerName) || {};
    const customerName = customerObj.fullName || invoice.customerName || '---';
    const customerAddress = customerObj.address || 'Maharashtra<br/>India';
    const customerPhone = customerObj.phone || '---';
    const customerEmail = customerObj.email || '---';

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download/print invoice.");
      return;
    }

    const itemsHtml = (invoice.items || []).map((item, index) => `
      <tr style="border-bottom: 1px solid #000;">
        <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: center; vertical-align: top;">${index + 1}</td>
        <td style="border-right: 1px solid #000; padding: 10px 12px; font-size: 13px; text-align: left; vertical-align: top;">
          <div style="font-weight: bold; color: #000;">${item.name || '---'}</div>
        </td>
        <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: center; vertical-align: top;">${(item.quantity || 0).toFixed(2)}</td>
        <td style="border-right: 1px solid #000; padding: 10px 8px; font-size: 13px; text-align: right; vertical-align: top;">${(item.rate || 0).toFixed(2)}</td>
        <td style="padding: 10px 8px; font-size: 13px; text-align: right; vertical-align: top; font-weight: bold;">${(item.amount || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoice.invoiceNumber || invoice.saleOrderNumber || invoice.id}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #000;
              padding: 15mm 20mm;
              margin: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            .company-name {
              font-size: 26px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 0 0 5px 0;
            }
            .company-details {
              font-size: 14px;
              line-height: 1.4;
              color: #000;
            }
            .invoice-title {
              font-size: 38px;
              font-family: Georgia, serif;
              font-weight: normal;
              text-transform: uppercase;
              text-align: right;
              letter-spacing: 2px;
              margin: 0;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000;
              margin-bottom: 25px;
            }
            .info-cell {
              width: 50%;
              padding: 12px;
              vertical-align: top;
              font-size: 13px;
              line-height: 1.6;
            }
            .info-sub-table {
              width: 100%;
              border-collapse: collapse;
            }
            .info-sub-table td {
              padding: 3px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000;
              margin-bottom: 25px;
            }
            .items-table th {
              background-color: #f9fafb;
              font-size: 12px;
              font-weight: bold;
              text-transform: capitalize;
              padding: 10px 8px;
            }
            .bottom-table {
              width: 100%;
              border-collapse: collapse;
              border: 1.5px solid #000;
            }
            .bottom-left-cell {
              width: 55%;
              border-right: 1.5px solid #000;
              padding: 15px;
              vertical-align: top;
              line-height: 1.5;
            }
            .bottom-right-cell {
              width: 45%;
              vertical-align: top;
              padding: 0;
            }
            .totals-table {
              width: 100%;
              border-collapse: collapse;
            }
            .totals-table td {
              padding: 10px 15px;
              font-size: 13px;
            }
            .totals-table tr.total-row {
              font-weight: bold;
              font-size: 14px;
              background-color: #f9fafb;
              border-top: 1.5px solid #000;
              border-bottom: 1.5px solid #000;
            }
            .signature-cell {
              padding: 40px 15px 15px 15px;
              text-align: center;
            }
            .signature-line {
              font-family: monospace;
              font-size: 12px;
              margin-bottom: 5px;
              letter-spacing: -1px;
              color: #000;
            }
            .signature-text {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #000;
              margin-top: 50px;
              display: block;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="vertical-align: top; width: 60%;">
                <h1 class="company-name">${customerName}</h1>
                <div class="company-details">
                  ${customerAddress}<br/>
                  ${customerPhone}<br/>
                  ${customerEmail}
                </div>
              </td>
              <td style="vertical-align: middle; text-align: right; width: 40%;">
                <h2 class="invoice-title">Tax Invoice</h2>
              </td>
            </tr>
          </table>

          <table class="info-table">
            <tr>
              <td class="info-cell" style="border-right: 1.5px solid #000; width: 50%;">
                <table class="info-sub-table">
                  <tr>
                    <td style="width: 35%;">#</td>
                    <td style="width: 65%; font-weight: bold;">: ${invoice.invoiceNumber || invoice.saleOrderNumber || '---'}</td>
                  </tr>
                  <tr>
                    <td>Invoice Date</td>
                    <td style="font-weight: bold;">: ${formatA4Date(invoice.invoiceDate || invoice.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>Terms</td>
                    <td style="font-weight: bold;">: Due on Receipt</td>
                  </tr>
                  <tr>
                    <td>Due Date</td>
                    <td style="font-weight: bold;">: ${formatA4Date(invoice.invoiceDate || invoice.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>P.O.#</td>
                    <td style="font-weight: bold;">: ${invoice.saleOrderNumber || '---'}</td>
                  </tr>
                </table>
              </td>
              <td class="info-cell" style="width: 50%;">
                <!-- Blank as requested -->
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr style="border-bottom: 1.5px solid #000;">
                <th style="width: 6%; border-right: 1px solid #000; text-align: center;">Sr No</th>
                <th style="border-right: 1px solid #000; text-align: left; padding-left: 12px;">Item & Description</th>
                <th style="width: 12%; border-right: 1px solid #000; text-align: center;">Qty</th>
                <th style="width: 15%; border-right: 1px solid #000; text-align: right; padding-right: 12px;">Rate</th>
                <th style="width: 15%; text-align: right; padding-right: 12px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table class="bottom-table">
            <tr>
              <td class="bottom-left-cell">
                <div style="font-size: 11px; font-weight: bold; color: #555; text-transform: uppercase; margin-bottom: 4px;">Total In Words</div>
                <div style="font-size: 13px; font-weight: bold; font-style: italic; color: #000;">
                  ${numberToWords(invoice.total || 0)}
                </div>
              </td>
              <td class="bottom-right-cell">
                <table class="totals-table">
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="text-align: right; color: #333; width: 50%;">Sub Total</td>
                    <td style="text-align: right; font-weight: bold; color: #000; width: 50%;">${(invoice.subTotal || invoice.total || 0).toFixed(2)}</td>
                  </tr>
                  ${invoice.tax ? `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="text-align: right; color: #333;">Tax (${invoice.tax}%)</td>
                    <td style="text-align: right; font-weight: bold; color: #000;">₹${((invoice.total || 0) * (invoice.tax / 100)).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  ${invoice.adjustment ? `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="text-align: right; color: #333;">Adjustment</td>
                    <td style="text-align: right; font-weight: bold; color: #000;">₹${(invoice.adjustment).toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td style="text-align: right;">Total</td>
                    <td style="text-align: right; color: #000;">₹${(invoice.total || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" class="signature-cell">
                      <div class="signature-text">Authorized Signature</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 60px; font-size: 13px; font-weight: bold; color: #000; font-family: 'Times New Roman', Times, serif; letter-spacing: 0.5px;">
            Thanks for your business...!
          </div>

          <div style="position: fixed; bottom: 15mm; right: 20mm; font-size: 10px; color: #777; font-family: Arial, sans-serif; white-space: nowrap;">
            Downloaded: ${formattedTimestamp}
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    );
  };

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

  const formatFilterDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredInvoices = (() => {
    let list = invoices.filter(i => {
      const matchesSearch = (i.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateFilter) {
        const invoiceDateStr = i.invoiceDate || i.saleOrderDate || formatDate(i.createdAt);
        const filterDateStr = formatFilterDate(dateFilter);
        matchesDate = invoiceDateStr === filterDateStr;
      }

      let matchesAmount = true;
      if (amountFilter && amountFilter !== 'All') {
        const total = Number(i.total) || 0;
        if (amountFilter === 'Under ₹1,000') {
          matchesAmount = total < 1000;
        } else if (amountFilter === '₹1,000 - ₹5,000') {
          matchesAmount = total >= 1000 && total <= 5000;
        } else if (amountFilter === '₹5,000 - ₹10,000') {
          matchesAmount = total >= 5000 && total <= 10000;
        } else if (amountFilter === 'Over ₹10,000') {
          matchesAmount = total > 10000;
        }
      }

      return matchesSearch && matchesDate && matchesAmount;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal = a[sortConfig.key] ?? a['saleOrderNumber'] ?? '';
        let bVal = b[sortConfig.key] ?? b['saleOrderNumber'] ?? '';

        if (sortConfig.key === 'createdAt') {
          if (aVal?.toDate) aVal = aVal.toDate();
          if (bVal?.toDate) bVal = bVal.toDate();
        } else if (sortConfig.key === 'total') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else if (sortConfig.key === 'invoiceNumber') {
          // Extract numeric suffix for proper numeric ordering (e.g. SO-00002 > SO-00001)
          const numA = parseInt((String(aVal || a.saleOrderNumber || '')).replace(/\D+/g, '')) || 0;
          const numB = parseInt((String(bVal || b.saleOrderNumber || '')).replace(/\D+/g, '')) || 0;
          return sortConfig.dir === 'asc' ? numA - numB : numB - numA;
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const totalRecords = filteredInvoices.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + rowsPerPage);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading invoice records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Invoices</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage and track customer invoices</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              TOTAL RECORDS: {totalRecords}
            </span>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-50 border-none py-2.5 pl-11 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all text-gray-400 hover:text-gray-900 relative">
            <Calendar size={16} className={dateFilter ? 'text-[#1BAFAF]' : 'text-gray-400'} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none outline-none text-[12px] font-bold text-gray-500 focus:text-[#1BAFAF] cursor-pointer w-28"
            />
            {dateFilter && (
              <button
                onClick={() => {
                  setDateFilter('');
                  setCurrentPage(1);
                }}
                className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-900"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Amount Filter */}
          <div className="relative" ref={amountFilterRef}>
            <button
              onClick={() => setAmountFilterOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-all text-gray-500 hover:text-gray-900"
            >
              <Filter size={16} className={amountFilter !== 'All' ? 'text-[#1BAFAF]' : 'text-gray-400'} />
              <span className="text-[12px] font-bold text-gray-500">
                {amountFilter === 'All' ? 'All Amounts' : amountFilter}
              </span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${amountFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {amountFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {['All', 'Under ₹1,000', '₹1,000 - ₹5,000', '₹5,000 - ₹10,000', 'Over ₹10,000'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setAmountFilter(opt);
                      setCurrentPage(1);
                      setAmountFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${amountFilter === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {opt === 'All' ? 'All Amounts' : opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-gray-100 mx-1 hidden sm:block" />
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
                {rowOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRowsPerPage(opt);
                      setCurrentPage(1);
                      setRowsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${rowsPerPage === opt ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
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

      {/* Invoices Table */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Sr No</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('invoiceNumber')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Invoice ID <SortIcon colKey="invoiceNumber" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Customer <SortIcon colKey="customerName" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Date <SortIcon colKey="createdAt" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('total')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Amount <SortIcon colKey="total" />
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Download</th>
                <th className="px-6 py-4 text-center text-[14px] font-bold text-[#1BAFAF]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {currentInvoices.length > 0 ? currentInvoices.map((invoice, index) => (
                <tr
                  key={invoice.id}
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setIsPreviewOpen(true);
                  }}
                  className="hover:bg-gray-50 group transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 min-w-[150px]">
                    <span className="text-[14px] font-bold text-gray-900 uppercase">
                      {invoice.invoiceNumber || invoice.saleOrderNumber || `#${invoice.id.slice(-6)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] text-gray-500 font-medium">{invoice.customerName || 'Customer'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 font-medium">
                    {invoice.invoiceDate || invoice.saleOrderDate || formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] text-gray-500 font-medium">₹{(invoice.total || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(invoice);
                        }}
                        className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 rounded-lg transition-all active:scale-90"
                        title="Download Invoice"
                      >
                        <Download size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(invoice.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <FileText size={32} />
                    </div>
                    <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No Invoices found</p>
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-semibold text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* View Preview Modal */}
      {isPreviewOpen && selectedInvoice && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Invoice Details</h2>
                <p className="text-[12px] text-gray-400 font-medium">Record Information</p>
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
              {/* Summary Info */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Invoice ID</p>
                    <p className="font-bold text-gray-900 uppercase">{selectedInvoice.invoiceNumber || selectedInvoice.saleOrderNumber || '---'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                    <p className="font-bold text-gray-700">{selectedInvoice.invoiceDate || selectedInvoice.saleOrderDate || formatDate(selectedInvoice.createdAt)}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</p>
                    <p className="font-bold text-gray-700">{selectedInvoice.customerName || '---'}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Items Breakdown</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="px-4 py-3">Item Details</th>
                        <th className="px-4 py-3 text-center w-20">Qty</th>
                        <th className="px-4 py-3 text-right w-24">Rate</th>
                        <th className="px-4 py-3 text-right w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item, index) => (
                          <tr key={index} className="text-gray-700 font-medium">
                            <td className="px-4 py-3">{item.name || '---'}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900">{item.quantity || 0}</td>
                            <td className="px-4 py-3 text-right">₹{(item.rate || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900">₹{(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-400">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="border-t border-gray-100 pt-6 space-y-3 max-w-sm ml-auto">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sub Total</span>
                  <span className="text-gray-900">₹{(selectedInvoice.subTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tax (GST)</span>
                  <span className="text-gray-900">{selectedInvoice.tax || 0}%</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Adjustment</span>
                  <span className="text-gray-900">₹{(selectedInvoice.adjustment || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black border-t border-dashed border-gray-200 pt-3">
                  <span className="text-gray-900">Total ( ₹ )</span>
                  <span className="text-[#1BAFAF]">₹{(selectedInvoice.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[13px] font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                className="flex items-center gap-2 px-8 py-2.5 bg-[#1BAFAF] text-white rounded-xl text-[13px] font-bold hover:bg-[#158e8e] transition-all active:scale-95 shadow-lg shadow-[#1BAFAF]/20"
              >
                <Download size={16} strokeWidth={2.5} />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
