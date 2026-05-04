import React, { useState, useEffect } from 'react';
import { 
  Package,
  Search,
  AlertCircle,
  Image,
  ChevronDown,
  Loader2,
  TrendingDown,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Store
} from 'lucide-react';
import { useAdminUI } from '../../../context/AdminUIContext';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy
} from 'firebase/firestore';

export default function InventoryLogs() {
  const { isCollapsed } = useAdminUI();
  
  const [products, setProducts] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [offlineOrders, setOfflineOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'stock', dir: 'asc' });

  useEffect(() => {
    // 1. Fetch Products
    const qProducts = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Fetch Online Orders
    const qOnline = query(collection(db, 'orders'));
    const unsubOnline = onSnapshot(qOnline, (snapshot) => {
      setOnlineOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Fetch Offline Orders
    const qOffline = query(collection(db, 'offline_orders'));
    const unsubOffline = onSnapshot(qOffline, (snapshot) => {
      setOfflineOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false); // Assume offline loads last or fast enough
    });

    return () => {
      unsubProducts();
      unsubOnline();
      unsubOffline();
    };
  }, []);

  const getSalesData = (productName) => {
    let online = 0;
    let offline = 0;

    // Calculate online sales
    onlineOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.name === productName) online += (Number(item.qty) || 1);
        });
      } else if (order.productName === productName) {
        online += (Number(order.quantity) || 1);
      }
    });

    // Calculate offline sales
    offlineOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.name === productName) offline += (Number(item.qty) || 1);
        });
      } else if (order.productName === productName) {
        offline += (Number(order.quantity) || 1);
      }
    });

    return {
      online,
      offline,
      total: online + offline
    };
  };

  const productsWithSales = products.map(p => ({
    ...p,
    salesData: getSalesData(p.name)
  }));

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
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

  const filteredProducts = (() => {
    let list = productsWithSales.filter(p => {
      const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let aVal, bVal;
        
        if (sortConfig.key === 'salesTotal') {
          aVal = a.salesData.total;
          bVal = b.salesData.total;
        } else if (sortConfig.key === 'salesOnline') {
          aVal = a.salesData.online;
          bVal = b.salesData.online;
        } else if (sortConfig.key === 'salesOffline') {
          aVal = a.salesData.offline;
          bVal = b.salesData.offline;
        } else if (sortConfig.key === 'stock') {
          aVal = Number(a.stock) || 0;
          bVal = Number(b.stock) || 0;
        } else {
          aVal = a[sortConfig.key] ?? '';
          bVal = b[sortConfig.key] ?? '';
        }

        if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();

  const getStockStatus = (stock, type) => {
    const stockNum = Number(stock) || 0;
    if (type === 'Unique') {
      return { label: 'Unique Item', color: 'text-gray-500', bg: 'bg-gray-100', icon: CheckCircle2 };
    }
    if (stockNum === 0) {
      return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle };
    }
    if (stockNum < 5) {
      return { label: 'Low Stock', color: 'text-amber-500', bg: 'bg-amber-50', icon: TrendingDown };
    }
    return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 };
  };

  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => Number(p.stock) === 0 && p.productType !== 'Unique').length;
  const lowStockCount = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 5 && p.productType !== 'Unique').length;

  if (loading && products.length === 0) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading inventory logs...</p>
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
              Inventory Logs
            </h1>
            <p className="text-[12px] text-gray-400 font-medium">Monitor stock levels, online sales, and offline sales</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F7F7] text-[#1BAFAF] flex items-center justify-center shrink-0">
            <Package size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Products</p>
            <p className="text-xl font-black text-gray-900 tracking-tight">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider mb-0.5">Out of Stock</p>
            <p className="text-xl font-black text-red-600 tracking-tight">{outOfStockCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">Low Stock</p>
            <p className="text-xl font-black text-amber-600 tracking-tight">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar min-h-[400px]">
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
                  <button onClick={() => handleSort('stock')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Stock <SortIcon colKey="stock" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Status</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('salesOnline')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Online Sales <SortIcon colKey="salesOnline" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('salesOffline')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Offline Sales <SortIcon colKey="salesOffline" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">
                  <button onClick={() => handleSort('salesTotal')} className="flex items-center gap-1 hover:opacity-75 transition-opacity">
                    Total Sold <SortIcon colKey="salesTotal" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => {
                  const status = getStockStatus(product.stock, product.productType);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 group transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-6 py-4 max-w-[240px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Image size={20} className="text-gray-200" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-bold text-gray-900 truncate block" title={product.name}>{product.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.productType || 'Standard'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[15px] font-bold ${status.color}`}>
                          {product.productType === 'Unique' ? '-' : product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${status.bg} ${status.color}`}>
                          <status.icon size={14} strokeWidth={2.5} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {status.label}
                          </span>
                        </div>
                      </td>
                      
                      {/* Sales Columns */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-[#1BAFAF]">
                          <ShoppingCart size={14} />
                          <span className="text-[14px] font-bold">{product.salesData.online}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-amber-600">
                          <Store size={14} />
                          <span className="text-[14px] font-bold">{product.salesData.offline}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[15px] font-black text-gray-900">{product.salesData.total}</span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <Package size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500 font-bold">No products found</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
