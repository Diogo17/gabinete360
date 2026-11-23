import * as React from "react";
import { cn } from "../lib/utils";

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  label: string;
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, active, count, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[10px] md:text-[11px] font-semibold transition-all select-none border",
          active
            ? "border-green/30 bg-mint text-green shadow-xs font-bold"
            : "border-line bg-white text-muted hover:border-line-dark hover:text-ink hover:bg-paper",
          className
        )}
        {...props}
      >
        <span>{label}</span>
        {count !== undefined && (
          <span
            className={cn(
              "rounded-pill px-1.5 py-0.2 text-[9px] font-bold",
              active ? "bg-green text-white" : "bg-paper text-muted"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";
