"use client";

import { motion, type Variants } from "framer-motion";
import { Smartphone, Wifi, Star, MessageCircle, Globe, Camera } from "lucide-react";
import Image from "next/image";
import { useSiteAssets } from "@/context/SiteAssetsContext";

export default function HowItWorksAnimation() {
  const { getAsset } = useSiteAssets();
  const logoIcon = getAsset("logo_icon", "/images/logo-icon.png");

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.6,
        delayChildren: 0.2
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const }
    }
  };

  const pulse: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { 
      scale: 1.5, 
      opacity: 0,
      transition: { 
        duration: 2, 
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-tapsh-gray/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-tapsh-black"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-tapsh-taupe font-medium"
          >
            One tap. One simple digital experience.
          </motion.p>
        </div>

        {/* Animated Journey */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-4 relative"
        >
          {/* Connecting Lines (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-tapsh-gray/40 to-transparent z-0"></div>

          {/* STEP 1: NFC Product */}
          <motion.div variants={item} className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
              {/* Pulsing signal background */}
              <motion.div variants={pulse} className="absolute inset-0 bg-tapsh-soft-green/20 rounded-full"></motion.div>
              <div className="w-32 h-20 bg-tapsh-black rounded-xl shadow-xl border border-tapsh-charcoal flex items-center justify-center relative z-10 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                <span className="text-tapsh-beige font-bold tracking-widest text-xs">TAPSH</span>
                <Wifi className="w-4 h-4 text-tapsh-beige absolute right-3 top-3 rotate-90" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-tapsh-black mb-2">NFC Product</h3>
            <p className="text-tapsh-charcoal font-medium">Physical Touchpoint</p>
          </motion.div>

          {/* Connection Arrow (Mobile) */}
          <motion.div variants={item} className="lg:hidden text-tapsh-gray/40">
            <div className="h-10 w-0.5 bg-tapsh-gray/40 mx-auto"></div>
          </motion.div>

          {/* STEP 2: Phone */}
          <motion.div variants={item} className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
              <div className="w-24 h-48 bg-white rounded-[2rem] shadow-lg border-4 border-tapsh-charcoal/20 flex flex-col relative overflow-hidden z-10">
                <div className="w-10 h-1 bg-tapsh-charcoal/20 rounded-full mx-auto mt-2 absolute top-0 left-1/2 -translate-x-1/2 z-20"></div>
                {/* Phone screen animation */}
                <motion.div 
                  initial={{ top: "100%" }}
                  whileInView={{ top: "0%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0 bg-tapsh-pale-blue h-full flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.6, type: "spring" }}
                    className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center p-2.5"
                  >
                    <img src={logoIcon} alt="Icon" className="w-6 h-6 object-contain opacity-80" />
                  </motion.div>

                </motion.div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-tapsh-black mb-2">Guest's Phone</h3>
            <p className="text-tapsh-charcoal font-medium">Tap or Scan</p>
          </motion.div>

          {/* Connection Arrow (Mobile) */}
          <motion.div variants={item} className="lg:hidden text-tapsh-gray/40">
            <div className="h-10 w-0.5 bg-tapsh-gray/40 mx-auto"></div>
          </motion.div>

          {/* STEP 3: TAPSH Hub */}
          <motion.div variants={item} className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
              <div className="w-32 h-48 bg-[#FAF8F5] rounded-2xl shadow-xl border border-tapsh-charcoal/10 flex flex-col p-3 z-10">
                {/* Mini Hub UI */}
                <div className="w-8 h-8 bg-white rounded-full shadow-sm mx-auto mb-3"></div>
                <div className="w-16 h-2 bg-tapsh-charcoal/20 rounded-full mx-auto mb-4"></div>
                
                <div className="space-y-2">
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 2.0, duration: 0.5 }}
                    className="w-full h-6 bg-tapsh-taupe rounded-md flex items-center px-2 origin-left"
                  >
                    <div className="w-2 h-2 bg-tapsh-beige rounded-full"></div>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.2 }} className="h-8 bg-white rounded-md border border-tapsh-charcoal/10 flex items-center justify-center"><MessageCircle className="w-3 h-3 text-tapsh-taupe" /></motion.div>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.3 }} className="h-8 bg-white rounded-md border border-tapsh-charcoal/10 flex items-center justify-center"><Camera className="w-3 h-3 text-tapsh-taupe" /></motion.div>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.4 }} className="h-8 bg-white rounded-md border border-tapsh-charcoal/10 flex items-center justify-center"><Globe className="w-3 h-3 text-tapsh-taupe" /></motion.div>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.5 }} className="h-8 bg-white rounded-md border border-tapsh-charcoal/10 flex items-center justify-center"><Wifi className="w-3 h-3 text-tapsh-taupe" /></motion.div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-tapsh-black mb-2">TAPSH Hub</h3>
            <p className="text-tapsh-charcoal font-medium">One Digital Experience</p>
          </motion.div>

          {/* Connection Arrow (Mobile) */}
          <motion.div variants={item} className="lg:hidden text-tapsh-gray/40">
            <div className="h-10 w-0.5 bg-tapsh-gray/40 mx-auto"></div>
          </motion.div>

          {/* STEP 4: Digital Destination */}
          <motion.div variants={item} className="flex flex-col items-center text-center relative z-10 flex-1">
            <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
              {/* Highlight one action expanding */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 3.0, duration: 0.6, type: "spring" }}
                className="w-32 h-32 bg-white rounded-[2rem] shadow-xl border border-tapsh-charcoal/10 flex items-center justify-center flex-col gap-3 relative z-20"
              >
                <div className="w-12 h-12 bg-tapsh-bg-warm rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-tapsh-taupe fill-tapsh-taupe" />
                </div>
                <span className="text-xs font-bold text-tapsh-black">Google Review</span>
              </motion.div>
              
              {/* Floating elements behind */}
              <motion.div 
                initial={{ x: 0, y: 0, opacity: 0 }}
                whileInView={{ x: -35, y: 30, opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ delay: 3.2, duration: 0.8 }}
                className="absolute w-10 h-10 bg-white rounded-xl shadow-md border border-tapsh-charcoal/10 flex items-center justify-center z-10"
              >
                <MessageCircle className="w-4 h-4 text-tapsh-soft-green" />
              </motion.div>
              
              <motion.div 
                initial={{ x: 0, y: 0, opacity: 0 }}
                whileInView={{ x: 35, y: -20, opacity: 0.5 }}
                viewport={{ once: true }}
                transition={{ delay: 3.3, duration: 0.8 }}
                className="absolute w-10 h-10 bg-white rounded-xl shadow-md border border-tapsh-charcoal/10 flex items-center justify-center z-10"
              >
                <Wifi className="w-4 h-4 text-tapsh-pale-blue" />
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-tapsh-black mb-2">Digital Destination</h3>
            <p className="text-tapsh-charcoal font-medium text-sm px-4">Review • WhatsApp • Wi-Fi • Instagram • Website & More</p>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
