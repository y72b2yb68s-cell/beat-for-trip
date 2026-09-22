import Skeleton from "@/components/ui/Skeleton";

export default function BeatDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
