import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#F0F7FF] pt-24 pb-12 border-t border-[#004D40]/5">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">
          
          {/* Column 1: Brand Info */}
          <div>
            <h2 className="text-[#004D40] text-lg font-fashion font-bold tracking-[0.3em] uppercase mb-8">
              MAYASINDHU
            </h2>
            <p className="text-[#4A5568] text-[15px] leading-relaxed mb-10 max-w-[280px]">
              Curating timeless pieces that honor the hands that made them. Wear the story of heritage.
            </p>
            
            {/* Social Icons - Mimicking Reference Image */}
            <div className="flex space-x-6 text-[#004D40]/60">
              <a href="#" className="hover:text-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </a>
              <a href="#" className="hover:text-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </a>
              <a href="#" className="hover:text-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-[#004D40] text-xs font-fashion font-bold tracking-[0.2em] uppercase mb-8">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {['The Manifesto', 'Artisanship', 'Sizing Guide', 'Privacy', 'Care Instructions'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[#4A5568] text-xs uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-[#004D40] text-xs font-fashion font-bold tracking-[0.2em] uppercase mb-8">
              Categories
            </h3>
            <ul className="space-y-4">
              {['Handloom Sarees', 'Artisan Jewellery', 'Sustainable Dresses', 'Crafted Decor'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-[#4A5568] text-xs uppercase tracking-widest hover:text-brand-orange transition-colors duration-300">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: The Studio */}
          <div>
            <h3 className="text-[#004D40] text-xs font-fashion font-bold tracking-[0.2em] uppercase mb-8">
              The Studio
            </h3>
            <div className="text-[#4A5568] text-[13px] leading-loose">
              <p className="mb-4">A-12 Heritage Row,<br />Arts District, Jaipur 302001</p>
              <p className="mb-1 hover:text-brand-orange transition-colors cursor-pointer">concierge@mayasindhu.co</p>
              <p className="hover:text-brand-orange transition-colors cursor-pointer">+91 141 245 0098</p>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-[#004D40]/10 text-center">
          <p className="text-[#004D40]/40 text-[10px] uppercase tracking-[0.3em] font-medium">
            © 2026 MAYASINDHU. CRAFTED FOR THE MODERN MUSE.
          </p>
        </div>
      </div>
    </footer>
  );
}
