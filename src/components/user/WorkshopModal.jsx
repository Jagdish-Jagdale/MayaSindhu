/**
 * File: WorkshopModal.jsx
 * Description: Client-facing e-commerce UI components for filtering catalogs, carousel sliders, footer contents, and shopping card modals.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Users, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import useEscapeKey from '../../hooks/useEscapeKey';
import { useAuth } from '../../context/AuthContext';

export default function WorkshopModal({ isOpen, onClose, workshop, initialTab = 'details' }) {
  const { user, setLoginModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    participants: '1'
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && user && workshop && activeTab === 'history') {
      setHistoryLoading(true);
      const bookingsRef = collection(db, 'workshopBookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid && data.workshopName === workshop.name) {
            list.push({ id: doc.id, ...data });
          }
        });
        setBookingHistory(list);
        setHistoryLoading(false);
      }, (error) => {
        console.error("Error fetching history:", error);
        setHistoryLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isOpen, user, workshop, activeTab]);

  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || ''
      }));
    }
  }, [isOpen, user]);

  useEscapeKey(onClose, isOpen);
  useEscapeKey(() => setShowConfirmModal(false), showConfirmModal);

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
        userId: user?.uid || null,
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

  // Create Razorpay order via backend
  const createRazorpayOrder = async (amount) => {
    try {
      const response = await fetch('/backend/create_order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: 'workshop_' + Date.now()
        })
      });
      const data = await response.json();
      if (data.success) {
        return data.order_id;
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  };

  // Verify Razorpay payment via backend
  const verifyRazorpayPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
      const response = await fetch('/backend/verify_payment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        })
      });
      const data = await response.json();
      if (data.success) {
        return true;
      } else {
        throw new Error(data.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handleRazorpayPayment = async () => {
    if (loading) return;
    if (!window.Razorpay) {
      toast.error("Razorpay payment gateway failed to load. Please check your internet connection.");
      return;
    }

    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Step 1: Create Razorpay Order via backend
      const orderId = await createRazorpayOrder(totalAmount * 100);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: totalAmount * 100, // in paise
        currency: "INR",
        name: "MayaSindhu Workshops",
        description: `Workshop Booking: ${workshop.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            // Step 2: Verify payment via backend signature verification
            const isValid = await verifyRazorpayPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!isValid) {
              throw new Error("Payment signature verification failed.");
            }

            // Step 3: Write booking to Firestore only after verification succeeds
            await addDoc(collection(db, 'workshopBookings'), {
              ...formData,
              userId: user?.uid || null,
              workshopName: workshop.name,
              workshopDate: workshop.date,
              fees: Number(workshop.fees) || 0,
              totalAmountPaid: totalAmount,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
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
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support if your account was charged.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone ? (formData.phone.length === 10 ? '+91' + formData.phone : formData.phone) : ''
        },
        theme: {
          color: "#1BAFAF"
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled.");
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Payment gateway is temporarily unavailable. Please try again later or contact support.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isExpired) {
      toast.error("Registration for this workshop has closed.");
      return;
    }
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
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

  const isWorkshopExpired = (dateStr) => {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split('-');
    const localDeadline = new Date(year, month - 1, day, 23, 59, 59, 999);
    return new Date() > localDeadline;
  };

  const isExpired = workshop ? isWorkshopExpired(workshop.date) : false;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = onClose; closeFn(); } }}>
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
            className="relative bg-white w-full max-w-4xl md:h-[600px] rounded-3xl overflow-hidden shadow-2xl z-10 font-outfit flex flex-col"
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
                <h3 className="text-2xl font-bold font-outfit text-gray-900 mb-2">Registration Confirmed!</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Your workshop slot has been booked successfully. We will contact you soon with further details.</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:h-full flex-grow">
                {/* Left Side - Image & Info */}
                <div className="hidden md:block md:w-[45%] md:flex-shrink-0 relative bg-gray-100 md:h-full">
                  <img src={workshop.image} alt={workshop.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge at Top Right */}
                  {isExpired ? (
                    <div className="absolute top-6 right-6 bg-red-500 text-white px-3.5 py-1.5 rounded-full shadow-md z-10 text-[9px] font-bold uppercase tracking-widest">
                      Closed
                    </div>
                  ) : (
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-sm z-10">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-orange">
                        {formatWorkshopDate(workshop.date)}
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-8 left-8 text-white text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Selected Workshop</p>
                    <h4 className="text-xl font-bold font-outfit leading-tight text-white line-clamp-2">{workshop.name}</h4>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-[55%] md:flex-shrink-0 p-6 md:p-10 relative flex flex-col md:h-full justify-between">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${activeTab === 'details'
                            ? 'text-brand-orange border-b-2 border-brand-orange'
                            : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => {
                          if (!user) {
                            toast.error("Please login or sign up first to book a slot.");
                            setLoginModalOpen(true);
                            return;
                          }
                          setActiveTab('form');
                        }}
                        className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${activeTab === 'form'
                            ? 'text-brand-orange border-b-2 border-brand-orange'
                            : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        Book Slot
                      </button>
                      <button
                        onClick={() => {
                          if (!user) {
                            toast.error("Please login or sign up first to view booking history.");
                            setLoginModalOpen(true);
                            return;
                          }
                          setActiveTab('history');
                        }}
                        className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all cursor-pointer ${activeTab === 'history'
                            ? 'text-brand-orange border-b-2 border-brand-orange'
                            : 'text-gray-400 hover:text-gray-600'
                          }`}
                      >
                        Booking History
                      </button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                      <X size={20} />
                    </button>
                  </div>

                  {activeTab === 'details' && (
                    <div className="flex flex-col justify-between flex-1 text-left font-outfit overflow-hidden">
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{workshop.name}</h3>
                          <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-1">
                            {formatWorkshopDate(workshop.date)}
                          </p>
                        </div>
                        <div className="prose prose-sm text-gray-600 leading-relaxed text-sm">
                          {workshop.description || workshop.summary || "No description available."}
                        </div>
                      </div>
                      
                      <hr className="border-gray-100 mt-4" />
                      <div className="pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Registration Fee</span>
                          <span className="text-2xl font-black text-gray-900">
                            {workshop.fees && Number(workshop.fees) > 0 ? `₹${workshop.fees}` : 'Free'}
                          </span>
                        </div>
                        {!isExpired && (
                          <button
                            onClick={() => {
                              if (!user) {
                                  toast.error("Please login or sign up first to book a slot.");
                                  setLoginModalOpen(true);
                                  return;
                              }
                              setActiveTab('form');
                            }}
                            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer"
                          >
                            Register Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'form' && (
                    <>
                      {isExpired ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X size={24} />
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">Registration Closed</h4>
                          <p className="text-sm text-gray-500 px-4">Registration for this workshop has closed. Please check out our upcoming workshops.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black font-outfit uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                              <div className="relative group">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                                <input
                                  required
                                  type="text"
                                  placeholder="Enter your full name"
                                  value={formData.fullName}
                                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black font-outfit uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                              <div className="relative group">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                                <input
                                  required
                                  type="tel"
                                  pattern="[0-9]*"
                                  maxLength={10}
                                  placeholder="Enter your mobile number"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black font-outfit uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                            <div className="relative group">
                              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                              <input
                                required
                                type="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                              <label className="text-[10px] font-black font-outfit uppercase tracking-widest text-gray-400">City / Address</label>
                              <span className="text-[9px] font-bold text-gray-400 font-outfit">{formData.address.length}/200</span>
                            </div>
                            <div className="relative group">
                              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                              <input
                                required
                                type="text"
                                maxLength={200}
                                placeholder="Enter your city / address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value.slice(0, 200) })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black font-outfit uppercase tracking-widest text-gray-400 ml-1">Participants (Optional)</label>
                            <div className="relative group">
                              <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
                              <select
                                value={formData.participants}
                                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-brand-orange focus:bg-white transition-all text-sm font-bold text-gray-800 appearance-none cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
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
                            className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-bold font-outfit uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8 group cursor-pointer"
                          >
                            {loading ? (
                              <><Loader2 className="animate-spin" size={16} /> Securely Processing...</>
                            ) : (
                              <>{workshop.fees && Number(workshop.fees) > 0 ? 'Proceed to Payment' : 'Confirm Booking'} <CheckCircle2 size={16} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                          </button>
                        </form>
                      )}
                    </>
                  )}

                  {activeTab === 'history' && (
                    <div className="flex flex-col flex-1 text-left font-outfit">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Your Booking History</h3>
                      {historyLoading ? (
                        <div className="flex-grow flex items-center justify-center py-8">
                          <Loader2 className="animate-spin text-brand-orange" size={24} />
                        </div>
                      ) : bookingHistory.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-sm text-gray-400">You haven't booked any slots for this workshop yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
                          {bookingHistory.map((booking) => (
                            <div key={booking.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col gap-2 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-800">{booking.fullName}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${booking.status === 'paid'
                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 space-y-1">
                                <p>Seats: <span className="font-bold text-gray-700">{booking.participants}</span></p>
                                <p>Contact: <span className="font-bold text-gray-700">{booking.phone}</span></p>
                                {booking.razorpayPaymentId && (
                                  <p className="text-[10px] text-gray-400">Payment ID: {booking.razorpayPaymentId}</p>
                                )}
                                <p className="text-[9px] text-gray-400">Booked on: {booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000).toLocaleString() : 'Recent'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                    className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative border border-gray-50"
                  >
                    <button onClick={() => setShowConfirmModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                      <X size={18} />
                    </button>
                    <div className="w-14 h-14 bg-orange-50 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                      <AlertCircle size={28} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2 font-outfit">Confirm Booking & Pay</h4>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed font-outfit">
                      You are booking a slot for <strong className="font-bold text-gray-800">{formData.fullName}</strong> ({formData.participants} {formData.participants === '1' ? 'person' : 'people'}) to attend <strong className="font-bold text-gray-800">{workshop.name}</strong>.
                    </p>
                    <div className="border-t border-b border-gray-100 py-4 mb-6 flex justify-between items-center px-2 font-outfit">
                      <span className="text-xs font-bold text-gray-400 uppercase">Total Amount:</span>
                      <span className="text-xl font-black text-brand-orange">₹{totalAmount}</span>
                    </div>
                    <div className="flex gap-3 font-outfit">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRazorpayPayment}
                        disabled={loading}
                        className={`flex-1 bg-brand-orange hover:bg-brand-orange/95 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-brand-orange/10 transition-all cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                          }`}
                      >
                        {loading ? 'Processing...' : 'Pay Now'}
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
