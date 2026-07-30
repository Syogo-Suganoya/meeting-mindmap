import type { MindMapEdge, MindMapNode, RelationKind } from "@/lib/types";

export type Scenario = {
  id: string;
  label: string;
  sourceUrl?: string;
  sourceNote?: string;
  build: () => { nodes: MindMapNode[]; edges: MindMapEdge[] };
};

// サンプルシナリオに手動で回答↔回答の関係エッジを仕込むためのヘルパー。
// スタイルはuseMindMapStore.addAnswerRelationと同じ配色に揃える。
export function buildRelationEdge(
  id: string,
  source: string,
  target: string,
  kind: RelationKind,
  reason: string,
): MindMapEdge {
  return {
    id,
    source,
    target,
    data: { kind, reason },
    style:
      kind === "agree"
        ? { stroke: "#10b981", strokeWidth: 2 }
        : { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5 5" },
    label: kind === "agree" ? "🤝 一致" : "⚡ 対立",
    labelBgPadding: [4, 2],
    labelBgStyle: { fill: "#ffffff", fillOpacity: 0.8 },
  };
}
