// Heat map visualization component for click and interaction tracking

import React, { useEffect, useState, useRef } from 'react';
import { getAnalytics } from '../../services/analyticsEngine';
import './HeatMap.css';

export interface HeatMapPoint {
  x: number;
  y: number;
  intensity: number;
  element?: string;
  timestamp: number;
}

export interface HeatMapProps {
  enabled?: boolean;
  displayMode?: 'overlay' | 'standalone';
  radius?: number;
  opacity?: number;
  colorScheme?: 'hot' | 'cool' | 'rainbow';
  minIntensity?: number;
  maxIntensity?: number;
}

/**
 * Heat Map Component
 */
export const HeatMap: React.FC<HeatMapProps> = ({
  enabled = false,
  displayMode = 'overlay',
  radius = 30,
  opacity = 0.6,
  colorScheme = 'hot',
  minIntensity = 1,
  maxIntensity = 10,
}) => {
  const [points, setPoints] = useState<HeatMapPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  /**
   * Load heat map data from localStorage
   */
  useEffect(() => {
    if (!enabled) return;

    const loadHeatMapData = () => {
      try {
        const stored = localStorage.getItem('hummbl_heatmap_data');
        if (stored) {
          const data = JSON.parse(stored);
          setPoints(data);
        }
      } catch (error) {
        console.warn('Failed to load heat map data:', error);
      }
    };

    loadHeatMapData();
  }, [enabled]);

  /**
   * Track clicks and update heat map
   */
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const point: HeatMapPoint = {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
        intensity: 1,
        element: (event.target as HTMLElement)?.tagName.toLowerCase(),
        timestamp: Date.now(),
      };

      setPoints((prev) => {
        // Check for nearby points to merge
        const nearby = prev.find(
          (p) => Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < radius
        );

        let updated: HeatMapPoint[];
        if (nearby) {
          // Merge with nearby point
          updated = prev.map((p) =>
            p === nearby ? { ...p, intensity: Math.min(p.intensity + 1, maxIntensity) } : p
          );
        } else {
          // Add new point
          updated = [...prev, point];
        }

        // Limit to last 500 points
        if (updated.length > 500) {
          updated = updated.slice(-500);
        }

        // Persist to localStorage
        try {
          localStorage.setItem('hummbl_heatmap_data', JSON.stringify(updated));
        } catch (error) {
          console.warn('Failed to persist heat map data:', error);
        }

        return updated;
      });

      // Track with analytics
      const analytics = getAnalytics();
      analytics.trackClick((event.target as HTMLElement)?.id || 'unknown', {
        x: point.x,
        y: point.y,
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled, radius, maxIntensity]);

  /**
   * Update canvas dimensions
   */
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  /**
   * Render heat map on canvas
   */
  useEffect(() => {
    if (!enabled || !canvasRef.current || points.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heat map points
    points.forEach((point) => {
      const normalizedIntensity = (point.intensity - minIntensity) / (maxIntensity - minIntensity);
      const alpha = Math.max(0, Math.min(1, normalizedIntensity)) * opacity;

      // Create radial gradient
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);

      const color = getColorForIntensity(normalizedIntensity, colorScheme);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });
  }, [enabled, points, dimensions, radius, opacity, colorScheme, minIntensity, maxIntensity]);

  /**
   * Clear heat map
   */
  const clearHeatMap = () => {
    setPoints([]);
    localStorage.removeItem('hummbl_heatmap_data');
  };

  /**
   * Export heat map data
   */
  const exportData = () => {
    const dataStr = JSON.stringify(points, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `heatmap-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!enabled) return null;

  return (
    <div className={`heatmap-container ${displayMode}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="heatmap-canvas"
        aria-hidden="true"
      />

      <div className="heatmap-controls">
        <button onClick={clearHeatMap} className="heatmap-btn">
          Clear Heat Map
        </button>
        <button onClick={exportData} className="heatmap-btn">
          Export Data
        </button>
        <div className="heatmap-stats">{points.length} interaction points</div>
      </div>
    </div>
  );
};

/**
 * Get color for intensity value based on color scheme
 */
function getColorForIntensity(
  intensity: number,
  scheme: 'hot' | 'cool' | 'rainbow'
): { r: number; g: number; b: number } {
  const clamped = Math.max(0, Math.min(1, intensity));

  switch (scheme) {
    case 'hot':
      // Blue -> Green -> Yellow -> Red
      if (clamped < 0.25) {
        return { r: 0, g: Math.floor(clamped * 4 * 255), b: 255 };
      } else if (clamped < 0.5) {
        return { r: 0, g: 255, b: Math.floor((0.5 - clamped) * 4 * 255) };
      } else if (clamped < 0.75) {
        return { r: Math.floor((clamped - 0.5) * 4 * 255), g: 255, b: 0 };
      } else {
        return { r: 255, g: Math.floor((1 - clamped) * 4 * 255), b: 0 };
      }

    case 'cool':
      // Blue -> Cyan -> White
      return {
        r: Math.floor(clamped * 255),
        g: Math.floor(clamped * 255),
        b: 255,
      };

    case 'rainbow':
      // Full rainbow spectrum
      const hue = clamped * 360;
      return hslToRgb(hue, 100, 50);

    default:
      return { r: 255, g: 0, b: 0 };
  }
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Hook for programmatic heat map access
 */
export function useHeatMap() {
  const [points, setPoints] = useState<HeatMapPoint[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem('hummbl_heatmap_data');
        if (stored) {
          setPoints(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to load heat map data:', error);
      }
    };

    loadData();
  }, []);

  const getHotspots = (threshold: number = 5): HeatMapPoint[] => {
    return points.filter((p) => p.intensity >= threshold);
  };

  const getAverageIntensity = (): number => {
    if (points.length === 0) return 0;
    return points.reduce((sum, p) => sum + p.intensity, 0) / points.length;
  };

  const getIntensityByArea = (x: number, y: number, width: number, height: number): number => {
    const areaPoints = points.filter(
      (p) => p.x >= x && p.x <= x + width && p.y >= y && p.y <= y + height
    );
    return areaPoints.reduce((sum, p) => sum + p.intensity, 0);
  };

  return {
    points,
    getHotspots,
    getAverageIntensity,
    getIntensityByArea,
  };
}
