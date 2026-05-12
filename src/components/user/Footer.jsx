import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useCategories from '../../hooks/useCategories';

export default function Footer() {
  const { categories } = useCategories();

  const categoryOrder = [
    'CURATED SAREES',
    'DESIGNER DRESS MATERIALS',
    'FESTIVE SPECIAL COLLECTION',
    'HANDCRAFTED JEWELLERY',
    'ELEGANT ACCESSORIES',
    'BAGS',
    'TRENDY READYMADES'
  ];

  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name.toUpperCase().trim());
    const indexB = categoryOrder.indexOf(b.name.toUpperCase().trim());
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Get top 8 sorted main categories for the footer
  const mainCategories = sortedCategories
    .filter(cat => !cat.parentId)
    .slice(0, 8);

  return (
    <footer className="bg-[#F0F7FF] pt-24 pb-12 border-t border-[#004D40]/5">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">

          {/* Column 1: Brand Info */}
          <div>
            <h2 className="text-[#004D40] text-lg font-sans font-bold tracking-[0.3em] uppercase mb-8">
              MAYASINDHU
            </h2>
            <p className="text-[#1A1A1A] text-[15px] leading-relaxed mb-10 max-w-[280px]">
              Curating timeless pieces that honor the hands that made them. Wear the story of heritage.
            </p>
            <div className="flex gap-6 items-center">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-brand-orange transition-all duration-300 transform hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-brand-orange transition-all duration-300 transform hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#1A1A1A] hover:text-brand-orange transition-all duration-300 transform hover:scale-110">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 103.38 103.38 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 103.38 103.38 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="text-[#004D40] text-xs font-sans font-bold tracking-[0.2em] uppercase mb-8">
              Categories
            </h3>
            <ul className="space-y-4">
              {mainCategories.length > 0 ? (
                mainCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      to={cat.fullPath || `/c/${cat.slug || cat.id}`}
                      className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300 line-clamp-1"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                ['Sarees', 'Jewellery', 'Dresses', 'Accessories'].map((link) => (
                  <li key={link}>
                    <Link to="/shop" className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                      {link}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Column 3: Other Links */}
          <div>
            <h3 className="text-[#004D40] text-xs font-sans font-bold tracking-[0.2em] uppercase mb-8">
              Other Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/blog" className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-[#1A1A1A] text-[11px] uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact US */}
          <div className="lg:col-start-4">
            <h3 className="text-[#004D40] text-xs font-sans font-bold tracking-[0.2em] uppercase mb-8">
              Contact US
            </h3>
            <ul className="space-y-5 text-[#1A1A1A] text-[13px] leading-relaxed">
              <li className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 text-brand-orange shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Shop No. 5, Grandstand Apartment, Survey No. 2945, K/10, Pratibha Nagar Road, Kolhapur</span>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <a href="mailto:mayasindhuofficial@gmail.com" className="hover:text-brand-orange transition-colors">mayasindhuofficial@gmail.com</a>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <a href="tel:+919172020494" className="hover:text-brand-orange transition-colors">+91 9172020494</a>
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange shrink-0"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors font-bold uppercase tracking-widest text-[10px]">View on Map</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-[#004D40]/10 text-center">
          <p className="text-[#1A1A1A] text-[10px] uppercase tracking-[0.3em] font-medium">
            © 2026 MAYASINDHU. CRAFTED FOR THE MODERN MUSE.
          </p>
        </div>
      </div>
    </footer>
  );
}
