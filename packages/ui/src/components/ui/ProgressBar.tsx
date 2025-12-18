import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  width: number;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ width, className, children }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${width}%`;
    }
  }, [width]);

  return (
    <div ref={barRef} className={cn(className)}>
      {children}
    </div>
  );
};
