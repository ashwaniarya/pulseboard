import { Skeleton } from "@pulseboard/ui";

export function RouteFallback() {
  return (
    <div aria-busy="true" className="space-y-4 p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton shape="rectangle" className="h-[7.5rem]" />
        <Skeleton shape="rectangle" className="h-[7.5rem]" />
        <Skeleton shape="rectangle" className="h-[7.5rem]" />
      </div>
      <Skeleton shape="rectangle" className="h-72" />
    </div>
  );
}
