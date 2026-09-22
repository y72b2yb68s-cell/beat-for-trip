import Link from "next/link";
import { getDashboardStats, listRecentOrders } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), listRecentOrders()]);

  const cards = [
    { label: "Published Beats", value: stats.publishedBeats },
    { label: "Total Beats", value: stats.totalBeats },
    { label: "Paid Orders", value: stats.paidOrders },
    { label: "Revenue", value: formatPrice(stats.revenue) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold uppercase tracking-tight text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
          Recent Orders
        </h2>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Beat</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">
                      {order.type === "EXCLUSIVE_BEAT" ? "Exclusive Beat" : (order.beat?.title ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-muted">{order.email}</td>
                    <td className="px-4 py-3 text-green">{formatPrice(order.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                          order.status === "paid" && "bg-green-dim text-green",
                          order.status === "pending" && "bg-white/5 text-muted",
                          order.status === "failed" && "bg-red-500/10 text-red-400",
                          order.status === "refunded" && "bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-6">
        <Link href="/admin/beats" className="text-sm font-semibold text-green">
          Manage beats →
        </Link>
        <Link href="/admin/orders" className="text-sm font-semibold text-green">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
