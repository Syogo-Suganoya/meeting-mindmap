import type { MindMapEdge, MindMapNode } from "@/lib/types";

const STORAGE_KEY = "meeting-mindmap:v1";
const SAVE_DEBOUNCE_MS = 500;

type PersistedState = {
  version: 1;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  savedAt: number;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveMindMap(nodes: MindMapNode[], edges: MindMapEdge[]): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const payload: PersistedState = { version: 1, nodes, edges, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, SAVE_DEBOUNCE_MS);
}

export function loadMindMap(): { nodes: MindMapNode[]; edges: MindMapEdge[] } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return { nodes: parsed.nodes, edges: parsed.edges };
  } catch {
    return null;
  }
}

export function clearMindMap(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
