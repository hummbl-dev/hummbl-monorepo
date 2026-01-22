import React, { useState } from 'react';
import { Wing, Transformation } from './Wing';
import '../../styles/wings.css';

export interface WingSelectorProps {
  transformations?: Transformation[];
  defaultSelected?: Transformation;
  onSelect?: (transformation: Transformation) => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showLabels?: boolean;
  multiSelect?: boolean;
  className?: string;
}

const DEFAULT_TRANSFORMATIONS: Transformation[] = ['P', 'IN', 'CO', 'DE', 'RE', 'SY'];

export const WingSelector: React.FC<WingSelectorProps> = ({
  transformations = DEFAULT_TRANSFORMATIONS,
  defaultSelected,
  onSelect,
  size = 'medium',
  showLabels = true,
  multiSelect = false,
  className = '',
}) => {
  const [selected, setSelected] = useState<Transformation[]>(
    defaultSelected ? [defaultSelected] : []
  );

  const handleWingClick = (transformation: Transformation) => {
    if (multiSelect) {
      setSelected((prev) => {
        const newSelected = prev.includes(transformation)
          ? prev.filter((t) => t !== transformation)
          : [...prev, transformation];
        
        if (onSelect && newSelected.length > 0) {
          onSelect(newSelected[newSelected.length - 1]);
        }
        
        return newSelected;
      });
    } else {
      setSelected([transformation]);
      if (onSelect) {
        onSelect(transformation);
      }
    }
  };

  return (
    <div className={`wing-selector ${className}`} role="radiogroup">
      {transformations.map((transformation) => {
        const isSelected = selected.includes(transformation);
        return (
          <div
            key={transformation}
            className={`wing-selector-item ${isSelected ? 'wing-selector-item-selected' : ''}`}
            role="radio"
            aria-checked={isSelected}
          >
            <Wing
              transformation={transformation}
              size={size}
              animate="hover"
              onClick={() => handleWingClick(transformation)}
            />
            {showLabels && (
              <div className="wing-selector-label">
                {transformation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WingSelector;
