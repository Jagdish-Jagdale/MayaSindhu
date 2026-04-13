import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Layers } from 'lucide-react';

const STATS = [
  { name: 'Total Revenue', value: '₹1,24,500', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'New Orders', value: '42', icon: ShoppingBag, color: 'text-brand-burgundy', bg: 'bg-brand-burgundy/5' },
  { name: 'Total Customers', value: '1,205', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Silk Inventory', value: '86', icon: Layers, color: 'text-brand-gold', bg: 'bg-brand-gold/5' },
];

const RECENT_ORDERS = [
  { id: '#ORD-7241', customer: 'Priya Sharma', product: 'Banarasi Silk Saree', date: 'Oct 12, 2026', status: 'Delivered', amount: '₹45,000' },
  { id: '#ORD-7242', customer: 'Ananya Iyer', product: 'Kanjeevaram Silk', date: 'Oct 12, 2026', status: 'Processing', amount: '₹52,000' },
  { id: '#ORD-7243', customer: 'Meera Das', product: 'Linen Collection', date: 'Oct 11, 2026', status: 'Shipped', amount: '₹12,400' },
  { id: '#ORD-7244', customer: 'Sita Ram', product: 'Cotton Jamdani', date: 'Oct 11, 2026', status: 'Delivered', amount: '₹18,000' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-brand-burgundy-dark font-bold">Store Overview</h1>
        <p className="text-sm text-gray-400 font-sans tracking-wide mt-1">Detailed performance of MayaSindhuu Artisan Shop</p>
      </div>

      {/* Stats Grids*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-gray-500 font-sans">{stat.name}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 font-serif tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-brand-burgundy">Recent Orders</h3>
            <button className="text-xs text-brand-gold font-bold uppercase tracking-widest hover:text-brand-gold-dark">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-sans">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-brand-cream/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-burgundy font-sans">{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.product}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Small Stats Widget/Activity */}
        <div className="bg-brand-burgundy-dark rounded-2xl p-8 text-brand-cream">
          <h3 className="font-serif font-bold text-lg text-brand-gold mb-6">Artisan Spotlight</h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-brand-gold text-lg font-bold">RM</div>
              <div>
                <p className="text-sm font-bold">Ramesh Mittal</p>
                <p className="text-xs text-brand-cream/50 uppercase tracking-widest">Master Weaver - Silk</p>
              </div>
            </div>
            <div className="w-full h-px bg-white/10" />
            <p className="text-sm leading-relaxed text-brand-cream/70 italic">
              "This month, we completed three custom bridal Banarasi orders. The intricate gold hand-work required 20 days of focused precision per piece."
            </p>
            <div className="pt-4">
              <button className="text-[10px] font-bold text-brand-gold uppercase tracking-widest border-b border-brand-gold pb-1 hover:text-brand-cream hover:border-brand-cream transition-colors">View Artisan Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
