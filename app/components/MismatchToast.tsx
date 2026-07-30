"use client";

export type ToastItem = { id: string; message: string };

type MismatchToastProps = {
  toasts: ToastItem[];
};

export default function MismatchToast({ toasts }: MismatchToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-20 flex w-[min(90vw,360px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-md border border-red-400 bg-red-50 px-3 py-2 text-xs text-red-800 shadow-lg dark:border-red-700 dark:bg-red-950 dark:text-red-200"
        >
          ⚠️ {t.message}
        </div>
      ))}
    </div>
  );
}
