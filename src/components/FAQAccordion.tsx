"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is NFC technology?",
    answer: "NFC (Near Field Communication) is a short-range wireless technology that allows compatible smartphones to interact with a TAPSH product by simply bringing the phone close to it. No manual typing or searching is required."
  },
  {
    question: "How does a TAPSH NFC product work?",
    answer: "A TAPSH product contains an NFC chip programmed with a digital destination. A customer simply taps the product with a compatible smartphone, and the relevant TAPSH Hub, review page, WhatsApp, website or other configured destination opens in their browser."
  },
  {
    question: "What if a customer's phone doesn't support NFC?",
    answer: "TAPSH products can combine NFC + QR, so customers can scan the QR code instead. This provides a simple alternative when NFC isn't available or the customer prefers scanning."
  },
  {
    question: "Do customers need to install an app?",
    answer: "No. TAPSH is designed to work through the customer's phone browser. Customers don't need to download a TAPSH app just to access the digital experience."
  },
  {
    question: "What is TAPSH Hub?",
    answer: "TAPSH Hub is a branded mobile digital page connected to a business's physical TAPSH touchpoints. It can bring useful destinations such as reviews, WhatsApp, Instagram, Wi-Fi, directions, websites, booking links and other relevant links together in one simple experience."
  },
  {
    question: "Can every business have a different TAPSH Hub?",
    answer: "Yes. Each Hub can be configured around the individual business. Only the links and modules relevant to that business need to be displayed."
  },
  {
    question: "Can the information in a TAPSH Hub be updated later?",
    answer: "Yes. The Hub uses a permanent digital destination, so its links and information can be updated without replacing the physical TAPSH product when the physical product points to that Hub."
  },
  {
    question: "What can customers access through TAPSH?",
    answer: "Depending on the business setup, customers can access options such as reviews, WhatsApp, Wi-Fi, Instagram, directions, websites, booking links and other custom destinations."
  },
  {
    question: "Does every TAPSH product have to use TAPSH Hub?",
    answer: "No. Depending on the product and setup, a TAPSH NFC/QR touchpoint can open a specific destination directly or connect to a TAPSH Hub containing multiple options."
  },
  {
    question: "Where can TAPSH products be used?",
    answer: "TAPSH can be used across businesses such as resorts, hotels, homestays, restaurants, cafés, salons, spas, clinics, retail stores, offices and other physical customer-facing spaces."
  },
  {
    question: "Can TAPSH products be customized for a business?",
    answer: "Yes. Physical TAPSH products can be customized according to the selected product and business requirements, including appropriate branding and the digital destination connected to the product."
  },
  {
    question: "Can I change a link later without replacing the NFC product?",
    answer: "When the physical product is connected to a permanent TAPSH Hub URL, the destination links inside the Hub can be updated while the NFC/QR touchpoint continues using the same Hub address."
  },
  {
    question: "How do I get started with TAPSH?",
    answer: "Contact TAPSH with your business requirements. We can help determine the appropriate physical touchpoints, digital destinations and TAPSH Hub configuration for your business."
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-tapsh-bg-warm relative">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm font-bold tracking-widest text-tapsh-charcoal uppercase mb-2 block">
            Need to know more?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-tapsh-black">
            Questions? We Have Answers.
          </h2>
          <p className="text-lg text-tapsh-taupe font-medium max-w-2xl mx-auto">
            Everything you need to know about TAPSH, NFC, QR and the TAPSH Hub.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'border-tapsh-taupe/30 shadow-md' : 'border-tapsh-charcoal/10 shadow-sm hover:border-tapsh-charcoal/30'}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <h3 className={`text-lg font-bold pr-8 ${isOpen ? 'text-tapsh-black' : 'text-tapsh-black/80'}`}>
                    {faq.question}
                  </h3>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-tapsh-pale-blue text-tapsh-black' : 'bg-tapsh-bg-warm text-tapsh-charcoal'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-tapsh-charcoal leading-relaxed text-[15px] sm:text-base border-t border-tapsh-charcoal/10 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
