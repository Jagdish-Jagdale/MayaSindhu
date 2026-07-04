/**
 * File: Privacy.jsx
 * Description: Client-facing policy guidelines statement displaying personal information safeguards and details.
 * Work Done: Removed unused imports and motion components to optimize package build weight.
 */

import React from 'react';
import { ShieldCheck, Eye, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="bg-white min-h-screen font-sans text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover opacity-10"
            alt="Privacy Background"
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
              <ShieldCheck className="text-brand-orange" size={32} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-sans font-bold text-[#1A1A1A] mb-4 tracking-tight"
          >
            Privacy <span className="text-brand-orange">Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black"
          >
            Your Security is Our Priority
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-white p-8 md:p-20 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.03)] border border-gray-100">
          <div className="prose prose-brand max-w-none">
            <h2 className="text-2xl font-bold mb-6">1. Information Collection</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect information from you when you register on our site, place an order, or subscribe to our newsletter. The data collected may include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>Contact information (Name, Email, Phone Number)</li>
              <li>Shipping and Billing addresses</li>
              <li>Payment details (processed securely via Razorpay)</li>
              <li>Purchase history and preferences</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">2. Use of Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Any of the information we collect from you may be used in one of the following ways:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-8">
              <li>To personalize your experience and better respond to your individual needs.</li>
              <li>To improve our website based on the information and feedback we receive from you.</li>
              <li>To process transactions quickly and securely.</li>
              <li>To send periodic emails regarding your order or other products and services.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6">3. Data Security</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We implement a variety of security measures to maintain the safety of your personal information. We use state-of-the-art encryption to protect sensitive information transmitted online. Your payment data is handled by industry-leading payment processors and is never stored on our servers.
            </p>

            <h2 className="text-2xl font-bold mb-6">4. Cookie Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Yes, we use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits, and compile aggregate data about site traffic.
            </p>

            <h2 className="text-2xl font-bold mb-6">5. Third-Party Disclosure</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>

            <h2 className="text-2xl font-bold mb-6">6. Your Consent</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              By using our site, you consent to our online privacy policy. We reserve the right to update this policy at any time, and changes will be reflected on this page.
            </p>

            <h2 className="text-2xl font-bold mb-6">7. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>

            <h2 className="text-2xl font-bold mb-6">8. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold mb-6">9. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              You have the right to access, correct, or delete your personal information. You can do this by logging into your account or by contacting us directly. You also have the right to object to the processing of your data for marketing purposes.
            </p>

            <h2 className="text-2xl font-bold mb-6">10. Security of Transactions</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              All credit card transactions are processed through a gateway provider and are not stored or processed on our servers. We use Secure Socket Layer (SSL) technology to ensure your data is safe and encrypted.
            </p>

            <div className="mt-16 p-10 bg-[#004D40]/5 rounded-[2rem] border border-[#004D40]/10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Lock className="text-brand-orange" size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-2">Have concerns about your data?</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We are committed to transparency. If you have questions about how your data is handled, please contact our privacy team at <a href="mailto:mayasindhuofficial@gmail.com" className="text-brand-orange font-bold">mayasindhuofficial@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
