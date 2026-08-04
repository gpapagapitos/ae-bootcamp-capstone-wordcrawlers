export type MapNodeType =
  "battle" | "elite" | "event" | "treasure" | "shop" | "rest" | "boss";

export interface MapNode {
  id: string;
  row: number;
  lane: number;
  type: MapNodeType;
}

export interface MapEdge {
  from: string;
  to: string;
}

export interface ActMap {
  nodes: MapNode[];
  edges: MapEdge[];
}
