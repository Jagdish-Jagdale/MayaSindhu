import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Package, 
  Plus,
  Loader2
} from 'lucide-react';

const BulkItemModal = ({ isOpen, onClose, products, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    onAdd(selectedProducts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-[18px] font-bold text-gray-900">Add Items in Bulk</h2>
            <p className="text-[12px] text-gray-400 font-medium">Select multiple products to add to your order</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-8 py-4 border-b border-gray-50">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none py-3 pl-11 pr-4 text-[14px] rounded-2xl outline-none focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-1 gap-2">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedIds.includes(product.id) 
                    ? 'border-[#1BAFAF] bg-[#1BAFAF]/5 shadow-sm' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedIds.includes(product.id) 
                    ? 'bg-[#1BAFAF] border-[#1BAFAF]' 
                    : 'border-gray-200 bg-white'
                }`}>
                  {selectedIds.includes(product.id) && <Check size={14} className="text-white" />}
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-[12px] text-gray-400 font-medium">SKU: {product.sku || 'N/A'}</p>
                </div>

                <div className="text-right">
                  <p className="text-[14px] font-black text-[#1BAFAF]">₹{(product.price || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">In Stock: {product.stock || 0}</p>
                </div>
              </button>
            ))}

            {filteredProducts.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                  <Package size={32} />
                </div>
                <p className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex items-center justify-between flex-shrink-0">
          <p className="text-[13px] font-bold text-gray-500">
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selectedIds.length === 0}
              className="bg-[#1BAFAF] text-white px-8 py-3 rounded-2xl text-[14px] font-bold shadow-lg shadow-[#1BAFAF]/20 hover:bg-[#17a0a0] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkItemModal;
