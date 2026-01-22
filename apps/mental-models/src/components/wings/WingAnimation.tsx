import React, { useState, useEffect } from 'react';
import { Wing, Transformation } from './Wing';
import '../styles/wings.css';
import '../styles/animations.css';

export interface WingAnimationProps {
  sequence: Transformation[];
  interval?: number;
  loop?: boolean;
  autoStart?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onSequenceComplete?: () => void;
  className?: string;
}

export const WingAnimation: React.FC<WingAnimationProps> = ({
  sequence,
  interval = 1000,
  loop = true,
  autoStart = true,
  size = 'large',
  onSequenceComplete,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % sequence.length;
        
        if (nextIndex === 0 && !loop) {
          setIsPlaying(false);
          if (onSequenceComplete) {
            onSequenceComplete();
          }
        }
        
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, sequence.length, loop, onSequenceComplete]);

  const currentTransformation = sequence[currentIndex];

  return (
    <div className={`wing-animation ${className}`}>
      <Wing
        transformation={currentTransformation}
        size={size}
        animate="pulse"
      />
      <div className="wing-animation-controls">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="wing-animation-button"
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="wing-animation-indicator">
          {currentIndex + 1} / {sequence.length}
        </div>
      </div>
    </div>
  );
};

export default WingAnimation;
