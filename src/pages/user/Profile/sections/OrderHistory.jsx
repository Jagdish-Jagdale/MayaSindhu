import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDocs } from 'firebase/firestore';
import { Package, Clock, Truck, CheckCircle2, ChevronRight, XCircle, RotateCcw, Loader2, Search, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const STATUS_ICONS = {
  'Pending': <Clock size={16} />,
  'Confirmed': <Package size={16} />,
  'Shipped': <Truck size={16} />,
  'Delivered': <CheckCircle2 size={16} />,
  'Cancelled': <XCircle size={16} />,
  'Returned': <RotateCcw size={16} />,
};

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

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
        name: doc.data().name
      }));
      setProducts(prods);
    }, (error) => {
      console.error("Products load error:", error);
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
      console.error("Reviews load error:", error);
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
      console.error("Orders listener error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const handleRequestReturn = async (orderId) => {
    if (!window.confirm('Request a return for this order?')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'Return Requested',
        updatedAt: serverTimestamp()
      });
      toast.success('Return request submitted');
    } catch (error) {
      toast.error('Failed to submit return request');
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
      console.error("Error submitting review:", error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#f5aa00]" size={40} /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">My Orders</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Review and track your recent purchases.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="Search Orders..."
              className="pl-11 pr-6 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 focus:border-brand-orange outline-none text-[13px] font-bold w-full md:w-60 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Package className="text-gray-200" size={28} />
            </div>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No orders found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-brand-orange/20 transition-all bg-white shadow-sm">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00]">Order ID</p>
                      <h4 className="text-lg font-sans font-bold text-[#1A1A1A]">{order.orderId}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-5 py-2 rounded-xl border border-red-100 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => handleRequestReturn(order.id)}
                          className="px-5 py-2 rounded-xl border border-[#f5aa00]/20 text-[#f5aa00] text-[10px] font-bold uppercase tracking-widest hover:bg-[#fffbf2] transition-all"
                        >
                          Return
                        </button>
                      )}
                      <div className={`px-5 py-2 rounded-xl flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] border shadow-sm ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-400 border-red-100' :
                            'bg-white text-[#f5aa00] border-[#f5aa00]/20'
                        }`}>
                        {STATUS_ICONS[order.status] || <Package size={14} />}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Progress */}
                  {!['Cancelled', 'Returned'].includes(order.status) && (
                    <div className="relative mb-8 px-2">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10 rounded-full" />
                      <div
                        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-[#f5aa00] to-[#e07a00] -translate-y-1/2 -z-10 rounded-full transition-all duration-1000"
                        style={{ width: `${(STATUS_STEPS.indexOf(order.status) / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                      <div className="flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const isActive = STATUS_STEPS.indexOf(order.status) >= idx;
                          return (
                            <div key={step} className="flex flex-col items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[#f5aa00] text-white shadow-lg shadow-[#f5aa00]/20' : 'bg-white border border-gray-100 text-gray-300'
                                }`}>
                                {React.cloneElement(STATUS_ICONS[step], { size: 14 })}
                              </div>
                              <span className={`hidden sm:inline-block text-[8px] uppercase font-bold tracking-widest ${isActive ? 'text-[#f5aa00]' : 'text-gray-300'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#f5aa00] px-1">Items Ordered</p>
                      <div className="grid grid-cols-1 gap-2">
                        {order.items?.map((item, idx) => {
                          const resolvedProductId = item.id || products.find(p => p.name === item.name)?.id;
                          const isEligibleForReview = ['Paid', 'Delivered'].includes(order.status) && resolvedProductId;
                          const reviewKey = `${order.id}_${resolvedProductId}`;
                          const isReviewed = userReviews[reviewKey];

                          return (
                            <div key={idx} className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-50 shadow-sm">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-[#fffbf2] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  <Package className="text-[#f5aa00]/30" size={20} />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h5 className="text-[13px] font-bold text-[#1A1A1A] truncate leading-tight">{item.name}</h5>
                                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Qty: {item.qty} × ₹{item.price.toLocaleString()}</p>
                                </div>
                              </div>
                              {isEligibleForReview && (
                                <button
                                  disabled={isReviewed}
                                  onClick={() => handleOpenReviewModal(order, item)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    isReviewed 
                                    ? 'bg-gray-50 border border-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5 active:scale-95 cursor-pointer'
                                  }`}
                                >
                                  {isReviewed ? 'Reviewed' : 'Rate & Review'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between shadow-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-[#1A1A1A]">₹{order.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide">
                          <span className="text-gray-400">Shipping</span>
                          <span className="text-green-600 font-black">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-end">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Total Paid</span>
                        <span className="text-xl font-bold text-[#1A1A1A] leading-none">₹{order.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
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
    </div>
  );
}
