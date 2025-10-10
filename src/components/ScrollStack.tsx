import React, { ReactNode } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card w-full my-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 ${itemClassName}`.trim()}>
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  className = '',
  children
}) => {
  return (
    <div className={`relative w-full ${className}`.trim()}>
      <div className="py-16">
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;