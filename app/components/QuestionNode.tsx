"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { MindMapNode } from "@/lib/types";
import { useMindMapActions } from "@/lib/mindmap-actions-context";

export type QuestionNodeProps = NodeProps<MindMapNode> & {
  data: Extract<MindMapNode["data"], { kind: "question" }>;
};

export default function QuestionNode({ data, id }: QuestionNodeProps) {
  const { updateNodeText } = useMindMapActions();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.text);
  const [showRaw, setShowRaw] = useState(false);

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
      className="relative min-w-[180px] max-w-[260px] rounded-lg border-2 border-indigo-500 bg-indigo-50 px-4 py-3 shadow-md dark:bg-indigo-950"
      onDoubleClick={() => setEditing(true)}
      onMouseEnter={() => setShowRaw(true)}
      onMouseLeave={() => setShowRaw(false)}
    >
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
        質問{data.speaker ? ` ・ ${data.speaker}` : ""}
      </div>
      {editing ? (
        <textarea
          autoFocus
          className="w-full resize-none rounded border border-indigo-300 bg-white p-1 text-sm text-gray-900 nodrag"
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
      {showRaw && !editing && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded border border-gray-300 bg-white p-2 text-xs text-gray-600 shadow-lg dark:bg-gray-800 dark:text-gray-300">
          {data.rawText}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="q-out" />
    </div>
  );
}
