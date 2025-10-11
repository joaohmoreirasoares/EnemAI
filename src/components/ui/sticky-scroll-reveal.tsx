"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface StickyScrollRevealProps {
  content: {
    title: string;
    description: string;
    content: React.ReactNode;
  }[];
  className?: string;
}

export const StickyScrollReveal: React.FC<StickyScrollRevealProps> = ({
  content,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Setup Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = contentRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    contentRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToContent = useCallback((index: number) => {
    if (contentRefs.current[index]) {
      contentRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Navigation dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
        {content.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToContent(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === activeIndex
                ? "bg-purple-600 scale-125"
                : "bg-gray-600 hover:bg-gray-500"
            )}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      {/* Content sections */}
      <div className="space-y-20">
        {content.map((section, index) => (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className={cn(
              "min-h-screen flex items-center justify-center p-8",
              index % 2 === 0 ? "flex-row" : "flex-row-reverse"
            )}
          >
            <div className="flex-1 max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">{section.title}</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                {section.description}
              </p>
            </div>
            <div className="flex-1 max-w-2xl">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};