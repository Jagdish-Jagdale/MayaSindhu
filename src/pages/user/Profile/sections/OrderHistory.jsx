/**
 * File: OrderHistory.jsx
 * Description: Client-facing customer page rendering home banners, blog lists, product details, and profile user sections.
 * Work Done: Integrated baseline UI layouts, state boundaries, CSS theme styling, and routing pathways.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDocs } from 'firebase/firestore';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle, RotateCcw, Loader2, Search, Star, X, Download, MapPin, CreditCard, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import mstitleLogo from '../../../../assets/mstitle.png';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  'Pending': <Clock size={16} />,
  'Confirmed': <Package size={16} />,
  'Shipped': <Truck size={16} />,
  'Delivered': <CheckCircle2 size={16} />,
  'Cancelled': <XCircle size={16} />,
  'Returned': <RotateCcw size={16} />,
  'Exchange Requested': <RotateCcw size={16} />,
  'Exchange Req Accept': <CheckCircle2 size={16} />,
  'Exchange Req Reject': <XCircle size={16} />,
};

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Review states
  const [userReviews, setUserReviews] = useState({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch all products to resolve product IDs for historical orders
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(prods);
    }, (error) => {
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for user's existing reviews
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reviews'),
      where('userUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewMap = {};
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.orderId && data.productId) {
          reviewMap[`${data.orderId}_${data.productId}`] = true;
        }
      });
      setUserReviews(reviewMap);
    }, (error) => {
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('customerUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      });
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return;
    setCancellingOrder(true);
    try {
      await updateDoc(doc(db, 'orders', cancelOrderId), {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
      toast.success('Order cancelled successfully');
      setCancelOrderId(null);
    } catch (error) {
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Exchange states
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeOrder, setExchangeOrder] = useState(null);
  const [exchangeReason, setExchangeReason] = useState('');
  const [exchangeImage, setExchangeImage] = useState('');
  const [submittingExchange, setSubmittingExchange] = useState(false);

  const handleOpenExchangeModal = (order) => {
    setExchangeOrder(order);
    setExchangeReason('');
    setExchangeImage('');
    setIsExchangeModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExchangeImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitExchange = async (e) => {
    e.preventDefault();
    if (!exchangeReason.trim()) {
      toast.error('Please enter a reason for exchange');
      return;
    }
    setSubmittingExchange(true);
    try {
      const ticketId = `EXC-${Date.now().toString().slice(-6)}`;
      
      await addDoc(collection(db, 'exchangeTickets'), {
        ticketId,
        orderId: exchangeOrder.id,
        orderDisplayId: exchangeOrder.orderId || exchangeOrder.id,
        customerUid: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Customer',
        reason: exchangeReason.trim(),
        image: exchangeImage || '',
        items: exchangeOrder.items || [],
        total: exchangeOrder.total || 0,
        status: 'Pending',
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'orders', exchangeOrder.id), {
        status: 'Exchange Requested',
        exchangeReason: exchangeReason.trim(),
        exchangeImage: exchangeImage || '',
        updatedAt: serverTimestamp()
      });
      toast.success('Exchange request submitted and ticket raised');
      setIsExchangeModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit exchange request');
    } finally {
      setSubmittingExchange(false);
    }
  };

  const handleOpenReviewModal = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setRating(5);
    setHoveredRating(0);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedItem) return;
    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    const resolvedProductId = selectedItem.id || products.find(p => p.name === selectedItem.name)?.id;
    if (!resolvedProductId) {
      toast.error('Failed to resolve product ID for this item');
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: resolvedProductId,
        productName: selectedItem.name,
        orderId: selectedOrder.id,
        orderDisplayId: selectedOrder.orderId,
        userUid: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Verified Buyer',
        rating: rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      };

      // 1. Add review to 'reviews' collection
      await addDoc(collection(db, 'reviews'), reviewData);

      // 2. Compute new average rating for the product and update product doc
      const productId = resolvedProductId.toString();
      const reviewsQuery = query(collection(db, 'reviews'), where('productId', '==', productId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const allReviews = reviewsSnapshot.docs.map(doc => doc.data());
      
      // Calculate average rating
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));

      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        rating: avgRating,
        reviewCount: allReviews.length
      });

      toast.success('Review submitted successfully');
      setIsReviewModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const downloadInvoice = async (order, item) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Add logo
      const logoImg = new Image();
      logoImg.src = mstitleLogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      try {
        doc.addImage(logoImg, 'PNG', 20, yPos, 30, 20);
      } catch (e) {
        doc.setFontSize(24);
        doc.setTextColor(245, 170, 0);
        doc.text('MayaSindhu', 20, yPos + 15);
      }

      // Company name
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('MayaSindhu', 20, yPos + 30);

      // Invoice title on right
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', pageWidth - 20, yPos + 15, { align: 'right' });
      doc.setFontSize(10);
      doc.text(`Invoice No: INV-${order.orderId || order.id}`, pageWidth - 20, yPos + 25, { align: 'right' });
      doc.text(`Date: ${formatDate(order.createdAt)}`, pageWidth - 20, yPos + 32, { align: 'right' });

      yPos += 50;

      // Sold By section
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Sold By:', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('MayaSindhu', 20, yPos);
      yPos += 6;
      doc.text('Shop No. 5, Grandstand Apartment, Survey No. 2945, K/10,', 20, yPos);
      yPos += 6;
      doc.text('Pratibha Nagar Road, Kolhapur', 20, yPos);
      yPos += 6;
      doc.text('mayasindhu2124@gmail.com', 20, yPos);
      yPos += 6;
      doc.text('+91 9172020494', 20, yPos);

      // Billing Details on right
      const billingX = pageWidth - 80;
      yPos = 70;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Billing & Shipping Details:', billingX, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`${order.shippingAddress?.firstName || order.customerName || ''} ${order.shippingAddress?.lastName || ''}`, billingX, yPos);
      yPos += 6;
      const address = order.shippingAddress?.address || '';
      const addressLines = doc.splitTextToSize(address, 70);
      addressLines.forEach(line => {
        doc.text(line, billingX, yPos);
        yPos += 6;
      });
      doc.text(`${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zip || ''}`, billingX, yPos);
      yPos += 6;
      doc.text(`Phone: ${order.shippingAddress?.phone || ''}`, billingX, yPos);

      yPos += 20;

      // Product table
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Product Details', 20, yPos);
      doc.text('Price', pageWidth - 100, yPos);
      doc.text('Qty', pageWidth - 60, yPos);
      doc.text('Amount', pageWidth - 20, yPos, { align: 'right' });

      yPos += 8;
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(item.name, 20, yPos);
      yPos += 6;
      if (item.color || item.design) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const details = [];
        if (item.color) details.push(`Color: ${item.color}`);
        if (item.design) details.push(`Style: ${item.design}`);
        doc.text(details.join(' | '), 20, yPos);
        yPos += 6;
      }

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${item.price?.toLocaleString('en-IN')}`, pageWidth - 100, yPos);
      doc.text(`${item.qty}`, pageWidth - 60, yPos);
      doc.text(`Rs. ${(item.price * item.qty)?.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });

      yPos += 15;

      // Totals
      const itemTotal = item.price * item.qty;
      const itemGst = Math.round(itemTotal - (itemTotal / 1.18));
      const itemBasePrice = Math.round(itemTotal / 1.18);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Price (excl. GST)', pageWidth - 80, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${itemBasePrice.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setTextColor(100, 100, 100);
      doc.text('GST (18%)', pageWidth - 80, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${itemGst.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setTextColor(100, 100, 100);
      doc.text('Gross Subtotal', pageWidth - 80, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setTextColor(100, 100, 100);
      doc.text('Delivery Charges', pageWidth - 80, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(order.shipping > 0 ? `Rs. ${order.shipping}` : 'Free', pageWidth - 20, yPos, { align: 'right' });
      yPos += 12;

      doc.setDrawColor(200, 200, 200);
      doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
      yPos += 8;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Total Paid', pageWidth - 80, yPos);
      doc.text(`Rs. ${((item.price * item.qty) + (order.shipping || 0)).toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 15;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Payment Method: ${order.paymentMethod?.toUpperCase()}`, pageWidth - 20, yPos, { align: 'right' });

      yPos += 30;

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for choosing MayaSindhu and supporting traditional heritage craftsmanship.', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text('This is a computer-generated invoice and requires no signature.', pageWidth / 2, yPos, { align: 'center' });

      doc.save(`Invoice-${order.orderId || order.id}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Invoice download error:', error);
    }
  };

  const flatItems = [];
  orders.forEach(order => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        flatItems.push({ order, item });
      });
    }
  });

  const filteredItems = flatItems.filter(({ order, item }) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const orderIdStr = (order.orderId || order.id || '').toLowerCase();
    const itemNameStr = (item.name || '').toLowerCase();
    const statusStr = (order.status || '').toLowerCase();
    return orderIdStr.includes(term) || itemNameStr.includes(term) || statusStr.includes(term);
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 my-auto text-center">
      <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Loading Orders</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 relative">
        <input 
          type="text"
          placeholder="Search by Order ID, Product Name, or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-[#f5aa00] focus:ring-1 focus:ring-[#f5aa00]"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
      </div>
      <div className="space-y-6">
        {/* Flat List of Order Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Package className="text-gray-300" size={28} />
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">{searchTerm ? 'No orders found matching your search' : 'No orders found'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(({ order, item }, idx) => {
              const productDoc = products.find(p => p.id === item.id || p.name === item.name);
              const itemImage = item.image || (productDoc?.images && productDoc.images[0]) || (productDoc?.image) || '';
              
              const resolvedProductId = item.id || productDoc?.id;
              const isEligibleForReview = (order.status === 'Delivered' || order.status === 'delivered') && resolvedProductId;
              const reviewKey = `${order.id}_${resolvedProductId}`;
              const isReviewed = userReviews[reviewKey];

              // Status details
              let statusColor = 'bg-blue-500';
              let statusText = `${order.status}`;
              let statusMsg = 'Your order is being processed.';

              const dateStr = formatDate(order.updatedAt || order.createdAt);
              const rawStatus = (order.status || '').toLowerCase();

              if (rawStatus === 'delivered') {
                statusColor = 'bg-green-600';
                statusText = `Delivered on ${dateStr}`;
                statusMsg = 'Your item has been delivered';
              } else if (rawStatus === 'cancelled') {
                statusColor = 'bg-red-500';
                statusText = `Cancelled on ${dateStr}`;
                statusMsg = 'Your order was cancelled as per your request.';
              } else if (rawStatus === 'pending') {
                statusColor = 'bg-amber-500';
                statusText = `Ordered on ${dateStr}`;
                statusMsg = 'Your order is pending confirmation.';
              } else if (rawStatus === 'confirmed' || rawStatus === 'paid') {
                statusColor = 'bg-blue-600';
                statusText = `Confirmed on ${dateStr}`;
                statusMsg = 'Your order has been confirmed.';
              } else if (rawStatus === 'processing') {
                statusColor = 'bg-amber-500';
                statusText = `Processing`;
                statusMsg = 'Your order is being processed.';
              } else if (rawStatus === 'shipped') {
                statusColor = 'bg-indigo-500';
                statusText = `Shipped on ${dateStr}`;
                statusMsg = 'Your item is on the way.';
              } else if (rawStatus === 'out of delivery' || rawStatus === 'out for delivery') {
                statusColor = 'bg-purple-500';
                statusText = `Out for Delivery`;
                statusMsg = 'Your item is out for delivery.';
              } else if (rawStatus === 'exchange requested') {
                statusColor = 'bg-amber-500';
                statusText = `Exchange Requested`;
                statusMsg = 'Your exchange request is under review.';
              } else if (rawStatus === 'exchange req accept') {
                statusColor = 'bg-green-600';
                statusText = `Exchange Approved`;
                statusMsg = 'Your exchange request has been approved.';
              } else if (rawStatus === 'exchange req reject') {
                statusColor = 'bg-red-500';
                statusText = `Exchange Rejected`;
                statusMsg = 'Your exchange request was not approved.';
              }

              return (
                <div key={`${order.id}_${idx}`} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-amber-100 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center">
                  
                  {/* Left: Product Image */}
                  <div className="w-20 h-24 bg-white border border-gray-100 rounded-lg p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {itemImage ? (
                      <img src={itemImage || null} alt={item.name} className="w-full h-full object-contain rounded-md" />
                    ) : (
                      <Package className="text-gray-300" size={24} />
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-grow min-w-0 space-y-1 md:pr-4">
                    <h4 className="text-[15px] font-bold text-gray-800 leading-snug line-clamp-2">
                      {item.name}
                    </h4>
                    {(item.color || item.design) && (
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                        {item.color && `Color: ${item.color}`}
                        {item.color && item.design && '  |  '}
                        {item.design && `Style: ${item.design}`}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">Order ID: {order.orderId || order.id}</p>
                      <button
                        onClick={() => setSelectedOrderDetail({ order, item, itemImage })}
                        className="text-[10px] text-[#f5aa00] hover:text-[#e09b00] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-base font-black text-gray-800 px-2 md:px-6 shrink-0 md:text-right md:w-32">
                    ₹{item.price?.toLocaleString('en-IN')}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="w-full md:w-64 shrink-0 space-y-1 flex flex-col md:pl-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                      <span className="text-xs font-bold text-gray-850">{statusText}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium">{statusMsg}</p>
                    
                    {/* Cancel / Exchange button in status block */}
                    <div className="flex flex-wrap gap-2.5 mt-1">
                      {['pending', 'confirmed', 'processing', 'paid', 'placed'].includes(rawStatus) && (
                        <button
                          onClick={() => setCancelOrderId(order.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                      {['shipped', 'out of delivery', 'out for delivery'].includes(rawStatus) && (
                        <button
                          disabled
                          title="Order is shipped and cannot be cancelled"
                          className="text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 cursor-not-allowed"
                        >
                          Cancel Order
                        </button>
                      )}
                      {(rawStatus === 'delivered' || rawStatus === 'exchange req reject') && (
                        <button
                          onClick={() => handleOpenExchangeModal(order)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Exchange Item
                        </button>
                      )}
                    </div>

                    {isEligibleForReview && (
                      <button
                        disabled={!!isReviewed}
                        onClick={() => !isReviewed && handleOpenReviewModal(order, item)}
                        className={`mt-2 flex items-center gap-1.5 text-xs font-bold transition-all ${
                          isReviewed 
                            ? 'text-gray-400 opacity-60 cursor-not-allowed' 
                            : 'text-blue-600 hover:text-blue-800 cursor-pointer'
                        }`}
                      >
                        <Star size={14} fill={isReviewed ? "currentColor" : "none"} className={isReviewed ? "text-gray-400" : "text-blue-600"} />
                        <span>{isReviewed ? 'Product Reviewed' : 'Rate & Review Product'}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrderDetail(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <p className="text-[11px] text-gray-400 font-medium">Order ID: {selectedOrderDetail.order.orderId || selectedOrderDetail.order.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderDetail(null)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Product & Status Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="w-20 h-24 bg-white border border-gray-100 rounded-lg p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {selectedOrderDetail.itemImage ? (
                        <img src={selectedOrderDetail.itemImage || null} alt={selectedOrderDetail.item.name} className="w-full h-full object-contain rounded-md" />
                      ) : (
                        <Package className="text-gray-300" size={24} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[15px] font-bold text-gray-800 leading-snug">{selectedOrderDetail.item.name}</h4>
                      {(selectedOrderDetail.item.color || selectedOrderDetail.item.design) && (
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                          {selectedOrderDetail.item.color && `Color: ${selectedOrderDetail.item.color}`}
                          {selectedOrderDetail.item.color && selectedOrderDetail.item.design && '  |  '}
                          {selectedOrderDetail.item.design && `Style: ${selectedOrderDetail.item.design}`}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Seller: MayaSindhu Heritage</p>
                      <p className="text-base font-black text-gray-800 mt-2">₹{selectedOrderDetail.item.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery Timeline</h4>
                    <div className="relative pl-6 space-y-6 border-l-2 border-gray-100 ml-3">
                      {(() => {
                        const modalRawStatus = (selectedOrderDetail.order.status || '').toLowerCase();
                        const isCancelled = modalRawStatus === 'cancelled';

                        return (
                          <>
                            {/* Step: Ordered */}
                            <div className="relative">
                              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border-4 border-white" />
                              <div>
                                <p className="text-xs font-bold text-gray-800">Order Confirmed</p>
                                <p className="text-[10px] text-gray-400 font-medium">{formatDate(selectedOrderDetail.order.createdAt)}</p>
                              </div>
                            </div>

                            {!isCancelled && (
                              <>
                                {/* Step: Processing */}
                                {['processing', 'shipped', 'out of delivery', 'out for delivery', 'delivered'].includes(modalRawStatus) && (
                                  <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border-4 border-white" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">Processing</p>
                                      <p className="text-[10px] text-gray-400 font-medium">Order is being prepared for dispatch.</p>
                                    </div>
                                  </div>
                                )}

                                {/* Step: Shipped */}
                                {['shipped', 'out of delivery', 'out for delivery', 'delivered'].includes(modalRawStatus) && (
                                  <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border-4 border-white" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">Shipped</p>
                                      <p className="text-[10px] text-gray-400 font-medium">Your package has left the Shop.</p>
                                    </div>
                                  </div>
                                )}

                                {/* Step: Out of Delivery */}
                                {['out of delivery', 'out for delivery', 'delivered'].includes(modalRawStatus) && (
                                  <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border-4 border-white" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">Out of Delivery</p>
                                      <p className="text-[10px] text-gray-400 font-medium">Your package is out for delivery.</p>
                                    </div>
                                  </div>
                                )}

                                {/* Step: Delivered */}
                                {modalRawStatus === 'delivered' && (
                                  <div className="relative">
                                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center border-4 border-white" />
                                    <div>
                                      <p className="text-xs font-bold text-gray-800">Delivered</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{formatDate(selectedOrderDetail.order.updatedAt || selectedOrderDetail.order.createdAt)}</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Step: Cancelled */}
                            {isCancelled && (
                              <div className="relative">
                                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border-4 border-white" />
                                <div>
                                  <p className="text-xs font-bold text-red-500">Order Cancelled</p>
                                  <p className="text-[10px] text-gray-400 font-medium">
                                    {selectedOrderDetail.order.updatedAt ? formatDate(selectedOrderDetail.order.updatedAt) : 'As requested by customer.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right: Delivery & Pricing Cards */}
                <div className="space-y-6">
                  {/* Delivery details */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      Delivery details
                    </h4>
                    <div className="space-y-2">
                      <div className="inline-block bg-gray-200/60 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {selectedOrderDetail.order.shippingAddress?.type || 'Home'}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                        {selectedOrderDetail.order.shippingAddress?.address || selectedOrderDetail.order.customerName}
                        <br/>
                        {selectedOrderDetail.order.shippingAddress?.city}, {selectedOrderDetail.order.shippingAddress?.state} - <span className="font-bold">{selectedOrderDetail.order.shippingAddress?.zip}</span>
                      </p>
                      <p className="text-xs text-gray-700 font-semibold mt-1">
                        {selectedOrderDetail.order.shippingAddress?.firstName || selectedOrderDetail.order.customerName} {selectedOrderDetail.order.shippingAddress?.lastName || ''}
                        {selectedOrderDetail.order.shippingAddress?.phone && ` • ${selectedOrderDetail.order.shippingAddress.phone}`}
                      </p>
                    </div>
                  </div>

                  {/* Price details */}
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard size={14} className="text-gray-400" />
                      Price details
                    </h4>
                    <div className="space-y-2.5 text-xs text-gray-700">
                      {(() => {
                        const itemTotal = selectedOrderDetail.item.price * selectedOrderDetail.item.qty;
                        const itemGst = Math.round(itemTotal - (itemTotal / 1.18));
                        const itemBasePrice = Math.round(itemTotal / 1.18);
                        return (
                          <>
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-400">Price (excl. GST)</span>
                              <span>₹{itemBasePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-400">GST (18%)</span>
                              <span>₹{itemGst.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-medium text-gray-500">
                              <span className="text-gray-400">Special price</span>
                              <span>₹{itemTotal.toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-400">Delivery fees</span>
                        <span className="text-green-600">
                          {selectedOrderDetail.order.shipping > 0 ? `₹${selectedOrderDetail.order.shipping}` : 'Free'}
                        </span>
                      </div>
                      <hr className="border-dashed border-gray-200" />
                      <div className="flex justify-between font-black text-sm text-gray-800">
                        <span>Total amount</span>
                        <span>₹{((selectedOrderDetail.item.price * selectedOrderDetail.item.qty) + (selectedOrderDetail.order.shipping || 0))?.toLocaleString('en-IN')}</span>
                      </div>
                      <hr className="border-dashed border-gray-200" />
                      <div className="flex justify-between font-semibold text-[11px] text-gray-400 uppercase">
                        <span>Paid By</span>
                        <span className="text-gray-700 font-bold">{selectedOrderDetail.order.paymentMethod || 'UPI'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Invoice Button */}
                  {['processing', 'shipped', 'out of delivery', 'out for delivery', 'delivered', 'cancelled'].includes((selectedOrderDetail.order.status || '').toLowerCase()) && (
                    <button
                      onClick={() => downloadInvoice(selectedOrderDetail.order, selectedOrderDetail.item)}
                      className="w-full bg-[#f5aa00] hover:bg-[#e09b00] text-[#1A1A1A] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      <Download size={15} />
                      <span>Download Invoice</span>
                    </button>
                  )}

                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) setIsReviewModalOpen(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
                <p className="text-[11px] text-gray-400 font-medium">Share your experience with this artisanal masterpiece</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Product</span>
                <p className="text-sm font-bold text-gray-800">{selectedItem?.name}</p>
              </div>

              {/* Star Rating Selector */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Rating</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = hoveredRating ? hoveredRating >= star : rating >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-gray-200 hover:text-amber-400 transition-colors p-1 cursor-pointer focus:outline-none"
                      >
                        <Star 
                          size={28} 
                          fill={isFilled ? "#F59E0B" : "none"} 
                          className={isFilled ? "text-amber-500 scale-110 transition-transform" : "text-gray-300"} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Comment Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Review</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved about this product..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium text-gray-600 text-xs resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-[#1A1A1A] hover:bg-black disabled:opacity-50 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Exchange Modal */}
      {isExchangeModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={(e) => { if (e.target === e.currentTarget) setIsExchangeModalOpen(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Product Exchange</h3>
                <p className="text-[11px] text-gray-400 font-medium">Please provide a reason and an image of the product.</p>
              </div>
              <button 
                onClick={() => setIsExchangeModalOpen(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitExchange} className="p-6 space-y-5">
              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reason for Exchange</label>
                <textarea
                  rows={4}
                  value={exchangeReason}
                  onChange={(e) => setExchangeReason(e.target.value)}
                  placeholder="Explain why you want to exchange the product..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange focus:bg-white p-4 rounded-2xl outline-none transition-all font-medium text-gray-600 text-xs resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Image Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Condition Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-gray-100/50 transition-all relative">
                  {exchangeImage ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden group">
                      <img src={exchangeImage || null} alt="Exchange product preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setExchangeImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full py-4">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-[#f5aa00]">Upload Image</span>
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">PNG, JPG up to 5MB</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" required />
                    </label>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExchange}
                  className="flex-1 bg-[#1A1A1A] hover:bg-black disabled:opacity-50 text-white px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingExchange ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {cancelOrderId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !cancellingOrder && setCancelOrderId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
            />
            <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 pointer-events-auto text-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                  <XCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Cancel Order</h3>
                <p className="text-gray-500 text-xs mb-6 leading-relaxed font-medium">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    disabled={cancellingOrder}
                    onClick={() => setCancelOrderId(null)}
                    className="flex-1 py-3.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={cancellingOrder}
                    onClick={confirmCancelOrder}
                    className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {cancellingOrder ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <span>Confirm Cancel</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
