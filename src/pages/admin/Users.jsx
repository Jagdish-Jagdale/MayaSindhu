import React from 'react';
import { Users as UsersIcon, Plus, Search, Filter } from 'lucide-react';

const Users = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">Active Curators & Clients</h1>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Manage your community of artisans and shoppers</p>
        </div>
        <button className="bg-[#600000] text-[#fefccf] px-6 py-4 flex items-center gap-3 transition-all duration-500 hover:bg-[#390000] group shadow-lg shadow-[#600000]/10">
          <Plus size={18} />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">Invite New Member</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Members', value: '1,284' },
          { label: 'Active Today', value: '156' },
          { label: 'New This Week', value: '+42' },
          { label: 'Pending Invitations', value: '08' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-black/[0.03] p-6 shadow-sm">
            <p className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-serif text-[#390000]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Card (Floating Style) */}
      <div className="bg-white border border-black/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-black/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-[#600000] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..."
              className="w-full bg-[#f5f5f7] border-none py-3 pl-12 pr-4 text-sm outline-none placeholder:text-black/20 focus:bg-white focus:ring-1 focus:ring-[#600000]/10 transition-all duration-300"
            />
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#600000] hover:opacity-70 transition-opacity">
            <Filter size={16} />
            <span>Filter List</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fefccf]/20 border-b border-black/[0.03]">
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Member</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest">Date Joined</th>
                <th className="px-8 py-4 text-[10px] font-bold text-[#600000]/60 uppercase tracking-widest text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#fefccf] text-[#600000] flex items-center justify-center font-bold text-sm">
                        JD
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#390000]">Jane Doe</p>
                        <p className="text-[11px] text-black/40">jane.doe@example.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-[#f5f5f7] text-black/60">
                      Standard Client
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[11px] text-black/40 font-medium">Oct 12, 2025</td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[10px] font-bold text-[#600000] uppercase tracking-widest hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
