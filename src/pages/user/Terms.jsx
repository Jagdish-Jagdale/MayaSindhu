import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, FileText } from 'lucide-react';

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
            <h2 className="text-2xl font-bold mb-6">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Welcome to MayaSindhu. These Terms and Conditions govern your use of our website and the purchase of our handcrafted products. By accessing our site, you agree to follow these terms in full.
            </p>

            <h2 className="text-2xl font-bold mb-6">2. Use of the Website</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You must be at least 18 years of age to use this website. By using this website and by agreeing to these terms and conditions, you warrant and represent that you are at least 18 years of age.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>You may not use our products for any illegal or unauthorized purpose.</li>
              <li>You must not transmit any worms or viruses or any code of a destructive nature.</li>
              <li>A breach or violation of any of the Terms will result in an immediate termination of your Services.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">3. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              All content included on this site, such as text, graphics, logos, images, and software, is the property of MayaSindhu or its content suppliers and is protected by international copyright laws.
            </p>

            <h2 className="text-2xl font-bold mb-6">4. Product Accuracy</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We attempt to be as accurate as possible with product descriptions and images. However, because our products are handcrafted, slight variations in color, texture, and finish are expected and celebrate the uniqueness of each piece.
            </p>

            <h2 className="text-2xl font-bold mb-6">5. Pricing and Availability</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
            </p>

            <h2 className="text-2xl font-bold mb-6">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              MayaSindhu shall not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products.
            </p>

            <h2 className="text-2xl font-bold mb-6">7. User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify MayaSindhu of any unauthorized uses of your account or any other breaches of security.
            </p>

            <h2 className="text-2xl font-bold mb-6">8. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-2xl font-bold mb-6">9. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-2xl font-bold mb-6">10. Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <div className="mt-16 p-8 bg-[#FAF9F6] rounded-3xl border border-dashed border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-2 italic">Questions about the Terms of Service should be sent to us at</p>
              <a href="mailto:mayasindhuofficial@gmail.com" className="text-brand-orange font-bold hover:underline">mayasindhuofficial@gmail.com</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
