import React from 'react';
import { cn } from '@/lib/utils';

function shimmer() {
  return 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';
}

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('bg-white/5 rounded-md', shimmer(), className)} />
);

export const StatsSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="ov-panel-flat p-4">
        <Skeleton className="h-4 w-1/3 mb-3" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="rounded-md border border-white/10 overflow-hidden">
    <div className="grid grid-cols-6 bg-white/5">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8" />
      ))}
    </div>
    <div className="divide-y divide-white/5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid grid-cols-6">
          {Array.from({ length: 6 }).map((__, c) => (
            <Skeleton key={c} className="h-10" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="ov-panel-flat p-6 space-y-6">
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

/* keyframes for shimmer (Tailwind utilities could also define) */
// Add to global CSS if not present: @keyframes shimmer { 100% { transform: translateX(100%); } }
