export default function ProductManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-brand-burgundy-dark font-bold">Inventory Management</h1>
        <p className="text-sm text-gray-400 font-sans tracking-wide mt-1">Manage your collection of handmade sarees</p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center py-24">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-serif text-brand-burgundy mb-4">Product List (Coming Soon)</h3>
          <p className="text-gray-500 mb-8">This section is being prepared to help you manage stock, pricing, and artisan details for each piece.</p>
          <button className="btn btn-primary bg-brand-gold text-brand-burgundy font-bold px-8">Add New Product</button>
        </div>
      </div>
    </div>
  );
}
