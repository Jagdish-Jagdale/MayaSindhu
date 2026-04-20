import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message, 
  itemName, 
  loading = false,
  dangerText = "Delete"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative bg-white rounded-2xl w-full max-w-[480px] shadow-2xl shadow-black/10 overflow-hidden"
          >
            <div className="p-7 sm:p-8">
              <div className="flex gap-5">
                {/* Icon Column */}
                <div className="shrink-0 pt-0.5">
                  <div className="w-11 h-11 rounded-full bg-[#FFF1F1] flex items-center justify-center">
                    <AlertTriangle className="text-[#FF0000]" size={22} strokeWidth={2.5} />
                  </div>
                </div>

                {/* Text Column */}
                <div className="flex-1 space-y-2">
                  <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-none">
                    {title}
                  </h2>
                  <div className="text-[14px] leading-relaxed text-[#4B5563] font-medium">
                    {message || (
                      <>
                        Are you sure you want to delete {itemName ? (
                          <>this item <span className="font-bold text-[#111827]">"{itemName}"</span>?</>
                        ) : "this item?"}
                      </>
                    )}
                  </div>
                  <p className="text-[13px] text-[#9CA3AF] font-medium">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] font-bold text-[14px] hover:bg-[#E2E8F0] transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#FF0000] text-white font-bold text-[14px] hover:bg-[#E60000] transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50 min-w-[100px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    dangerText
                  )}
                </button>
              </div>
            </div>

            {/* Optional Close Button (Top Right) */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors"
            >
              <X size={22} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
