import { TrendingUp, ShoppingBag, Users, Layers, ArrowUpRight, Package } from 'lucide-react';

const STATS = [
  {
    name: 'Total Revenue',
    value: '₹1,24,500',
    change: '+12.4%',
    icon: TrendingUp,
    iconBg: 'bg-[#E8F7F7]',
    iconColor: 'text-[#1BAFAF]',
  },
  {
    name: 'New Orders',
    value: '42',
    change: '+8.1%',
    icon: ShoppingBag,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    name: 'Total Clients',
    value: '1,205',
    change: '+3.6%',
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    name: 'Inventory Pieces',
    value: '186',
    change: '-2 units',
    icon: Layers,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
];

const RECENT_ORDERS = [
  { id: '#ORD-7241', customer: 'Priya Sharma',  product: 'Banarasi Heritage',  status: 'Delivered',  amount: '₹45,000', avatar: 'PS' },
  { id: '#ORD-7242', customer: 'Ananya Iyer',   product: 'Kanjeevaram Silk',   status: 'Processing', amount: '₹52,000', avatar: 'AI' },
  { id: '#ORD-7243', customer: 'Meera Das',     product: 'Linen Masterpiece',  status: 'Shipped',    amount: '₹12,400', avatar: 'MD' },
  { id: '#ORD-7244', customer: 'Sita Ram',      product: 'Cotton Jamdani',     status: 'Delivered',  amount: '₹18,000', avatar: 'SR' },
];

const FEATURED_PRODUCTS = [
  { sku: 'AT-BNS-204', name: 'Crimson Heritage Banarasi', technique: 'Pure Mulberry Silk • Hand-woven Zari', price: '₹84,500', inventory: 12, status: 'ACTIVE',    statusColor: 'bg-white text-gray-700' },
  { sku: 'AT-KJV-092', name: 'Peacock Dawn Kanjeevaram',  technique: 'Korvai Technique • 4-Ply Silk',        price: '₹1,25,000',inventory: 2,  status: 'LOW STOCK', statusColor: 'bg-red-500 text-white'  },
  { sku: 'AT-CHN-551', name: 'Morning Mist Chanderi',     technique: 'Cotton Silk Blend • Butti Motif',      price: '₹32,000', inventory: 24, status: 'ACTIVE',    statusColor: 'bg-white text-gray-700' },
];

const STATUS_STYLES = {
  Delivered:  'bg-green-50 text-green-700',
  Processing: 'bg-amber-50 text-amber-700',
  Shipped:    'bg-blue-50 text-blue-700',
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
                <stat.icon size={19} strokeWidth={2} />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[12px] text-gray-400 font-medium mb-1">{stat.name}</p>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-800">Recent Acquisitions</h2>
            <button className="text-[12px] font-semibold text-[#1BAFAF] flex items-center gap-1 hover:opacity-75 transition-opacity">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="w-8 h-8 rounded-full bg-[#1BAFAF]/15 text-[#1BAFAF] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {order.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{order.customer}</p>
                  <p className="text-[11px] text-gray-400 truncate">{order.product}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500'}`}>
                  {order.status}
                </span>
                <p className="text-[13px] font-bold text-gray-800 text-right shrink-0">{order.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions sidebar */}
        <div className="space-y-5">
          {/* Stock alert */}
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <p className="text-[12px] font-semibold text-[#1BAFAF] uppercase tracking-wider mb-1">Stock Alert</p>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-4">3 categories are below the luxury density threshold.</p>
            <button className="w-full py-2.5 rounded-xl bg-[#1BAFAF] text-white text-[12px] font-semibold hover:bg-[#17a0a0] transition-colors">
              Balance Archive
            </button>
          </div>

          {/* Artisan spotlight */}
          <div className="bg-[#1BAFAF] rounded-2xl p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-3">Artisan Spotlight</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[11px]">RM</div>
              <div>
                <p className="text-[13px] font-bold">Ramesh Mittal</p>
                <p className="text-[10px] text-white/60">Heritage Specialist</p>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-white/75 italic mb-4">
              "Maintaining the weight and drape of pure Zari requires patience that digital systems often forget."
            </p>
            <button className="text-[11px] font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1">
              Full Report <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Featured products — floating cards like the reference image */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-gray-800">Featured Inventory</h2>
          <button className="text-[12px] font-semibold text-[#1BAFAF] flex items-center gap-1 hover:opacity-75 transition-opacity">
            View All Products <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_PRODUCTS.map((p) => (
            <div
              key={p.sku}
              className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden hover:shadow-[0_6px_28px_rgba(0,0,0,0.10)] transition-shadow duration-300 group"
            >
              {/* Image placeholder with gradient */}
              <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package size={40} strokeWidth={1} className="text-gray-300" />
                </div>
                {/* Status badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${p.statusColor} backdrop-blur-sm`}>
                  {p.status}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="text-[10px] text-gray-400 font-medium mb-0.5">SKU: {p.sku}</p>
                <p className="text-[#1BAFAF] font-bold text-[15px] mb-0.5">{p.price}</p>
                <h3 className="text-[14px] font-bold text-gray-800 mb-1 leading-snug">{p.name}</h3>
                <p className="text-[11px] text-gray-400 mb-4">{p.technique}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Inventory</p>
                    <p className={`text-[13px] font-bold ${p.inventory <= 3 ? 'text-red-500' : 'text-gray-800'}`}>
                      {p.inventory} Units
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-[#E8F7F7] text-gray-400 hover:text-[#1BAFAF] transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
