import * as React from "react";
import { cn } from "../lib/utils";

export interface DemoWatermarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const DemoWatermark = React.forwardRef<HTMLSpanElement, DemoWatermarkProps>(
  ({ className, size = "sm", text = "DEMONSTRAÇÃO", ...props }, ref) => {
    // Em produção estrita (NEXT_PUBLIC_DEMO_MODE !== "true"), não renderiza marca d'água
    const globalObj = typeof globalThis !== "undefined" ? (globalThis as any) : null;
    const env = globalObj?.process?.env;
    if (env && env.NEXT_PUBLIC_DEMO_MODE !== "true" && env.NODE_ENV === "production") {
      return null;
    }

    return (
      <span
        ref={ref}
        title="Ambiente com dados demonstrativos fictícios"
        className={cn(
          "inline-flex items-center gap-1 rounded-pill font-extrabold uppercase tracking-widest select-none border border-gold/30 bg-gold/10 text-gold",
          size === "sm" && "px-2 py-0.5 text-[8px]",
          size === "md" && "px-2.5 py-1 text-[10px]",
          size === "lg" && "px-3 py-1.5 text-xs",
          className
        )}
        {...props}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        {text}
      </span>
    );
  }
);
DemoWatermark.displayName = "DemoWatermark";
