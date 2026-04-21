import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Lock, CreditCard, Truck, ShoppingBag, MapPin, MapPinned } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const steps = ['Shipping', 'Payment', 'Confirmation'];

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipping] = useState(500);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    // List and Fetch Cart Items
    const cartItemsQuery = query(collection(db, 'users', user.uid, 'cart'));
    const unsubscribeCart = onSnapshot(cartItemsQuery, (snapshot) => {
      const cartItems = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setItems(cartItems);
      setLoading(false);
    });

    // List and Fetch Saved Addresses
    const addressesQuery = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribeAddresses = onSnapshot(addressesQuery, (snapshot) => {
      const addresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedAddresses(addresses);
      
      // Auto-select default address if available and form is empty
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr && !formData.address) {
        handleSelectAddress(defaultAddr);
      }
    });

    return () => {
      unsubscribeCart();
      unsubscribeAddresses();
    };
  }, [user]);

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    const names = address.fullName.split(' ');
    setFormData({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      phone: address.phone
    });
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subtotal + (subtotal > 25000 ? 0 : shipping);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    try {
      const orderId = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // 1. Save Order to Firestore
      await addDoc(collection(db, "orders"), {
        orderId: orderId,
        customerUid: user.uid,
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: user.email,
        items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        subtotal,
        shipping: subtotal > 25000 ? 0 : shipping,
        total,
        status: 'Pending',
        shippingAddress: formData,
        createdAt: serverTimestamp(),
      });

      // 2. Trigger Admin Notification
      await addDoc(collection(db, "notifications"), {
        type: 'order',
        uid: orderId,
        message: `New Order Placed: ${orderId} by ${user.email}`,
        createdAt: serverTimestamp(),
      });

      // 3. Clear Cart
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const cartSnap = await getDocs(cartRef);
      const deletePromises = cartSnap.docs.map(item => deleteDoc(doc(db, 'users', user.uid, 'cart', item.id)));
      await Promise.all(deletePromises);

      nextStep();
    } catch (error) {
      console.error("Order Error:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 md:py-24 font-sans focus-within:scroll-smooth">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                  index <= activeStep ? 'bg-brand-orange text-white' : 'bg-white text-gray-300 border border-gray-100'
                }`}
              >
                {index < activeStep ? <Check size={20} /> : index + 1}
              </div>
              <span className={`mt-4 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${
                index <= activeStep ? 'text-brand-orange' : 'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div 
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Truck className="text-brand-orange" size={24} />
                    <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Shipping Details</h2>
                  </div>

                  {/* Saved Addresses Picker */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-12">
                      <div className="flex items-center gap-2 mb-6 px-2">
                        <MapPinned size={14} className="text-brand-orange" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Select from Saved Addresses</span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectAddress(addr)}
                            className={`flex-shrink-0 w-64 p-6 rounded-3xl border-2 transition-all text-left snap-start relative ${
                              selectedAddressId === addr.id 
                                ? 'border-brand-orange bg-brand-orange/[0.02] shadow-lg shadow-brand-orange/5' 
                                : 'border-gray-50 bg-[#FAF9F6]/50 hover:border-gray-200'
                            }`}
                          >
                            {selectedAddressId === addr.id && (
                              <div className="absolute top-4 right-4 bg-brand-orange text-white p-1 rounded-full">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                            <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 mb-3">{addr.type}</p>
                            <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">{addr.fullName}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {addr.address}, {addr.city}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput label="First Name" value={formData.firstName} onChange={(v) => { setFormData({...formData, firstName: v}); setSelectedAddressId(null); }} />
                      <FormInput label="Last Name" value={formData.lastName} onChange={(v) => { setFormData({...formData, lastName: v}); setSelectedAddressId(null); }} />
                    </div>
                    <FormInput label="Street Address" value={formData.address} onChange={(v) => { setFormData({...formData, address: v}); setSelectedAddressId(null); }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormInput label="City" value={formData.city} onChange={(v) => { setFormData({...formData, city: v}); setSelectedAddressId(null); }} />
                      <FormInput label="State" value={formData.state} onChange={(v) => { setFormData({...formData, state: v}); setSelectedAddressId(null); }} />
                      <FormInput label="Zip Code" value={formData.zip} onChange={(v) => { setFormData({...formData, zip: v}); setSelectedAddressId(null); }} />
                    </div>
                    <FormInput label="Phone Number" type="tel" value={formData.phone} onChange={(v) => { setFormData({...formData, phone: v}); setSelectedAddressId(null); }} />
                  </form>

                  <div className="mt-12 flex justify-end">
                    <button onClick={nextStep} className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-2 transition-transform active:scale-95 shadow-xl shadow-brand-orange/20">
                      Proceed to Payment <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <CreditCard className="text-brand-orange" size={24} />
                    <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Payment Method</h2>
                  </div>

                  <div className="space-y-4 mb-10">
                    <PaymentOption label="Credit / Debit Card" icon={<CreditCard size={20} />} active />
                    <PaymentOption label="UPI / Net Banking" icon={<ShoppingBag size={20} />} />
                    <PaymentOption label="Cash on Delivery (Heritage)" icon={<Truck size={20} />} />
                  </div>

                  <form className="space-y-6">
                    <FormInput label="Cardholder Name" />
                    <FormInput label="Card Number" placeholder="**** **** **** ****" />
                    <div className="grid grid-cols-2 gap-6">
                      <FormInput label="Expiry Date" placeholder="MM / YY" />
                      <FormInput label="CVV" placeholder="***" type="password" />
                    </div>
                  </form>

                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="text-sm font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors">Back to Shipping</button>
                    <button onClick={handlePlaceOrder} className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-2 transition-transform active:scale-95 shadow-xl shadow-brand-orange/20">
                      Place Order <Lock size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div 
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-12 md:p-20 rounded-[4rem] shadow-sm text-center"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <h2 className="text-4xl font-fashion font-bold text-[#1A1A1A] mb-4">A Heritage Treasure is on its way!</h2>
                  <p className="text-gray-500 text-lg mb-12 max-w-md mx-auto leading-relaxed">
                    Your order has been successfully placed. We've sent the confirmation details to your email.
                  </p>
                  <Link to="/shop" className="btn btn-primary px-12 py-5 rounded-full inline-block shadow-xl shadow-brand-orange/20">Continue Shopping</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          {activeStep < 2 && (
            <div className="lg:col-span-1">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 sticky top-12">
                <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-8">Order Details</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">{items.length} Heritage Items</span>
                    <span className="font-bold text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Shipping Fee</span>
                    <span className={`font-bold ${subtotal > 25000 ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                      {subtotal > 25000 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-fashion font-bold pt-6 border-t border-gray-50">
                  <span>Grand Total</span>
                  <span className="text-brand-orange">₹{total.toLocaleString()}</span>
                </div>
                <div className="mt-8 p-4 bg-[#FAF9F6] rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    By completing your purchase you agree to our Terms of Use and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function FormInput({ label, type = 'text', placeholder = '', value = '', onChange }) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-2 group-focus-within:text-brand-orange transition-colors">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF9F6] px-6 py-4 rounded-2xl border border-transparent focus:outline-none focus:bg-white focus:border-brand-orange/20 focus:ring-4 focus:ring-brand-orange/5 transition-all font-medium text-sm"
      />
    </div>
  );
}

function PaymentOption({ label, icon, active }) {
  return (
    <div className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${
      active ? 'bg-brand-orange/[0.02] border-brand-orange/20 text-brand-orange' : 'bg-[#FAF9F6]/50 border-gray-50 text-gray-400 hover:border-gray-200 hover:text-[#1A1A1A]'
    }`}>
      <div className="flex items-center gap-4">
        {icon}
        <span className="font-bold text-xs uppercase tracking-widest leading-none">{label}</span>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        active ? 'border-brand-orange bg-brand-orange' : 'border-gray-200 bg-white'
      }`}>
        {active && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
      </div>
    </div>
  );
}
