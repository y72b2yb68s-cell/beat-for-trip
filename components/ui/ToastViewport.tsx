"use client";

import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  success: "border-green/40 text-green",
  error: "border-red-500/40 text-red-400",
  info: "border-border text-foreground",
};

export default function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          onClick={() => dismissToast(toast.id)}
          className={cn(
            "animate-fade-in cursor-pointer rounded-xl border bg-surface px-4 py-3 text-sm shadow-lg",
            typeStyles[toast.type]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
