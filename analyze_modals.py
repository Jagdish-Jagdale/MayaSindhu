import os
import re
import glob

# Files with modals
files = [
    r"src\pages\user\Profile\sections\AddressBook.jsx",
    r"src\pages\user\Profile\sections\OrderHistory.jsx",
    r"src\pages\user\Profile\sections\PaymentMethods.jsx",
    r"src\pages\user\Profile\sections\ReturnsRefunds.jsx",
    r"src\pages\user\Cart.jsx",
    r"src\pages\user\CategoryView.jsx",
    r"src\pages\user\Checkout.jsx",
    r"src\pages\user\Login.jsx",
    r"src\pages\admin\settings\ArtisanBlooms.jsx",
    r"src\pages\admin\settings\Banner.jsx",
    r"src\pages\admin\settings\Blogs.jsx",
    r"src\pages\admin\settings\Testimonial.jsx",
    r"src\pages\admin\settings\Workshops.jsx",
    r"src\pages\admin\Categories.jsx",
    r"src\pages\admin\DeliveryCharges.jsx",
    r"src\pages\admin\Orders.jsx",
    r"src\pages\admin\ProductManagement.jsx",
    r"src\pages\admin\Returns.jsx",
    r"src\pages\admin\offline\Orders.jsx",
    r"src\pages\admin\offline\Returns.jsx",
    r"src\pages\superadmin\Admins.jsx",
    r"src\pages\superadmin\SuperAdmins.jsx",
    r"src\components\user\TrendProductsModal.jsx",
    r"src\components\user\VideoModal.jsx",
    r"src\components\user\WorkshopModal.jsx",
    r"src\components\admin\DeleteConfirmationModal.jsx",
    r"src\components\admin\LogoutConfirmationModal.jsx",
    r"src\components\admin\ProductFormModal.jsx",
    r"src\components\admin\UserModal.jsx",
    r"src\components\admin\UserViewModal.jsx",
    r"src\components\admin\offline\BulkItemModal.jsx",
    r"src\components\admin\offline\InvoiceModal.jsx",
    r"src\components\admin\offline\OfflineOrderModal.jsx",
    r"src\components\admin\offline\StoreCustomerModal.jsx",
    r"src\components\admin\offline\StoreOrderModal.jsx",
    r"src\components\admin\offline\VendorModal.jsx",
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all instances of fixed inset-0
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'fixed inset-0' in line:
            # Let's find the closest onClick or close function nearby
            # Look up a few lines to find conditional render like {isModalOpen && (
            condition = ""
            for j in range(i-1, max(-1, i-10), -1):
                if '&&' in lines[j] and '{' in lines[j]:
                    condition = lines[j].strip()
                    break
            
            # Look down for close buttons
            close_func = ""
            for j in range(i, min(len(lines), i+30)):
                if '<button' in lines[j] and 'onClick=' in lines[j]:
                    m = re.search(r'onClick=\{([^}]+)\}', lines[j])
                    if m:
                        close_func = m.group(1)
                        if 'set' in close_func or 'onClose' in close_func:
                            break
            print(f"{filepath}:{i+1} | Cond: {condition} | Close: {close_func}")
