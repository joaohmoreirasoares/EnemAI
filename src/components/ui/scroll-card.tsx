"use client";

import React, { useRef, useState, useEffect } from 'react';

const ScrollCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sample data for the cards
  const articleCardsData = [
    {
      id: 1,
      title: "Exploring the Universe",
      description: "Journey through the cosmos and discover amazing celestial bodies.",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Deep Sea Wonders",
      description: "Dive into the mysteries of the ocean and its fascinating creatures.",
      image: "https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Mountain Adventures",
      description: "Experience the thrill of high-altitude expeditions and breathtaking views.",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&auto=format&fit=crop"
    }
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const cardHeight = container.clientHeight;
      const newActiveIndex = Math.floor(scrollPosition / cardHeight);
      
      if (newActiveIndex !== activeIndex && newActiveIndex < articleCardsData.length) {
        setActiveIndex(newActiveIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <div className="relative h-screen overflow-hidden">
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {articleCardsData.map((card, i) => (
          <div 
            key={card.id} 
            className="snap-start h-screen flex items-center justify-center"
          >
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{ 
                backgroundImage: `url(${card.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="relative z-10 text-center text-white px-4 max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-4">{card.title}</h2>
                <p className="text-xl md:text-2xl">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Progress indicators */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        {articleCardsData.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const container = containerRef.current;
              if (container) {
                container.scrollTo({
                  top: i * container.clientHeight,
                  behavior: 'smooth'
                });
              }
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4">
        <button
          onClick={() => {
            const container = containerRef.current;
            if (container && activeIndex > 0) {
              container.scrollTo({
                top: (activeIndex - 1) * container.clientHeight,
                behavior: 'smooth'
              });
            }
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            const container = containerRef.current;
            if (container && activeIndex < articleCardsData.length - 1) {
              container.scrollTo({
                top: (activeIndex + 1) * container.clientHeight,
                behavior: 'smooth'
              });
            }
          }}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ScrollCard;