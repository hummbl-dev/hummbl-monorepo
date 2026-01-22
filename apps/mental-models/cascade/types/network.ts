// Network graph types for HUMMBL Framework

export interface NetworkNode {
  id: string;
  label: string;
  category: string;
  confidence: number;
  evidence_quality: 'A' | 'B' | 'C';
  provenance_hash: string;
  complexity: string;
  domain: string[];
}

export interface NetworkEdge {
  source: string;
  target: string;
  type: string;
  description: string;
  weight: number;
  bidirectional: boolean;
}

export interface NetworkStatistics {
  density: number;
  avg_degree: number;
  central_nodes: CentralNode[];
  relationship_types: Record<string, number>;
}

export interface CentralNode {
  id: string;
  in_degree: number;
  out_degree: number;
  betweenness_centrality: string;
}

export interface VisualizationHints {
  layout: string;
  node_size_by: string;
  node_color_by: string;
  edge_width_by: string;
  highlight_bidirectional: boolean;
  category_colors: Record<string, string>;
  evidence_quality_opacity: Record<string, number>;
}

export interface NetworkData {
  metadata: {
    generated_at: string;
    source: string;
    version: string;
    total_narratives: number;
    total_edges: number;
  };
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  network_statistics: NetworkStatistics;
  visualization_hints: VisualizationHints;
}
