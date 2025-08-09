import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-lg", className)}
      {...props} />
  );
}

// Specialized skeleton components for your app
const SkeletonCard = ({ className, ...props }) => (
  <div className={cn("border border-gray-100 rounded-2xl p-4 bg-white/80 backdrop-blur-sm", className)} {...props}>
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-4" />
    <Skeleton className="h-8 w-full" />
  </div>
);

const SkeletonBookingCard = ({ className, ...props }) => (
  <div className={cn("border border-gray-100 rounded-xl p-4 bg-white/80 backdrop-blur-sm", className)} {...props}>
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

const SkeletonTable = ({ rows = 5, className, ...props }) => (
  <div className={cn("bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50", className)} {...props}>
    <div className="p-4 border-b border-gray-200/50">
      <Skeleton className="h-5 w-32" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-200/50 flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-16 ml-auto" />
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonCard, SkeletonBookingCard, SkeletonTable }
