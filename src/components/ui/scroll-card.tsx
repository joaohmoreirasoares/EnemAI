import React, { useEffect, useRef } from 'react';
import CircularGallery from '../CircularGallery';

interface ScrollCardProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

const ScrollCard: React.FC<ScrollCardProps> = ({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        containerRef.current.style.height = `${width * 0.6}px`;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full" ref={containerRef}>
      <CircularGallery
        items={items}
        bend={bend}
        textColor={textColor}
        borderRadius={borderRadius}
        font={font}
        scrollSpeed={scrollSpeed}
        scrollEase={scrollEase}
      />
    </div>
  );
};

export default ScrollCard;