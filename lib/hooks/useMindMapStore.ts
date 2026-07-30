"use client";

import { useCallback, useRef } from "react";
import { addEdge, applyNodeChanges, useEdgesState, useNodesState, type Connection, type OnConnect } from "@xyflow/react";
import type { AnswerNodeData, MindMapEdge, MindMapNode, QuestionNodeData, RelationKind } from "@/lib/types";
import { applyDagreLayout } from "@/lib/layout";

type NewQuestionInput = Pick<QuestionNodeData, "text" | "rawText" | "speaker">;
type NewAnswerInput = Pick<AnswerNodeData, "text" | "rawText" | "speaker" | "matchScore" | "mismatchReason"> & {
  linkedQuestionId: string | null;
};

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function useMindMapStore(initial?: { nodes: MindMapNode[]; edges: MindMapEdge[] }) {
  const [nodes, setNodes, onNodesChangeRaw] = useNodesState<MindMapNode>(initial?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<MindMapEdge>(initial?.edges ?? []);
  const unlinkedXRef = useRef(600);

  // react-flow標準のonNodesChangeをラップし、ドラッグ確定(dragging:false)を検知してisManualを立てる
  const onNodesChange = useCallback<typeof onNodesChangeRaw>(
    (changes) => {
      const draggedIds = new Set(
        changes
          .filter((c) => c.type === "position" && c.dragging === false)
          .map((c) => (c as { id: string }).id),
      );
      if (draggedIds.size === 0) {
        onNodesChangeRaw(changes);
        return;
      }
      setNodes((current) =>
        applyNodeChanges(changes, current).map((node) =>
          draggedIds.has(node.id) ? { ...node, data: { ...node.data, isManual: true } } : node,
        ),
      );
    },
    [onNodesChangeRaw, setNodes],
  );

  const relayout = useCallback(() => {
    setNodes((current) => applyDagreLayout(current, edges));
  }, [edges, setNodes]);

  const addQuestionNode = useCallback(
    (q: NewQuestionInput): string => {
      const id = nextId("q");
      const node: MindMapNode = {
        id,
        type: "question",
        position: { x: 0, y: 0 },
        data: { kind: "question", ...q, createdAt: Date.now(), isManual: false },
      };
      setNodes((current) => applyDagreLayout([...current, node], edges));
      return id;
    },
    [edges, setNodes],
  );

  const addAnswerNode = useCallback(
    (a: NewAnswerInput): string => {
      const id = nextId("a");
      const isUnlinked = a.linkedQuestionId === null;
      const node: MindMapNode = {
        id,
        type: "answer",
        position: isUnlinked
          ? {
              x: unlinkedXRef.current,
              y:
                80 *
                (nodes.filter((n) => n.data.kind === "answer" && n.data.matchScore === null).length + 1),
            }
          : { x: 0, y: 0 },
        data: {
          kind: "answer",
          text: a.text,
          rawText: a.rawText,
          speaker: a.speaker,
          matchScore: a.matchScore,
          mismatchReason: a.mismatchReason,
          createdAt: Date.now(),
          isManual: isUnlinked, // 未分類ノードは自動レイアウト対象から外す(手動接続まで固定表示)
        },
      };
      setNodes((current) => {
        const next = [...current, node];
        return isUnlinked ? next : applyDagreLayout(next, [...edges, ...(a.linkedQuestionId ? [{ id: nextId("e"), source: a.linkedQuestionId, target: id }] : [])]);
      });
      if (a.linkedQuestionId) {
        setEdges((current) => [
          ...current,
          { id: nextId("e"), source: a.linkedQuestionId as string, target: id },
        ]);
      }
      return id;
    },
    [edges, nodes, setEdges, setNodes],
  );

  const updateNodeText = useCallback(
    (id: string, text: string) => {
      setNodes((current) =>
        current.map((n) => (n.id === id ? { ...n, data: { ...n.data, text, isManual: true } } : n)),
      );
    },
    [setNodes],
  );

  const overrideMismatch = useCallback(
    (id: string) => {
      setNodes((current) =>
        current.map((n) =>
          n.id === id && n.data.kind === "answer"
            ? { ...n, data: { ...n.data, matchOverridden: true } }
            : n,
        ),
      );
    },
    [setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((n) => n.id !== id));
      setEdges((current) => current.filter((e) => e.source !== id && e.target !== id));
    },
    [setEdges, setNodes],
  );

  const addAnswerRelation = useCallback(
    (sourceId: string, targetId: string, kind: RelationKind, reason: string) => {
      if (sourceId === targetId) return;
      const bothExist = nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId);
      if (!bothExist) return;

      const alreadyRelated = edges.some(
        (e) =>
          e.data &&
          ((e.source === sourceId && e.target === targetId) ||
            (e.source === targetId && e.target === sourceId)),
      );
      if (alreadyRelated) return;

      const style =
        kind === "agree"
          ? { stroke: "#10b981", strokeWidth: 2 }
          : { stroke: "#ef4444", strokeWidth: 2, strokeDasharray: "5 5" };
      const label = kind === "agree" ? "🤝 一致" : "⚡ 対立";

      setEdges((current) => [
        ...current,
        {
          id: nextId("rel"),
          source: sourceId,
          target: targetId,
          data: { kind, reason },
          style,
          label,
          labelBgPadding: [4, 2] as [number, number],
          labelBgStyle: { fill: "#ffffff", fillOpacity: 0.8 },
        },
      ]);
    },
    [edges, nodes, setEdges],
  );

  const onConnect = useCallback<OnConnect>(
    (connection: Connection) => {
      setEdges((current) => addEdge(connection, current));
      setNodes((current) =>
        current.map((n) =>
          n.id === connection.target && n.data.kind === "answer"
            ? { ...n, data: { ...n.data, isManual: true } }
            : n,
        ),
      );
    },
    [setEdges, setNodes],
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addQuestionNode,
    addAnswerNode,
    updateNodeText,
    overrideMismatch,
    deleteNode,
    addAnswerRelation,
    relayout,
    setNodes,
    setEdges,
  };
}
