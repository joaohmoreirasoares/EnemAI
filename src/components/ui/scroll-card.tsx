"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ScrollCardProps {
  children: ReactNode;
  className?: string;
}

const ScrollCard = ({ children, className }: ScrollCardProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
    </div>
  );
};

export default ScrollCard;