import React, { useRef, useEffect } from 'react';

// Definir a interface de props
interface CircularGalleryProps {
  items: {
    image: string;
    text: string;
  }[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

const CircularGallery = ({
  items,
  bend = 3,
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05
}: CircularGalleryProps): JSX.Element => { // Adicionar tipo de retorno JSX.Element
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Lógica de inicialização aqui
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default CircularGallery;