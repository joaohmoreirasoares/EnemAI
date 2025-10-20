"use client";

import React from 'react';

interface ScrollCardProps {
  children: React.ReactNode;
}

const ScrollCard: React.FC<ScrollCardProps> = ({ children }) => {
  return (
    <div className="flex justify-between px-16 opacity-0">
      <div className="grid gap-2">
        {articleCardsData.map((card, i) => (
          <figure key={i} className="sticky top-0 h-screen grid place-content-center">
            {/* ... rest of the component */}
          </figure>
        ))}
      </div>
      {/* ... rest of the component */}
    </div>
  );
};

export default ScrollCard;