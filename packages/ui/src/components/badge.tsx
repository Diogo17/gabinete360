import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[9px] md:text-[10px] font-bold tracking-wide transition-colors whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        green: "bg-tag-greenBg text-tag-greenText border border-green/10",
        amber: "bg-tag-amberBg text-tag-amberText border border-gold/15",
        blue: "bg-tag-blueBg text-tag-blueText border border-blue/15",
        red: "bg-tag-redBg text-tag-redText border border-red/15",
        neutral: "bg-paper text-muted border border-line",
        primary: "bg-green text-white",
        outline: "border border-line bg-transparent text-ink",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              variant === "green" && "bg-green",
              variant === "amber" && "bg-gold",
              variant === "blue" && "bg-blue",
              variant === "red" && "bg-red",
              (!variant || variant === "neutral" || variant === "outline") && "bg-muted"
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
