"use client";

export function Snackbar({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-4 rounded-lg bg-ink px-4 py-3 text-white shadow-lg">
        <span className="text-[14px]">{message}</span>
        <button type="button" onClick={onAction} className="text-[14px] font-semibold text-brand">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
