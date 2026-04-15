import React from 'react';
import { History, ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';

const InventoryLogs = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">Movement Chronicles</h1>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Historical record of every textile piece from atelier to archive</p>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#600000] hover:opacity-70 transition-opacity">
          <RotateCcw size={16} />
          <span>Refresh Journal</span>
        </button>
      </div>

      <div className="bg-white border border-black/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/[0.02] border-b border-black/[0.03]">
                <th className="px-8 py-5 text-[10px] font-bold text-black/40 uppercase tracking-widest ont-bold uppercase tracking-widest">Moment</th>
                <th className="px-8 py-5 text-[10px] font-bold text-black/40 uppercase tracking-widest ont-bold uppercase tracking-widest">Masterpiece</th>
                <th className="px-8 py-5 text-[10px] font-bold text-black/40 uppercase tracking-widest ont-bold uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-bold text-black/40 uppercase tracking-widest ont-bold uppercase tracking-widest">Adjustment</th>
                <th className="px-8 py-5 text-[10px] font-bold text-black/40 uppercase tracking-widest ont-bold uppercase tracking-widest text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {[
                { time: 'Today, 2:45 PM', piece: 'Crimson Heritage Banarasi', action: 'Restocked', adj: '+12 Units', by: 'Vikram S.' },
                { time: 'Today, 11:30 AM', piece: 'Peacock Dawn Kanjeevaram', action: 'Sale Fulfilled', adj: '-01 Unit', by: 'Auto-System' },
                { time: 'Yesterday, 5:20 PM', piece: 'Indigo Ikat Masterpiece', action: 'Archived', adj: 'Status Change', by: 'Master Curator' },
                { time: 'Oct 14, 10:15 AM', piece: 'Morning Mist Chanderi', action: 'Inspection', adj: 'No Change', by: 'Anita R.' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-8 py-5 text-[11px] text-black/40 font-medium">{log.time}</td>
                  <td className="px-8 py-5">
                    <p className="text-[13px] font-bold text-[#390000]">{log.piece}</p>
                    <p className="text-[9px] text-[#600000] font-bold uppercase tracking-[0.1em]">SKU: AT-BNS-204</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       {log.action === 'Restocked' ? <ArrowDownLeft size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-[#600000]" />}
                       <span className="text-[11px] font-bold text-black/60 uppercase tracking-wider">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[12px] font-serif font-bold text-[#390000]">{log.adj}</td>
                  <td className="px-8 py-5 text-right text-[11px] text-black/40 font-bold uppercase tracking-widest">{log.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogs;
