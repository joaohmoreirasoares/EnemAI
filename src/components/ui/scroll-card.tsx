"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ScrollCardProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollCard = ({ children, className }: ScrollCardProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('scroll-container');
    if (!container) return;

    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('left')}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleScroll('right')}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        id="scroll-container"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollCard;