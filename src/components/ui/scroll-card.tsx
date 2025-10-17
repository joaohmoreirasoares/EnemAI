import React from 'react';

interface ScrollCardProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollCard: React.FC<ScrollCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export default ScrollCard;