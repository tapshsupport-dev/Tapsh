"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import ProductSlideshow from "@/components/products/ProductSlideshow";
import { ProductItem, subscribeToProducts, DEFAULT_PRODUCTS } from "@/lib/productsService";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((items) => {
      // Show only active products on the public catalog
      const activeOnly = items.filter((p) => p.status === "ACTIVE");
      setProducts(activeOnly);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-tapsh-pale-blue">
      
      {/* Header Banner */}
      <div className="bg-tapsh-black py-14 sm:py-20 text-center">
        <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tapsh-soft-green/20 text-tapsh-soft-green text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Smart NFC & QR Touchpoints
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-tapsh-pale-blue mb-4 sm:mb-6">
            Our Products
          </h1>
          <p className="text-lg sm:text-xl text-tapsh-pale-blue/70 max-w-2xl mx-auto">
            Premium NFC & QR hardware solutions designed to seamlessly bridge your physical space to the digital world.
          </p>
        </FadeIn>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {isLoaded && products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-tapsh-charcoal/15 max-w-lg mx-auto p-8 shadow-xs">
            <Sparkles className="w-8 h-8 text-tapsh-soft-green mx-auto mb-3" />
            <h3 className="text-lg font-bold text-tapsh-black">No Products Currently Listed</h3>
            <p className="text-xs text-tapsh-charcoal mt-1">Our hardware lineup is currently being updated. Please check back soon or contact support for customized hardware inquiries.</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const hasMultipleImages = product.images && product.images.length > 1;
            const waQuoteUrl = `https://wa.me/917977469926?text=${encodeURIComponent(
              `Hello TAPSH, I am interested in getting a quote and details for *${product.name}*.`
            )}`;

            return (
              <StaggerItem 
                key={product.id || product.slug} 
                id={product.slug} 
                className="scroll-mt-32 bg-white rounded-3xl border border-tapsh-charcoal/20 overflow-hidden hover:shadow-2xl hover:border-tapsh-charcoal/50 hover:-translate-y-1 transition-all group flex flex-col shadow-sm"
              >
                
                {/* Product Visual Showcase (Interactive Slideshow for multiple images) */}
                <div className="relative">
                  <ProductSlideshow
                    images={product.images}
                    name={product.name}
                    iconType={product.iconType}
                  />

                  {/* Ribbon Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-3 py-1 rounded-full bg-tapsh-black text-tapsh-pale-blue text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Multi-Image Indicator Pill */}
                  {hasMultipleImages && (
                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-tapsh-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                      Slideshow
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="mb-2">
                    {product.category && (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-tapsh-taupe">
                        {product.category}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-tapsh-black mt-0.5">
                      {product.name}
                    </h2>
                  </div>

                  <p className="text-tapsh-charcoal mb-6 min-h-[3rem] leading-relaxed text-sm sm:text-base">
                    {product.description}
                  </p>
                  
                  {/* Key Benefit Highlight */}
                  {product.benefit && (
                    <div className="bg-tapsh-pale-blue/50 rounded-2xl p-4 mb-8 border border-tapsh-charcoal/20">
                      <p className="text-sm font-medium text-tapsh-black">
                        <span className="block text-xs text-tapsh-soft-green font-bold uppercase tracking-wider mb-1">
                          Key Benefit
                        </span>
                        {product.benefit}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="mt-auto flex flex-col sm:flex-row items-center gap-3">
                    <a 
                      href={waQuoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 px-4 text-center bg-tapsh-soft-green text-white rounded-xl font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Get a Quote
                    </a>
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-full sm:w-auto py-3 px-4 text-center bg-tapsh-pale-blue hover:bg-tapsh-pale-blue/80 text-tapsh-black rounded-xl font-bold border border-tapsh-charcoal/20 transition-colors flex items-center justify-center gap-1.5 text-sm"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
      </div>

    </div>
  );
}
