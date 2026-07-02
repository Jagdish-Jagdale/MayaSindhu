const fs = require('fs');
const files = [
  'src/pages/user/Profile/sections/AddressBook.jsx',
  'src/pages/user/Profile/sections/OrderHistory.jsx',
  'src/pages/user/Profile/sections/PaymentMethods.jsx',
  'src/pages/user/Profile/sections/ReturnsRefunds.jsx',
  'src/pages/user/Cart.jsx',
  'src/pages/user/CategoryView.jsx',
  'src/pages/user/Checkout.jsx',
  'src/pages/user/Login.jsx',
  'src/pages/admin/settings/ArtisanBlooms.jsx',
  'src/pages/admin/settings/Banner.jsx',
  'src/pages/admin/settings/Blogs.jsx',
  'src/pages/admin/settings/Testimonial.jsx',
  'src/pages/admin/settings/Workshops.jsx',
  'src/pages/admin/Categories.jsx',
  'src/pages/admin/DeliveryCharges.jsx',
  'src/pages/admin/Orders.jsx',
  'src/pages/admin/ProductManagement.jsx',
  'src/pages/admin/Returns.jsx',
  'src/pages/admin/offline/Orders.jsx',
  'src/pages/admin/offline/Returns.jsx',
  'src/pages/superadmin/Admins.jsx',
  'src/pages/superadmin/SuperAdmins.jsx',
  'src/components/user/TrendProductsModal.jsx',
  'src/components/user/VideoModal.jsx',
  'src/components/user/WorkshopModal.jsx',
  'src/components/admin/DeleteConfirmationModal.jsx',
  'src/components/admin/LogoutConfirmationModal.jsx',
  'src/components/admin/ProductFormModal.jsx',
  'src/components/admin/UserModal.jsx',
  'src/components/admin/UserViewModal.jsx',
  'src/components/admin/offline/BulkItemModal.jsx',
  'src/components/admin/offline/InvoiceModal.jsx',
  'src/components/admin/offline/OfflineOrderModal.jsx',
  'src/components/admin/offline/StoreCustomerModal.jsx',
  'src/components/admin/offline/StoreOrderModal.jsx',
  'src/components/admin/offline/VendorModal.jsx'
];

let patches = [];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((l, i) => {
    if (l.includes('fixed inset-0')) {
      let cond = '';
      for (let j = Math.max(0, i-10); j < i; j++) {
        if (lines[j].includes('&&') && lines[j].includes('{')) {
          cond = lines[j].trim();
        }
      }
      
      let close = '';
      for (let j = i; j < Math.min(lines.length, i+30); j++) {
        if (lines[j].includes('<button') && lines[j].includes('onClick=')) {
          const m = lines[j].match(/onClick=\{([^}]+)\}/);
          if (m) {
            close = m[1];
            if (close.includes('set') || close.includes('onClose') || close.includes('Modal')) break;
          }
        }
      }
      
      let isOpenVar = 'isOpen';
      if (cond) {
        const m = cond.match(/\{([a-zA-Z0-9_]+)\s*&&/);
        if (m) isOpenVar = m[1];
      }
      
      patches.push({
        file: f,
        line: i,
        isOpenVar: isOpenVar,
        closeCode: close
      });
      console.log(`${f}:${i+1} | CondVar: ${isOpenVar} | Close: ${close}`);
    }
  });
});
