"use client";

import React from 'react';

interface ScrollCardProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollCard = ({ children, className = "" }: ScrollCardProps) => {
  return (
    <div className={`flex justify-between px-16 ${className}`}>
      <div className="grid gap-2">
        {children}
      </div>
    </div>
  );
};

export default ScrollCard;