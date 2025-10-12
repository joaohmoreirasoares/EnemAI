import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardStackProps {
  items: {
    id: number;
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  className?: string;
  onCardClick?: (id: number) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ items, className, onCardClick }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Main container with new background color */}
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative w-full h-full p-8">
          <AnimatePresence mode="wait">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className={cn(
                  "absolute inset-0 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 cursor-pointer",
                  index === activeIndex && "z-10",
                  index < activeIndex && "opacity-0 scale-95",
                  index > activeIndex && "opacity-0 scale-105"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  scale: index === activeIndex ? 1 : 0.95,
                  y: index === activeIndex ? 0 : (index - activeIndex) * 20
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => handleCardClick(index)}
              >
                <div className="h-full flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-300 mb-6 flex-1">{item.description}</p>
                  {item.content && (
                    <div className="mt-auto">
                      {item.content}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-700/50 transition-colors"
            disabled={isAnimating}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-700/50 transition-colors"
            disabled={isAnimating}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};