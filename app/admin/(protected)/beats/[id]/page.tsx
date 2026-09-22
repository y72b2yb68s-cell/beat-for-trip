import { notFound } from "next/navigation";
import { getAdminBeatById } from "@/lib/admin/beats";
import BeatForm from "@/components/admin/BeatForm";

export const dynamic = "force-dynamic";

export default async function EditBeatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beat = await getAdminBeatById(id);
  if (!beat) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold uppercase tracking-tight text-foreground">Edit Beat</h1>
      <BeatForm beat={beat} />
    </div>
  );
}
