"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, ChevronRight, Star, Wifi, MessageCircle, 
  Camera, Globe, LayoutGrid, Sparkles, Image as ImageIcon 
} from "lucide-react";

interface ProductSlideshowProps {
  images?: string[];
  name: string;
  iconType?: string;
  className?: string;
  autoPlayInterval?: number;
}

export default function ProductSlideshow({
  images = [],
  name,
  iconType = "sparkles",
  className = "",
  autoPlayInterval = 3500,
}: ProductSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validImages = images.filter((img) => Boolean(img && img.trim() !== ""));
  const hasMultiple = validImages.length > 1;

  // Auto-play slideshow when not hovered
  useEffect(() => {
    if (!hasMultiple || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasMultiple, isHovered, validImages.length, autoPlayInterval]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  // Helper to render icon fallback when no image is uploaded
  const renderFallbackIcon = () => {
    switch (iconType) {
      case "star":
        return <Star className="w-12 h-12 text-tapsh-soft-green" />;
      case "wifi":
        return <Wifi className="w-12 h-12 text-tapsh-soft-green" />;
      case "message":
        return <MessageCircle className="w-12 h-12 text-tapsh-soft-green" />;
      case "camera":
        return <Camera className="w-12 h-12 text-tapsh-soft-green" />;
      case "globe":
        return <Globe className="w-12 h-12 text-tapsh-soft-green" />;
      case "grid":
        return <LayoutGrid className="w-12 h-12 text-tapsh-soft-green" />;
      default:
        return <Sparkles className="w-12 h-12 text-tapsh-soft-green" />;
    }
  };

  return (
    <div
      className={`relative w-full h-56 sm:h-64 bg-gradient-to-br from-tapsh-pale-blue via-white to-tapsh-pale-blue/60 flex items-center justify-center overflow-hidden border-b border-tapsh-charcoal/20 select-none group/slideshow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CASE 1: MULTIPLE IMAGES SLIDESHOW */}
      {hasMultiple ? (
        <>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {validImages.map((src, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-700 ease-in-out ${
                  index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={src}
                  alt={`${name} photo ${index + 1}`}
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-2xl transform transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Navigation Chevron Buttons */}
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-tapsh-black/70 hover:bg-tapsh-black text-white flex items-center justify-center transition-all opacity-0 group-hover/slideshow:opacity-100 shadow-md backdrop-blur-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-tapsh-black/70 hover:bg-tapsh-black text-white flex items-center justify-center transition-all opacity-0 group-hover/slideshow:opacity-100 shadow-md backdrop-blur-xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slideshow Indicator Dots */}
          <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5">
            {validImages.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentIndex(dotIndex);
                }}
                className={`rounded-full transition-all cursor-pointer ${
                  dotIndex === currentIndex
                    ? "w-4 h-1.5 bg-tapsh-soft-green"
                    : "w-1.5 h-1.5 bg-tapsh-charcoal/40 hover:bg-tapsh-charcoal"
                }`}
                aria-label={`Jump to slide ${dotIndex + 1}`}
              />
            ))}
          </div>

          {/* Slideshow Counter Badge */}
          <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-tapsh-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
            {currentIndex + 1} / {validImages.length}
          </div>
        </>
      ) : validImages.length === 1 ? (
        /* CASE 2: SINGLE IMAGE */
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={validImages[0]}
            alt={name}
            className="max-h-full max-w-full object-contain drop-shadow-md rounded-2xl transform transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : (
        /* CASE 3: NO CUSTOM IMAGES (FALLBACK EMBLEM) */
        <>
          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl border border-tapsh-charcoal/15 flex items-center justify-center relative z-10 group-hover/slideshow:scale-110 transition-transform duration-500">
            {renderFallbackIcon()}
          </div>
          <div className="absolute inset-0 bg-tapsh-soft-green/10 rounded-full blur-2xl pointer-events-none scale-150"></div>
        </>
      )}
    </div>
  );
}
