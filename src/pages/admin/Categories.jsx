import React from 'react';
import { Grid2X2, Plus, ArrowUpRight } from 'lucide-react';

const Categories = () => {
  const categories = [
    { name: 'Banarasi Heritage', count: 42, color: '#fefccf' },
    { name: 'Kanjeevaram Silks', count: 28, color: '#e0e5cc' },
    { name: 'Ikat Masterpieces', count: 35, color: '#f7f9fb' },
    { name: 'Cotton Silk Blends', count: 56, color: '#fdf9f1' },
    { name: 'Designer Blouses', count: 18, color: '#fefccf' },
    { name: 'Bridal Collection', count: 12, color: '#e0e5cc' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#390000] mb-2 tracking-tight">Curation Clusters</h1>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-[0.2em]">Organize your collection by technique and textile heritage</p>
        </div>
        <button className="bg-white border border-[#600000]/20 text-[#600000] px-6 py-4 flex items-center gap-3 transition-all duration-500 hover:bg-[#600000] hover:text-white group">
          <Plus size={18} />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]">New Collection Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.name} className="group cursor-pointer">
            <div className="bg-white border border-black/[0.03] p-8 shadow-sm transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(57,0,0,0.05)] group-hover:border-[#600000]/10 flex flex-col justify-between h-56">
              <div className="flex justify-between items-start">
                <div style={{ backgroundColor: cat.color }} className="w-12 h-12 flex items-center justify-center text-[#600000]">
                  <Grid2X2 size={24} />
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ArrowUpRight size={20} className="text-[#D4AF37]" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-serif text-[#390000] mb-1">{cat.name}</h3>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{cat.count} Masterpieces</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
