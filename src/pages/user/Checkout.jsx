import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Lock, CreditCard, Truck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = ['Shipping', 'Payment', 'Confirmation'];

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 md:py-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Stepper Header */}
        <div className="flex justify-between items-center mb-16 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                  index <= activeStep ? 'bg-brand-orange text-white' : 'bg-white text-gray-300 border border-gray-100'
                }`}
              >
                {index < activeStep ? <Check size={20} /> : index + 1}
              </div>
              <span className={`mt-4 text-[10px] uppercase font-bold tracking-[0.2em] transition-colors ${
                index <= activeStep ? 'text-brand-orange' : 'text-gray-300'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div 
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <Truck className="text-brand-orange" size={24} />
                    <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Shipping Details</h2>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput label="First Name" />
                      <FormInput label="Last Name" />
                    </div>
                    <FormInput label="Street Address" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormInput label="City" />
                      <FormInput label="State" />
                      <FormInput label="Zip Code" />
                    </div>
                    <FormInput label="Phone Number" type="tel" />
                  </form>

                  <div className="mt-12 flex justify-end">
                    <button onClick={nextStep} className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-2">
                      Proceed to Payment <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-10 md:p-14 rounded-[4rem] shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <CreditCard className="text-brand-orange" size={24} />
                    <h2 className="text-3xl font-fashion font-bold text-[#1A1A1A]">Payment Method</h2>
                  </div>

                  <div className="space-y-4 mb-10">
                    <PaymentOption label="Credit / Debit Card" icon={<CreditCard size={20} />} active />
                    <PaymentOption label="UPI / Net Banking" icon={<ShoppingBag size={20} />} />
                    <PaymentOption label="Cash on Delivery (Heritage)" icon={<Truck size={20} />} />
                  </div>

                  <form className="space-y-6">
                    <FormInput label="Cardholder Name" />
                    <FormInput label="Card Number" placeholder="**** **** **** ****" />
                    <div className="grid grid-cols-2 gap-6">
                      <FormInput label="Expiry Date" placeholder="MM / YY" />
                      <FormInput label="CVV" placeholder="***" type="password" />
                    </div>
                  </form>

                  <div className="mt-12 flex justify-between">
                    <button onClick={prevStep} className="text-sm font-bold text-gray-400 hover:text-[#1A1A1A]">Back to Shipping</button>
                    <button onClick={nextStep} className="btn btn-primary px-12 py-5 rounded-2xl flex items-center gap-2">
                      Place Order <Lock size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div 
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-12 md:p-20 rounded-[4rem] shadow-sm text-center"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-10">
                    <Check size={48} />
                  </div>
                  <h2 className="text-4xl font-fashion font-bold text-[#1A1A1A] mb-4">A Heritage Treasure is on its way!</h2>
                  <p className="text-gray-500 text-lg mb-12 max-w-md mx-auto">
                    Your order #MS-9281 has been successfully placed. We've sent the confirmation details to your email.
                  </p>
                  <Link to="/shop" className="btn btn-primary px-12 py-5 rounded-full">Continue Shopping</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          {activeStep < 2 && (
            <div className="lg:col-span-1">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-fashion font-bold text-[#1A1A1A] mb-8">Order Details</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">2 Heritage Items</span>
                    <span className="font-bold">₹21,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-fashion font-bold pt-6 border-t border-gray-50">
                  <span>Grand Total</span>
                  <span className="text-brand-orange">₹21,000</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function FormInput({ label, type = 'text', placeholder = '' }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block px-2">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-[#FAF9F6] px-6 py-4 rounded-2xl border border-gray-50 focus:outline-none focus:border-brand-orange/30 transition-all font-medium text-sm"
      />
    </div>
  );
}

function PaymentOption({ label, icon, active }) {
  return (
    <div className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
      active ? 'bg-brand-orange/5 border-brand-orange/20 text-brand-orange' : 'bg-gray-50 border-gray-50 text-gray-500 hover:border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        {icon}
        <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        active ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'
      }`}>
        {active && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </div>
  );
}
