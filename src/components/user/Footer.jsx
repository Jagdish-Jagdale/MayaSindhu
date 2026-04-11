export default function Footer() {
  return (
    <footer className="bg-brand-burgundy-dark text-brand-cream pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-serif font-bold tracking-widest mb-6 border-b border-brand-cream/20 pb-4 inline-block">
            MAYASINDHU
          </h2>
          <p className="max-w-md text-brand-cream/70 leading-relaxed font-sans mt-4">
            Celebrating the timeless art of handmade sarees. MayaSindhu brings you the finest selection of heritage textiles, woven with passion and traditional craftsmanship.
          </p>
        </div>
        
        <div>
          <h3 className="text-brand-gold font-medium tracking-widest mb-6 uppercase text-sm">Customer Care</h3>
          <ul className="space-y-4 text-sm text-brand-cream/60">
            <li><a href="#" className="hover:text-brand-gold transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Care Instructions</a></li>
            <li><a href="#" className="hover:text-brand-gold transition-colors">Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-brand-gold font-medium tracking-widest mb-6 uppercase text-sm">Newsletter</h3>
          <p className="text-sm text-brand-cream/60 mb-4 font-sans">Join the legacy to receive curated collection updates.</p>
          <div className="flex border-b border-brand-cream/30 pb-2">
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-brand-cream/30"
            />
            <button className="text-xs tracking-widest uppercase hover:text-brand-gold transition-colors">Join</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.2em] uppercase text-brand-cream/40">
        <p>&copy; 2026 MAYASINDHU. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-brand-cream transition-colors">Instagram</a>
          <a href="#" className="hover:text-brand-cream transition-colors">Pinterest</a>
          <a href="#" className="hover:text-brand-cream transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
