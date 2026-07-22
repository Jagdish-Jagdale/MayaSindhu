/**

 * File: Checkout.jsx

 * Description: Client-facing multi-step order checkout page with form fields for shipping details, Razorpay payments, and Firestore order submissions.

 * Work Done: Converted uncontrolled HTML form inputs to controlled React states to align with pure React rules. Added screen-reader accessible labels to checkout forms. Replaced generic browser alert boxes with clean toast feedback.

 */



import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { Check, Shield, Plus, Minus, Trash2, Edit2, Loader2, AlertTriangle } from 'lucide-react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { db } from '../../firebase';

import { collection, addDoc, serverTimestamp, query, onSnapshot, getDocs, deleteDoc, doc, updateDoc, getDoc, where } from 'firebase/firestore';

import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';
import { getFriendlyErrorMessage } from '../../utils/firebaseErrors';
import useEscapeKey from '../../hooks/useEscapeKey';



export default function Checkout() {

  const { user, login, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const { buyNowItem } = location.state || {};



  const [activeStep, setActiveStep] = useState('address'); // 'address', 'summary', 'payment', 'confirm'

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deliveryRates, setDeliveryRates] = useState([]);

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  const [addressErrors, setAddressErrors] = useState({});

  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addressToDelete, setAddressToDelete] = useState(null);

  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [consentChecked, setConsentChecked] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: 'Alert', message: '' });

  // Modals for escape key
  useEscapeKey(() => setAddressToDelete(null), !!addressToDelete);
  useEscapeKey(() => setShowLogoutConfirm(false), showLogoutConfirm);
  useEscapeKey(() => setErrorModal({ isOpen: false, title: 'Alert', message: '' }), errorModal.isOpen);



  const [checkoutEmail, setCheckoutEmail] = useState('');

  const [checkoutPassword, setCheckoutPassword] = useState('');



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



  const [newAddress, setNewAddress] = useState({

    fullName: '',

    phone: '',

    zip: '',

    locality: '',

    address: '',

    city: '',

    state: '',

    alternatePhone: '',

    type: 'HOME'

  });



  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const [isLocationEditable, setIsLocationEditable] = useState(false);



  const showError = (message, title = "Alert") => {

    setErrorModal({ isOpen: true, title, message });

  };



  useEffect(() => {

    if (!newAddress.zip || newAddress.zip.length !== 6) {

      setNewAddress(prev => ({

        ...prev,

        city: '',

        state: ''

      }));

      setIsLocationEditable(false);

      return;

    }



    const fetchLocation = async () => {

      setIsFetchingLocation(true);

      setIsLocationEditable(false);

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {

        const res = await fetch(`https://api.postalpincode.in/pincode/${newAddress.zip}`, {

          signal: controller.signal

        });

        clearTimeout(timeoutId);

        if (!res.ok) {

          throw new Error(`HTTP error! status: ${res.status}`);

        }

        const data = await res.json();

        if (data && data[0]) {

          if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {

            const office = data[0].PostOffice[0];

            const stateName = office.State;

            const districtName = office.District;



            setNewAddress(prev => ({

              ...prev,

              city: districtName || prev.city,

              state: stateName || prev.state

            }));



            setAddressErrors(prev => ({

              ...prev,

              zip: '',

              city: '',

              state: ''

            }));

          } else {

            setAddressErrors(prev => ({

              ...prev,

              zip: 'Entered pincode is not recognized.'

            }));

            setNewAddress(prev => ({

              ...prev,

              city: '',

              state: ''

            }));

            setIsLocationEditable(true);

          }

        }

      } catch (error) {

        clearTimeout(timeoutId);

        toast.error("Failed to fetch location details for pincode.");

        setNewAddress(prev => ({

          ...prev,

          city: '',

          state: ''

        }));

        setIsLocationEditable(true);

      } finally {

        setIsFetchingLocation(false);

      }

    };

    fetchLocation();

  }, [newAddress.zip]);



  const INDIAN_STATES = [

    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",

    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",

    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",

    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",

    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",

    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",

    "Lakshadweep", "Puducherry"

  ];



  useEffect(() => {

    if (!user) {

      setItems([]);

      setLoading(false);

      return;

    }



    // Handle Buy Now Case

    if (buyNowItem) {

      const resolveBuyNow = async () => {

        try {

          const prodRef = doc(db, 'products', buyNowItem.id.toString());

          const prodSnap = await getDoc(prodRef);

          if (prodSnap.exists()) {

            const prodData = prodSnap.data();

            let actualPrice = prodData.actualPrice || prodData.price || 0;

            if (buyNowItem.variantId) {

              const variantRef = doc(db, 'products', buyNowItem.id.toString(), 'variants', buyNowItem.variantId);

              const variantSnap = await getDoc(variantRef);

              if (variantSnap.exists()) {

                const variantData = variantSnap.data();

                actualPrice = variantData.actualPrice || variantData.price || actualPrice;

              }

            }

            setItems([{

              ...buyNowItem,

              actualPrice: actualPrice

            }]);

          } else {

            setItems([buyNowItem]);

          }

        } catch (e) {

          setItems([buyNowItem]);

        }

        setLoading(false);

      };

      resolveBuyNow();

    } else {

      const cartItemsQuery = query(collection(db, 'users', user.uid, 'cart'));

      const unsubscribeCart = onSnapshot(cartItemsQuery, async (snapshot) => {

        const cartItems = snapshot.docs.map(doc => ({

          docId: doc.id,

          ...doc.data()

        }));



        const resolvedItems = await Promise.all(cartItems.map(async (item) => {

          try {

            const prodRef = doc(db, 'products', item.id.toString());

            const prodSnap = await getDoc(prodRef);

            if (prodSnap.exists()) {

              const prodData = prodSnap.data();

              let actualPrice = prodData.actualPrice || prodData.price || 0;

              if (item.variantId) {

                const variantRef = doc(db, 'products', item.id.toString(), 'variants', item.variantId);

                const variantSnap = await getDoc(variantRef);

                if (variantSnap.exists()) {

                  const variantData = variantSnap.data();

                  actualPrice = variantData.actualPrice || variantData.price || actualPrice;

                }

              }

              return {

                ...item,

                price: item.price || prodData.discountedPrice || prodData.price || 0,

                actualPrice: actualPrice

              };

            }

          } catch (err) {

          }

          return item;

        }));



        setItems(resolvedItems);

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



  // Create Razorpay order via backend

  const createRazorpayOrder = async (amount) => {

    try {

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create_order.php`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          amount: amount,

          currency: 'INR',

          receipt: 'order_' + Date.now()

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

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/verify_payment.php`, {

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



  useEffect(() => {

    const q = query(collection(db, 'deliverychargers'));

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

      }));

      setDeliveryRates(data);

    }, (error) => {

    });

    return () => unsubscribe();

  }, []);



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

  const deliveryCharges = (() => {

    let zipToEvaluate = null;



    if (selectedAddressId) {

      const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId);

      if (selectedAddress && selectedAddress.zip) {

        zipToEvaluate = selectedAddress.zip;

      }

    } else if (newAddress.zip && newAddress.zip.length === 6) {

      zipToEvaluate = newAddress.zip;

    }



    if (!zipToEvaluate) return 0;



    const rate = deliveryRates.find(r => {

      const pins = r.pincodes || [r.pincode] || [];

      return pins.includes(zipToEvaluate);

    });



    return rate ? rate.charge : 0;

  })();

  const total = subtotal + deliveryCharges;

  const gstAmount = Math.round(subtotal * 0.08);

  const actualPrice = subtotal - gstAmount;

  const totalSavings = items.reduce((acc, item) => {

    const itemActual = Number(item.actualPrice || item.price || 0);

    const itemPaid = Number(item.price || 0);

    return acc + (Math.max(0, itemActual - itemPaid) * Number(item.qty || 1));

  }, 0);



  const handleUpdateQuantity = async (item, newQty) => {

    if (newQty < 1) return;



    // Check if unique piece is being incremented

    const isUnique = item.isUniquePiece === true || item.productType === 'Unique';

    if (isUnique && newQty > 1) {

      showError("This is a unique piece, only 1 is available.");

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



  const handleSaveAddress = async () => {

    const { fullName, phone, zip, locality, address, city, state, alternatePhone, type } = newAddress;

    const errors = {};



    if (!fullName || !fullName.trim()) {

      errors.fullName = "Name is a required field.";

    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {

      errors.fullName = "Name can only contain letters and spaces.";

    } else if (fullName.trim().length < 2) {

      errors.fullName = "Name must be at least 2 characters.";

    } else if (fullName.length > 50) {

      errors.fullName = "Name cannot exceed 50 characters.";

    }



    if (!phone) {

      errors.phone = "Mobile number is required.";

    } else if (!/^[6-9]\d{9}$/.test(phone)) {

      errors.phone = "Please enter a valid mobile number.";

    }



    if (!zip) {

      errors.zip = "Pincode is required.";

    } else if (!/^\d{6}$/.test(zip)) {

      errors.zip = "Pincode must be exactly 6 digits.";

    } else if (addressErrors.zip === 'Entered pincode is not recognized.') {

      errors.zip = "Entered pincode is not recognized.";

    }



    if (!locality || !locality.trim()) {

      errors.locality = "Locality is required.";

    }



    if (!address || !address.trim()) {

      errors.address = "Address is required.";

    } else if (address.length > 200) {

      errors.address = "Address cannot exceed 200 characters.";

    }



    if (!errors.zip) {

      if (!city || !city.trim()) {

        errors.city = "City is required.";

      }



      if (!state) {

        errors.state = "Please select a State.";

      }

    }



    if (alternatePhone && !/^[6-9]\d{9}$/.test(alternatePhone)) {

      errors.alternatePhone = "Please enter a valid alternate mobile number.";

    }



    if (Object.keys(errors).length > 0) {

      setAddressErrors(errors);

      return;

    }

    setAddressErrors({});



    try {

      let savedId = editingAddressId;

      const isDefault = savedAddresses.length === 0;



      if (editingAddressId) {

        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingAddressId), {

          fullName,

          phone,

          zip,

          locality,

          address,

          city,

          state,

          alternatePhone: alternatePhone || '',

          type

        });

        setEditingAddressId(null);

      } else {

        if (savedAddresses.length >= 3) {

          showError("You can save a maximum of 3 addresses. Please delete an address to add a new one.");

          return;

        }

        const addrRef = await addDoc(collection(db, 'users', user.uid, 'addresses'), {

          fullName,

          phone,

          zip,

          locality,

          address,

          city,

          state,

          alternatePhone: alternatePhone || '',

          type,

          isDefault

        });

        savedId = addrRef.id;

      }



      // Clear the form and close it

      setNewAddress({

        fullName: '',

        phone: '',

        zip: '',

        locality: '',

        address: '',

        city: '',

        state: '',

        alternatePhone: '',

        type: 'HOME'

      });

      setAddressErrors({});

      setIsAddingAddress(false);



      // Auto-select the newly added/edited address

      handleSelectAddress({

        id: savedId,

        fullName,

        phone,

        zip,

        locality,

        address,

        city,

        state,

        alternatePhone,

        type,

        isDefault

      });



    } catch (error) {

      showError("Failed to save address. Please try again.");

    }

  };



  const validateStock = async () => {

    try {

      for (const item of items) {

        const productId = item.id?.toString();

        const variantId = item.variantId;

        if (!productId) {

          showError(`Unable to validate stock for "${item.name}". Invalid Product ID.`);

          return false;

        }



        let currentStock = 0;

        let isAvailable = true;

        let isUnique = item.productType === 'Unique';



        if (variantId) {

          const variantRef = doc(db, 'products', productId, 'variants', variantId);

          const variantSnap = await getDoc(variantRef);

          if (!variantSnap.exists()) {

            showError(`Selected variant of "${item.name}" was not found.`);

            return false;

          }

          const variantData = variantSnap.data();

          currentStock = typeof variantData.stock === 'number' ? variantData.stock : 0;

          isUnique = variantData.productType === 'Unique';

        } else {

          const productRef = doc(db, 'products', productId);

          const productSnap = await getDoc(productRef);

          if (!productSnap.exists()) {

            showError(`Product "${item.name}" was not found in our collection.`);

            return false;

          }

          const productData = productSnap.data();

          isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';

          currentStock = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);

          isAvailable = productData.isAvailable !== false;

        }



        if (isUnique) {

          if (currentStock === 0 || isAvailable === false) {

            showError(`Apologies! The unique piece "${item.name}" is already sold out.`);

            return false;

          }

        } else {

          if (currentStock === 0) {

            showError(`Apologies! The product "${item.name}" is out of stock.`);

            return false;

          }

          if (item.qty > currentStock) {

            showError(`Apologies! The product "${item.name}" has insufficient stock. Only ${currentStock} left in stock.`);

            return false;

          }

        }

      }

      return true;

    } catch (error) {

      showError("An error occurred while validating stock. Please try again.");

      return false;

    }

  };



  const processOrder = async (razorpayPaymentId = null, overrideMethod = null) => {

    try {

      const generateOrderId = () => {

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        const digits = '0123456789';

        const all = chars + digits;

        let suffix = '';

        suffix += chars[Math.floor(Math.random() * chars.length)];

        suffix += digits[Math.floor(Math.random() * digits.length)];

        for (let i = 2; i < 7; i++) {

          suffix += all[Math.floor(Math.random() * all.length)];

        }

        suffix = suffix.split('').sort(() => Math.random() - 0.5).join('');

        return 'ORD' + suffix;

      };

      let orderId = generateOrderId();

      let isUnique = false;

      let attempts = 0;

      while (!isUnique && attempts < 10) {

        attempts++;

        const q = query(collection(db, "orders"), where("orderId", "==", orderId));

        const snap = await getDocs(q);

        if (snap.empty) {

          isUnique = true;

        } else {

          orderId = generateOrderId();

        }

      }



      const isStockAvailable = await validateStock();

      if (!isStockAvailable) return;



      const availabilityPromises = items.map(async (item) => {

        const productId = item.id?.toString();

        const variantId = item.variantId;

        const productRef = doc(db, 'products', productId);

        const productSnap = await getDoc(productRef);



        if (productSnap.exists()) {

          const productData = productSnap.data();

          const isUnique = productData.isUniquePiece === true || productData.productType === 'Unique';

          const parentStock = typeof productData.stock === 'number' ? productData.stock : (isUnique ? 1 : 15);



          if (variantId) {

            const variantRef = doc(db, 'products', productId, 'variants', variantId);

            const variantSnap = await getDoc(variantRef);

            if (variantSnap.exists()) {

              const variantStock = Number(variantSnap.data().stock) || 0;

              const newVarStock = Math.max(0, variantStock - item.qty);

              await updateDoc(variantRef, {

                stock: newVarStock,

                updatedAt: serverTimestamp()

              });

            }

            const newParentStock = Math.max(0, parentStock - item.qty);

            return updateDoc(productRef, {

              stock: newParentStock,

              isAvailable: newParentStock > 0,

              status: newParentStock > 0,

              updatedAt: serverTimestamp()

            });

          } else {

            if (isUnique) {

              return updateDoc(productRef, {

                isAvailable: false,

                status: false,

                stock: 0,

                updatedAt: serverTimestamp()

              });

            } else {

              const newStock = Math.max(0, parentStock - item.qty);

              return updateDoc(productRef, {

                stock: newStock,

                isAvailable: newStock > 0,

                status: newStock > 0,

                updatedAt: serverTimestamp()

              });

            }

          }

        }

      });

      await Promise.all(availabilityPromises);



      const finalMethod = (typeof overrideMethod === 'string') ? overrideMethod : paymentMethod;

      const totalQty = items.reduce((sum, item) => sum + (item.qty || 1), 0);

      await addDoc(collection(db, "orders"), {

        orderId: orderId,

        customerUid: user.uid,

        customerName: `${formData.firstName} ${formData.lastName}`,

        email: user.email,

        totalAmount: total,

        paymentMethod: finalMethod,

        razorpayPaymentId: razorpayPaymentId,

        items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, productType: i.productType || 'Standard', variantId: i.variantId || '', sku: i.sku || '', image: i.image || '', color: i.color || '', design: i.design || '' })),

        quantity: totalQty,

        subtotal,

        shipping: deliveryCharges,

        total,

        status: 'Confirmed',

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

      setLoadingPayment(false);

      showError("Failed to place order: " + (error.message || error));

    }

  };



  const handleRazorpayPayment = async (method = null) => {

    if (!window.Razorpay) {

      showError("Razorpay SDK failed to load. Please check your internet connection.");

      setLoadingPayment(false);

      return;

    }



    try {

      // Create order via backend

      const orderId = await createRazorpayOrder(total * 100);

      

      const options = {

        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",

        order_id: orderId, // Use order_id from backend instead of amount

        amount: total * 100,

        currency: "INR",

        name: "MayaSindhu",

        description: "Heritage Purchase",

        handler: async function (response) {

          try {

            // Verify payment via backend

            const isValid = await verifyRazorpayPayment(

              response.razorpay_order_id,

              response.razorpay_payment_id,

              response.razorpay_signature

            );

            

            if (isValid) {

              await processOrder(response.razorpay_payment_id, method);

            } else {

              setLoadingPayment(false);

              showError("Payment verification failed. Please contact support.");

            }

          } catch (error) {
            console.error("Payment verification error:", error);
            setLoadingPayment(false);
            showError("Payment verification failed. Please try again or contact support if the amount was debited.");
          }

        },

        prefill: {

          name: `${formData.firstName} ${formData.lastName}`,

          email: user.email,

          contact: formData.phone ? (formData.phone.length === 10 ? '+91' + formData.phone : formData.phone) : ''

        },

        theme: {

          color: "#EA580C"

        },

        modal: {

          ondismiss: function () {

            setLoadingPayment(false);

            showError("Payment was cancelled. Please try again when you're ready to complete the purchase.", "Payment Cancelled");

          }

        }

      };



      const rzp = new window.Razorpay(options);

      rzp.open();

    } catch (error) {
      console.error("Payment initiation error:", error);
      setLoadingPayment(false);
      showError("Payment gateway is temporarily unavailable. Please try again later or contact support.");
    }

  };



  const handlePlaceOrder = async (overrideMethod = null) => {

    if (items.length === 0) return;



    if (loadingPayment) return;



    if (!formData.firstName || !formData.address || !formData.phone) {

      showError("Please select or add a delivery address.");

      return;

    }



    if (!consentChecked) {

      showError("Please acknowledge the unboxing video requirement to proceed.", "Consent Required");

      return;

    }



    setLoadingPayment(true);



    const isStockAvailable = await validateStock();

    if (!isStockAvailable) {

      setLoadingPayment(false);

      return;

    }



    const method = (typeof overrideMethod === 'string') ? overrideMethod : paymentMethod;

    if (method === 'upi') {

      handleRazorpayPayment(method);

    } else {

      await processOrder(null, method);

    }

  };





  if (activeStep === 'confirm') {

    return (

      <div className="bg-[#f1f3f6] min-h-screen pt-4 pb-10 md:pt-8 md:pb-20 font-sans flex items-center justify-center">

        <div className="bg-white p-6 md:p-12 rounded-sm shadow-sm text-center max-w-lg mx-4">

          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">

            <Check size={32} md:size={40} strokeWidth={3} />

          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2 md:mb-4">Order Placed Successfully!</h2>

          <p className="text-sm md:text-gray-500 mb-6 md:mb-8">

            Thank you for your purchase. We've sent the confirmation details to your email.

          </p>

          <Link to="/" className="bg-brand-orange text-white px-6 py-2.5 md:px-8 md:py-3 rounded-sm font-semibold shadow hover:bg-green-700 transition">

            Continue Shopping

          </Link>

        </div>

      </div>

    );

  }



  return (

    <div className="bg-[#f1f3f6] min-h-screen pt-4 pb-12 md:pt-8 md:pb-20 font-sans">

      <div className="max-w-[1200px] mx-auto px-2 md:px-4 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 items-start">



        {/* Accordion List */}

        <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">



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

                    <label htmlFor="checkout-email" className="sr-only">Email Address</label>

                    <input 

                      type="email" 

                      placeholder="Email" 

                      className="w-full border border-gray-300 px-4 py-3 rounded-[2px] mb-3 text-sm focus:outline-none focus:border-brand-orange" 

                      id="checkout-email" 

                      value={checkoutEmail}

                      onChange={(e) => setCheckoutEmail(e.target.value)}

                    />

                    <label htmlFor="checkout-password" className="sr-only">Password</label>

                    <input 

                      type="password" 

                      placeholder="Password" 

                      className="w-full border border-gray-300 px-4 py-3 rounded-[2px] mb-4 text-sm focus:outline-none focus:border-brand-orange" 

                      id="checkout-password" 

                      value={checkoutPassword}

                      onChange={(e) => setCheckoutPassword(e.target.value)}

                    />

                    <div className="flex gap-4 items-center">

                      <button

                        onClick={async () => {

                          if (checkoutEmail && checkoutPassword) {

                            try {

                              await login(checkoutEmail, checkoutPassword);

                              toast.success("Logged in successfully. Welcome back!");

                              setActiveStep('address');

                            } catch (e) {

                              toast.error("Login failed. Please check your credentials.");

                            }

                          }

                        }}

                        className="bg-brand-orange text-white px-4 py-2 md:px-8 md:py-3 font-semibold text-xs md:text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase flex-1"

                      >

                        Login

                      </button>

                      <button

                        type="button"

                        onClick={() => navigate(-1)}

                        className="text-gray-500 font-semibold text-xs md:text-[15px] hover:text-brand-orange transition uppercase px-4"

                      >

                        Cancel

                      </button>

                    </div>

                  </div>

                ) : (

                  <div className="max-w-sm bg-white p-6 border border-gray-200 rounded-[2px]">

                    <p className="text-sm text-gray-800 font-semibold mb-2">You are logged in securely.</p>

                    <p className="text-sm text-gray-600 mb-6">{user.email}</p>

                    <button

                      onClick={() => setActiveStep('address')}

                      className="bg-brand-orange text-white px-4 py-2 md:px-8 md:py-3 font-semibold text-xs md:text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase w-full mb-3"

                    >

                      Continue Checkout

                    </button>

                    <button

                      onClick={() => setShowLogoutConfirm(true)}

                      className="text-brand-orange font-semibold text-xs md:text-sm w-full uppercase hover:underline"

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

                      <div className="flex items-center justify-between mb-2">

                        <div className="flex items-center gap-4">

                          <span className="font-semibold text-[15px]">{addr.fullName}</span>

                          <span className="bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider rounded-sm">{addr.type || 'HOME'}</span>

                        </div>

                        <div className="flex items-center gap-3">

                          <button

                            type="button"

                            onClick={(e) => {

                              e.preventDefault();

                              e.stopPropagation();

                              setEditingAddressId(addr.id);

                              setNewAddress({

                                fullName: addr.fullName || '',

                                phone: addr.phone || '',

                                zip: addr.zip || '',

                                locality: addr.locality || '',

                                address: addr.address || '',

                                city: addr.city || '',

                                state: addr.state || '',

                                alternatePhone: addr.alternatePhone || '',

                                type: addr.type || 'HOME'

                              });

                              setIsLocationEditable(false);

                              setIsAddingAddress(true);

                            }}

                            className="p-1.5 text-gray-400 hover:text-brand-orange hover:bg-gray-50 rounded transition"

                            title="Edit Address"

                          >

                            <Edit2 size={15} />

                          </button>

                          <button

                            type="button"

                            onClick={(e) => {

                              e.preventDefault();

                              e.stopPropagation();

                              setAddressToDelete(addr.id);

                            }}

                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded transition"

                            title="Delete Address"

                          >

                            <Trash2 size={15} />

                          </button>

                        </div>

                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed mb-2">

                        {addr.address}, {addr.city}, {addr.state} - <span className="font-medium">{addr.zip}</span>

                      </p>

                      <p className="text-sm text-gray-700 mb-4">Phone: <span className="font-semibold">{addr.phone}</span></p>



                      {selectedAddressId === addr.id && (

                        <button

                          onClick={() => setActiveStep('summary')}

                          className="bg-brand-orange text-white px-4 py-2 md:px-8 md:py-3 font-semibold text-xs md:text-sm rounded-[2px] shadow-sm hover:shadow transition uppercase"

                        >

                          Deliver Here

                        </button>

                      )}

                    </div>

                  </label>

                ))}



                <div

                  onClick={() => {

                    if (savedAddresses.length >= 3) {

                      showError("You can save a maximum of 3 addresses. Please delete an address to add a new one.");

                      return;

                    }

                    setEditingAddressId(null);

                    setNewAddress({

                      fullName: '',

                      phone: '',

                      zip: '',

                      locality: '',

                      address: '',

                      city: '',

                      state: '',

                      alternatePhone: '',

                      type: 'HOME'

                    });

                    setAddressErrors({});

                    setIsLocationEditable(false);

                    setIsAddingAddress(!isAddingAddress);

                  }}

                  className="bg-white border border-dashed border-brand-orange p-2.5 md:p-4 text-brand-orange font-bold flex items-center justify-center gap-2 cursor-pointer rounded-[2px] hover:bg-orange-50 transition uppercase text-xs md:text-sm"

                >

                  <Plus size={18} strokeWidth={2.5} /> ADD A NEW ADDRESS

                </div>



                {isAddingAddress && (

                  <div className="mt-4 bg-[#f1f3f6]/30 p-6 border border-gray-200 rounded-[2px]">

                    <div className="mb-6 flex items-center text-[15px] font-semibold text-gray-800">

                      <Check size={18} strokeWidth={2.5} className="text-[#1BAFAF] mr-2" /> {editingAddressId ? "Edit Address" : "Delivery available in Kolhapur"}

                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="Name"

                          maxLength={50}

                          value={newAddress.fullName}

                          onChange={(e) => {

                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');

                            setNewAddress({ ...newAddress, fullName: val });

                            if (addressErrors.fullName) {

                              setAddressErrors({ ...addressErrors, fullName: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange"

                        />

                        {addressErrors.fullName && <span className="text-red-500 text-xs mt-1">{addressErrors.fullName}</span>}

                      </div>

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="10-digit mobile number"

                          value={newAddress.phone}

                          onChange={(e) => {

                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);

                            setNewAddress({ ...newAddress, phone: val });

                            if (addressErrors.phone) {

                              setAddressErrors({ ...addressErrors, phone: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange"

                        />

                        {addressErrors.phone && <span className="text-red-500 text-xs mt-1">{addressErrors.phone}</span>}

                      </div>

                      <div className="relative flex flex-col">

                        <input

                          type="text"

                          placeholder="Pincode"

                          value={newAddress.zip}

                          onChange={(e) => {

                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);

                            setNewAddress({ ...newAddress, zip: val });

                            if (addressErrors.zip) {

                              setAddressErrors({ ...addressErrors, zip: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange pr-10"

                        />

                        {isFetchingLocation && (

                          <div className="absolute right-3 top-3.5 flex items-center justify-center">

                            <Loader2 className="w-4 h-4 text-brand-orange animate-spin" />

                          </div>

                        )}

                        {addressErrors.zip && <span className="text-red-500 text-xs mt-1">{addressErrors.zip}</span>}

                      </div>

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="City"

                          maxLength={50}

                          value={newAddress.locality}

                          onChange={(e) => {

                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');

                            setNewAddress({ ...newAddress, locality: val });

                            if (addressErrors.locality) {

                              setAddressErrors({ ...addressErrors, locality: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange"

                        />

                        {addressErrors.locality && <span className="text-red-500 text-xs mt-1">{addressErrors.locality}</span>}

                      </div>

                      <div className="md:col-span-2 flex flex-col">

                        <textarea

                          placeholder="Address (Area and Street)"

                          rows="3"

                          maxLength={200}

                          value={newAddress.address}

                          onChange={(e) => {

                            setNewAddress({ ...newAddress, address: e.target.value });

                            if (addressErrors.address) {

                              setAddressErrors({ ...addressErrors, address: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange resize-none"

                        ></textarea>

                        {addressErrors.address && <span className="text-red-500 text-xs mt-1">{addressErrors.address}</span>}

                      </div>

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="District"

                          value={newAddress.city}

                          readOnly={!isLocationEditable}

                          className={`w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none ${isLocationEditable ? 'bg-white' : 'bg-gray-50 text-[#1A1A1A] cursor-not-allowed'}`}

                          onChange={(e) => {

                            if (isLocationEditable) {

                              const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');

                              setNewAddress({ ...newAddress, city: val });

                              if (addressErrors.city) {

                                setAddressErrors({ ...addressErrors, city: '' });

                              }

                            }

                          }}

                        />

                        {addressErrors.city && <span className="text-red-500 text-xs mt-1">{addressErrors.city}</span>}

                      </div>

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="State"

                          value={newAddress.state}

                          readOnly={!isLocationEditable}

                          className={`w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none ${isLocationEditable ? 'bg-white' : 'bg-gray-50 text-[#1A1A1A] cursor-not-allowed'}`}

                          onChange={(e) => {

                            if (isLocationEditable) {

                              setNewAddress({ ...newAddress, state: e.target.value });

                              if (addressErrors.state) {

                                setAddressErrors({ ...addressErrors, state: '' });

                              }

                            }

                          }}

                        />

                        {addressErrors.state && <span className="text-red-500 text-xs mt-1">{addressErrors.state}</span>}

                      </div>

                      <div className="flex flex-col">

                        <input

                          type="text"

                          placeholder="Alternate Phone (Optional)"

                          value={newAddress.alternatePhone}

                          onChange={(e) => {

                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);

                            setNewAddress({ ...newAddress, alternatePhone: val });

                            if (addressErrors.alternatePhone) {

                              setAddressErrors({ ...addressErrors, alternatePhone: '' });

                            }

                          }}

                          className="w-full border border-gray-300 px-4 py-3 rounded-[2px] text-sm focus:outline-none focus:border-brand-orange"

                        />

                        {addressErrors.alternatePhone && <span className="text-red-500 text-xs mt-1">{addressErrors.alternatePhone}</span>}

                      </div>

                    </div>



                    <div className="mt-6 flex gap-4">

                      <button

                        onClick={handleSaveAddress}

                        className="bg-brand-orange text-white px-4 py-2 md:px-8 md:py-3 font-semibold text-xs md:text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase"

                      >

                        Save and Deliver Here

                      </button>

                      <button

                        onClick={() => {

                          setIsAddingAddress(false);

                          setEditingAddressId(null);

                          setAddressErrors({});

                        }}

                        className="text-gray-500 font-semibold text-xs md:text-[15px] hover:text-brand-orange transition uppercase px-4"

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

              summary={activeStep === 'payment' ? `${items.reduce((a, b) => a + b.qty, 0)} Item(s)` : null}

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

                            {items.length > 1 && (

                              <button

                                onClick={() => handleRemoveItem(item)}

                                className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-wider transition flex items-center gap-1"

                              >

                                <Trash2 size={12} /> Remove

                              </button>

                            )}

                          </div>

                        </div>

                      </div>

                    ))

                  )}

                </div>



                <div className="mt-4 md:mt-6 flex justify-end">

                  <button

                    onClick={() => setActiveStep('payment')}

                    className="bg-brand-orange text-white px-5 py-2 md:px-10 md:py-3.5 font-bold text-xs md:text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase"

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

                  <span className="text-xs md:text-[15px] text-[#1A1A1A] font-medium">UPI / Net Banking</span>

                </label>



                {/* Return Policy Consent Checkbox */}

                <div className="p-4 border-b border-gray-100 bg-amber-50/40 flex items-start gap-3">

                  <input

                    type="checkbox"

                    id="unboxing-consent"

                    checked={consentChecked}

                    onChange={(e) => setConsentChecked(e.target.checked)}

                    className="mt-1 w-4 h-4 rounded text-brand-orange focus:ring-brand-orange accent-brand-orange cursor-pointer"

                  />

                  <label htmlFor="unboxing-consent" className="text-xs md:text-sm text-gray-700 cursor-pointer select-none leading-relaxed">

                    I acknowledge that <strong className="text-brand-orange font-semibold">recording an unboxing video is mandatory</strong> for any package returns, exchanges.

                  </label>

                </div>



                <div className="p-4 md:p-6 border-t border-gray-100 bg-[#f1f3f6]/30 flex justify-end">

                  <button

                    onClick={() => handlePlaceOrder()}

                    disabled={loadingPayment}

                    className={`bg-brand-orange text-white px-5 py-2 md:px-10 md:py-3.5 font-bold text-xs md:text-[15px] rounded-[2px] shadow-sm hover:shadow transition uppercase ${
                      loadingPayment ? 'opacity-50 cursor-not-allowed' : ''
                    }`}

                  >

                    {loadingPayment ? (
                      <span className="flex items-center gap-2 justify-center">
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </span>
                    ) : (
                      "Place Order"
                    )}

                  </button>

                </div>

              </div>

            )}

          </div>



        </div>



        {/* Sidebar Price Details */}

        <div className="lg:col-span-1 order-1 lg:order-2">

          <div className="bg-white shadow-sm rounded-[2px] sticky top-24">

            <div className="border-b border-gray-200 p-4">

              <h3 className="text-gray-500 font-bold text-sm tracking-wide uppercase">Price Details</h3>

            </div>

            <div className="p-4 space-y-3 md:space-y-5 text-xs md:text-[15px]">

              <div className="flex justify-between">

                <span>Price ({items.reduce((a, b) => a + b.qty, 0)} item{items.reduce((a, b) => a + b.qty, 0) !== 1 ? 's' : ''})</span>

                <span>₹{actualPrice.toLocaleString()}</span>

              </div>

              <div className="flex justify-between">

                <span>GST (8%)</span>

                <span>₹{gstAmount.toLocaleString()}</span>

              </div>

              <div className="flex justify-between font-medium text-gray-600">

                <span>Gross Amount</span>

                <span>₹{subtotal.toLocaleString()}</span>

              </div>

              <div className="flex justify-between">

                <span>Delivery Charges</span>

                <span className="text-green-600">₹{deliveryCharges.toLocaleString()}</span>

              </div>



            </div>

            <div className="border-t border-dashed border-gray-200 p-4">

              <div className="flex justify-between font-bold text-sm md:text-lg text-[#1A1A1A]">

                <span>Total Payable</span>

                <span>₹{total.toLocaleString()}</span>

              </div>

            </div>

            <div className="border-t border-gray-200 p-4 text-brand-orange font-bold text-xs md:text-sm">

              Your Total Savings on this order ₹{totalSavings.toLocaleString()}

            </div>

          </div>

        </div>



      </div>



      {/* Delete Address Confirmation Modal */}

      {addressToDelete && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 rounded-[2px] shadow-lg max-w-sm w-full text-center">

            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 font-sans">Delete Address</h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Are you sure you want to delete this address? This action cannot be undone.</p>

            <div className="flex gap-4 justify-center">

              <button

                type="button"

                disabled={isDeletingAddress}

                onClick={() => setAddressToDelete(null)}

                className="px-6 py-2 border border-gray-300 rounded-[2px] text-gray-700 font-semibold text-sm hover:bg-gray-50 transition uppercase tracking-wide text-xs disabled:opacity-50"

              >

                Cancel

              </button>

              <button

                type="button"

                disabled={isDeletingAddress}

                onClick={async () => {

                  try {

                    setIsDeletingAddress(true);

                    await deleteDoc(doc(db, 'users', user.uid, 'addresses', addressToDelete));

                    if (selectedAddressId === addressToDelete) {

                      setSelectedAddressId(null);

                    }

                  } catch (error) {

                  } finally {

                    setIsDeletingAddress(false);

                    setAddressToDelete(null);

                  }

                }}

                className={`px-6 py-2 bg-red-600 text-white rounded-[2px] font-semibold text-sm transition uppercase tracking-wide text-xs ${isDeletingAddress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'

                  }`}

              >

                {isDeletingAddress ? "Deleting..." : "Delete"}

              </button>

            </div>

          </div>

        </div>

      )}



      {/* Logout Confirmation Modal */}

      {showLogoutConfirm && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white p-6 rounded-[2px] shadow-lg max-w-sm w-full text-center">

            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 font-sans">Confirm Logout</h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Are you sure you want to logout and login as another account?</p>

            <div className="flex gap-4 justify-center">

              <button

                type="button"

                onClick={() => setShowLogoutConfirm(false)}

                className="px-6 py-2 border border-gray-300 rounded-[2px] text-gray-700 font-semibold text-sm hover:bg-gray-50 transition uppercase tracking-wide text-xs"

              >

                Cancel

              </button>

              <button

                type="button"

                onClick={() => {

                  logout();

                  setActiveStep('login');

                  setShowLogoutConfirm(false);

                }}

                className="px-6 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-[2px] font-semibold text-sm transition uppercase tracking-wide text-xs"

              >

                Logout

              </button>

            </div>

          </div>

        </div>

      )}

      {/* Error / Alert Modal */}

      <AnimatePresence>

        {errorModal.isOpen && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">

            <motion.div

              initial={{ scale: 0.95, opacity: 0 }}

              animate={{ scale: 1, opacity: 1 }}

              exit={{ scale: 0.95, opacity: 0 }}

              className="bg-white p-6 rounded-[4px] shadow-xl max-w-sm w-full text-center border border-gray-100"

            >

              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">

                <AlertTriangle size={24} />

              </div>

              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{errorModal.title || "Alert"}</h3>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{errorModal.message}</p>

              <button

                type="button"

                onClick={() => setErrorModal({ isOpen: false, title: 'Alert', message: '' })}

                className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-[2px] font-semibold text-sm transition uppercase tracking-wide"

              >

                Okay

              </button>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}



const StepHeader = ({ stepNum, title, isCompleted, onEdit, summary, isActive }) => {

  if (isCompleted && !isActive) {

    return (

      <div onClick={onEdit} className={`bg-brand-orange px-3 py-2 md:px-4 md:py-3 flex justify-between items-center text-white ${onEdit ? 'cursor-pointer hover:bg-brand-orange-dark transition' : ''}`}>

        <div className="flex items-start">

          <div className="bg-white/20 text-white font-bold text-[10px] md:text-xs w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-4 rounded-[2px] mt-0.5">

            ✓

          </div>

          <div>

            <div className="font-semibold text-xs md:text-[15px]">{title}</div>

            {summary && <div className="text-xs md:text-sm font-medium mt-0.5 md:mt-1">{summary}</div>}

          </div>

        </div>

        {onEdit && (

          <button className="bg-white text-brand-orange font-semibold text-xs md:text-sm px-4 py-1.5 md:px-6 md:py-2 rounded shadow-sm hover:shadow transition">

            CHANGE

          </button>

        )}

      </div>

    );

  }

  return (

    <div onClick={onEdit} className={`bg-brand-orange px-3 py-2 md:px-4 md:py-3 flex items-center text-white ${onEdit ? 'cursor-pointer hover:bg-brand-orange-dark transition' : ''}`}>

      <div className="bg-white text-brand-orange text-xs md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-4 rounded-[2px]">

        {stepNum}

      </div>

      <span className="font-semibold text-xs md:text-[15px]">{title}</span>

    </div>

  );

};

