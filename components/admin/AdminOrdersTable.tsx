"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrder } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";

const FULFILLMENT_STATUSES = ["PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

const statusClasses: Record<string, string> = {
  paid: "bg-green-dim text-green",
  pending: "bg-white/5 text-muted",
  failed: "bg-red-500/10 text-red-400",
  refunded: "bg-red-500/10 text-red-400",
};

export default function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateFulfillment(orderId: string, fulfillmentStatus: string) {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus }),
      });
      if (!res.ok) throw new Error();
      showToast("Order updated.", "success");
      router.refresh();
    } catch {
      showToast("Failed to update order.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Order ID</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Customer Email</th>
            <th className="px-4 py-3 font-medium">Customer Name</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Currency</th>
            <th className="px-4 py-3 font-medium">Payment Status</th>
            <th className="px-4 py-3 font-medium">Fulfillment</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 10)}…</td>
              <td className="px-4 py-3 text-foreground">
                {order.type === "EXCLUSIVE_BEAT" ? "Exclusive Beat" : "Beat"}
              </td>
              <td className="px-4 py-3 text-muted">{order.email}</td>
              <td className="px-4 py-3 text-muted">{order.customerName ?? "—"}</td>
              <td className="px-4 py-3 text-green">{formatPrice(order.amount)}</td>
              <td className="px-4 py-3 text-muted">{order.currency}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    statusClasses[order.status] ?? "bg-white/5 text-muted"
                  )}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {order.type === "EXCLUSIVE_BEAT" ? (
                  <select
                    value={order.fulfillmentStatus ?? ""}
                    onChange={(e) => updateFulfillment(order.id, e.target.value)}
                    disabled={updatingId === order.id || !order.fulfillmentStatus}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-green focus:outline-none disabled:opacity-50"
                  >
                    {!order.fulfillmentStatus && <option value="">—</option>}
                    {FULFILLMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
