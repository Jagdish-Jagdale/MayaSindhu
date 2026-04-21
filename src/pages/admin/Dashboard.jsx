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
  Activity
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
  Bar
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

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    clients: 0,
    inventory: 0,
    revenueChange: '+0%',
    ordersChange: '+0%',
    clientsChange: '+0%',
    inventoryChange: '+0%'
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Stats & Recent Orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate Total Revenue
      const totalRev = orders.reduce((sum, order) => sum + parseCurrency(order.total), 0);
      
      // Calculate New Orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newOrdersCount = orders.filter(o => o.createdAt && o.createdAt.toDate() > thirtyDaysAgo).length;

      setStats(prev => ({
        ...prev,
        revenue: totalRev,
        orders: orders.length,
        ordersChange: `+${newOrdersCount}`
      }));
      setRecentOrders(orders.slice(0, 5));

      // Calculate Sales Trend (Last 7 days)
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
    });

    // 2. Fetch Users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, clients: users.length }));
      setRecentUsers(users.slice(0, 5));
    });

    // 3. Fetch Products for Inventory & Categories
    const productsQuery = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const totalStock = products.reduce((sum, p) => sum + (Number(p.inventory) || 0), 0);
      
      setStats(prev => ({ ...prev, inventory: totalStock }));

      // Group by Heritage/Category
      const categories = {};
      products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      const catArray = Object.entries(categories).map(([name, value]) => ({ name, value }));
      setCategoryData(catArray.sort((a, b) => b.value - a.value).slice(0, 5));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubProducts();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { name: 'Total Revenue', value: formatIndianCurrency(stats.revenue), icon: TrendingUp, color: 'text-[#1BAFAF]', bg: 'bg-[#E8F7F7]' },
    { name: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Total Customers', value: stats.clients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Total Products', value: stats.inventory, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-50' },
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

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Sales Trend</h2>
              <p className="text-[11px] text-gray-400 font-medium">Daily revenue over the last 7 days</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
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

        {/* Category Distribution Pie */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-[15px] font-bold text-gray-900">Category Distribution</h2>
            <p className="text-[11px] text-gray-400 font-medium">Product volume by category</p>
          </div>
          <div className="flex-1 h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
             {categoryData.slice(0, 4).map((cat, i) => (
               <div key={cat.name} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-[10px] font-bold text-gray-500 truncate">{cat.name}</span>
               </div>
             ))}
          </div>
        </div>

      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
               <ShoppingBag className="text-[#1BAFAF]" size={18} />
               <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Recent Orders</h2>
            </div>
            <ArrowUpRight size={16} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-8 py-4 hover:bg-gray-50/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm border border-[#1BAFAF]/5">
                  {order.customerName?.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-gray-900 truncate">{order.customerName}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">{order.id.slice(-6)} • {order.status}</p>
                </div>
                <p className="text-[13px] font-black text-[#1BAFAF]">{order.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
               <UserPlus className="text-amber-500" size={18} />
               <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Recent Members</h2>
            </div>
            <ArrowUpRight size={16} className="text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-8 py-4 hover:bg-gray-50/50 transition-all">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-white shadow-sm">
                   {user.profileImage ? (
                      <img src={user.profileImage} className="w-full h-full object-cover" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={16} /></div>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-gray-400 font-medium truncate font-inter uppercase tracking-widest">{user.email}</p>
                </div>
                <div className="text-[10px] font-black px-2.5 py-1 bg-[#1BAFAF]/10 text-[#1BAFAF] rounded-lg uppercase tracking-wider">Active</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
