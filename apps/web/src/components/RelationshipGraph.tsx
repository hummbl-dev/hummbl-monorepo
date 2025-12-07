import { useMemo, useCallback } from 'react';
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
}

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ models }) => {
  const navigate = useNavigate();

  // Define transformation colors to match the rest of the app
  const TRANSFORMATION_COLORS: Record<string, string> = {
    P: '#2563eb', // blue-600
    IN: '#dc2626', // red-600
    CO: '#16a34a', // green-600
    DE: '#9333ea', // purple-600
    RE: '#ea580c', // orange-600
    SY: '#0891b2', // cyan-600
  };

  // Prepare graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = models.map(model => ({
      id: model.code,
      name: model.name,
      group: model.transformation,
      val: model.priority === 1 ? 10 : 5, // Larger nodes for high priority models
    }));

    // Generate links based on shared transformation
    // In a real scenario, we'd use actual relationship data
    const links: { source: string; target: string }[] = [];

    // Create links between models in the same transformation
    const modelsByTrans: Record<string, string[]> = {};
    models.forEach(m => {
      if (!modelsByTrans[m.transformation]) {
        modelsByTrans[m.transformation] = [];
      }
      modelsByTrans[m.transformation].push(m.code);
    });

    Object.values(modelsByTrans).forEach(group => {
      // Connect models in a chain or star pattern for visualization
      for (let i = 0; i < group.length - 1; i++) {
        links.push({ source: group[i], target: group[i + 1] });
      }
      // Close the loop
      if (group.length > 2) {
        links.push({ source: group[group.length - 1], target: group[0] });
      }
    });

    return { nodes, links };
  }, [models]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      navigate(`/model/${node.id}`);
    },
    [navigate]
  );

  return (
    <div className="w-full h-[600px] border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950/50">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: GraphNode) => TRANSFORMATION_COLORS[node.group] || '#ffffff'}
        nodeRelSize={6}
        linkColor={() => '#3f3f46'} // zinc-700
        backgroundColor="#09090b" // zinc-950
        onNodeClick={handleNodeClick}
        enableNodeDrag={true}
        cooldownTicks={100}
      />
    </div>
  );
};
