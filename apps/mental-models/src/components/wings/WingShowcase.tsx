import React from 'react';
import { WingGrid } from './WingGrid';
import { Transformation } from './Wing';
import '../styles/wings.css';

export interface WingShowcaseProps {
  title?: string;
  subtitle?: string;
  showAllTransformations?: boolean;
  customTransformations?: Transformation[];
  columns?: 2 | 3 | 4 | 6;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  animate?: boolean | 'hover' | 'pulse' | 'float';
  showLabels?: boolean;
  darkMode?: boolean;
  className?: string;
}

const TRANSFORMATION_DESCRIPTIONS: Record<Transformation, string> = {
  P: 'Perceive - Foundation of understanding and observation',
  IN: 'Internalize - Deep reflection and personal integration',
  CO: 'Connect - Building bridges and relationships',
  DE: 'Deconstruct - Analysis and breaking down complexity',
  RE: 'Reconstruct - Building and synthesis',
  SY: 'Synthesize - Complete integration and wholeness',
};

export const WingShowcase: React.FC<WingShowcaseProps> = ({
  title = 'HUMMBL Transformations',
  subtitle,
  showAllTransformations = true,
  customTransformations,
  columns = 3,
  size = 'large',
  animate = 'hover',
  showLabels = true,
  darkMode = false,
  className = '',
}) => {
  const transformations = customTransformations || 
    (showAllTransformations ? (['P', 'IN', 'CO', 'DE', 'RE', 'SY'] as Transformation[]) : []);

  return (
    <div className={`wing-showcase ${darkMode ? 'wing-showcase-dark' : ''} ${className}`}>
      <div className="wing-showcase-header">
        <h2 className="wing-showcase-title">{title}</h2>
        {subtitle && <p className="wing-showcase-subtitle">{subtitle}</p>}
      </div>
      
      <WingGrid
        transformations={transformations}
        columns={columns}
        size={size}
        animate={animate}
        showLabels={showLabels}
      />
      
      {showLabels && (
        <div className="wing-showcase-descriptions">
          {transformations.map((transformation) => (
            <div key={transformation} className="wing-showcase-description">
              <strong>{transformation}:</strong> {TRANSFORMATION_DESCRIPTIONS[transformation]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WingShowcase;
