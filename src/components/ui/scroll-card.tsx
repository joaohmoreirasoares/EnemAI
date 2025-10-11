import React, { useEffect, useRef } from 'react';
import CircularGallery from '@/components/CircularGallery';

interface ScrollCardProps {
  items?: { image: string; text: string }[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

export default function ScrollCard({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05
}: ScrollCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ensure items array exists and has content
    const safeItems = items || [
      {
        image: `https://picsum.photos/seed/1/800/600?grayscale`,
        text: 'Bridge'
      },
      {
        image: `https://picsum.photos/seed/2/800/600?grayscale`,
        text: 'Desk Setup'
      },
      {
        image: `https://picsum.photos/seed/3/800/600?grayscale`,
        text: 'Waterfall'
      },
      {
        image: `https://picsum.photos/seed/4/800/600?grayscale`,
        text: 'Strawberries'
      },
      {
        image: `https://picsum.photos/seed/5/800/600?grayscale`,
        text: 'Deep Diving'
      },
      {
        image: `https://picsum.photos/seed/16/800/600?grayscale`,
        text: 'Train Track'
      },
      {
        image: `https://picsum.photos/seed/17/800/600?grayscale`,
        text: 'Santorini'
      },
      {
        image: `https://picsum.photos/seed/8/800/600?grayscale`,
        text: 'Blurry Lights'
      },
      {
        image: `https://picsum.photos/seed/9/800/600?grayscale`,
        text: 'New York'
      },
      {
        image: `https://picsum.photos/seed/10/800/600?grayscale`,
        text: 'Good Boy'
      },
      {
        image: `https://picsum.photos/seed/21/800/600?grayscale`,
        text: 'Coastline'
      },
      {
        image: `https://picsum.photos/seed/12/800/600?grayscale`,
        text: 'Palm Trees'
      }
    ];

    const app = new (window as any).App(containerRef.current, {
      items: safeItems,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase
    });

    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return (
    <div className="w-full h-96 overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef}>
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
}