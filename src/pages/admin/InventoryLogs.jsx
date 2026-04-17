import React from 'react';
import { 
  History, 
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  User as UserIcon,
  Package,
  Calendar,
  Clock
} from 'lucide-react';

const LOGS = [
  { time: 'Today, 2:45 PM', piece: 'Crimson Heritage Banarasi', action: 'Restocked', adj: '+12 Units', by: 'Vikram S.', sku: 'AT-BNS-204' },
  { time: 'Today, 11:30 AM', piece: 'Peacock Dawn Kanjeevaram', action: 'Sale Fulfilled', adj: '-01 Unit', by: 'Auto-System', sku: 'AT-KJV-092' },
  { time: 'Yesterday, 5:20 PM', piece: 'Indigo Ikat Masterpiece', action: 'Archived', adj: 'Status Change', by: 'Master Curator', sku: 'AT-IKT-115' },
  { time: 'Oct 14, 10:15 AM', piece: 'Morning Mist Chanderi', action: 'Inspection', adj: 'No Change', by: 'Anita R.', sku: 'AT-CHN-551' },
];

export default function InventoryLogs() {
  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Movement Chronicles</h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Full audit trail of stock movements and adjustments</p>
          </div>
          <button className="flex items-center gap-2 text-[12px] font-semibold text-[#1BAFAF] hover:bg-[#eaf6f6] px-3 py-1.5 rounded-xl transition-all active:scale-95">
            <RotateCcw size={15} />
            Refresh Journal
          </button>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-white">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Moment</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Masterpiece</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Action</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1BAFAF]">Adjustment</th>
                <th className="px-6 py-4 text-right text-[14px] font-bold text-[#1BAFAF]">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {LOGS.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[13px] font-semibold text-gray-800">{log.time.split(',')[0]}</p>
                      <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={10} />
                        {log.time.split(',')[1]?.trim()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 leading-tight">{log.piece}</p>
                        <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">SKU: {log.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${log.action === 'Restocked' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {log.action === 'Restocked' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <span className="text-[12px] font-bold text-gray-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[13px] font-bold ${log.adj.includes('+') ? 'text-green-600' : 'text-gray-900'}`}>{log.adj}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <p className="text-[13px] font-bold text-gray-800">{log.by}</p>
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <UserIcon size={14} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
