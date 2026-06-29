/**
 * File: ActiveSessions.jsx
 * Description: Superadmin platform manager page rendering session dashboards and security administrator logs.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  Clock, 
  Power, 
  Loader2, 
  ShieldAlert,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAdminUI } from '../../context/AdminUIContext';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ActiveSessions() {
  const { isCollapsed } = useAdminUI();
  const { user } = useAuth();

  // State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [revokingId, setRevokingId] = useState(null);

  // Fetch Sessions in Realtime
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'superadmin_sessions'),
      where('superadmin_id', '==', user.email.toLowerCase()),
      where('is_active', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side by last_activity to avoid composite index requirement
      list.sort((a, b) => {
        const timeA = a.last_activity?.toDate ? a.last_activity.toDate().getTime() : new Date(a.last_activity).getTime();
        const timeB = b.last_activity?.toDate ? b.last_activity.toDate().getTime() : new Date(b.last_activity).getTime();
        return timeB - timeA;
      });
      setSessions(list);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load active sessions");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRevoke = async (sessionId) => {
    try {
      setRevokingId(sessionId);
      await updateDoc(doc(db, 'superadmin_sessions', sessionId), {
        is_active: false
      });
      toast.success("Session revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceIcon = (userAgent = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="text-purple-500" size={18} />;
    }
    return <Monitor className="text-blue-500" size={18} />;
  };

  const formatBrowser = (userAgent = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const formatOS = (userAgent = '') => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'Unknown OS';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const currentDeviceId = localStorage.getItem('superadmin_device_id');

  const filteredSessions = sessions.filter(s => 
    (s.ip_address || '').includes(searchTerm) ||
    (s.browser_info || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading active login sessions...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all duration-300 ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header Section */}
      <div className="space-y-2 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-[#1BAFAF]" size={24} />
              Active Superadmin Sessions
            </h1>
            <p className="text-[12px] text-gray-400 font-medium font-inter">Monitor and manage devices currently logged into your Superadmin account (Max 3 simultaneous devices allowed).</p>
          </div>
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-700">
            Sessions: {sessions.length} / 3 Devices
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative group w-full sm:max-w-[480px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
          <input
            type="text"
            placeholder="Search sessions by IP address or browser info..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500 w-24">Device</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">System Info</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">IP Address</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">Login Time</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-gray-500">Last Activity</th>
              <th className="px-6 py-4 text-right text-[14px] font-bold text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <tr key={session.id} className={`hover:bg-gray-50 group transition-colors ${session.device_id === currentDeviceId ? 'bg-emerald-50/20' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        {getDeviceIcon(session.browser_info)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">{formatOS(session.browser_info)}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{formatBrowser(session.browser_info)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[12px] text-gray-600 font-medium max-w-[200px] truncate" title={session.browser_info}>
                      {session.browser_info || 'Unknown User Agent'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Globe size={14} className="text-gray-400" />
                      <span className="text-[13px] font-semibold">{session.ip_address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={14} />
                      <span className="text-[12px] font-medium">{formatTime(session.login_time)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={14} />
                      <span className="text-[12px] font-medium">{formatTime(session.last_activity)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {session.device_id === currentDeviceId ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                        Current Device
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleRevoke(session.id)}
                        disabled={revokingId === session.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95"
                      >
                        {revokingId === session.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Power size={12} />
                        )}
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                  No active login sessions detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
