import { useMemo, useCallback, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import type { MentalModel } from '@hummbl/core';

interface RelationshipGraphProps {
  models: MentalModel[];
}

interface GraphNode {
  id: string;
  name: string;
  group: string;
  val: number;
  definition?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'intra' | 'cross'; // intra = same transformation, cross = different
}

// Transformation metadata
const TRANSFORMATIONS = {
  P: { name: 'Perspective', color: '#2563eb' },
  IN: { name: 'Inversion', color: '#dc2626' },
  CO: { name: 'Composition', color: '#16a34a' },
  DE: { name: 'Decomposition', color: '#9333ea' },
  RE: { name: 'Recursion', color: '#ea580c' },
  SY: { name: 'Synthesis', color: '#0891b2' },
};

// Cross-transformation relationships (semantic connections between model types)
const CROSS_TRANSFORMATION_LINKS: [string, string][] = [
  // Perspective <-> Inversion (opposing viewpoints)
  ['P1', 'IN3'], // First Principles <-> Problem Reversal
  ['P4', 'IN4'], // Lens Shifting <-> Contra-Logic
  // Composition <-> Decomposition (build vs break apart)
  ['CO1', 'DE1'], // Synergy <-> Root Cause Analysis
  ['CO3', 'DE3'], // Functional Composition <-> Modularization
  ['CO8', 'DE4'], // Layered Abstraction <-> Layered Breakdown
  // Recursion <-> all (recursive patterns apply everywhere)
  ['RE1', 'DE1'], // Kaizen <-> Root Cause Analysis
  ['RE2', 'CO5'], // Feedback Loops <-> Emergence
  ['RE9', 'IN2'], // Iterative Prototyping <-> Premortem Analysis
  // Synthesis connections
  ['SY1', 'CO1'], // Pattern Synthesis <-> Synergy
  ['SY2', 'DE6'], // Emergence Detection <-> Taxonomy
];

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ models }) => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedTransformation, setSelectedTransformation] = useState<string | null>(null);

  // Prepare graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = models.map(model => ({
      id: model.code,
      name: model.name,
      group: model.transformation,
      val: model.priority === 1 ? 12 : 6,
      definition: model.definition,
    }));

    const links: GraphLink[] = [];
    const nodeIds = new Set(nodes.map(n => n.id));

    // Intra-transformation links (within same transformation)
    const modelsByTrans: Record<string, string[]> = {};
    models.forEach(m => {
      if (!modelsByTrans[m.transformation]) {
        modelsByTrans[m.transformation] = [];
      }
      modelsByTrans[m.transformation].push(m.code);
    });

    Object.values(modelsByTrans).forEach(group => {
      // Connect priority 1 models as hubs
      const hubModels = group.filter(code => {
        const model = models.find(m => m.code === code);
        return model?.priority === 1;
      });
      const otherModels = group.filter(code => !hubModels.includes(code));

      // Connect hub models to each other
      for (let i = 0; i < hubModels.length; i++) {
        for (let j = i + 1; j < hubModels.length; j++) {
          links.push({ source: hubModels[i], target: hubModels[j], type: 'intra' });
        }
      }

      // Connect other models to nearest hub
      otherModels.forEach((code, idx) => {
        const hubIdx = idx % Math.max(hubModels.length, 1);
        if (hubModels[hubIdx]) {
          links.push({ source: code, target: hubModels[hubIdx], type: 'intra' });
        }
      });
    });

    // Cross-transformation links
    CROSS_TRANSFORMATION_LINKS.forEach(([source, target]) => {
      if (nodeIds.has(source) && nodeIds.has(target)) {
        links.push({ source, target, type: 'cross' });
      }
    });

    return { nodes, links };
  }, [models]);

  // Filter nodes by transformation if selected
  const filteredData = useMemo(() => {
    if (!selectedTransformation) return graphData;

    const filteredNodes = graphData.nodes.filter(n => n.group === selectedTransformation);
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(
      l => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, selectedTransformation]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node?.id) {
        navigate(`/model/${node.id}`);
      }
    },
    [navigate]
  );

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
    // Change cursor to indicate nodes are clickable
    document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.5, 400);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
    setSelectedTransformation(null);
  };

  return (
    <div className="relative w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-zinc-900/50 rounded-sm border border-zinc-800">
        <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider mr-2">
          Filter:
        </span>
        <button
          onClick={() => setSelectedTransformation(null)}
          className={`px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${
            !selectedTransformation
              ? 'bg-zinc-700 border-zinc-500 text-zinc-100'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          ALL
        </button>
        {Object.entries(TRANSFORMATIONS).map(([code, { name, color }]) => (
          <button
            key={code}
            onClick={() => setSelectedTransformation(code)}
            title={name}
            className={`px-2 py-1 text-xs font-mono rounded-sm border transition-colors flex items-center gap-1.5 ${
              selectedTransformation === code
                ? 'bg-zinc-700 border-zinc-500 text-zinc-100'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {code}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute top-16 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleResetView}
          className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-sm flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors text-xs"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute top-16 left-4 z-10 max-w-xs p-3 bg-zinc-900 border border-zinc-700 rounded-sm shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  TRANSFORMATIONS[hoveredNode.group as keyof typeof TRANSFORMATIONS]?.color,
              }}
            />
            <span className="text-xs font-mono text-zinc-400">{hoveredNode.id}</span>
          </div>
          <h4 className="text-sm font-medium text-zinc-100 mb-1">{hoveredNode.name}</h4>
          {hoveredNode.definition && (
            <p className="text-xs text-zinc-400 line-clamp-3">{hoveredNode.definition}</p>
          )}
          <p className="text-xs text-zinc-500 mt-2 italic">Click to view details</p>
        </div>
      )}

      {/* Graph Canvas */}
      <div className="w-full h-[600px] border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950/50">
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredData}
          nodeLabel=""
          nodeColor={(node: GraphNode) =>
            TRANSFORMATIONS[node.group as keyof typeof TRANSFORMATIONS]?.color || '#ffffff'
          }
          nodeRelSize={6}
          nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12 / globalScale;
            const nodeSize = node.val || 6;
            const color =
              TRANSFORMATIONS[node.group as keyof typeof TRANSFORMATIONS]?.color || '#ffffff';

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x || 0, node.y || 0, nodeSize, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw label for larger nodes or when zoomed in
            if (globalScale > 0.8 || node.val > 8) {
              ctx.font = `${fontSize}px monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, node.x || 0, (node.y || 0) + nodeSize + fontSize);
            }
          }}
          linkColor={
            (link: GraphLink) => (link.type === 'cross' ? '#22c55e44' : '#3f3f46') // Green for cross-links
          }
          linkWidth={(link: GraphLink) => (link.type === 'cross' ? 2 : 1)}
          linkLineDash={(link: GraphLink) => (link.type === 'cross' ? [5, 5] : [])}
          backgroundColor="#09090b"
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          enableNodeDrag={true}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between mt-3 text-xs text-zinc-500 font-mono">
        <span>{filteredData.nodes.length} models</span>
        <span>
          {filteredData.links.filter(l => l.type === 'intra').length} intra-links •{' '}
          {filteredData.links.filter(l => l.type === 'cross').length} cross-links
        </span>
      </div>
    </div>
  );
};
