import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface PositionedElementProps {
  x: number;
  y: number;
  className?: string;
  children: React.ReactNode;
}

export const PositionedElement: React.FC<PositionedElementProps> = ({
  x,
  y,
  className,
  children,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.style.setProperty('--preview-x', `${x}px`);
      elementRef.current.style.setProperty('--preview-y', `${y}px`);
    }
  }, [x, y]);

  return (
    <div ref={elementRef} className={cn(className)}>
      {children}
    </div>
  );
};
