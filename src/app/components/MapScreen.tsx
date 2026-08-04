import { useEffect, useMemo, useRef, useState } from 'react';
import { describeBuff } from '../content/events.js';
import { getSelectableNodeIds, resolveNodeLabel } from '../map/map.js';
import type { MapNodeType } from '../map/types.js';
import { useMapStore } from '../store/mapStore.js';
import { useProgressionStore } from '../store/progressionStore.js';

const NODE_STYLES: Record<MapNodeType, string> = {
  battle: 'node node-battle',
  elite: 'node node-elite',
  event: 'node node-event',
  treasure: 'node node-treasure',
  shop: 'node node-shop',
  rest: 'node node-rest',
  boss: 'node node-boss'
};

const NODE_ICONS: Record<MapNodeType, string> = {
  battle: '\u2694',
  elite: '\u2620',
  event: '?',
  treasure: '\u25C6',
  shop: '\u26EA',
  rest: '\u2726',
  boss: '\u265A'
};

function describeType(type: MapNodeType): string {
  switch (type) {
    case 'battle':
      return 'Standard combat encounter';
    case 'elite':
      return 'High-risk elite battle';
    case 'event':
      return 'Narrative event with choices';
    case 'treasure':
      return 'Treasure reward encounter';
    case 'shop':
      return 'Buy cards, remove cards, prep strategy';
    case 'rest':
      return 'Recover and tune your run';
    case 'boss':
      return 'Act-ending boss fight';
    default:
      return 'Unknown encounter';
  }
}

const NODE_X_MARGIN = 10;
const NODE_Y_MARGIN = 8;
const JITTER_PERCENT = 4;
const MAX_NODE_SIZE_PX = 50;
const MIN_NODE_SIZE_PX = 24;
/** Minimum gap kept between the edges of the closest two node centers. */
const NODE_SPACING_GAP_PX = 12;
/** Extra clearance beyond the node radius so connector lines stop short of the edge. */
const NODE_LINE_CLEARANCE_PX = 4;

/**
 * Picks a node circle diameter that fits the closest pair of actual rendered node centers,
 * so nodes never visually overlap regardless of viewport size, without shrinking them more
 * than necessary.
 */
function computeNodeSize(points: Array<{ x: number; y: number; }>, stageWidth: number, stageHeight: number): number {
  if (!stageWidth || !stageHeight || points.length < 2) {
    return MAX_NODE_SIZE_PX;
  }

  let minDistPx = Infinity;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = ((points[i].x - points[j].x) / 100) * stageWidth;
      const dy = ((points[i].y - points[j].y) / 100) * stageHeight;
      const dist = Math.hypot(dx, dy);
      if (dist < minDistPx) {
        minDistPx = dist;
      }
    }
  }

  const fitted = minDistPx - NODE_SPACING_GAP_PX;
  return Math.max(MIN_NODE_SIZE_PX, Math.min(MAX_NODE_SIZE_PX, fitted));
}

/** Small deterministic per-node offset so paths don't sit on a perfect grid. */
function jitterFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ((hash % 1000) / 1000 - 0.5) * JITTER_PERCENT;
}

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Shortens a line (given in 0-100 percent coords) by the node radius on each end, in real pixel space. */
function trimToNodeEdges(
  segment: LineSegment,
  containerWidth: number,
  containerHeight: number,
  edgeGapPx: number
): LineSegment {
  if (!containerWidth || !containerHeight) {
    return segment;
  }

  const px1 = (segment.x1 / 100) * containerWidth;
  const py1 = (segment.y1 / 100) * containerHeight;
  const px2 = (segment.x2 / 100) * containerWidth;
  const py2 = (segment.y2 / 100) * containerHeight;

  const dx = px2 - px1;
  const dy = py2 - py1;
  const length = Math.hypot(dx, dy);
  if (length <= edgeGapPx * 2) {
    return { x1: segment.x1, y1: segment.y1, x2: segment.x1, y2: segment.y1 };
  }

  const ux = dx / length;
  const uy = dy / length;
  const tx1 = px1 + ux * edgeGapPx;
  const ty1 = py1 + uy * edgeGapPx;
  const tx2 = px2 - ux * edgeGapPx;
  const ty2 = py2 - uy * edgeGapPx;

  return {
    x1: (tx1 / containerWidth) * 100,
    y1: (ty1 / containerHeight) * 100,
    x2: (tx2 / containerWidth) * 100,
    y2: (ty2 / containerHeight) * 100
  };
}

interface MapScreenProps {
  onReroll?: () => void;
  onEndRun?: () => void;
}

export function MapScreen({ onReroll, onEndRun }: MapScreenProps) {
  const { map, currentNodeId, visitedNodeIds, selectNode, resetMap } = useMapStore();
  const pendingBuff = useProgressionStore((state) => state.pendingBuff);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [tooltipNodeId, setTooltipNodeId] = useState<string | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) {
      return;
    }

    const updateSize = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectable = useMemo(
    () => getSelectableNodeIds(map, currentNodeId, visitedNodeIds),
    [map, currentNodeId, visitedNodeIds]
  );

  const { maxRow, maxLane } = useMemo(() => {
    let row = 0;
    let lane = 0;
    for (const node of map.nodes) {
      row = Math.max(row, node.row);
      lane = Math.max(lane, node.lane);
    }
    return { maxRow: row, maxLane: lane };
  }, [map.nodes]);

  const nodeX = (node: { id: string; lane: number; }) => {
    const span = 100 - NODE_X_MARGIN * 2;
    const base = maxLane === 0 ? 50 : NODE_X_MARGIN + (node.lane / maxLane) * span;
    return base + jitterFor(node.id);
  };

  const nodeY = (node: { id: string; row: number; }) => {
    const span = 100 - NODE_Y_MARGIN * 2;
    const base = maxRow === 0 ? 90 : 90 - (node.row / maxRow) * span;
    return base + jitterFor(`${node.id}-y`);
  };

  const nodeSize = useMemo(() => {
    const points = map.nodes.map((node) => ({ x: nodeX(node), y: nodeY(node) }));
    return computeNodeSize(points, stageSize.width, stageSize.height);
  }, [map.nodes, stageSize.width, stageSize.height, maxRow, maxLane]);
  const edgeGapPx = nodeSize / 2 + NODE_LINE_CLEARANCE_PX;

  const currentNode = currentNodeId ? map.nodes.find((node) => node.id === currentNodeId) : null;
  const tooltipNode = tooltipNodeId ? map.nodes.find((node) => node.id === tooltipNodeId) : null;

  return (
    <div className="screen-root map-layout">
      <header className="header">
        <div className="map-title-block">
          <p className="eyebrow">Wordcrawlers</p>
          <h1>Act 1 Vault Route</h1>
          {pendingBuff ? <p className="map-buff-badge">{describeBuff(pendingBuff)}</p> : null}
        </div>
        <div className="map-header-actions">
          <button className="ink-button" onClick={() => (onReroll ? onReroll() : resetMap(Date.now()))}>
            Reroll Seed
          </button>
          {onEndRun ? (
            <button className="ink-button" onClick={onEndRun}>
              End Run
            </button>
          ) : null}
        </div>
      </header>

      <section className="panel map-panel">
        <div className="map-panel-header">
          <p className="map-panel-label">Route Stage</p>
          <div className="map-panel-status">
            <span>Current</span>
            <strong>{currentNode ? resolveNodeLabel(currentNode.type) : 'Start'}</strong>
          </div>
        </div>

        <div className="map-stage" ref={stageRef}>
          <svg className="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {map.edges.map((edge) => {
              const from = map.nodes.find((node) => node.id === edge.from);
              const to = map.nodes.find((node) => node.id === edge.to);
              if (!from || !to) {
                return null;
              }

              const raw = { x1: nodeX(from), y1: nodeY(from), x2: nodeX(to), y2: nodeY(to) };
              const { x1, y1, x2, y2 } = trimToNodeEdges(raw, stageSize.width, stageSize.height, edgeGapPx);
              const isPath = currentNodeId === from.id && selectable.includes(to.id);

              return (
                <line
                  key={`${edge.from}->${edge.to}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={isPath ? 'path-line active' : 'path-line'}
                />
              );
            })}
          </svg>

          <div className="map-grid">
            {map.nodes.map((node, index) => {
              const top = `${nodeY(node)}%`;
              const left = `${nodeX(node)}%`;
              const isCurrent = currentNodeId === node.id;
              const isVisited = visitedNodeIds.includes(node.id);
              const isSelectable = selectable.includes(node.id);

              const className = [
                NODE_STYLES[node.type],
                isCurrent ? 'current' : '',
                isVisited ? 'visited' : '',
                isSelectable ? 'selectable' : ''
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={node.id}
                  className={className}
                  style={{ top, left, width: nodeSize, height: nodeSize, animationDelay: `${index * 28}ms` }}
                  disabled={!isSelectable}
                  onClick={() => selectNode(node.id)}
                  onMouseEnter={() => setTooltipNodeId(node.id)}
                  onMouseLeave={() => setTooltipNodeId((current) => (current === node.id ? null : current))}
                  onFocus={() => setTooltipNodeId(node.id)}
                  onBlur={() => setTooltipNodeId((current) => (current === node.id ? null : current))}
                  aria-label={`${resolveNodeLabel(node.type)}: ${describeType(node.type)}`}
                  aria-describedby={tooltipNodeId === node.id ? 'map-node-tooltip' : undefined}
                >
                  <span aria-hidden="true" style={{ fontSize: nodeSize * 0.55 }}>
                    {NODE_ICONS[node.type]}
                  </span>
                </button>
              );
            })}
          </div>

          {tooltipNode ? (
            <div
              id="map-node-tooltip"
              role="tooltip"
              className={`map-node-tooltip ${nodeY(tooltipNode) < 20 ? 'below' : ''}`.trim()}
              style={{ top: `${nodeY(tooltipNode)}%`, left: `${nodeX(tooltipNode)}%` }}
            >
              <strong>{resolveNodeLabel(tooltipNode.type)}</strong>
              <span>{describeType(tooltipNode.type)}</span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

