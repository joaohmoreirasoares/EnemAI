import React, { useRef, useEffect, useState } from 'react';

interface CircularGalleryProps {
  items: {
    text: string;
  }[];
  bend?: number;
  textColor?: string;
  font?: string;
}

const CircularGallery = ({
  items,
  bend = 200,
  textColor = '#ffffff',
  font = 'bold 16px Figtree'
}: CircularGalleryProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  
  useEffect(() => {
    const animate = () => {
      setAngle(prev => (prev + 0.3) % 360);
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] flex items-center justify-center"
    >
      {items.map((item, index) => {
        const total = items.length;
        const itemAngle = (index * (360 / total) + angle) % 360;
        const radians = (itemAngle * Math.PI) / 180;
        const radius = bend;
        
        const style = {
          transform: `translate(
            ${radius * Math.cos(radians)}px,
            ${radius * Math.sin(radians)}px
          )`,
          color: textColor,
          font: font,
          opacity: 1 - Math.abs(radians % (Math.PI * 2) - Math.PI) * 0.3
        };

        return (
          <div
            key={index}
            className="absolute bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl max-w-[300px] transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg border border-gray-700"
            style={style}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white">👤</span>
              </div>
              <div>
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
            </div>
            <p className="text-gray-300 italic mb-4">"{item.text}"</p>
            <div className="text-right text-sm text-gray-400">
              - Usuário {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CircularGallery;