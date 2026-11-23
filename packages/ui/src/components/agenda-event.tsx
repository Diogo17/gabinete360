import * as React from "react";
import { cn } from "../lib/utils";

export interface AgendaEventItemProps extends React.HTMLAttributes<HTMLDivElement> {
  time: string;
  title: string;
  meta?: string;
  accentColor?: string;
  variant?: "green" | "amber" | "blue" | "default";
}

export const AgendaEventItem = React.forwardRef<HTMLDivElement, AgendaEventItemProps>(
  ({ className, time, title, meta, accentColor, variant = "green", ...props }, ref) => {
    const computedColor = React.useMemo(() => {
      if (accentColor) return accentColor;
      switch (variant) {
        case "green":
          return "#8bbba3";
        case "amber":
          return "#d3a968";
        case "blue":
          return "#8eabc0";
        default:
          return "#176B52";
      }
    }, [accentColor, variant]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center gap-3 rounded-lg border border-line bg-white p-2.5 transition-colors hover:bg-paper/60 pl-3.5",
          className
        )}
        {...props}
      >
        {/* Left vertical accent bar */}
        <div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-sm"
          style={{ backgroundColor: computedColor }}
        />

        <div className="min-w-[44px] text-xs font-bold text-ink">
          {time}
        </div>

        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-bold text-ink leading-tight">
            {title}
          </div>
          {meta && (
            <div className="truncate text-[10px] text-muted leading-normal mt-0.5">
              {meta}
            </div>
          )}
        </div>
      </div>
    );
  }
);
AgendaEventItem.displayName = "AgendaEventItem";
