import React, { ReactNode, useEffect, useRef } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card w-full my-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 transition-all duration-700 ease-out ${itemClassName}`.trim()}>
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  className = '',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.scroll-stack-card');
    
    // Initialize all cards with stacked positions (this is the default state)
    cards.forEach((card, index) => {
      // Only apply transformations to cards after the first one
      if (index > 0) {
        const translateY = index * 20;  // Each card moves down 20px
        const scale = 1 - (index * 0.05);  // Each card scales down by 5%
        const opacity = 1 - (index * 0.2);  // Each card becomes more transparent
        
        (card as HTMLElement).style.transform = `translateY(${translateY}px) scale(${scale})`;
        (card as HTMLElement).style.opacity = `${opacity}`;
      } else {
        // First card stays in normal position
        (card as HTMLElement).style.transform = 'translateY(0) scale(1)';
        (card as HTMLElement).style.opacity = '1';
      }
      (card as HTMLElement).style.zIndex = `${cards.length - index}`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          const index = Array.from(cards).indexOf(card);
          
          if (entry.isIntersecting) {
            // When card is in viewport, apply stacked position
            if (index > 0) {
              const translateY = index * 20;
              const scale = 1 - (index * 0.05);
              const opacity = 1 - (index * 0.2);
              
              card.style.transform = `translateY(${translateY}px) scale(${scale})`;
              card.style.opacity = `${opacity}`;
            } else {
              // First card stays normal
              card.style.transform = 'translateY(0) scale(1)';
              card.style.opacity = '1';
            }
          } else {
            // When card is out of viewport, reset to normal position
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      <div className="py-16">
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;