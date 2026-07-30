"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import MindMapCanvas from "@/app/components/MindMapCanvas";
import RecordingUploadPanel from "@/app/components/RecordingUploadPanel";
import MismatchToast, { type ToastItem } from "@/app/components/MismatchToast";
import { MindMapActionsProvider } from "@/lib/mindmap-actions-context";
import { useMindMapStore } from "@/lib/hooks/useMindMapStore";
import { loadMindMap, saveMindMap, clearMindMap } from "@/lib/storage";
import { MISMATCH_THRESHOLD } from "@/lib/types";
import type { AnalyzeResponse } from "@/app/api/analyze/route";
import { SCENARIOS, getScenario } from "@/lib/samples";

const SCENARIO_STORAGE_KEY = "meeting-mindmap:scenario";

function getStoredScenarioId(): string {
  if (typeof window === "undefined") return SCENARIOS[0].id;
  return window.localStorage.getItem(SCENARIO_STORAGE_KEY) ?? SCENARIOS[0].id;
}

export default function BoardPage() {
  const [scenarioId, setScenarioId] = useState(getStoredScenarioId);
  const [initial] = useState(() => loadMindMap() ?? getScenario(scenarioId).build());
  const store = useMindMapStore(initial);
  const {
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
    setNodes,
    setEdges,
  } = store;
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    saveMindMap(nodes, edges);
  }, [nodes, edges]);

  const actions = useMemo(
    () => ({ updateNodeText, overrideMismatch, deleteNode }),
    [updateNodeText, overrideMismatch, deleteNode],
  );

  const pushToast = useCallback((message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const handleAnalyzeRecording = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      setUploadError(null);
      try {
        const existingQuestions = nodes
          .filter((n) => n.data.kind === "question")
          .map((n) => ({ id: n.id, text: n.data.text }));

        const questionIdByAnswerId = new Map(
          edges.filter((e) => !e.data).map((e) => [e.target, e.source] as const),
        );
        const existingAnswers = nodes
          .filter((n) => n.data.kind === "answer" && questionIdByAnswerId.has(n.id))
          .map((n) => ({
            id: n.id,
            text: n.data.text,
            questionId: questionIdByAnswerId.get(n.id) as string,
          }));

        const formData = new FormData();
        formData.append("recording", file);
        formData.append("existingQuestions", JSON.stringify(existingQuestions));
        formData.append("existingAnswers", JSON.stringify(existingAnswers));

        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "unknown error" }));
          console.error("[analyze] failed", body);
          setUploadError(typeof body.error === "string" ? body.error : "解析中にエラーが発生しました");
          return;
        }
        const data = (await res.json()) as AnalyzeResponse;

        const tempIdToRealId = new Map<string, string>();
        for (const q of data.newQuestions) {
          const id = addQuestionNode({ text: q.text, rawText: q.rawText, speaker: q.speaker });
          tempIdToRealId.set(q.tempId, id);
        }
        const answerTempIdToRealId = new Map<string, string>();
        const existingAnswerIds = new Set(existingAnswers.map((a) => a.id));
        for (const a of data.newAnswers) {
          const linkedQuestionId =
            a.linkedExistingQuestionId ??
            (a.linkedNewQuestionTempId ? (tempIdToRealId.get(a.linkedNewQuestionTempId) ?? null) : null);
          const id = addAnswerNode({
            text: a.text,
            rawText: a.rawText,
            speaker: a.speaker,
            matchScore: a.matchScore,
            mismatchReason: a.mismatchReason,
            linkedQuestionId,
          });
          answerTempIdToRealId.set(a.tempId, id);
          if (a.matchScore !== null && a.matchScore < MISMATCH_THRESHOLD) {
            pushToast(a.mismatchReason ?? "この回答は質問とズレている可能性があります");
          }
        }
        for (const rel of data.answerRelations) {
          const resolveRef = (ref: string): string | null => {
            if (answerTempIdToRealId.has(ref)) return answerTempIdToRealId.get(ref) as string;
            if (existingAnswerIds.has(ref)) return ref;
            return null;
          };
          const idA = resolveRef(rel.answerARef);
          const idB = resolveRef(rel.answerBRef);
          if (idA && idB && idA !== idB) {
            addAnswerRelation(idA, idB, rel.kind, rel.reason);
          }
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [nodes, edges, addQuestionNode, addAnswerNode, addAnswerRelation, pushToast],
  );

  const currentScenario = useMemo(() => getScenario(scenarioId), [scenarioId]);

  function loadScenario(id: string) {
    setScenarioId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SCENARIO_STORAGE_KEY, id);
    }
    clearMindMap();
    const fresh = getScenario(id).build();
    setNodes(fresh.nodes);
    setEdges(fresh.edges);
  }

  return (
    <div className="flex h-dvh w-dvw flex-col">
      <header className="flex flex-col gap-1 border-b border-gray-200 px-4 py-2 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              ← トップ
            </Link>
            <h1 className="text-sm font-semibold">会議ホワイトボード議事録</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={scenarioId}
              onChange={(e) => loadScenario(e.target.value)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-900"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {currentScenario.sourceUrl && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            出典:{" "}
            <a
              href={currentScenario.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-900 dark:hover:text-gray-100"
            >
              {currentScenario.sourceNote ?? currentScenario.sourceUrl}
            </a>
          </p>
        )}
      </header>
      <main className="relative flex-1">
        <MindMapActionsProvider value={actions}>
          <MindMapCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />
        </MindMapActionsProvider>
        <RecordingUploadPanel
          isAnalyzing={isAnalyzing}
          error={uploadError}
          onAnalyze={handleAnalyzeRecording}
        />
        <MismatchToast toasts={toasts} />
      </main>
    </div>
  );
}
