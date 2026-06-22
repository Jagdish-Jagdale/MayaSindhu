import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Layers, 
  ArrowUpRight, 
  Package, 
  UserPlus,
  Loader2,
  PieChart as PieChartIcon,
  Activity,
  IndianRupee,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Tags
} from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#1BAFAF', '#B18968', '#D4AF37', '#178E8E', '#2D3748'];

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = val.toString().replace(/[^\d.]/g, '');
  return str ? Number(str) : 0;
};

const formatIndianCurrency = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export default function Reports() {
  const location = useLocation();
  const isOffline = location.pathname.includes('/admin-offline');

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); 
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'customers', 'products', 'categories'

  // Raw fetched data from database
  const [allOrders, setAllOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Custom Dropdown Open/Close states and refs
  const [customerOpen, setCustomerOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const customerRef = useRef(null);
  const productRef = useRef(null);
  const categoryRef = useRef(null);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) setCustomerOpen(false);
      if (productRef.current && !productRef.current.contains(e.target)) setProductOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Pagination States for reports tabs
  const [reportCurrentPage, setReportCurrentPage] = useState(1);
  const [reportRowsPerPage, setReportRowsPerPage] = useState(10);

  // Load data based on current page mode (online vs offline)
  useEffect(() => {
    setLoading(true);
    const ordersCollection = isOffline ? 'storeOrders' : 'orders';
    const customersCollection = isOffline ? 'storeCustomers' : 'users';

    // 1. Fetch Orders
    const ordersQuery = query(collection(db, ordersCollection), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllOrders(orders);
    }, (error) => {
    });

    // 2. Fetch Customers
    const unsubCustomers = onSnapshot(collection(db, customersCollection), (snapshot) => {
      const custs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(custs);
    }, (error) => {
    });

    // 3. Fetch Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    }, (error) => {
    });

    // 4. Fetch Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubCustomers();
      unsubProducts();
      unsubCategories();
    };
  }, [isOffline]);

  // Helper to determine main category of a product
  const getProductCategory = (prodName) => {
    const prod = products.find(p => p.name === prodName);
    if (!prod) return 'Uncategorized';
    
    let cat = categories.find(c => c.id === prod.categoryId);
    
    // Traverse up to find the root/main category
    let maxDepth = 10;
    while (cat && cat.parentId && maxDepth > 0) {
      const parent = categories.find(c => c.id === cat.parentId);
      if (parent) {
        cat = parent;
      } else {
        break;
      }
      maxDepth--;
    }
    
    return cat ? (cat.name || 'Uncategorized') : 'Uncategorized';
  };

  // Populate filter selectors dynamically
  const uniqueCustomers = useMemo(() => {
    const names = new Set();
    customers.forEach(c => { if (c.fullName) names.add(c.fullName); });
    return Array.from(names).sort();
  }, [customers]);

  const uniqueProducts = useMemo(() => {
    const names = new Set();
    products.forEach(p => { if (p.name) names.add(p.name); });
    allOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => { if (item.name) names.add(item.name); });
      } else if (o.productName) { names.add(o.productName); }
    });
    return Array.from(names).sort();
  }, [allOrders, products]);

  const uniqueCategories = useMemo(() => {
    const names = new Set();
    categories.forEach(cat => { if (cat.name) names.add(cat.name); });
    products.forEach(p => { if (p.category) names.add(p.category); });
    return Array.from(names).sort();
  }, [categories, products]);

  // Apply filters on orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      // 1. Quick Time range filter (only applies if no custom date is selected)
      if (!startDate && !endDate && timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
        if (orderDate && orderDate < cutoff) return false;
      }

      // 2. Custom Date Range Filters
      const orderDate = o.createdAt?.toDate ? o.createdAt.toDate() : (o.createdAt ? new Date(o.createdAt) : null);
      if (orderDate) {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
      }

      // 3. Customer Filter
      if (selectedCustomer !== 'All' && o.customerName !== selectedCustomer) return false;

      // 4. Product Filter
      if (selectedProduct !== 'All') {
        if (o.items && Array.isArray(o.items)) {
          if (!o.items.some(item => item.name === selectedProduct)) return false;
        } else if (o.productName !== selectedProduct) return false;
      }

      // 5. Category Filter
      if (selectedCategory !== 'All') {
        if (o.items && Array.isArray(o.items)) {
          if (!o.items.some(item => getProductCategory(item.name) === selectedCategory)) return false;
        } else if (getProductCategory(o.productName) !== selectedCategory) return false;
      }

      return true;
    });
  }, [allOrders, timeRange, startDate, endDate, selectedCustomer, selectedProduct, selectedCategory, products]);

  // Aggregate stats based on filtered orders
  const stats = useMemo(() => {
    const totalRev = filteredOrders.reduce((sum, order) => sum + parseCurrency(order.total), 0);
    const totalProfit = totalRev * 0.35; // Assuming 35% margin for reports
    const avgValue = filteredOrders.length > 0 ? totalRev / filteredOrders.length : 0;
    return {
      revenue: totalRev,
      profit: totalProfit,
      orders: filteredOrders.length,
      avgValue: avgValue,
      successRate: '94%'
    };
  }, [filteredOrders]);

  // AreaChart trend data based on filtered orders
  const reportData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return [...Array(days)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const dayOrders = filteredOrders.filter(o => {
        if (!o.createdAt) return false;
        const oDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return oDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === label;
      });
      const rev = dayOrders.reduce((sum, o) => sum + parseCurrency(o.total), 0);
      return {
        name: label,
        revenue: rev,
        profit: rev * 0.35,
        orders: dayOrders.length
      };
    });
  }, [filteredOrders, timeRange]);

  // Customer-wise aggregated reports
  const customerSalesData = useMemo(() => {
    const totals = {};
    filteredOrders.forEach(o => {
      const name = o.customerName || 'Walk-in Customer';
      const amt = parseCurrency(o.total);
      let qty = o.items && Array.isArray(o.items) ? o.items.reduce((sum, item) => sum + (Number(item.quantity) || Number(item.qty) || 1), 0) : (Number(o.quantity) || Number(o.qty) || 1);
      
      if (!totals[name]) {
        totals[name] = { name, ordersCount: 0, itemsCount: 0, totalSpent: 0 };
      }
      totals[name].ordersCount += 1;
      totals[name].itemsCount += qty;
      totals[name].totalSpent += amt;
    });
    return Object.values(totals).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredOrders]);

  // Product-wise aggregated reports
  const productSalesData = useMemo(() => {
    const totals = {};
    filteredOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const name = item.name || 'Unknown Product';
          const qty = Number(item.quantity) || Number(item.qty) || 1;
          const amt = parseCurrency(item.amount) || (parseCurrency(item.rate || item.price) * qty);
          const cat = getProductCategory(name);
          if (!totals[name]) totals[name] = { name, category: cat, qtySold: 0, totalSales: 0 };
          totals[name].qtySold += qty;
          totals[name].totalSales += amt;
        });
      } else if (o.productName) {
        const name = o.productName;
        const qty = Number(o.quantity) || Number(o.qty) || 1;
        const amt = parseCurrency(o.total);
        const cat = getProductCategory(name);
        if (!totals[name]) totals[name] = { name, category: cat, qtySold: 0, totalSales: 0 };
        totals[name].qtySold += qty;
        totals[name].totalSales += amt;
      }
    });
    return Object.values(totals).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredOrders, products]);

  // Category-wise aggregated reports
  const categorySalesData = useMemo(() => {
    const totals = {};
    filteredOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const cat = getProductCategory(item.name);
          const qty = Number(item.quantity) || Number(item.qty) || 1;
          const amt = parseCurrency(item.amount) || (parseCurrency(item.rate || item.price) * qty);
          if (!totals[cat]) totals[cat] = { name: cat, qtySold: 0, totalSales: 0 };
          totals[cat].qtySold += qty;
          totals[cat].totalSales += amt;
        });
      } else if (o.productName) {
        const cat = getProductCategory(o.productName);
        const qty = Number(o.quantity) || Number(o.qty) || 1;
        const amt = parseCurrency(o.total);
        if (!totals[cat]) totals[cat] = { name: cat, qtySold: 0, totalSales: 0 };
        totals[cat].qtySold += qty;
        totals[cat].totalSales += amt;
      }
    });
    return Object.values(totals).sort((a, b) => b.qtySold - a.qtySold);
  }, [filteredOrders, products, categories]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCustomer('All');
    setSelectedProduct('All');
    setSelectedCategory('All');
    setTimeRange('all');
  };

  // Excel Export Handler
  const exportToExcel = () => {
    const overviewData = [
      ['MAYA SINDHU REPORTS SUMMARY'],
      ['Report Mode', isOffline ? 'Offline Store Panel' : 'E-Commerce Online Panel'],
      ['Date Range', `${startDate || 'Start'} to ${endDate || 'End'}`],
      ['Filtered Customer', selectedCustomer],
      ['Filtered Product', selectedProduct],
      ['Filtered Category', selectedCategory],
      [],
      ['Metric', 'Value'],
      ['Gross Revenue (INR)', stats.revenue],
      ['Estimated Profit (35% Margin)', stats.profit],
      ['Total Orders Count', stats.orders],
      ['Average Order Value (INR)', stats.avgValue]
    ];

    const ordersDataExport = filteredOrders.map((o, idx) => ({
      'Sr No': idx + 1,
      'Order ID': o.saleOrderNumber || o.orderId || o.id,
      'Customer Name': o.customerName || 'Walk-in Customer',
      'Items': o.items ? o.items.map(i => `${i.name} (x${i.quantity})`).join(', ') : (o.productName || 'Handmade Creation'),
      'Date': o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN') : new Date(o.createdAt).toLocaleDateString('en-IN')) : 'N/A',
      'Status': o.status || 'Delivered',
      'Amount (INR)': parseCurrency(o.total),
      'Profit (INR)': parseCurrency(o.total) * 0.35
    }));

    const customerDataExport = customerSalesData.map((c, idx) => ({
      'Sr No': idx + 1,
      'Customer Name': c.name,
      'Orders Placed': c.ordersCount,
      'Total Items Bought': c.itemsCount,
      'Total Purchases (INR)': c.totalSpent,
      'Profit Contribution (INR)': c.totalSpent * 0.35
    }));

    const productsDataExport = productSalesData.map((p, idx) => ({
      'Sr No': idx + 1,
      'Product Name': p.name,
      'Category': p.category,
      'Quantity Sold': p.qtySold,
      'Total Revenue (INR)': p.totalSales,
      'Profit (INR)': p.totalSales * 0.35
    }));

    const categoriesDataExport = categorySalesData.map((c, idx) => ({
      'Sr No': idx + 1,
      'Category Name': c.name,
      'Items Sold': c.qtySold,
      'Total Revenue (INR)': c.totalSales,
      'Profit (INR)': c.totalSales * 0.35
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), 'Overview Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordersDataExport), 'Detailed Orders');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerDataExport), 'Customer Sales');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productsDataExport), 'Product Sales');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoriesDataExport), 'Category Sales');
    
    XLSX.writeFile(wb, `MayaSindhu_Report_${isOffline ? 'Offline' : 'Online'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Export Handler
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(27, 175, 175); // Teal brand color
    doc.text('MAYA SINDHU', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text(`${isOffline ? 'Offline In-Store' : 'E-Commerce Online'} Reports & Insights`, 14, 28);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 35);
    doc.text(`Period: ${startDate || 'All Time'} to ${endDate || 'All Time'}`, 14, 40);
    doc.text(`Filters: Customer: ${selectedCustomer} | Product: ${selectedProduct} | Category: ${selectedCategory}`, 14, 45);
    
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 48, 196, 48);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text('KEY METRICS SUMMARY:', 14, 56);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Gross Revenue: ${formatIndianCurrency(stats.revenue)}`, 16, 63);
    doc.text(`Estimated Profit (35% Margin): ${formatIndianCurrency(stats.profit)}`, 16, 68);
    doc.text(`Total Orders: ${stats.orders}`, 16, 73);
    doc.text(`Average Order Value: ${formatIndianCurrency(stats.avgValue)}`, 16, 78);
    
    let tableHeaders = [];
    let tableBody = [];
    let tableTitle = '';
    
    const startY = 88;
    
    if (activeTab === 'overview') {
      tableTitle = 'Transactions List (Top 30):';
      tableHeaders = [['Sr No', 'Order ID', 'Customer', 'Date', 'Status', 'Total']];
      tableBody = filteredOrders.slice(0, 30).map((o, idx) => [
        idx + 1,
        o.saleOrderNumber || o.orderId || o.id.slice(-6),
        o.customerName || 'Walk-in Customer',
        o.createdAt ? (o.createdAt.toDate ? o.createdAt.toDate().toLocaleDateString('en-IN') : new Date(o.createdAt).toLocaleDateString('en-IN')) : 'N/A',
        o.status || 'Delivered',
        formatIndianCurrency(parseCurrency(o.total))
      ]);
    } else if (activeTab === 'customers') {
      tableTitle = 'Customer wise Sales Report:';
      tableHeaders = [['Sr No', 'Customer Name', 'Orders Placed', 'Items Bought', 'Total Purchases']];
      tableBody = customerSalesData.map((c, idx) => [
        idx + 1,
        c.name,
        c.ordersCount,
        c.itemsCount,
        formatIndianCurrency(c.totalSpent)
      ]);
    } else if (activeTab === 'products') {
      tableTitle = 'Product wise Sales Report:';
      tableHeaders = [['Sr No', 'Product Name', 'Category', 'Quantity Sold', 'Revenue Generated']];
      tableBody = productSalesData.map((p, idx) => [
        idx + 1,
        p.name,
        p.category,
        p.qtySold,
        formatIndianCurrency(p.totalSales)
      ]);
    } else if (activeTab === 'categories') {
      tableTitle = 'Category wise Sales Report:';
      tableHeaders = [['Sr No', 'Category Name', 'Items Sold', 'Total Revenue']];
      tableBody = categorySalesData.map((c, idx) => [
        idx + 1,
        c.name,
        c.qtySold,
        formatIndianCurrency(c.totalSales)
      ]);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(tableTitle, 14, startY);
    
    doc.autoTable({
      startY: startY + 4,
      head: tableHeaders,
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [27, 175, 175] },
      styles: { fontSize: 8 },
    });
    
    if (activeTab === 'overview' && filteredOrders.length > 30) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`* Showing top 30 records out of ${filteredOrders.length} total filtered transactions in PDF.`, 14, doc.lastAutoTable.finalY + 8);
    }
    
    doc.save(`MayaSindhu_Report_${isOffline ? 'Offline' : 'Online'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const paginate = (data, page, limit) => {
    const start = (page - 1) * limit;
    return data.slice(start, start + limit);
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Compiling Report Analysis...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { name: isOffline ? 'Gross In-Store Sales' : 'Gross Revenue', value: formatIndianCurrency(stats.revenue), icon: IndianRupee, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Avg. Order Value', value: formatIndianCurrency(stats.avgValue), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            {isOffline ? 'In-Store Reports & Insights' : 'E-Commerce Reports & Insights'}
          </h1>
          <p className="text-[12px] text-gray-400 font-medium">Detailed breakdown of your store's financial performance</p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            {['7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setStartDate('');
                  setEndDate('');
                }}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  timeRange === range && !startDate && !endDate
                    ? 'bg-[#1BAFAF] text-white' 
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-all shadow-sm"
          >
            <Download size={14} />
            Export Excel
          </button>
          
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-[#1BAFAF] text-white px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-[#158e8e] transition-all shadow-sm"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-50 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="text-[#1BAFAF]" size={16} />
            <h3 className="text-[12px] font-bold text-gray-800 uppercase tracking-wider">Configure Report Filters</h3>
          </div>
          
          {(startDate || endDate || selectedCustomer !== 'All' || selectedProduct !== 'All' || selectedCategory !== 'All' || timeRange !== 'all') && (
            <button 
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={12} />
              Reset Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Start Date</label>
            <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100/50 transition-colors">
              <Calendar size={14} className="text-[#1BAFAF] mr-2 shrink-0" />
              <input 
                type="date" 
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setStartDate(val);
                  if (endDate && val > endDate) {
                    setEndDate('');
                  }
                  setReportCurrentPage(1);
                }}
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer"
              />
            </div>
          </div>
          
          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">End Date</label>
            <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100/50 transition-colors">
              <Calendar size={14} className="text-[#1BAFAF] mr-2 shrink-0" />
              <input 
                type="date" 
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  setEndDate(val);
                  if (startDate && val < startDate) {
                    setStartDate('');
                  }
                  setReportCurrentPage(1);
                }}
                className="w-full bg-transparent border-none outline-none text-[12px] font-bold text-gray-700 cursor-pointer"
              />
            </div>
          </div>
          
          {/* Customer Dropdown */}
          <div className="flex flex-col gap-1.5" ref={customerRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Customer</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCustomerOpen(prev => !prev)}
                className="w-full relative flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100/50 transition-colors text-left"
              >
                <div className="flex items-center min-w-0">
                  <User size={14} className="text-[#1BAFAF] mr-2 shrink-0" />
                  <span className="text-[12px] font-bold text-gray-700 truncate">
                    {selectedCustomer === 'All' ? 'All Customers' : selectedCustomer}
                  </span>
                </div>
                <ChevronDown size={12} className={`text-gray-400 ml-1 shrink-0 transition-transform duration-200 ${customerOpen ? 'rotate-180' : ''}`} />
              </button>
              {customerOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer('All');
                      setReportCurrentPage(1);
                      setCustomerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                      selectedCustomer === 'All' ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Customers
                  </button>
                  {uniqueCustomers.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(name);
                        setReportCurrentPage(1);
                        setCustomerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                        selectedCustomer === name ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Product Dropdown */}
          <div className="flex flex-col gap-1.5" ref={productRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Product</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductOpen(prev => !prev)}
                className="w-full relative flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100/50 transition-colors text-left"
              >
                <div className="flex items-center min-w-0">
                  <Package size={14} className="text-[#1BAFAF] mr-2 shrink-0" />
                  <span className="text-[12px] font-bold text-gray-700 truncate">
                    {selectedProduct === 'All' ? 'All Products' : selectedProduct}
                  </span>
                </div>
                <ChevronDown size={12} className={`text-gray-400 ml-1 shrink-0 transition-transform duration-200 ${productOpen ? 'rotate-180' : ''}`} />
              </button>
              {productOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct('All');
                      setReportCurrentPage(1);
                      setProductOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                      selectedProduct === 'All' ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </button>
                  {uniqueProducts.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(name);
                        setReportCurrentPage(1);
                        setProductOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                        selectedProduct === name ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5" ref={categoryRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Category</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen(prev => !prev)}
                className="w-full relative flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100/50 transition-colors text-left"
              >
                <div className="flex items-center min-w-0">
                  <Layers size={14} className="text-[#1BAFAF] mr-2 shrink-0" />
                  <span className="text-[12px] font-bold text-gray-700 truncate">
                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                  </span>
                </div>
                <ChevronDown size={12} className={`text-gray-400 ml-1 shrink-0 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoryOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setReportCurrentPage(1);
                      setCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                      selectedCategory === 'All' ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {uniqueCategories.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(name);
                        setReportCurrentPage(1);
                        setCategoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                        selectedCategory === name ? 'text-[#1BAFAF] font-semibold bg-[#1BAFAF]/5' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STAT_CARDS.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <stat.icon size={26} strokeWidth={2.5} />
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

      {/* Report Switch Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'customers', name: 'Customer Sales' },
          { id: 'products', name: 'Product Sales' },
          { id: 'categories', name: 'Category Sales' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setReportCurrentPage(1);
            }}
            className={`px-6 py-3 border-b-2 text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'border-[#1BAFAF] text-[#1BAFAF]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab panel */}
      {activeTab === 'overview' && (
        <>
          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue vs Profit Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">Revenue vs Profit Analysis</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Monitoring profitability trends over time</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#1BAFAF]" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profit</span>
                   </div>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1BAFAF" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1BAFAF" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#1BAFAF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top 5 Categories */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-start relative overflow-hidden min-h-[460px]">
               <div className="mb-6">
                 <h2 className="text-[15px] font-bold text-gray-900">Top Categories</h2>
                 <p className="text-[11px] text-gray-400 font-medium">Most products sold by collection</p>
               </div>
               
               <div className="flex-1 space-y-5 w-full">
                 {categorySalesData.slice(0, 7).map((cat, i) => (
                   <div key={cat.name} className="flex flex-col gap-2">
                     <div className="flex items-center justify-between text-[12px]">
                       <span className="font-bold text-gray-800 uppercase tracking-tight">{cat.name}</span>
                       <span className="font-black text-[#1BAFAF]">{cat.qtySold} Units ({formatIndianCurrency(cat.totalSales)})</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full rounded-full transition-all duration-1000" 
                         style={{ 
                           width: `${(cat.qtySold / (categorySalesData[0]?.qtySold || 1)) * 100}%`,
                           backgroundColor: COLORS[i % COLORS.length]
                         }} 
                       />
                     </div>
                   </div>
                 ))}
                 {categorySalesData.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                     <Layers size={40} className="mb-2 opacity-20" />
                     <p className="text-[11px] font-bold tracking-widest uppercase">No Sales Yet</p>
                   </div>
                 )}
               </div>
            </div>

          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Full Order Report Table */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                   <BarChart3 className="text-[#1BAFAF]" size={18} />
                   <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Detailed Order Report</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('customers')} 
                  className="text-[11px] font-black text-[#1BAFAF] uppercase tracking-widest hover:underline animate-subtle-bounce"
                >
                  View Customers List
                </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-gray-100">
                          <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                          <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                          <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Net Total</th>
                          <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Est. Profit</th>
                          <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {filteredOrders.slice(0, 5).map((order) => {
                          const rev = parseCurrency(order.total);
                          return (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                               <td className="px-8 py-4 text-[13px] font-black text-gray-400 uppercase">
                                 #{order.saleOrderNumber || order.orderId?.replace('#', '') || order.id.slice(-6)}
                               </td>
                               <td className="px-8 py-4 text-[13px] font-bold text-gray-900">{order.customerName || 'Walk-in Customer'}</td>
                               <td className="px-8 py-4 text-[13px] font-black text-[#1BAFAF] leading-none">
                                  {formatIndianCurrency(rev)}
                               </td>
                               <td className="px-8 py-4 text-[13px] font-black text-amber-500">
                                  {formatIndianCurrency(rev * 0.35)}
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                     order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                     order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' :
                                     'bg-blue-50 text-blue-600'
                                  }`}>
                                     {order.status || 'Confirmed'}
                                  </span>
                               </td>
                            </tr>
                          );
                       })}
                       {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-8 py-10 text-center text-[13px] font-medium text-gray-400">
                              No matching orders found. Adjust your filters.
                            </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </div>

            {/* Top Products Breakdown */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                   <Package className="text-amber-500" size={18} />
                   <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                     Top Products
                   </h2>
                </div>
                <Activity size={16} className="text-gray-300" />
              </div>
              <div className="divide-y divide-gray-50">
                {productSalesData.slice(0, 7).map((prod, i) => (
                  <div key={prod.name} className="flex flex-col gap-2 px-8 py-5 hover:bg-gray-50/50 transition-all">
                     <div className="flex items-center justify-between">
                        <span className="text-[13px] font-black text-gray-900 uppercase tracking-tight truncate max-w-[180px]" title={prod.name}>{prod.name}</span>
                        <span className="text-[11px] font-black text-[#1BAFAF]">{prod.qtySold} Sold ({formatIndianCurrency(prod.totalSales)})</span>
                     </div>
                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full rounded-full transition-all duration-1000" 
                           style={{ 
                              width: `${(prod.totalSales / (productSalesData[0]?.totalSales || 1)) * 100}%`,
                              backgroundColor: COLORS[i % COLORS.length]
                           }} 
                        />
                     </div>
                  </div>
                ))}
                {productSalesData.length === 0 && (
                   <p className="px-8 py-10 text-center text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                     No products recorded
                   </p>
                )}
                <div className="p-8 text-center">
                   <button 
                     onClick={() => setActiveTab('products')} 
                     className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
                   >
                      Generate Product Report
                   </button>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Customer Sales Table */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 bg-gray-50/40 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Customer Purchase Records</h3>
            <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#E8F7F7] px-3 py-1 rounded-full uppercase tracking-wider">
              Total Customers: {customerSalesData.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Sr No</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Orders Count</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Items Bought</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Total Purchases</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginate(customerSalesData, reportCurrentPage, reportRowsPerPage).map((c, idx) => (
                  <tr key={c.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-[13px] font-black text-gray-400">
                      {String((reportCurrentPage - 1) * reportRowsPerPage + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-bold text-gray-900">{c.name}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-gray-800 text-center">{c.ordersCount}</td>
                    <td className="px-8 py-4 text-[13px] font-bold text-gray-500 text-center">{c.itemsCount}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-[#1BAFAF]">{formatIndianCurrency(c.totalSpent)}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-amber-500">{formatIndianCurrency(c.totalSpent * 0.35)}</td>
                  </tr>
                ))}
                {customerSalesData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-[13px] font-medium text-gray-400">
                      No customer transactions match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {customerSalesData.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Rows per page: {reportRowsPerPage}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => reportCurrentPage > 1 && setReportCurrentPage(reportCurrentPage - 1)}
                  disabled={reportCurrentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[12px] font-semibold text-gray-400">
                  Page {reportCurrentPage} of {Math.ceil(customerSalesData.length / reportRowsPerPage) || 1}
                </span>
                <button 
                  onClick={() => reportCurrentPage < Math.ceil(customerSalesData.length / reportRowsPerPage) && setReportCurrentPage(reportCurrentPage + 1)}
                  disabled={reportCurrentPage >= Math.ceil(customerSalesData.length / reportRowsPerPage)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Sales Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 bg-gray-50/40 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Product Sales breakdown</h3>
            <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#E8F7F7] px-3 py-1 rounded-full uppercase tracking-wider">
              Total Products: {productSalesData.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Sr No</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product Name</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Quantity Sold</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Gross Sales</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginate(productSalesData, reportCurrentPage, reportRowsPerPage).map((p, idx) => (
                  <tr key={p.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-[13px] font-black text-gray-400">
                      {String((reportCurrentPage - 1) * reportRowsPerPage + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-bold text-gray-900">{p.name}</td>
                    <td className="px-8 py-4 text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
                      <span className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-400 font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-[13px] font-black text-gray-800 text-center">{p.qtySold}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-[#1BAFAF]">{formatIndianCurrency(p.totalSales)}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-amber-500">{formatIndianCurrency(p.totalSales * 0.35)}</td>
                  </tr>
                ))}
                {productSalesData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-[13px] font-medium text-gray-400">
                      No product sales match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {productSalesData.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Rows per page: {reportRowsPerPage}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => reportCurrentPage > 1 && setReportCurrentPage(reportCurrentPage - 1)}
                  disabled={reportCurrentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[12px] font-semibold text-gray-400">
                  Page {reportCurrentPage} of {Math.ceil(productSalesData.length / reportRowsPerPage) || 1}
                </span>
                <button 
                  onClick={() => reportCurrentPage < Math.ceil(productSalesData.length / reportRowsPerPage) && setReportCurrentPage(reportCurrentPage + 1)}
                  disabled={reportCurrentPage >= Math.ceil(productSalesData.length / reportRowsPerPage)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Sales Table */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 bg-gray-50/40 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wider">Category Sales breakdown</h3>
            <span className="text-[11px] font-bold text-[#1BAFAF] bg-[#E8F7F7] px-3 py-1 rounded-full uppercase tracking-wider">
              Total Categories: {categorySalesData.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Sr No</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Category Name</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Items Sold</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Revenue Generated</th>
                  <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginate(categorySalesData, reportCurrentPage, reportRowsPerPage).map((c, idx) => (
                  <tr key={c.name} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-[13px] font-black text-gray-400">
                      {String((reportCurrentPage - 1) * reportRowsPerPage + idx + 1).padStart(2, '0')}
                    </td>
                    <td className="px-8 py-4 text-[13px] font-bold text-gray-900 uppercase tracking-wider">{c.name}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-gray-800 text-center">{c.qtySold}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-[#1BAFAF]">{formatIndianCurrency(c.totalSales)}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-amber-500">{formatIndianCurrency(c.totalSales * 0.35)}</td>
                  </tr>
                ))}
                {categorySalesData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-[13px] font-medium text-gray-400">
                      No category sales match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {categorySalesData.length > 0 && (
            <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Rows per page: {reportRowsPerPage}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => reportCurrentPage > 1 && setReportCurrentPage(reportCurrentPage - 1)}
                  disabled={reportCurrentPage === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <span className="text-[12px] font-semibold text-gray-400">
                  Page {reportCurrentPage} of {Math.ceil(categorySalesData.length / reportRowsPerPage) || 1}
                </span>
                <button 
                  onClick={() => reportCurrentPage < Math.ceil(categorySalesData.length / reportRowsPerPage) && setReportCurrentPage(reportCurrentPage + 1)}
                  disabled={reportCurrentPage >= Math.ceil(categorySalesData.length / reportRowsPerPage)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
