/**
 * File: Terms.jsx
 * Description: Client-facing terms of service document outlining agreement rules, warranty statements, and legal frameworks.
 * Work Done: Cleaned up imports by removing unused framer-motion components to optimize asset size.
 */

import React from 'react';
import { Shield, Scale, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-10"
            alt="Terms Background"
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
              <Scale className="text-brand-orange" size={32} />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-sans font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            Terms & <span className="text-brand-orange">Conditions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black"
          >
            Last Updated: May 2026
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-white p-8 md:p-20 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="prose prose-brand max-w-none">
            <p className="text-gray-600 leading-relaxed mb-8">
              Welcome to Maya Sindhu. These Terms and Conditions govern your use of our website and the purchase of products from us. By browsing or shopping with us, you agree to abide by the terms listed below.
            </p>

            <h2 className="text-2xl font-bold mb-6">1. Products & Descriptions</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>All items are handcrafted and may vary slightly in design and color.</li>
              <li>We strive to ensure that product images and descriptions are accurate, but slight variations may occur due to screen settings or handmade nature.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">2. Orders & Payments</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>Orders can be placed through our website or in-store.</li>
              <li>We accept secure payment methods including UPI, debit/credit cards, and net banking.</li>
              <li>Prices are listed in INR and are inclusive/exclusive of taxes as specified.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">3. Shipping & Delivery</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>Standard delivery timelines range from 5-10 working days depending on location.</li>
              <li>We are not responsible for delays caused by third-party logistics providers.</li>
              <li>Tracking details will be shared once your order is dispatched.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">4. Returns & Exchanges</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>Returns are accepted only for damaged or incorrect items, within 7 days of delivery.</li>
              <li>To initiate a return, please contact our support team with images and order details.</li>
              <li>Items must be unused and returned in original packaging.</li>
              <li>Custom-made or personalized items are not eligible for return or exchange.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              All content on our website, including images, text, and designs, is the property of Maya Sindhu and may not be reused or copied without written permission.
            </p>

            <h2 className="text-2xl font-bold mb-6">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Maya Sindhu is not liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products or website.
            </p>

            <h2 className="text-2xl font-bold mb-6">7. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be effective immediately upon posting.
            </p>

            <h2 className="text-2xl font-bold mb-6">8. Contact</h2>
            <div className="mt-8 p-8 bg-[#FAF9F6] rounded-3xl border border-dashed border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2 italic">For queries or support, reach out to us at:</p>
              <a href="mailto:mayasindhuofficial@gmail.com" className="text-brand-orange font-bold hover:underline">mayasindhuofficial@gmail.com</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
