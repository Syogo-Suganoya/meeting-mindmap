"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MindMapNode } from "@/lib/types";
import { getMatchLevel } from "@/lib/types";
import { useMindMapActions } from "@/lib/mindmap-actions-context";

export type AnswerNodeProps = NodeProps<MindMapNode> & {
  data: Extract<MindMapNode["data"], { kind: "answer" }>;
};

const LEVEL_STYLES = {
  high: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
  mid: "border-amber-500 bg-amber-50 dark:bg-amber-950",
  low: "border-red-500 bg-red-50 dark:bg-red-950",
  unlinked: "border-gray-400 bg-gray-100 dark:bg-gray-800",
} as const;

export default function AnswerNode({ data, id }: AnswerNodeProps) {
  const { updateNodeText, overrideMismatch } = useMindMapActions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.text);
  const [showRaw, setShowRaw] = useState(false);

  const level = data.matchOverridden ? "high" : getMatchLevel(data.matchScore);
  const showWarning = level === "low" && !data.matchOverridden;

  function commit() {
    setEditing(false);
    const text = draft.trim();
    if (text && text !== data.text) {
      updateNodeText(id, text);
    } else {
      setDraft(data.text);
    }
  }

  return (
    <div
      className={`relative min-w-[180px] max-w-[260px] rounded-lg border-2 px-4 py-3 shadow-md ${LEVEL_STYLES[level]}`}
      onDoubleClick={() => setEditing(true)}
      onMouseEnter={() => setShowRaw(true)}
      onMouseLeave={() => setShowRaw(false)}
    >
      <Handle type="target" position={Position.Top} id="a-in" />
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-gray-500">
        <span>
          回答{data.speaker ? ` ・ ${data.speaker}` : ""}
        </span>
        {data.matchScore !== null && (
          <span>{data.matchScore}点</span>
        )}
      </div>
      {editing ? (
        <textarea
          autoFocus
          className="w-full resize-none rounded border border-gray-300 bg-white p-1 text-sm text-gray-900 nodrag"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
        />
      ) : (
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.text}</p>
      )}
      {showWarning && (
        <div className="mt-2 flex items-start gap-1 text-xs text-red-700 dark:text-red-300">
          <span aria-hidden>⚠️</span>
          <span className="flex-1">{data.mismatchReason ?? "質問とズレている可能性があります"}</span>
        </div>
      )}
      {showWarning && (
        <button
          type="button"
          className="nodrag mt-1 rounded border border-red-400 px-2 py-0.5 text-[10px] text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
          onClick={() => overrideMismatch(id)}
        >
          これは妥当な回答として扱う
        </button>
      )}
      {showRaw && !editing && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded border border-gray-300 bg-white p-2 text-xs text-gray-600 shadow-lg dark:bg-gray-800 dark:text-gray-300">
          {data.rawText}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="a-out" />
    </div>
  );
}
