"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Beat as PrismaBeat } from "@prisma/client";
import { formatDuration, formatPrice } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AdminBeatsTable({ beats }: { beats: PrismaBeat[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<PrismaBeat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/beats/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Beat deleted.", "success");
      setPendingDelete(null);
      router.refresh();
    } catch {
      showToast("Failed to delete beat.", "error");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(beat: PrismaBeat) {
    setTogglingId(beat.id);
    const nextStatus = beat.status === "published" ? "unpublished" : "published";
    try {
      const formData = new FormData();
      formData.set("status", nextStatus);
      const res = await fetch(`/api/admin/beats/${beat.id}`, { method: "PATCH", body: formData });
      if (!res.ok) throw new Error();
      showToast(nextStatus === "published" ? "Beat published." : "Beat unpublished.", "success");
      router.refresh();
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  if (beats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted">No beats yet.</p>
        <Link href="/admin/beats/new" className="mt-4 inline-block text-sm font-semibold text-green">
          Add your first beat
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Genre</th>
              <th className="px-4 py-3 font-medium">BPM / Key</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Files</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {beats.map((beat) => (
              <tr key={beat.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-foreground">{beat.title}</td>
                <td className="px-4 py-3 text-muted">{beat.genre}</td>
                <td className="px-4 py-3 text-muted">
                  {beat.bpm} · {beat.key}
                </td>
                <td className="px-4 py-3 text-muted">{formatDuration(beat.duration)}</td>
                <td className="px-4 py-3 text-green">{formatPrice(beat.price)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleStatus(beat)}
                    disabled={togglingId === beat.id}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                      beat.status === "published"
                        ? "bg-green-dim text-green"
                        : "bg-white/5 text-muted"
                    )}
                  >
                    {beat.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {[beat.coverUrl && "cover", beat.previewUrl && "preview", beat.fileKey && "full"]
                    .filter(Boolean)
                    .join(", ") || "none"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/beats/${beat.id}`} className="text-xs font-semibold text-foreground hover:text-green">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(beat)}
                      className="text-xs font-semibold text-muted hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Delete this beat?">
        <p className="text-sm text-muted">
          This permanently deletes &quot;{pendingDelete?.title}&quot; and its files. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
