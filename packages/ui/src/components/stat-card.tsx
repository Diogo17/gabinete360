import * as React from "react";
import { cn } from "../lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  caption?: string;
  iconBgColor?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, icon, label, value, trend, caption, iconBgColor, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-line bg-white p-4 md:p-[18px] shadow-card transition-all duration-200 hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          {icon && (
            <div
              className={cn(
                "flex h-[34px] w-[34px] items-center justify-center rounded-sm bg-mint text-green text-sm font-bold shadow-xs",
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] font-bold tracking-tight",
                trend.isPositive !== false
                  ? "bg-mint text-green"
                  : "bg-tag-redBg text-tag-redText"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>

        <div className="mt-3 font-heading text-2xl md:text-[27px] font-extrabold tracking-tight text-ink leading-tight">
          {value}
        </div>

        <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-muted">
          <span>{label}</span>
          {caption && <span className="text-[10px] text-muted/70">{caption}</span>}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
