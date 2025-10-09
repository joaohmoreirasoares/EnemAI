import React, { useRef, useEffect } from 'react';

interface CircularGalleryProps {
  items: {
    image: string;
    text: string;
  }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  textColor?: string;
  font?: string;
}

// Alterar para export default
export default function CircularGallery({
  items,
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
  textColor = '#ffffff',
  font = 'bold 24px Figtree'
}: CircularGalleryProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Lógica de inicialização aqui
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  return <div ref={containerRef} className="w-full h-full" />;
}