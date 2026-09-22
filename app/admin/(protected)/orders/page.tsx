import { listAdminOrders } from "@/lib/admin/orders";
import AdminOrdersTable from "@/components/admin/AdminOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Orders</h1>
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}
