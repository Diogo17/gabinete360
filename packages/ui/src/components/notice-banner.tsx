import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "../lib/utils";

export interface NoticeBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  variant?: "institutional" | "warning" | "info";
}

export const NoticeBanner = React.forwardRef<HTMLDivElement, NoticeBannerProps>(
  ({ className, icon, variant = "institutional", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs transition-colors select-none",
          variant === "institutional" &&
            "border-[#e7ebdc] bg-[#fbfcf5] text-[#64724f]",
          variant === "warning" &&
            "border-gold/25 bg-tag-amberBg text-tag-amberText",
          variant === "info" &&
            "border-blue/25 bg-tag-blueBg text-tag-blueText",
          className
        )}
        {...props}
      >
        <span className="shrink-0">
          {icon || <Info className="h-4 w-4" />}
        </span>
        <div className="flex-1 text-[11px] md:text-xs leading-relaxed">
          {children}
        </div>
      </div>
    );
  }
);
NoticeBanner.displayName = "NoticeBanner";
