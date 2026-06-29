/**
 * File: WorkshopModal.jsx
 * Description: Client-facing e-commerce UI components for filtering catalogs, carousel sliders, footer contents, and shopping card modals.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Users, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function WorkshopModal({ isOpen, onClose, workshop }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    participants: '1'
  });

  // Load Razorpay script dynamically
  useEffect(() => {
    if (!isOpen) return;
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [isOpen]);

  if (!isOpen || !workshop) return null;

  const totalAmount = Number(workshop.fees || 0) * Number(formData.participants || 1);

  const handleFreeBooking = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'workshopBookings'), {
        ...formData,
        workshopName: workshop.name,
        workshopDate: workshop.date,
        fees: 0,
        totalAmountPaid: 0,
        status: 'free',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      toast.success('Slot booked successfully!');
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ fullName: '', phone: '', email: '', address: '', participants: '1' });
      }, 3000);
    } catch (error) {
      toast.error('Failed to book slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = () => {
    if (!window.Razorpay) {
      toast.error("Razorpay payment gateway failed to load. Please check your internet connection.");
      return;
    }

    setShowConfirmModal(false);
    setLoading(true);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
      amount: totalAmount * 100, // in paise
      currency: "INR",
      name: "MayaSindhu Workshops",
      description: `Workshop Booking: ${workshop.name}`,
      image: "/src/assets/mstitle.png",
      handler: async function (response) {
        try {
          await addDoc(collection(db, 'workshopBookings'), {
            ...formData,
            workshopName: workshop.name,
            workshopDate: workshop.date,
            fees: Number(workshop.fees) || 0,
            totalAmountPaid: totalAmount,
            razorpayPaymentId: response.razorpay_payment_id,
            status: 'paid',
            createdAt: serverTimestamp()
          });
          setSuccess(true);
          toast.success('Slot booked and payment received!');
          setTimeout(() => {
            onClose();
            setSuccess(false);
            setFormData({ fullName: '', phone: '', email: '', address: '', participants: '1' });
          }, 3000);
        } catch (error) {
          toast.error("Failed to save booking. Please contact support with payment ID: " + response.razorpay_payment_id);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: "#1BAFAF"
      },
      modal: {
        ondismiss: function() {
          toast.error("Payment cancelled.");
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (workshop.fees && Number(workshop.fees) > 0) {
      setShowConfirmModal(true);
    } else {
      handleFreeBooking();
    }
  };

  const formatWorkshopDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10"
          >
            {success ? (
              <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h3 className="text-2xl font-bold font-sans text-gray-900 mb-2">Registration Confirmed!</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Your workshop slot has been booked successfully. We will contact you soon with further details.</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row">
                {/* Left Side - Image & Info */}
                <div className="hidden md:block w-2/5 relative bg-gray-100">
                  <img src={workshop.image} alt={workshop.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Selected Workshop</p>
                    <h4 className="text-xl font-bold font-sans leading-tight">{workshop.name}</h4>
                    <div className="flex items-center gap-2 mt-3 opacity-90">
                      <Calendar size={14} className="text-[#1BAFAF]" />
                      <span className="text-xs font-medium tracking-wide">{formatWorkshopDate(workshop.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 opacity-90">
                      <span className="text-xs font-bold bg-[#1BAFAF]/30 text-white border border-white/20 px-2 py-0.5 rounded">
                        {workshop.fees && Number(workshop.fees) > 0 ? `₹${workshop.fees} / Person` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex-grow p-8 md:p-12 relative">
                  <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={20} />
                  </button>

                  <div className="mb-10">
                    <h3 className="text-2xl font-bold font-sans text-gray-900">Book Your Slot</h3>
                    <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Workshop Registration</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black font-sans uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                        <div className="relative group">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                          <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black font-sans uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                        <div className="relative group">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                          <input
                            required
                            type="tel"
                            pattern="[0-9]*"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-sans uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                        <input
                          required
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-sans uppercase tracking-widest text-gray-400 ml-1">City / Address</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                        <input
                          required
                          type="text"
                          placeholder="Your location"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black font-sans uppercase tracking-widest text-gray-400 ml-1">Participants (Optional)</label>
                      <div className="relative group">
                        <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                        <select
                          value={formData.participants}
                          onChange={(e) => setFormData({...formData, participants: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800 appearance-none cursor-pointer"
                        >
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
                        </select>
                      </div>
                    </div>

                    {workshop.fees && Number(workshop.fees) > 0 && (
                      <div className="flex justify-between items-center bg-[#1BAFAF]/5 border border-[#1BAFAF]/10 p-4 rounded-2xl mt-4">
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fees ({formData.participants} {formData.participants === '1' ? 'Person' : 'People'})</p>
                          <p className="text-[11px] text-gray-400 font-medium">₹{workshop.fees} per person</p>
                        </div>
                        <span className="text-[18px] font-black text-gray-900">₹{totalAmount}</span>
                      </div>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full bg-[#111111] text-white py-5 rounded-xl font-bold font-sans uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8 group"
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin" size={16} /> Securely Processing...</>
                      ) : (
                        <>{workshop.fees && Number(workshop.fees) > 0 ? 'Proceed to Payment' : 'Confirm Booking'} <CheckCircle2 size={16} className="group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Confirmation Payment Modal Overlay */}
            <AnimatePresence>
              {showConfirmModal && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
                  >
                    <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                      <X size={18} />
                    </button>
                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                      <AlertCircle size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Confirm Booking & Pay</h4>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                      You are booking a slot for **{formData.fullName}** ({formData.participants} {formData.participants === '1' ? 'person' : 'people'}) to attend **{workshop.name}**.
                    </p>
                    <div className="border-t border-b border-gray-50 py-4 mb-6 flex justify-between items-center px-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Total Amount:</span>
                      <span className="text-xl font-black text-[#1BAFAF]">₹{totalAmount}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRazorpayPayment}
                        className="flex-1 bg-[#1BAFAF] hover:bg-[#17a0a0] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#1BAFAF]/10 transition-all active:scale-95"
                      >
                        Pay Now
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
