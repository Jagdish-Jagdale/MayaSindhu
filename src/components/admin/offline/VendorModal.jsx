import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  ChevronDown
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
import CustomSelect from '../../common/CustomSelect';

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

    if (formData.phone && formData.phone.length !== 10) {
      toast.error("Primary Phone must be exactly 10 digits");
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (formData.pan && !panRegex.test(formData.pan)) {
      toast.error("Invalid PAN format (e.g. ABCDE1234F)");
      return;
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
      toast.error("Invalid Pincode (6 digits required)");
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
          createdAt: serverTimestamp()
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

  const tabs = ['Other Details', 'Address'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div>
            <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <p className="text-[12px] text-gray-400 font-medium">Manage your vendor relationships efficiently</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    placeholder="Enter vendor full name"
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: val });
                      }}
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, alternatePhone: val });
                      }}
                      placeholder="9876543211"
                      className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <CustomSelect
                label="Vendor Status"
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={['Active', 'Inactive']}
              />
            </div>
          </div>

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

                      <CustomSelect
                        label="Currency"
                        value={formData.currency}
                        onChange={(val) => setFormData({ ...formData, currency: val })}
                        options={['INR- Indian Rupee', 'USD- US Dollar', 'EUR- Euro']}
                      />
                    </div>

                    <div className="space-y-6">
                      <CustomSelect
                        label="Payment Terms"
                        value={formData.paymentTerms}
                        onChange={(val) => setFormData({ ...formData, paymentTerms: val })}
                        options={['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60']}
                      />

                      <CustomSelect
                        label="TDS"
                        value={formData.tds}
                        onChange={(val) => setFormData({ ...formData, tds: val })}
                        options={['Select a Tax', 'GST 18%', 'GST 5%', 'TDS 1%', 'TDS 2%']}
                      />

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-300 group-focus-within:text-[#1BAFAF] transition-colors" />
                      <textarea
                        rows="3"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street address, building, apartment..."
                        className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        className="w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        className="w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Country</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="Country"
                          className="w-full bg-gray-50 border-2 border-transparent py-3.5 pl-12 pr-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="411001"
                        className="w-full bg-gray-50 border-2 border-transparent py-3.5 px-4 text-[14px] font-medium rounded-2xl outline-none focus:bg-white focus:border-[#1BAFAF]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex gap-4">
            <button type="button" onClick={onClose} className="px-8 py-4 text-[14px] font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 text-[14px] font-bold text-white bg-[#1BAFAF] rounded-2xl hover:bg-[#158e8e] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : (vendor ? 'Update Vendor' : 'Add Vendor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorModal;
