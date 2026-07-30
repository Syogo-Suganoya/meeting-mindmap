"use client";

import { createContext, useContext } from "react";

export type MindMapActions = {
  updateNodeText: (id: string, text: string) => void;
  overrideMismatch: (id: string) => void;
  deleteNode: (id: string) => void;
};

const noop = () => {
  throw new Error("MindMapActionsContext.Provider is missing");
};

const MindMapActionsContext = createContext<MindMapActions>({
  updateNodeText: noop,
  overrideMismatch: noop,
  deleteNode: noop,
});

export const MindMapActionsProvider = MindMapActionsContext.Provider;

export function useMindMapActions(): MindMapActions {
  return useContext(MindMapActionsContext);
}
