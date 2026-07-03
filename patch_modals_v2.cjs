const fs = require('fs');

const patches = [
  { f: "src/pages/user/Profile/sections/AddressBook.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [176] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "selectedOrderDetail", close: "() => setSelectedOrderDetail(null)", lines: [572] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "isReviewModalOpen", close: "() => setIsReviewModalOpen(false)", lines: [755] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", isOpen: "isExchangeModalOpen", close: "() => setIsExchangeModalOpen(false)", lines: [841] },
  { f: "src/pages/user/Profile/sections/PaymentMethods.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [201] },
  { f: "src/pages/user/Profile/sections/PaymentMethods.jsx", isOpen: "isBankModalOpen", close: "() => setIsBankModalOpen(false)", lines: [251] },
  { f: "src/pages/user/Profile/sections/ReturnsRefunds.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)", lines: [172] },
  { f: "src/pages/user/Cart.jsx", isOpen: "isCartOpen", close: "() => setCartOpen(false)", lines: [174] },
  { f: "src/pages/user/CategoryView.jsx", isOpen: "isMobileFiltersOpen", close: "() => setIsMobileFiltersOpen(false)", lines: [264] },
  { f: "src/pages/user/Checkout.jsx", isOpen: "addressToDelete", close: "() => setAddressToDelete(null)", lines: [1274] },
  { f: "src/pages/user/Checkout.jsx", isOpen: "showLogoutConfirm", close: "() => setShowLogoutConfirm(false)", lines: [1315] },
  { f: "src/pages/user/Checkout.jsx", isOpen: "isOpen", close: "onClose", lines: [1345] },
  { f: "src/pages/user/Login.jsx", isOpen: "isLoginModalOpen", close: "handleCloseModal", lines: [120] },
  { f: "src/pages/admin/settings/ArtisanBlooms.jsx", isOpen: "isFormModalOpen", close: "() => setIsFormModalOpen(false)", lines: [457] },
  { f: "src/pages/admin/settings/Banner.jsx", isOpen: "selectedBannerImage", close: "() => setSelectedBannerImage(null)", lines: [441] },
  { f: "src/pages/admin/settings/Blogs.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [477] },
  { f: "src/pages/admin/settings/Testimonial.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [382] },
  { f: "src/pages/admin/settings/Workshops.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [397] },
  { f: "src/pages/admin/Categories.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [925] },
  { f: "src/pages/admin/DeliveryCharges.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [491] },
  { f: "src/pages/admin/DeliveryCharges.jsx", isOpen: "isDeleteModalOpen", close: "() => setIsDeleteModalOpen(false)", lines: [616] },
  { f: "src/pages/admin/Orders.jsx", isOpen: "isOpen", close: "() => setIsOpen(false)", lines: [653] },
  { f: "src/pages/admin/ProductManagement.jsx", isOpen: "isOpen", close: "() => setIsOpen(false)", lines: [856] },
  { f: "src/pages/admin/Returns.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)", lines: [415] },
  { f: "src/pages/admin/offline/Orders.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)", lines: [454] },
  { f: "src/pages/admin/offline/Returns.jsx", isOpen: "isPreviewOpen", close: "() => setIsPreviewOpen(false)", lines: [737] },
  { f: "src/pages/admin/offline/Returns.jsx", isOpen: "isReturnFormOpen", close: "() => setIsReturnFormOpen(false)", lines: [899] },
  { f: "src/pages/superadmin/Admins.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [319] },
  { f: "src/pages/superadmin/SuperAdmins.jsx", isOpen: "isModalOpen", close: "() => setIsModalOpen(false)", lines: [296] },
  { f: "src/components/user/TrendProductsModal.jsx", isOpen: "isOpen", close: "onClose", lines: [15] },
  { f: "src/components/user/VideoModal.jsx", isOpen: "isOpen", close: "onClose", lines: [98] },
  { f: "src/components/user/WorkshopModal.jsx", isOpen: "isOpen", close: "onClose", lines: [143] },
  { f: "src/components/admin/DeleteConfirmationModal.jsx", isOpen: "isOpen", close: "onClose", lines: [18] },
  { f: "src/components/admin/LogoutConfirmationModal.jsx", isOpen: "isOpen", close: "onClose", lines: [15] },
  { f: "src/components/admin/ProductFormModal.jsx", isOpen: "isOpen", close: "onClose", lines: [571] },
  { f: "src/components/admin/UserModal.jsx", isOpen: "isOpen", close: "onClose", lines: [138] },
  { f: "src/components/admin/UserViewModal.jsx", isOpen: "isOpen", close: "onClose", lines: [106] },
  { f: "src/components/admin/offline/BulkItemModal.jsx", isOpen: "isOpen", close: "onClose", lines: [44] },
  { f: "src/components/admin/offline/InvoiceModal.jsx", isOpen: "isOpen", close: "onClose", lines: [292] },
  { f: "src/components/admin/offline/OfflineOrderModal.jsx", isOpen: "isOpen", close: "onClose", lines: [310] },
  { f: "src/components/admin/offline/StoreCustomerModal.jsx", isOpen: "isOpen", close: "onClose", lines: [90] },
  { f: "src/components/admin/offline/StoreOrderModal.jsx", isOpen: "isOpen", close: "onClose", lines: [257] },
  { f: "src/components/admin/offline/VendorModal.jsx", isOpen: "isOpen", close: "onClose", lines: [150] }
];

const fileCache = {};

patches.forEach(patch => {
  if (!fs.existsSync(patch.f)) return;
  if (!fileCache[patch.f]) {
    fileCache[patch.f] = fs.readFileSync(patch.f, 'utf8').split('\n');
  }
  let lines = fileCache[patch.f];
  
  patch.lines.forEach(l => {
    let lineIdx = l - 1;
    let originalLine = lines[lineIdx];
    
    // Safety check - verify line still has fixed inset-0
    if (!originalLine.includes('fixed inset-0')) {
      // search around it
      for (let i = Math.max(0, lineIdx - 10); i < Math.min(lines.length, lineIdx + 10); i++) {
        if (lines[i].includes('fixed inset-0')) {
          lineIdx = i;
          originalLine = lines[i];
          break;
        }
      }
    }
    
    if (!originalLine.includes('fixed inset-0')) {
      console.log('Could not find line for', patch.f, patch.lines);
      return;
    }

    if (originalLine.includes('ModalKeyboardListener')) return; // Already patched

    let modifiedLine = originalLine;

    // Inject onClick if not already present
    if (!modifiedLine.includes('onClick=')) {
      if (modifiedLine.includes('>')) {
         modifiedLine = modifiedLine.replace('>', ` onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = ${patch.close}; closeFn(); } }}>`);
      } else {
         // tag closes on a subsequent line
         lines[lineIdx] = modifiedLine + ` onClick={(e) => { if (e.target === e.currentTarget) { const closeFn = ${patch.close}; closeFn(); } }}`;
         modifiedLine = lines[lineIdx];
      }
    }

    // Inject KeyboardListener right before the line
    lines[lineIdx] = `{/* Keyboard Listener */}\n{(() => { const closeFn = ${patch.close}; return <ModalKeyboardListener isOpen={!!${patch.isOpen}} onClose={closeFn} />; })()}\n` + modifiedLine;
  });
});

Object.keys(fileCache).forEach(f => {
  let content = fileCache[f].join('\n');
  
  // Inject component definition if needed
  if (content.includes('ModalKeyboardListener') && !content.includes('function ModalKeyboardListener')) {
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
