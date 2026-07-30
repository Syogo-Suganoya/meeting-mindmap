"use client";

import { useRef, useState } from "react";

type RecordingUploadPanelProps = {
  isAnalyzing: boolean;
  error: string | null;
  onAnalyze: (file: File) => void;
};

export default function RecordingUploadPanel({ isAnalyzing, error, onAnalyze }: RecordingUploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 w-[min(90vw,480px)] -translate-x-1/2 rounded-lg border border-gray-300 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isAnalyzing}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          📁 録画/録音を選択
        </button>
        <p className="min-h-[1.5em] flex-1 truncate text-xs text-gray-500 dark:text-gray-400">
          {selectedFile ? selectedFile.name : "会議の録画・録音ファイルを選択してください"}
        </p>
        <button
          type="button"
          onClick={() => selectedFile && onAnalyze(selectedFile)}
          disabled={!selectedFile || isAnalyzing}
          className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isAnalyzing ? "解析中..." : "解析する"}
        </button>
      </div>
      {isAnalyzing && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          内容によっては数十秒〜数分かかる場合があります。
        </p>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
