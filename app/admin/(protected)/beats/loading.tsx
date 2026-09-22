import Skeleton from "@/components/ui/Skeleton";

export default function AdminBeatsLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
