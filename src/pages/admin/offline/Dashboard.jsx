import React, { useState, useEffect } from 'react';
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
  Store,
  Wallet,
  Clock
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
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

const COLORS = ['#1BAFAF', '#B18968', '#D4AF37', '#178E8E', '#2D3748'];

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(val.replace(/[^\d.]/g, ''));
};

const formatIndianCurrency = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export default function OfflineDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    inventory: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: We use 'offline_orders' for the offline store
    const ordersQuery = query(collection(db, 'offline_orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalRev = orders.reduce((sum, order) => sum + parseCurrency(order.total), 0);
      
      setStats(prev => ({
        ...prev,
        revenue: totalRev,
        orders: orders.length,
      }));
      setRecentOrders(orders.slice(0, 5));

      // Trend Simulation for Offline
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      });

      const trend = last7Days.map(label => {
        const dayOrders = orders.filter(o => 
          o.createdAt && 
          o.createdAt.toDate().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) === label
        );
        return {
          name: label,
          revenue: dayOrders.reduce((sum, o) => sum + parseCurrency(o.total), 0)
        };
      });
      setSalesData(trend);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading shop data...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { name: 'Shop Revenue', value: formatIndianCurrency(stats.revenue), icon: Store, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
    { name: 'Manual Orders', value: stats.orders, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Walk-ins', value: stats.orders ? Math.ceil(stats.orders * 1.2) : 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Cash Flow', value: formatIndianCurrency(stats.revenue * 0.95), icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <stat.icon size={22} strokeWidth={2.5} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">In-Store Sales Trend</h2>
              <p className="text-[11px] text-gray-400 font-medium">Daily shop performance over the last 7 days</p>
            </div>
          </div>
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minHeight={0}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1BAFAF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1BAFAF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1BAFAF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent In-Store Activity */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-[15px] font-bold text-gray-900">Recent Shop Activity</h2>
            <p className="text-[11px] text-gray-400 font-medium">Latest manual entries</p>
          </div>
          <div className="flex-1 space-y-4">
             {recentOrders.length > 0 ? recentOrders.map(order => (
               <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400">
                        <Clock size={16} />
                     </div>
                     <div>
                        <p className="text-[12px] font-bold text-gray-800">{order.customerName || 'Walk-in Customer'}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{order.id.slice(-6)}</p>
                     </div>
                  </div>
                  <span className="text-[12px] font-black text-[#1BAFAF]">{order.total}</span>
               </div>
             )) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <Store size={40} className="mb-2 opacity-20" />
                  <p className="text-[11px] font-bold tracking-widest uppercase">No Sales Yet</p>
               </div>
             )}
          </div>
        </div>

      </div>

    </div>
  );
}
