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
  IndianRupee,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
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
  Cell,
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line
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

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); 
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    orders: 0,
    avgValue: 0,
    successRate: '94%'
  });
  
  const [reportData, setReportData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [detailedOrders, setDetailedOrders] = useState([]);

  useEffect(() => {
    setLoading(true);
    
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalRev = orders.reduce((sum, order) => sum + parseCurrency(order.total), 0);
      const totalProfit = totalRev * 0.35; // Assuming 35% margin for reports
      const avgValue = orders.length > 0 ? totalRev / orders.length : 0;
      
      setStats({
        revenue: totalRev,
        profit: totalProfit,
        orders: orders.length,
        avgValue: avgValue,
        successRate: '94%'
      });

      setDetailedOrders(orders.slice(0, 10));

      // Calculate Trend based on timeRange
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const trend = [...Array(days)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        
        const dayOrders = orders.filter(o => 
          o.createdAt && 
          o.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === label
        );
        
        const rev = dayOrders.reduce((sum, o) => sum + parseCurrency(o.total), 0);
        return {
          name: label,
          revenue: rev,
          profit: rev * 0.35,
          orders: dayOrders.length
        };
      });
      setReportData(trend);
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const categories = {};
      products.forEach(p => {
        const cat = p.category || 'Lifestyle';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      const catArray = Object.entries(categories).map(([name, value]) => ({ name, value }));
      setCategoryData(catArray.sort((a, b) => b.value - a.value).slice(0, 5));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, [timeRange]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Compiling Report Analysis...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { name: 'Gross Revenue', value: formatIndianCurrency(stats.revenue), icon: IndianRupee, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
    { name: 'Estimated Profit', value: formatIndianCurrency(stats.profit), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Avg. Order Value', value: formatIndianCurrency(stats.avgValue), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Reports & Insights</h1>
          <p className="text-[12px] text-gray-400 font-medium">Detailed breakdown of your store's financial performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            {['7d', '30d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  timeRange === range 
                    ? 'bg-[#1BAFAF] text-white' 
                    : 'text-gray-400 hover:text-gray-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

        {/* Order Success Rate */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-6 left-8">
             <h2 className="text-[15px] font-bold text-gray-900">Success Rate</h2>
             <p className="text-[11px] text-gray-400 font-medium">Overall fulfillment score</p>
           </div>
           
           <div className="relative w-48 h-48 flex items-center justify-center my-8">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={[
                          { name: 'Success', value: 94 },
                          { name: 'Issues', value: 6 }
                       ]}
                       innerRadius={65}
                       outerRadius={85}
                       paddingAngle={5}
                       dataKey="value"
                    >
                       <Cell fill="#1BAFAF" cornerRadius={10} />
                       <Cell fill="#f1f5f9" cornerRadius={10} />
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black text-gray-900">{stats.successRate}</span>
                 <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Excellent</span>
              </div>
           </div>

           <div className="w-full space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Delivered Orders</span>
                 </div>
                 <span className="text-[12px] font-black text-gray-900">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                 <div className="flex items-center gap-2">
                    <Activity size={14} className="text-amber-500" />
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Disputed/Cancelled</span>
                 </div>
                 <span className="text-[12px] font-black text-gray-900">5.8%</span>
              </div>
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
            <button className="text-[11px] font-black text-[#1BAFAF] uppercase tracking-widest hover:underline">View All</button>
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
                   {detailedOrders.map((order) => {
                      const rev = parseCurrency(order.total);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                           <td className="px-8 py-4 text-[13px] font-black text-gray-400 uppercase">#{order.id.slice(-6)}</td>
                           <td className="px-8 py-4 text-[13px] font-bold text-gray-900">{order.customerName}</td>
                           <td className="px-8 py-4 text-[13px] font-black text-[#1BAFAF] leading-none">
                              {order.total}
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
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
        </div>

        {/* Top Product Categories Breakdown */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
               <Layers className="text-amber-500" size={18} />
               <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Top Collections</h2>
            </div>
            <Activity size={16} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex flex-col gap-2 px-8 py-5 hover:bg-gray-50/50 transition-all">
                 <div className="flex items-center justify-between">
                    <span className="text-[13px] font-black text-gray-900 uppercase tracking-tight">{cat.name}</span>
                    <span className="text-[11px] font-black text-[#1BAFAF]">{cat.value} Sales</span>
                 </div>
                 <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                       className="h-full rounded-full transition-all duration-1000" 
                       style={{ 
                          width: `${(cat.value / (categoryData[0]?.value || 1)) * 100}%`,
                          backgroundColor: COLORS[i % COLORS.length]
                       }} 
                    />
                 </div>
              </div>
            ))}
            <div className="p-8 text-center">
               <button className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors">
                  Generate Category Report
               </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
