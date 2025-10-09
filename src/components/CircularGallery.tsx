import React, { useRef, useEffect, useState } from 'react';

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

const CircularGallery = ({
  items,
  bend = 3,
  textColor = '#ffffff',
  font = 'bold 24px Figtree'
}: CircularGalleryProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Configuração básica de posicionamento circular
    const radius = 200; // Raio do círculo
    const totalItems = items.length;
    
    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'absolute flex flex-col items-center';
      itemElement.style.color = textColor;
      itemElement.style.font = font;
      
      // Posicionamento circular
      const itemAngle = (index * (360 / totalItems) + angle) % 360;
      const radians = (itemAngle * Math.PI) / 180;
      
      itemElement.style.transform = `translate(
        ${radius * Math.cos(radians)}px,
        ${radius * Math.sin(radians)}px
      )`;
      
      itemElement.innerHTML = `
        <div class="w-32 h-32 bg-gray-800 rounded-lg mb-2"></div>
        <div class="text-center max-w-[200px]">${item.text}</div>
      `;
      
      container.appendChild(itemElement);
    });

    // Animação básica de rotação
    const animation = requestAnimationFrame(() => {
      setAngle(prev => (prev + 0.5) % 360);
    });

    return () => {
      cancelAnimationFrame(animation);
      container.innerHTML = '';
    };
  }, [angle, items, textColor, font]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center"
    />
  );
};

export default CircularGallery;