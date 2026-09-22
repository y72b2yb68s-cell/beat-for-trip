import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/require-admin";
import AdminShell from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
