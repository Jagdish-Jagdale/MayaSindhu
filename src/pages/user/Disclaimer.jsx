import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Info, HelpCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-10"
            alt="Disclaimer Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center border border-gray-100">
              <AlertCircle className="text-brand-orange" size={32} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-sans font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            Legal <span className="text-brand-orange">Disclaimer</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black"
          >
            Important Information for Our Visitors
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-white p-8 md:p-20 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="prose prose-brand max-w-none">
            <h2 className="text-2xl font-bold mb-6">1. General Information</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              The information provided by MayaSindhu on this website is for general informational purposes only. All information on the site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
            </p>

            <h2 className="text-2xl font-bold mb-6">2. Product Representation</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
            </p>

            <h2 className="text-2xl font-bold mb-6">3. External Links</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              The site may contain (or you may be sent through the site) links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
            </p>

            <h2 className="text-2xl font-bold mb-6">4. Professional Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              The site cannot and does not contain professional advice. The information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
            </p>

            <h2 className="text-2xl font-bold mb-6">5. Errors and Omissions</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, MayaSindhu is not responsible for any errors or omissions, or for the results obtained from the use of this information.
            </p>

            <h2 className="text-2xl font-bold mb-6">6. Testimonials Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              The Site may contain testimonials by users of our products and/or services. These testimonials reflect the real-life experiences and opinions of such users. However, the experiences are personal to those particular users, and may not necessarily be representative of all users of our products and/or services.
            </p>

            <h2 className="text-2xl font-bold mb-6">7. Images Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Product images are for illustrative purposes only and may differ from the actual product. Due to differences in monitors, colors of products may also appear different to those shown on the site. Handcrafted items will always have unique characteristics.
            </p>

            <h2 className="text-2xl font-bold mb-6">8. Copyright Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Under Section 107 of the Copyright Act 1976, allowance is made for "fair use" for purposes such as criticism, comment, news reporting, teaching, scholarship, and research. Fair use is a use permitted by copyright statute that might otherwise be infringing.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-[#FAF9F6] rounded-3xl border border-gray-100">
                <Info className="text-brand-orange mb-4" size={24} />
                <h4 className="font-bold mb-2">Accuracy</h4>
                <p className="text-sm text-gray-500 leading-relaxed">We strive for perfection but celebrate the natural variations in our handcrafted treasures.</p>
              </div>
              <div className="p-8 bg-[#FAF9F6] rounded-3xl border border-gray-100">
                <HelpCircle className="text-brand-orange mb-4" size={24} />
                <h4 className="font-bold mb-2">Support</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Need clarification? Our team is here to help you understand our policies better.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
