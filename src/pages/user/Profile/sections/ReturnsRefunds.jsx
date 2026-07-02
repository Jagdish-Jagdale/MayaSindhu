import React, { useState, useEffect } from 'react';
import { RotateCcw, Package, Clock, CheckCircle2, Search, Loader2, Ticket, Eye, X } from 'lucide-react';
import { db } from '../../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function ReturnsRefunds({ user }) {
  const [activeTab, setActiveTab] = useState('returns'); // 'returns' or 'exchanges'
  const [returns, setReturns] = useState([]);
  const [exchangeTickets, setExchangeTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // 1. Fetch Return requests
    const returnQuery = query(
      collection(db, 'orders'),
      where('customerUid', '==', user.uid),
      where('status', 'in', ['Return Requested', 'Returned', 'Refunded'])
    );

    const unsubscribeReturns = onSnapshot(returnQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReturns(data);
    });

    // 2. Fetch Exchange tickets
    const exchangeQuery = query(
      collection(db, 'exchangeTickets'),
      where('customerUid', '==', user.uid)
    );

    const unsubscribeExchanges = onSnapshot(exchangeQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExchangeTickets(data);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => {
      unsubscribeReturns();
      unsubscribeExchanges();
    };
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f5aa00]" size={40} /></div>;

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl shadow-gray-200/20 border border-[#f0dda0]/20">
      {/* Title */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#f5aa00] to-[#e07a00] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#f5aa00]/20">
          <RotateCcw size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-sans font-bold text-[#1A1A1A] tracking-tight">Returns & Exchanges</h2>
          <p className="text-[10px] text-[#f5aa00] font-bold uppercase tracking-[0.2em] mt-0.5">Track Requests & Tickets</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-px mb-6">
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${
            activeTab === 'returns'
              ? 'border-[#f5aa00] text-[#f5aa00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Returns & Refunds ({returns.length})
        </button>
        <button
          onClick={() => setActiveTab('exchanges')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${
            activeTab === 'exchanges'
              ? 'border-[#f5aa00] text-[#f5aa00]'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Exchange Tickets ({exchangeTickets.length})
        </button>
      </div>

      {/* Returns Tab */}
      {activeTab === 'returns' && (
        returns.length === 0 ? (
          <div className="text-center py-16 bg-[#fffbf2]/20 rounded-xl border border-dashed border-[#f0dda0]/30">
            <RotateCcw size={40} className="text-[#f5aa00]/20 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">No return records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((item) => (
              <div key={item.id} className="p-5 md:p-6 border border-[#f0dda0]/10 rounded-xl bg-[#fffbf2]/10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-[#f5aa00]/20 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#f5aa00] shadow-sm border border-[#f0dda0]/10 group-hover:scale-105 transition-transform">
                    <Package size={22} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-sans font-bold text-[#1A1A1A] uppercase tracking-tight">{item.orderId}</h4>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{item.items?.length} Items • Return Requested</p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${
                    item.status === 'Refunded' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-[#fffbf2] text-[#f5aa00] border-[#f5aa00]/20'
                  }`}>
                    {item.status === 'Refunded' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {item.status}
                  </div>
                  <p className="text-lg font-sans font-bold text-[#1A1A1A] leading-none">₹{item.total?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Exchanges Tab */}
      {activeTab === 'exchanges' && (
        exchangeTickets.length === 0 ? (
          <div className="text-center py-16 bg-[#fffbf2]/20 rounded-xl border border-dashed border-[#f0dda0]/30">
            <Ticket size={40} className="text-[#f5aa00]/20 mx-auto mb-4" />
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">No exchange tickets raised</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exchangeTickets.map((ticket) => (
              <div key={ticket.id} className="p-5 md:p-6 border border-[#f0dda0]/10 rounded-xl bg-[#fffbf2]/10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-[#f5aa00]/20 group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#f5aa00] shadow-sm border border-[#f0dda0]/10 group-hover:scale-105 transition-transform">
                    <Ticket size={22} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-sans font-bold text-[#1A1A1A] uppercase tracking-tight">{ticket.ticketId}</h4>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Order: {ticket.orderDisplayId}</p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2">
                  <div className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${
                    ticket.status === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' :
                    ticket.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-[#fffbf2] text-[#f5aa00] border-[#f5aa00]/20'
                  }`}>
                    {ticket.status === 'Accepted' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {ticket.status === 'Accepted' ? 'Accepted' : ticket.status === 'Rejected' ? 'Rejected' : 'Pending'}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setIsPreviewOpen(true);
                    }}
                    className="mt-1 text-[11px] font-bold text-[#f5aa00] hover:text-[#e07a00] flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <Eye size={12} /> View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Ticket Details Lightbox/Modal */}
      {isPreviewOpen && selectedTicket && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = () => setIsPreviewOpen(false); closeFn(); } }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Exchange Ticket Details</h3>
                <p className="text-[11px] text-gray-400 font-medium">Ticket: {selectedTicket.ticketId}</p>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Order ID</span>
                <p className="text-sm font-bold text-gray-800">{selectedTicket.orderDisplayId}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Reason for Exchange</span>
                <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 p-3.5 rounded-xl border border-gray-100">{selectedTicket.reason}</p>
              </div>
              {selectedTicket.image && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Product Condition Image</span>
                  <div className="w-full rounded-xl overflow-hidden border border-gray-100">
                    <img src={selectedTicket.image} alt="Product condition" className="w-full h-auto object-cover max-h-48" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
