import * as React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular" | "card" | "table-row";
  count?: number;
}

export function SkeletonLoader({
  className,
  variant = "rectangular",
  count = 1,
  ...props
}: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "table-row") {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="animate-pulse">
            <td className="px-3.5 py-3">
              <div className="h-3 w-16 bg-line rounded-sm" />
            </td>
            <td className="px-3.5 py-3">
              <div className="h-3 w-40 bg-line rounded-sm" />
            </td>
            <td className="px-3.5 py-3">
              <div className="h-3 w-24 bg-line rounded-sm" />
            </td>
            <td className="px-3.5 py-3">
              <div className="h-4 w-20 bg-line rounded-pill" />
            </td>
            <td className="px-3.5 py-3">
              <div className="h-3 w-12 bg-line rounded-sm" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {items.map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-white p-4 shadow-card animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-8 w-8 rounded-sm bg-line" />
              <div className="h-4 w-12 rounded-pill bg-line" />
            </div>
            <div className="h-7 w-20 rounded-sm bg-line" />
            <div className="h-3 w-28 rounded-sm bg-line" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-line/80",
            variant === "text" && "h-3 w-full rounded-sm",
            variant === "circular" && "h-9 w-9 rounded-full",
            variant === "rectangular" && "h-10 w-full rounded-md",
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}
