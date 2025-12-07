import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  width: number;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ width, className = '', children }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${width}%`;
    }
  }, [width]);

  return (
    <div ref={barRef} className={className}>
      {children}
    </div>
  );
};
