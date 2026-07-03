const fs = require('fs');

const patches = [
{ f: "src/pages/user/Profile/sections/AddressBook.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "selectedOrderDetail", close: "() => setSelectedOrderDetail(null)", line: 572 },
{ f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "isReviewModalOpen", close: "() => setIsReviewModalOpen(false)", line: 755 },
{ f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "isExchangeModalOpen", close: "() => setIsExchangeModalOpen(false)", line: 841 },
{ f: "src/pages/user/Profile/sections/PaymentMethods.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", line: 201 },
{ f: "src/pages/user/Profile/sections/PaymentMethods.jsx", isOpen: "isBankModalOpen", close: "() => setIsBankModalOpen(false)", line: 251 },
{ f: "src/pages/user/Profile/sections/ReturnsRefunds.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)" },
{ f: "src/pages/user/Cart.jsx", isOpen: "isCartOpen", close: "() => setCartOpen(false)" },
{ f: "src/pages/user/CategoryView.jsx", isOpen: "isMobileFiltersOpen", close: "() => setIsMobileFiltersOpen(false)" },
{ f: "src/pages/user/Checkout.jsx", isOpen: "addressToDelete", close: "() => setAddressToDelete(null)", line: 1274 },
{ f: "src/pages/user/Checkout.jsx", isOpen: "showLogoutConfirm", close: "() => setShowLogoutConfirm(false)", line: 1315 },
{ f: "src/pages/user/Checkout.jsx", isOpen: "isOpen", close: "onClose", line: 1345 },
{ f: "src/pages/user/Login.jsx", isOpen: "isLoginModalOpen", close: "() => setLoginModalOpen(false)" },
{ f: "src/pages/admin/settings/ArtisanBlooms.jsx", isOpen: "isFormModalOpen", close: "() => setIsFormModalOpen(false)" },
{ f: "src/pages/admin/settings/Banner.jsx", isOpen: "selectedBannerImage", close: "() => setSelectedBannerImage(null)" },
{ f: "src/pages/admin/settings/Blogs.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/admin/settings/Testimonial.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/admin/settings/Workshops.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/admin/Categories.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/admin/DeliveryCharges.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", line: 491 },
{ f: "src/pages/admin/DeliveryCharges.jsx", isOpen: "isDeleteModalOpen", close: "() => setIsDeleteModalOpen(false)", line: 616 },
{ f: "src/pages/admin/Orders.jsx", isOpen: "isOpen", close: "() => setIsOpen(false)" },
{ f: "src/pages/admin/ProductManagement.jsx", isOpen: "isOpen", close: "() => setIsOpen(false)" },
{ f: "src/pages/admin/Returns.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)" },
{ f: "src/pages/admin/offline/Orders.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)" },
{ f: "src/pages/admin/offline/Returns.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)", line: 737 },
{ f: "src/pages/admin/offline/Returns.jsx", isOpen: "isReturnFormOpen", close: "() => setIsReturnFormOpen(false)", line: 899 },
{ f: "src/pages/superadmin/Admins.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/pages/superadmin/SuperAdmins.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)" },
{ f: "src/components/user/TrendProductsModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/user/VideoModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/user/WorkshopModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/DeleteConfirmationModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/LogoutConfirmationModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/ProductFormModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/UserModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/UserViewModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/BulkItemModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/InvoiceModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/OfflineOrderModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/StoreCustomerModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/StoreOrderModal.jsx", isOpen: "isOpen", close: "onClose" },
{ f: "src/components/admin/offline/VendorModal.jsx", isOpen: "isOpen", close: "onClose" }
];

const fileCache = {};

patches.forEach(patch => {
  if (!fs.existsSync(patch.f)) return;
  if (!fileCache[patch.f]) {
    fileCache[patch.f] = fs.readFileSync(patch.f, 'utf8');
  }
  let content = fileCache[patch.f];
  
  // Inject onClick
  // Find all <div className="fixed inset-0...
  const regex = /(<div[^>]*className="[^"]*fixed inset-0[^"]*"[^>]*)>/g;
  
  content = content.replace(regex, (match, p1) => {
    if (match.includes('onClick=')) return match;
    const closeFnStr = typeof patch.close === 'string' ? patch.close : 'onClose';
    return `${p1} onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = ${closeFnStr}; closeFn(); } }}>`;
  });

  // Inject Escape Key logic using a generic component Wrapper
  content = content.replace(/(<div[^>]*className="[^"]*fixed inset-0[^"]*"[^>]*onClick=\{\(e\)[^>]*)>/g, `$1>\n        {/* Keyboard Listener */}\n        {(() => {\n          const closeFn = ${patch.close};\n          return <ModalKeyboardListener isOpen={!!${patch.isOpen}} onClose={closeFn} />;\n        })()}`);
  
  fileCache[patch.f] = content;
});

// Write files back and inject ModalKeyboardListener component if needed
Object.keys(fileCache).forEach(f => {
  let content = fileCache[f];
  
  if (!content.includes('ModalKeyboardListener')) return; // No change made
  
  // If not already imported/defined, define ModalKeyboardListener at the top
  if (!content.includes('function ModalKeyboardListener')) {
    const listenerDef = `
// Injected by script for Modal escape key support
import { useEffect as _useEffect } from 'react';
function ModalKeyboardListener({ isOpen, onClose }) {
  _useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  return null;
}
`;
    // Find import React and inject after
    if (content.match(/(import React[^;]*;)/)) {
      content = content.replace(/(import React[^;]*;)/, `$1\n${listenerDef}`);
    } else if (content.match(/(import [^;]+ from 'react';)/)) {
      content = content.replace(/(import [^;]+ from 'react';)/, `$1\n${listenerDef}`);
    } else {
      content = listenerDef + '\n' + content;
    }
  }
  
  fs.writeFileSync(f, content);
  console.log('Patched', f);
});
