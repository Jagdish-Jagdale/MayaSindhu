import React, { useState, useEffect } from 'react';
import {
  Search,
  Trash2,
  Loader2,
  Star,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { db } from '../../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAdminUI } from '../../context/AdminUIContext';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function Reviews() {
  const { isCollapsed } = useAdminUI();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Visible', 'Hidden'
  const [ratingFilter, setRatingFilter] = useState('All'); // 'All', '5', '4', '3', '2', '1'
  const [selectedProductFilter, setSelectedProductFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique products with reviews
  const uniqueProducts = Array.from(
    new Map(
      reviews
        .filter(r => r.productId && r.productName)
        .map(r => [r.productId, { id: r.productId, name: r.productName }])
    ).values()
  );

  // Delete Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Reviews from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          visible: docData.visible !== false // Default to true if not explicitly false
        };
      });

      // Sort reviews client-side by createdAt descending
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime());
        const timeB = b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime());
        return timeB - timeA;
      });

      setReviews(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter reviews based on search & drop downs
  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      (review.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVisibility =
      activeFilter === 'All' ||
      (activeFilter === 'Visible' && review.visible === true) ||
      (activeFilter === 'Hidden' && review.visible === false);

    const matchesRating =
      ratingFilter === 'All' ||
      review.rating === parseInt(ratingFilter, 10);

    const matchesProduct =
      selectedProductFilter === 'All' ||
      review.productId === selectedProductFilter;

    return matchesSearch && matchesVisibility && matchesRating && matchesProduct;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / rowsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, ratingFilter, selectedProductFilter]);

  // Toggle Visibility Status
  const handleToggleVisibility = async (review) => {
    try {
      const newStatus = !review.visible;
      const docRef = doc(db, 'reviews', review.id);
      await updateDoc(docRef, { visible: newStatus });
      toast.success(newStatus ? "Review is now visible on product details" : "Review hidden from product details");
    } catch (error) {
      console.error("Error updating review visibility:", error);
      toast.error("Failed to update status");
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'reviews', reviewToDelete.id));
      toast.success("Review deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#1BAFAF]" />
        <p className="text-[14px] font-medium text-gray-400">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all ${isCollapsed ? 'max-w-[1600px]' : 'max-w-[1280px]'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header Section */}
      <div className="space-y-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">Product Reviews</h1>
            <p className="text-[12px] text-gray-400 font-medium tracking-tight">Manage user-submitted reviews and control their visibility on product detail pages.</p>
          </div>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-xl font-bold text-gray-900">{reviews.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Visible Reviews</p>
            <h3 className="text-xl font-bold text-gray-900">{reviews.filter(r => r.visible).length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Star size={20} className="fill-amber-500 text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-xl font-bold text-gray-900">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
            <EyeOff size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hidden Reviews</p>
            <h3 className="text-xl font-bold text-gray-900">{reviews.filter(r => !r.visible).length}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product, user or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1BAFAF] focus:border-[#1BAFAF] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Visibility Filter */}
          <div className="flex rounded-xl border border-gray-200 p-0.5 bg-gray-50 overflow-hidden">
            {['All', 'Visible', 'Hidden'].map(opt => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${activeFilter === opt ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1BAFAF]"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1BAFAF] max-w-[180px] truncate"
          >
            <option value="All">All Products</option>
            {uniqueProducts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Rows Per Page */}
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-[12px] font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#1BAFAF]"
          >
            <option value="5">5 rows</option>
            <option value="10">10 rows</option>
            <option value="25">25 rows</option>
            <option value="50">50 rows</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {paginatedReviews.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">No Reviews Found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">We couldn't find any reviews matching your current filters or search terms.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-white text-[#1BAFAF]">
                  <th className="px-6 py-4 text-left text-[14px] font-bold w-12 whitespace-nowrap">Sr.No.</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold whitespace-nowrap">Reviewer</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold whitespace-nowrap">Rating</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold">Review Details</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-center text-[14px] font-bold whitespace-nowrap">Visibility</th>
                  <th className="px-6 py-4 text-right text-[14px] font-bold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {paginatedReviews.map((review, index) => {
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* S.N. */}
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-400 font-medium">
                        {serialNumber}
                      </td>

                      {/* Product Info */}
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.productImage || 'https://via.placeholder.com/40'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate uppercase tracking-tight text-[12px]">{review.productName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Reviewer Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900 font-bold">{review.userName}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{review.userEmail}</p>
                        </div>
                      </td>

                      {/* Rating stars */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              fill={star <= review.rating ? "#F59E0B" : "none"}
                              className={star <= review.rating ? "text-amber-500" : "text-gray-200"}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Review Comment */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-[12px] text-gray-600 line-clamp-3 leading-relaxed font-normal">
                          {review.comment}
                        </p>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-[12px] text-gray-400 font-bold uppercase tracking-wider">
                        {formatDate(review.createdAt)}
                      </td>

                      {/* Toggle Visibility Switch */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(review)}
                          className={`mx-auto flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 border ${review.visible
                              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                          title={review.visible ? "Visible on storefront" : "Hidden from storefront"}
                        >
                          {review.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDelete(review)}
                          className="w-8 h-8 inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Delete Review"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[12px] text-gray-400 font-semibold">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="text-[12px] font-semibold text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1BAFAF] hover:bg-[#1BAFAF]/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={reviewToDelete ? `the review by "${reviewToDelete.userName}"` : 'this review'}
        loading={isDeleting}
      />
    </div>
  );
}
