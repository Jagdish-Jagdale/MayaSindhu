import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, Layers, ArrowUpRight } from 'lucide-react';

const STATS = [
  { name: 'Total Revenue', value: '₹1,24,500', icon: TrendingUp, color: 'text-[#600000]', bg: 'bg-[#fefccf]' },
  { name: 'New Orders', value: '42', icon: ShoppingBag, color: 'text-[#390000]', bg: 'bg-[#e0e5cc]' },
  { name: 'Total Clients', value: '1,205', icon: Users, color: 'text-[#600000]', bg: 'bg-[#f7f9fb]' },
  { name: 'Inventory Pieces', value: '186', icon: Layers, color: 'text-[#D4AF37]', bg: 'bg-[#600000]/5' },
];

const RECENT_ORDERS = [
  { id: '#ORD-7241', customer: 'Priya Sharma', product: 'Banarasi Heritage', status: 'Delivered', amount: '₹45,000' },
  { id: '#ORD-7242', customer: 'Ananya Iyer', product: 'Kanjeevaram Silk', status: 'Processing', amount: '₹52,000' },
  { id: '#ORD-7243', customer: 'Meera Das', product: 'Linen Masterpiece', status: 'Shipped', amount: '₹12,400' },
  { id: '#ORD-7244', customer: 'Sita Ram', product: 'Cotton Jamdani', status: 'Delivered', amount: '₹18,000' },
];

export default function Dashboard() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#390000] mb-3 tracking-tight">Atelier Overview</h1>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.3em]">Operational performance of the MayaSindhu Archive</p>
        </div>
        <div className="flex items-center gap-4 border-l border-black/[0.05] pl-6 py-1">
          <div className="text-right">
            <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">System Status</p>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Synchronized
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="bg-white p-8 shadow-sm border border-black/[0.03] relative group overflow-hidden"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} flex items-center justify-center mb-6 transition-transform duration-700 group-hover:scale-110`}>
              <stat.icon size={22} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] mb-1">{stat.name}</p>
            <p className="text-3xl font-serif text-[#390000] tracking-tight">{stat.value}</p>
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-700 group-hover:w-full"></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white shadow-sm border border-black/[0.03] overflow-hidden">
          <div className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-black/[0.01]">
            <h3 className="font-serif font-bold text-xl text-[#390000]">Recent Acquisitions</h3>
            <button className="text-[10px] font-bold text-[#600000] uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-70 transition-opacity">
              <span>View Full Ledger</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fefccf]/20 text-[10px] uppercase tracking-widest text-[#600000]/60 font-bold border-b border-black/[0.03]">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-8 py-5">Client</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-black/[0.01] transition-colors group cursor-default">
                    <td className="px-8 py-6 font-bold text-[#600000] text-[11px] tracking-widest font-sans uppercase">{order.id}</td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-[#390000] text-[13px]">{order.customer}</p>
                      <p className="text-[11px] text-black/30 font-medium">{order.product}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                        order.status === 'Processing' ? 'bg-[#fefccf] text-[#600000]' : 'bg-black/[0.05] text-black/60'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-serif font-bold text-[#390000]">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#600000] p-10 text-[#fefccf] relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-[#fefccf]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h3 className="font-serif font-bold text-2xl mb-8 leading-tight">Master Weaver <br /><span className="italic text-[#D4AF37]">Spotlight</span></h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#fefccf]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xl border border-[#D4AF37]/20">RM</div>
                <div>
                  <p className="text-sm font-bold tracking-wide">Ramesh Mittal</p>
                  <p className="text-[10px] text-[#fefccf]/40 font-bold uppercase tracking-[0.2em] mt-1">Heritage Specialist</p>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-[#fefccf]/70 italic font-medium">
                "Maintaining the weight and drape of pure Zari requires patience that digital systems often forget. This month's pieces are our finest yet."
              </p>
              <div className="pt-4 border-t border-[#fefccf]/10">
                <button className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] hover:text-[#fefccf] transition-colors pb-1 border-b border-[#D4AF37]">Full Artisan Report</button>
              </div>
            </div>
          </div>
          
          <div className="bg-[#fefccf] border border-[#600000]/5 p-8">
             <p className="text-[10px] font-bold text-[#600000] uppercase tracking-[0.3em] mb-4">Stock Optimization</p>
             <p className="text-sm text-[#390000]/60 font-medium leading-relaxed mb-6">3 Categories are currently below our luxury density threshold.</p>
             <button className="w-full bg-[#390000] text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#600000] transition-colors">Balance Archive</button>
          </div>
        </div>
      </div>
    </div>
  );
}

