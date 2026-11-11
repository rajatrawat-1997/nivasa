import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-[430px]">
        <div className="mb-3 flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-[26px]" />
        <div className="mt-5 flex items-center justify-center gap-3.5">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}
