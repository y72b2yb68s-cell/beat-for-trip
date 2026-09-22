import Link from "next/link";
import { listAdminBeats } from "@/lib/admin/beats";
import AdminBeatsTable from "@/components/admin/AdminBeatsTable";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminBeatsPage() {
  const beats = await listAdminBeats();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold uppercase tracking-tight text-foreground">Beats</h1>
        <Button href="/admin/beats/new" size="sm">
          Add Beat
        </Button>
      </div>

      <AdminBeatsTable beats={beats} />

      <p className="mt-4 text-xs text-muted">
        Need to get started? <Link href="/admin/beats/new" className="text-green">Add a beat</Link> and
        upload its cover, preview and full audio files.
      </p>
    </div>
  );
}
