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
    
    // Reset all cards
    cards.forEach((card, index) => {
      (card as HTMLElement).style.transform = `translateY(${index * 20}px) scale(${1 - index * 0.05})`;
      (card as HTMLElement).style.opacity = `${1 - index * 0.2}`;
      (card as HTMLElement).style.zIndex = `${cards.length - index}`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target as HTMLElement;
          const index = Array.from(cards).indexOf(card);
          
          if (entry.isIntersecting) {
            // Animate to stacked position
            card.style.transform = `translateY(${index * 20}px) scale(${1 - index * 0.05})`;
            card.style.opacity = `${1 - index * 0.2}`;
          } else {
            // Reset to normal position when out of view
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