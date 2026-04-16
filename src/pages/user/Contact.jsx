import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen py-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] uppercase tracking-[0.4em] font-bold text-brand-orange mb-4 block"
          >
            Get In Touch
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-fashion font-bold text-[#1A1A1A]"
          >
            Connect with Our Artisans
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white p-8 md:p-16 rounded-[4rem] shadow-sm">
          {/* Left: Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A] mb-8">Let's start a conversation</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-12">
                Whether you have a question about our heritage techniques, need assistance with an order, or just want to share your love for handcrafted art, our team is here to listen.
              </p>
            </div>

            <div className="space-y-8">
              <ContactItem 
                icon={<Mail size={24} />} 
                label="Email Us" 
                value="hello@mayasindhu.com" 
                sub="We reply within 24 hours" 
              />
              <ContactItem 
                icon={<Phone size={24} />} 
                label="Call Us" 
                value="+91 98765 43210" 
                sub="Mon-Sat, 9am - 6pm IST" 
              />
              <ContactItem 
                icon={<MapPin size={24} />} 
                label="Our Studio" 
                value="Artisans Block, Heritage Row" 
                sub="Jaipur, Rajasthan, India" 
              />
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-[#FAF9F6] p-8 md:p-12 rounded-[3rem]">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-brand-orange transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-brand-orange transition-all"
                />
              </div>
              <input 
                type="text" 
                placeholder="Subject" 
                className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-brand-orange transition-all"
              />
              <textarea 
                rows="5" 
                placeholder="How can we help you?" 
                className="w-full bg-white px-6 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:border-brand-orange transition-all resize-none"
              ></textarea>
              <button 
                className="w-full btn btn-primary py-5 rounded-2xl text-[14px]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-14 h-14 bg-brand-orange/5 text-brand-orange rounded-2xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{label}</p>
        <p className="text-xl font-fashion font-bold text-[#1A1A1A] mb-1">{value}</p>
        <p className="text-sm text-gray-500">{sub}</p>
      </div>
    </div>
  );
}
