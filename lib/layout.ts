import dagre from "dagre";
import type { MindMapEdge, MindMapNode } from "@/lib/types";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

// dagreは一部ノードだけ固定する機能を持たないため、全ノードを計算した後に
// isManual(ユーザーがドラッグ/編集確定済み)なノードだけ元の座標へ戻すポスト処理を行う。
export function applyDagreLayout(nodes: MindMapNode[], edges: MindMapEdge[]): MindMapNode[] {
  if (nodes.length === 0) return nodes;

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 60, ranksep: 100 });

  for (const node of nodes) {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  // 回答↔回答の関係エッジ(data持ち)は階層構造ではないため、dagreの計算対象から除外する
  for (const edge of edges) {
    if (edge.data) continue;
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    if (node.data.isManual) return node;
    const pos = graph.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    };
  });
}
