import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Plus, Minus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, onSnapshot, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { buyNowItem } = location.state || {};
  
  const [activeStep, setActiveStep] = useState('address'); // 'address', 'summary', 'payment', 'confirm'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipping] = useState(80);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

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

    // Handle Buy Now Case
    if (buyNowItem) {
      setItems([buyNowItem]);
      setLoading(false);
    } else {
      // Standard Cart Fetching
      const cartItemsQuery = query(collection(db, 'users', user.uid, 'cart'));
      const unsubscribeCart = onSnapshot(cartItemsQuery, (snapshot) => {
        const cartItems = snapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }));
        setItems(cartItems);
        setLoading(false);
      });
      return () => unsubscribeCart();
    }
  }, [user, buyNowItem]);

  // Load Razorpay script dynamically
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement('script');
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch Saved Addresses
  useEffect(() => {
    if (!user) return;

    const addressesQuery = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribeAddresses = onSnapshot(addressesQuery, (snapshot) => {
      const addresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedAddresses(addresses);

      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr && !formData.address && !selectedAddressId) {
        handleSelectAddress(defaultAddr);
      } else if (addresses.length > 0 && !selectedAddressId) {
        handleSelectAddress(addresses[0]);
      }
    });

    return () => unsubscribeAddresses();
  }, [user]);

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    const names = address.fullName ? address.fullName.split(' ') : [''];
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
  const deliveryCharges = shipping;
  const total = subtotal + deliveryCharges;

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    
    // Check if unique piece is being incremented
    const isUnique = item.isUniquePiece === true || item.productType === 'Unique';
    if (isUnique && newQty > 1) {
      alert("This is a unique piece, only 1 is available.");
      return;
    }

    if (buyNowItem) {
      const updatedItems = items.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
      setItems(updatedItems);
    } else {
      if (!user) return;
      const cartItemRef = doc(db, 'users', user.uid, 'cart', item.docId);
      await updateDoc(cartItemRef, { qty: newQty });
    }
  };

  const handleRemoveItem = async (item) => {
    if (buyNowItem) {
      const updatedItems = items.filter(i => i.id !== item.id);
      setItems(updatedItems);
      if (updatedItems.length === 0) navigate(-1);
    } else {
      if (!user) return;
      const cartItemRef = doc(db, 'users', user.uid, 'cart', item.docId);
      await deleteDoc(cartItemRef);
    }
  };

  const validateStock = async () => {
    try {
      for (const item of items) {
        const productId = item.id?.toString();
        if (!productId) {
          alert(`Unable to validate stock for "${item.name}". Invalid Product ID.`);
          return false;
        }
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) {
          alert(`Product "${item.name}" was not found in our collection.`);
          return false;
        }
        const productData = productSnap.data();
        const isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
        const currentStock = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);

        if (isUnique) {
          if (currentStock === 0 || productData.isAvailable === false) {
            alert(`Apologies! The unique piece "${item.name}" is already sold out.`);
            return false;
          }
        } else {
          if (currentStock === 0) {
            alert(`Apologies! The product "${item.name}" is out of stock.`);
            return false;
          }
          if (item.qty > currentStock) {
            alert(`Apologies! The product "${item.name}" has insufficient stock. Only ${currentStock} left in stock.`);
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Stock validation error:", error);
      alert("An error occurred while validating stock. Please try again.");
      return false;
    }
  };

  const processOrder = async (razorpayPaymentId = null) => {
    try {
      const orderId = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;

      const isStockAvailable = await validateStock();
      if (!isStockAvailable) return;

      const availabilityPromises = items.map(async (item) => {
        const productId = item.id?.toString();
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          const isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';
          const currentStock = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);

          if (isUnique) {
            return updateDoc(productRef, {
              isAvailable: false,
              stock: 0,
              updatedAt: serverTimestamp()
            });
          } else {
            const newStock = Math.max(0, currentStock - item.qty);
            return updateDoc(productRef, {
              stock: newStock,
              isAvailable: newStock > 0,
              updatedAt: serverTimestamp()
            });
          }
        }
      });
      await Promise.all(availabilityPromises);

      await addDoc(collection(db, "orders"), {
        orderId: orderId,
        customerUid: user.uid,
        customerName: `${formData.firstName} ${formData.lastName}`,
        totalAmount: total,
        paymentMethod: paymentMethod,
        razorpayPaymentId: razorpayPaymentId,
        items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, productType: i.productType || 'Standard' })),
        subtotal,
        shipping: deliveryCharges,
        total,
        status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        shippingAddress: formData,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        type: 'order',
        uid: orderId,
        message: `New Order Placed: ${orderId} by ${user.email}`,
        createdAt: serverTimestamp(),
      });

      if (!buyNowItem) {
        const cartRef = collection(db, 'users', user.uid, 'cart');
        const cartSnap = await getDocs(cartRef);
        const deletePromises = cartSnap.docs.map(item => deleteDoc(doc(db, 'users', user.uid, 'cart', item.id)));
        await Promise.all(deletePromises);
      }

      setActiveStep('confirm');
    } catch (error) {
      console.error("Order Error:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleRazorpayPayment = () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: "INR",
      name: "MayaSindhu",
      description: "Heritage Purchase",
      image: "/src/assets/mstitle.png",
      handler: async function (response) {
        await processOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: user.email,
        contact: formData.phone
      },
      theme: {
        color: "brand-orange"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment cancelled by user");
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    if (!formData.firstName || !formData.address || !formData.phone) {
      alert("Please select or add a delivery address.");
      return;
    }

    const isStockAvailable = await validateStock();
    if (!isStockAvailable) return;

    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      handleRazorpayPayment();
    } else {
      await processOrder();
    }
  };

  const StepHeader = ({ stepNum, title, isCompleted, onEdit, summary, isActive }) => {
    if (isCompleted && !isActive) {
      return (
        <div onClick={onEdit} className={`bg-brand-orange px-4 py-3 flex justify-between items-center text-white ${onEdit ? 'cursor-pointer hover:bg-brand-orange-dark transition' : ''}`}>
          <div className="flex items-start">
            <div className="bg-white/20 text-white font-bold text-xs w-6 h-6 flex items-center justify-center mr-4 rounded-[2px] mt-0.5">
              ✓
            </div>
            <div>
              <div className="font-semibold text-[15px]">{title}</div>
              {summary && <div className="text-sm font-medium mt-1">{summary}</div>}
            </div>
          </div>
          {onEdit && (
            <button className="bg-white text-brand-orange font-semibold text-sm px-6 py-2 rounded shadow-sm hover:shadow transition">
              CHANGE
            </button>
          )}
        </div>
      );
    }
    return (
      <div onClick={onEdit} className={`bg-brand-orange px-4 py-3 flex items-center text-white ${onEdit ? 'cursor-pointer hover:bg-brand-orange-dark transition' : ''}`}>
        <div className="bg-white text-brand-orange text-sm font-bold w-6 h-6 flex items-center justify-center mr-4 rounded-[2px]">
          {stepNum}
        </div>
        <span className="font-semibold text-[15px]">{title}</span>
      </div>
    );
  };

  if (activeStep === 'confirm') {
    return (
      <div className="bg-[#f1f3f6] min-h-screen pt-8 pb-20 font-sans flex items-center justify-center">
        <div className="bg-white p-12 rounded-sm shadow-sm text-center max-w-lg mx-4">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for your purchase. We've sent the confirmation details to your email.
          </p>
          <Link to="/" className="bg-brand-orange text-white px-8 py-3 rounded-sm font-semibold shadow hover:bg-green-700 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] min-h-screen pt-8 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Accordion List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* STEP 1: LOGIN */}
          <div className="bg-white shadow-sm overflow-hidden rounded-[2px]">
            <StepHeader 
              stepNum="1" 
              title="LOGIN OR SIGNUP" 
              isCompleted={!!user && activeStep !== 'login'} 
              isActive={activeStep === 'login'} 
              summary={user && activeStep !== 'login' ? `Logged in as ${user.email}` : null} 
              onEdit={() => setActiveStep('login')} 
            />
            {activeStep === 'login' && (
              <div className="p-4 md:p-6 bg-[#f1f3f6]/30 border-t border-gray-100">
                {!user ? (
                  <div className="max-w-sm bg-white p-6 border border-gray-200 rounded-[2px]">
                    <p className="text-sm text-gray-600 mb-4">Please log in to continue your checkout.</p>
                    <input type="email" placeholder="Email" className="w-full border border-gray-300 px-4 py-3 rounded-[2px] mb-3 text-sm focus:outline-none focus:border-brand-orange" id="checkout-email" />
                    <input type="password" placeholder="Password" className="w-full border border-gray-300 px-4 py-3 rounded-[2px] mb-4 text-sm focus:outline-none focus:border-brand-orange" id="checkout-password" />
                    <button 
                      onClick={async () => {
                        const email = document.getElementById('checkout-email').value;
                        const password = document.getElementById('checkout-password').value;
                        if (email && password) {
                          try {
                            await login(email, password);
                            setActiveStep('address');
                          } catch (e) {
                            alert("Login failed. Please check your credentials.");
                          }
                        }
                      }}
                      className="bg-brand-orange text-white px-8 py-3 font-semibold text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase w-full"
                    >
                      Login
                    </button>
                  </div>
                ) : (
                  <div className="max-w-sm bg-white p-6 border border-gray-200 rounded-[2px]">
                    <p className="text-sm text-gray-800 font-semibold mb-2">You are logged in securely.</p>
                    <p className="text-sm text-gray-600 mb-6">{user.email}</p>
                    <button 
                      onClick={() => setActiveStep('address')}
                      className="bg-brand-orange text-white px-8 py-3 font-semibold text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase w-full mb-3"
                    >
                      Continue Checkout
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        setActiveStep('login');
                      }}
                      className="text-brand-orange font-semibold text-sm w-full uppercase hover:underline"
                    >
                      Logout and use another account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: ADDRESS */}
          <div className="bg-white shadow-sm overflow-hidden rounded-[2px]">
            <StepHeader 
              stepNum="2" 
              title="DELIVERY ADDRESS" 
              isCompleted={activeStep !== 'address' && selectedAddressId} 
              isActive={activeStep === 'address'} 
              summary={activeStep !== 'address' && formData.address ? `${formData.firstName} - ${formData.address}, ${formData.city}` : null}
              onEdit={() => setActiveStep('address')}
            />
            
            {activeStep === 'address' && (
              <div className="p-4 md:p-6 bg-[#f1f3f6]/30">
                {savedAddresses.map((addr) => (
                  <label key={addr.id} className={`flex items-start p-4 mb-4 border rounded-[2px] cursor-pointer bg-white transition-all ${selectedAddressId === addr.id ? 'border-brand-orange' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="address" 
                      className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange accent-brand-orange" 
                      checked={selectedAddressId === addr.id}
                      onChange={() => handleSelectAddress(addr)}
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-[15px]">{addr.fullName}</span>
                        <span className="bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider rounded-sm">{addr.type || 'HOME'}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">
                        {addr.address}, {addr.city}, {addr.state} - <span className="font-medium">{addr.zip}</span>
                      </p>
                      <p className="text-sm text-gray-700 mb-4">Phone: <span className="font-semibold">{addr.phone}</span></p>
                      
                      {selectedAddressId === addr.id && (
                        <button 
                          onClick={() => setActiveStep('summary')} 
                          className="bg-brand-orange text-white px-8 py-3 font-semibold text-sm rounded-[2px] shadow-sm hover:shadow transition uppercase"
                        >
                          Deliver Here
                        </button>
                      )}
                    </div>
                  </label>
                ))}

                <div 
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="bg-white border border-dashed border-brand-orange p-4 text-brand-orange font-bold flex items-center justify-center gap-2 cursor-pointer rounded-[2px] hover:bg-orange-50 transition uppercase"
                >
                  <Plus size={18} strokeWidth={2.5} /> ADD A NEW ADDRESS
                </div>

                {isAddingAddress && (
                  <div className="mt-4 bg-[#f1f3f6]/30 p-6 border border-gray-200 rounded-[2px]">
                    <div className="mb-6 flex items-center text-[15px] font-semibold text-gray-800">
                      <Check size={18} strokeWidth={2.5} className="text-[#1BAFAF] mr-2" /> Delivery available in Kolhapur
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <input 
                        type="text" 
                        placeholder="10-digit mobile number" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <input 
                        type="text" 
                        placeholder="Pincode" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <input 
                        type="text" 
                        placeholder="Locality" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <div className="md:col-span-2">
                        <textarea 
                          placeholder="Address (Area and Street)" 
                          rows="3" 
                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange resize-none" 
                        ></textarea>
                      </div>
                      <input 
                        type="text" 
                        placeholder="City/District/Town" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <input 
                        type="text" 
                        placeholder="State" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                      <input 
                        type="text" 
                        placeholder="Alternate Phone (Optional)" 
                        className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange" 
                      />
                    </div>
                    
                    <div className="mt-6 flex gap-4">
                      <button 
                        className="bg-brand-orange text-white px-8 py-3 font-semibold text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase"
                      >
                        Save and Deliver Here
                      </button>
                      <button 
                        onClick={() => setIsAddingAddress(false)}
                        className="text-gray-500 font-semibold text-[15px] hover:text-brand-orange transition uppercase px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: ORDER SUMMARY */}
          <div className="bg-white shadow-sm overflow-hidden rounded-[2px]">
            <StepHeader 
              stepNum="3" 
              title="ORDER SUMMARY" 
              isCompleted={activeStep === 'payment'} 
              isActive={activeStep === 'summary'} 
              summary={activeStep === 'payment' ? `${items.reduce((a,b)=>a+b.qty,0)} Item(s)` : null}
              onEdit={() => setActiveStep('summary')}
            />
            
            {activeStep === 'summary' && (
              <div className="p-4 md:p-6 bg-white">
                <div className="max-h-[390px] overflow-y-auto custom-scrollbar pr-2">
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Your bag is empty.</div>
                  ) : (
                    items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 md:gap-6 py-4 border-b border-gray-100 last:border-0 relative">
                        <div className="w-20 h-24 flex-shrink-0 bg-gray-50 border border-gray-200 p-1">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[15px] text-[#1A1A1A] font-medium pr-8">{item.name}</h4>
                            <p className="text-lg font-bold text-[#1A1A1A] mt-1">₹{item.price.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center bg-gray-50 rounded border border-gray-200 px-1 py-0.5">
                              <button 
                                onClick={() => handleUpdateQuantity(item, item.qty - 1)}
                                className="p-1 text-gray-500 hover:text-black transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                              <button 
                                onClick={() => handleUpdateQuantity(item, item.qty + 1)}
                                className="p-1 text-gray-500 hover:text-black transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setActiveStep('payment')} 
                    className="bg-brand-orange text-white px-10 py-3.5 font-bold text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: PAYMENT OPTIONS */}
          <div className="bg-white shadow-sm overflow-hidden rounded-[2px]">
            <StepHeader 
              stepNum="4" 
              title="PAYMENT OPTIONS" 
              isCompleted={false} 
              isActive={activeStep === 'payment'} 
              onEdit={() => setActiveStep('payment')}
            />
            
            {activeStep === 'payment' && (
              <div className="bg-white">
                <label className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition ${paymentMethod === 'upi' ? 'bg-[#f1f3f6]/30' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="w-4 h-4 text-brand-orange focus:ring-brand-orange accent-brand-orange mr-4" 
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <span className="text-[15px] text-[#1A1A1A] font-medium">UPI / Net Banking</span>
                </label>
                
                <label className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition ${paymentMethod === 'card' ? 'bg-[#f1f3f6]/30' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="w-4 h-4 text-brand-orange focus:ring-brand-orange accent-brand-orange mr-4" 
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <span className="text-[15px] text-[#1A1A1A] font-medium">Credit / Debit / ATM Card</span>
                </label>


                <div className="p-6 border-t border-gray-100 bg-[#f1f3f6]/30 flex justify-end">
                  <button 
                    onClick={handlePlaceOrder} 
                    className="bg-brand-orange text-white px-10 py-3.5 font-bold text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Price Details */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-[2px] sticky top-24">
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-gray-500 font-bold text-sm tracking-wide uppercase">Price Details</h3>
            </div>
            <div className="p-4 space-y-5 text-[15px]">
              <div className="flex justify-between">
                <span>Price ({items.reduce((a,b)=>a+b.qty, 0)} item{items.reduce((a,b)=>a+b.qty, 0) !== 1 ? 's' : ''})</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gross Amount</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-green-600">₹{deliveryCharges.toLocaleString()}</span>
              </div>

            </div>
            <div className="border-t border-dashed border-gray-200 p-4">
              <div className="flex justify-between font-bold text-lg text-[#1A1A1A]">
                <span>Total Payable</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 text-brand-orange font-bold text-sm">
              Your Total Savings on this order ₹0
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-gray-500 text-xs font-medium px-2">
            <Shield size={24} className="text-gray-400" />
            <p>Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
