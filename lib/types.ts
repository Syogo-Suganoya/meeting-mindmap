import type { Edge, Node } from "@xyflow/react";

export const MISMATCH_THRESHOLD = 40;
export const MATCH_HIGH_THRESHOLD = 80;

type BaseNodeData = {
  text: string; // LLMが要約・整理した表示用テキスト
  rawText: string; // 文字起こしされた生の発言
  speaker?: string;
  createdAt: number;
  isManual: boolean; // ユーザーが手動編集/ドラッグ確定済みか
};

export type QuestionNodeData = BaseNodeData & {
  kind: "question";
};

export type AnswerNodeData = BaseNodeData & {
  kind: "answer";
  matchScore: number | null; // 0-100。紐づく質問が無い(未分類)場合はnull
  mismatchReason?: string;
  matchOverridden?: boolean; // ユーザーが警告を手動で解除した場合true
};

export type MindMapNodeData = QuestionNodeData | AnswerNodeData;

export type MindMapNode = Node<MindMapNodeData>;

export type RelationKind = "agree" | "conflict";
export type RelationEdgeData = { kind: RelationKind; reason: string };

// 質問→回答の階層エッジはdataを持たない。回答↔回答の関係エッジのみdataを持つ(この違いでレイアウト計算時に区別する)。
export type MindMapEdge = Edge<RelationEdgeData>;

export type MatchLevel = "high" | "mid" | "low" | "unlinked";

export function getMatchLevel(matchScore: number | null): MatchLevel {
  if (matchScore === null) return "unlinked";
  if (matchScore >= MATCH_HIGH_THRESHOLD) return "high";
  if (matchScore >= MISMATCH_THRESHOLD) return "mid";
  return "low";
}
