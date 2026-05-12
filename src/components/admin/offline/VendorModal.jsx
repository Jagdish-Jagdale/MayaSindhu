import React, { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Upload,
  Globe,
  Info
} from 'lucide-react';
import { db } from '../../../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const VendorModal = ({ isOpen, onClose, vendor = null }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Other Details');
  const [formData, setFormData] = useState({
    vendorName: '',
    companyName: '',
    displayName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    status: 'Active',
    // Other Details
    pan: '',
    isMsmeRegistered: false,
    currency: 'INR- Indian Rupee',
    paymentTerms: 'Due on Receipt',
    tds: 'Select a Tax',
    documents: [],
    // Address
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendorName: vendor.vendorName || '',
        companyName: vendor.companyName || '',
        displayName: vendor.displayName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        alternatePhone: vendor.alternatePhone || '',
        status: vendor.status || 'Active',
        pan: vendor.pan || '',
        isMsmeRegistered: vendor.isMsmeRegistered || false,
        currency: vendor.currency || 'INR- Indian Rupee',
        paymentTerms: vendor.paymentTerms || 'Due on Receipt',
        tds: vendor.tds || 'Select a Tax',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || 'India',
        pincode: vendor.pincode || ''
      });
    } else {
      setFormData({
        vendorName: '',
        companyName: '',
        displayName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        status: 'Active',
        pan: '',
        isMsmeRegistered: false,
        currency: 'INR- Indian Rupee',
        paymentTerms: 'Due on Receipt',
        tds: 'Select a Tax',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: ''
      });
    }
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vendorName || !formData.email) {
      toast.error("Vendor Name and Email are required");
      return;
    }

    setLoading(true);
    try {
      if (vendor) {
        await updateDoc(doc(db, 'storeVendors', vendor.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Vendor updated successfully");
      } else {
        await addDoc(collection(db, 'storeVendors'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success("Vendor added successfully");
      }
      onClose();
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error("Failed to save vendor");
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Other Details', 'Address', 'Contact Persons', 'Bank Details', 'Custom Fields', 'Remarks'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">
              {vendor ? 'Edit Vendor' : 'New Vendor'}
            </h2>
            <p className="text-[12px] text-gray-400 font-medium">Register a new supplier or service provider</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* Primary Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vendor Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vendor Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="ACME-VND"
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vendor@company.com"
                    className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Primary Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alternate Phone</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                    <input
                      type="tel"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      placeholder="9876543211"
                      className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vendor Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-1 border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-[13px] font-bold transition-all relative ${
                    activeTab === tab ? 'text-[#1BAFAF]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1BAFAF] animate-in fade-in slide-in-from-bottom-1" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 p-8 min-h-[300px] animate-in fade-in duration-500">
              {activeTab === 'Other Details' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          PAN <Info size={12} className="text-gray-300" />
                        </label>
                        <input
                          type="text"
                          value={formData.pan}
                          onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                          placeholder="ABCDE1234F"
                          className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <input
                          type="checkbox"
                          id="msme"
                          checked={formData.isMsmeRegistered}
                          onChange={(e) => setFormData({ ...formData, isMsmeRegistered: e.target.checked })}
                          className="w-5 h-5 rounded-lg accent-[#1BAFAF] cursor-pointer"
                        />
                        <label htmlFor="msme" className="text-[13px] font-bold text-gray-700 cursor-pointer">
                          This vendor is MSME registered
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Currency</label>
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        >
                          <option>INR- Indian Rupee</option>
                          <option>USD- US Dollar</option>
                          <option>EUR- Euro</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Payment Terms</label>
                        <select
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        >
                          <option>Due on Receipt</option>
                          <option>Net 15</option>
                          <option>Net 30</option>
                          <option>Net 45</option>
                          <option>Net 60</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">TDS</label>
                        <select
                          value={formData.tds}
                          onChange={(e) => setFormData({ ...formData, tds: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        >
                          <option>Select a Tax</option>
                          <option>GST 18%</option>
                          <option>GST 5%</option>
                          <option>TDS 1%</option>
                          <option>TDS 2%</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Documents</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-[#1BAFAF]/30 transition-all cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-[#1BAFAF]/10 text-[#1BAFAF] flex items-center justify-center">
                            <Upload size={18} />
                          </div>
                          <p className="text-[13px] font-bold text-gray-600">Upload File</p>
                          <p className="text-[11px] text-gray-400">Max 10 files, 10MB each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Address' && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      Full Address
                    </label>
                    <textarea
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Door No, Street Name, Area..."
                      className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Mumbai"
                        className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Maharashtra"
                        className="w-full bg-gray-50 border border-gray-100 py-3 px-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Country</label>
                      <div className="relative group">
                         <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                         <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pincode</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                          placeholder="400001"
                          className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 text-[14px] font-bold rounded-xl outline-none focus:bg-white focus:border-[#1BAFAF]/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {['Contact Persons', 'Bank Details', 'Custom Fields', 'Remarks'].includes(activeTab) && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-gray-900">{activeTab} Section</h4>
                    <p className="text-[13px] text-gray-400 max-w-xs">This feature is currently in development and will be available in the next update.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-4 text-[14px] font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 text-[14px] font-bold text-white bg-[#1BAFAF] rounded-2xl hover:bg-[#158e8e] transition-all shadow-lg shadow-[#1BAFAF]/20 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Processing...' : (vendor ? 'Update Vendor' : 'Add Vendor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorModal;
