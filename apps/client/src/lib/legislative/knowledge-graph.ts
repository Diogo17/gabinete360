export type GraphNodeType =
  | 'parliamentarian'
  | 'document'
  | 'demand'
  | 'institution'
  | 'inspection'
  | 'protocol';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  restricted?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

/**
 * Builds a tenant-isolated Parliamentary Knowledge Graph (Section 24.13),
 * filtering out restricted/confidential nodes from general queries.
 */
export function buildKnowledgeGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  includeRestricted = false
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const allowedNodes = includeRestricted ? nodes : nodes.filter((n) => !n.restricted);
  const allowedIds = new Set(allowedNodes.map((n) => n.id));
  const allowedEdges = edges.filter((e) => allowedIds.has(e.from) && allowedIds.has(e.to));

  return {
    nodes: allowedNodes,
    edges: allowedEdges,
  };
}
