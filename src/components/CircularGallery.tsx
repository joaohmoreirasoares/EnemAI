import React, { useRef, useEffect, useState } from 'react';

interface CircularGalleryProps {
  items: {
    text: string;
  }[];
  radius?: number;
  rotationSpeed?: number;
}

const CircularGallery = ({ 
  items,
  radius = 200,
  rotationSpeed = 0.5
}: CircularGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const animate = () => {
      setAngle(prev => (prev + rotationSpeed) % 360);
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [rotationSpeed]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-96 flex items-center justify-center"
    >
      {items.map((item, index) => {
        const itemAngle = (index * (360 / items.length) + angle) % 360;
        const radians = (itemAngle * Math.PI) / 180;
        
        return (
          <div
            key={index}
            className="absolute bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-gray-700 transition-all duration-300"
            style={{
              transform: `translate(
                ${radius * Math.cos(radians)}px,
                ${radius * Math.sin(radians)}px
              )`,
              width: '300px'
            }}
          >
            <div className="flex items-start mb-4">
              <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <span className="text-white">👤</span>
              </div>
              <div>
                <p className="text-white font-medium">Usuário {index + 1}</p>
                <p className="text-gray-400 text-sm">Estudante ENEM</p>
              </div>
            </div>
            <p className="text-gray-300 italic">"{item.text}"</p>
          </div>
        );
      })}
      
      {/* Elemento central */}
      <div className="absolute z-10 text-center">
        <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⭐</span>
        </div>
        <h3 className="text-xl font-bold text-white">Avaliações</h3>
        <p className="text-gray-400">{items.length}+ estudantes satisfeitos</p>
      </div>
    </div>
  );
};

export default CircularGallery;