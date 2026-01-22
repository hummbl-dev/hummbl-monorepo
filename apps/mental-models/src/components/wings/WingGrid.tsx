import React from 'react';
import { Wing, Transformation } from './Wing';
import '../../styles/wings.css';

export interface WingGridProps {
  transformations: Transformation[];
  columns?: 2 | 3 | 4 | 6;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animate?: boolean | 'hover' | 'pulse' | 'float';
  showLabels?: boolean;
  onWingClick?: (transformation: Transformation) => void;
  className?: string;
}

export const WingGrid: React.FC<WingGridProps> = ({
  transformations,
  columns = 3,
  size = 'medium',
  animate = false,
  showLabels = true,
  onWingClick,
  className = '',
}) => {
  const gridClass = `wing-grid wing-grid-cols-${columns}`;

  return (
    <div className={`${gridClass} ${className}`} role="list">
      {transformations.map((transformation) => (
        <div key={transformation} className="wing-grid-item" role="listitem">
          <Wing
            transformation={transformation}
            size={size}
            animate={animate}
            onClick={onWingClick ? () => onWingClick(transformation) : undefined}
          />
          {showLabels && (
            <div className="wing-grid-label">
              {transformation}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WingGrid;
