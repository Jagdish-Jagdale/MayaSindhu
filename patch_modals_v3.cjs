const fs = require('fs');

const patches = [
  { f: "src/pages/user/Profile/sections/AddressBook.jsx", close: "() => setIsModalOpen(false)", lines: [176] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", close: "() => setSelectedOrderDetail(null)", lines: [572] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", close: "() => setIsReviewModalOpen(false)", lines: [755] },
  { f: "src/pages/user/Profile/sections/OrderHistory.jsx", close: "() => setIsExchangeModalOpen(false)", lines: [841] },
  { f: "src/pages/user/Profile/sections/PaymentMethods.jsx", close: "() => setIsModalOpen(false)", lines: [201] },
  { f: "src/pages/user/Profile/sections/PaymentMethods.jsx", close: "() => setIsBankModalOpen(false)", lines: [251] },
  { f: "src/pages/user/Profile/sections/ReturnsRefunds.jsx", close: "() => setIsPreviewOpen(false)", lines: [172] },
  { f: "src/pages/user/Cart.jsx", close: "() => setCartOpen(false)", lines: [174] },
  { f: "src/pages/user/CategoryView.jsx", close: "() => setIsMobileFiltersOpen(false)", lines: [264] },
  { f: "src/pages/user/Checkout.jsx", close: "() => setAddressToDelete(null)", lines: [1274] },
  { f: "src/pages/user/Checkout.jsx", close: "() => setShowLogoutConfirm(false)", lines: [1315] },
  { f: "src/pages/user/Checkout.jsx", close: "onClose", lines: [1345] },
  { f: "src/pages/user/Login.jsx", close: "handleCloseModal", lines: [120] },
  { f: "src/pages/admin/settings/ArtisanBlooms.jsx", close: "() => setIsFormModalOpen(false)", lines: [457] },
  { f: "src/pages/admin/settings/Banner.jsx", close: "() => setSelectedBannerImage(null)", lines: [441] },
  { f: "src/pages/admin/settings/Blogs.jsx", close: "() => setIsModalOpen(false)", lines: [477] },
  { f: "src/pages/admin/settings/Testimonial.jsx", close: "() => setIsModalOpen(false)", lines: [382] },
  { f: "src/pages/admin/settings/Workshops.jsx", close: "() => setIsModalOpen(false)", lines: [397] },
  { f: "src/pages/admin/Categories.jsx", close: "() => setIsModalOpen(false)", lines: [925] },
  { f: "src/pages/admin/DeliveryCharges.jsx", close: "() => setIsModalOpen(false)", lines: [491] },
  { f: "src/pages/admin/DeliveryCharges.jsx", close: "() => setIsDeleteModalOpen(false)", lines: [616] },
  { f: "src/pages/admin/Orders.jsx", close: "() => setIsOpen(false)", lines: [653] },
  { f: "src/pages/admin/ProductManagement.jsx", close: "() => setIsOpen(false)", lines: [856] },
  { f: "src/pages/admin/Returns.jsx", close: "() => setIsPreviewOpen(false)", lines: [415] },
  { f: "src/pages/admin/offline/Orders.jsx", close: "() => setIsPreviewOpen(false)", lines: [454] },
  { f: "src/pages/admin/offline/Returns.jsx", close: "() => setIsPreviewOpen(false)", lines: [737] },
  { f: "src/pages/admin/offline/Returns.jsx", close: "() => setIsReturnFormOpen(false)", lines: [899] },
  { f: "src/pages/superadmin/Admins.jsx", close: "() => setIsModalOpen(false)", lines: [319] },
  { f: "src/pages/superadmin/SuperAdmins.jsx", close: "() => setIsModalOpen(false)", lines: [296] },
  { f: "src/components/user/TrendProductsModal.jsx", close: "onClose", lines: [15] },
  { f: "src/components/user/VideoModal.jsx", close: "onClose", lines: [98] },
  { f: "src/components/user/WorkshopModal.jsx", close: "onClose", lines: [143] },
  { f: "src/components/admin/DeleteConfirmationModal.jsx", close: "onClose", lines: [18] },
  { f: "src/components/admin/LogoutConfirmationModal.jsx", close: "onClose", lines: [15] },
  { f: "src/components/admin/ProductFormModal.jsx", close: "onClose", lines: [571] },
  { f: "src/components/admin/UserModal.jsx", close: "onClose", lines: [138] },
  { f: "src/components/admin/UserViewModal.jsx", close: "onClose", lines: [106] },
  { f: "src/components/admin/offline/BulkItemModal.jsx", close: "onClose", lines: [44] },
  { f: "src/components/admin/offline/InvoiceModal.jsx", close: "onClose", lines: [292] },
  { f: "src/components/admin/offline/OfflineOrderModal.jsx", close: "onClose", lines: [310] },
  { f: "src/components/admin/offline/StoreCustomerModal.jsx", close: "onClose", lines: [90] },
  { f: "src/components/admin/offline/StoreOrderModal.jsx", close: "onClose", lines: [257] },
  { f: "src/components/admin/offline/VendorModal.jsx", close: "onClose", lines: [150] }
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

    lines[lineIdx] = modifiedLine;
  });
});

Object.keys(fileCache).forEach(f => {
  let content = fileCache[f].join('\n');
  fs.writeFileSync(f, content);
  console.log('Patched onClick for', f);
});
