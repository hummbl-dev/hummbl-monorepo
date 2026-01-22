import React from 'react';
import '../../styles/wings.css';

export type Transformation = 'P' | 'IN' | 'CO' | 'DE' | 'RE' | 'SY';

export interface WingProps {
  transformation: Transformation;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animate?: boolean | 'hover' | 'pulse' | 'float';
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

const wingPaths: Record<Transformation, string> = {
  P: '/assets/wings/wing-p.svg',
  IN: '/assets/wings/wing-in.svg',
  CO: '/assets/wings/wing-co.svg',
  DE: '/assets/wings/wing-de.svg',
  RE: '/assets/wings/wing-re.svg',
  SY: '/assets/wings/wing-sy.svg',
};

const wingLabels: Record<Transformation, string> = {
  P: 'Perceive',
  IN: 'Internalize',
  CO: 'Connect',
  DE: 'Deconstruct',
  RE: 'Reconstruct',
  SY: 'Synthesize',
};

export const Wing: React.FC<WingProps> = ({
  transformation,
  size = 'medium',
  animate = false,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}) => {
  const animationClass = 
    animate === true ? 'wing-animate-hover' :
    animate === 'hover' ? 'wing-animate-hover' :
    animate === 'pulse' ? 'wing-animate-pulse' :
    animate === 'float' ? 'wing-animate-float' :
    '';

  const sizeClass = `wing-size-${size}`;
  
  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`wing-container ${sizeClass} ${animationClass} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel || `${wingLabels[transformation]} transformation wing`}
      data-transformation={transformation}
    >
      <img
        src={wingPaths[transformation]}
        alt={`${wingLabels[transformation]} wing`}
        className="wing-image"
      />
      <span className="wing-label" aria-hidden="true">
        {transformation}
      </span>
    </div>
  );
};

export default Wing;
