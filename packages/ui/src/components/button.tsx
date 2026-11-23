import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-green text-white hover:bg-green-hover active:bg-green-dark shadow-sm",
        secondary:
          "bg-mint text-green hover:bg-mint-dark font-semibold",
        outline:
          "border border-line bg-white text-ink hover:bg-paper hover:border-line-dark",
        ghost:
          "text-muted hover:text-ink hover:bg-mint/60",
        danger:
          "bg-red text-white hover:bg-red-hover active:bg-red/90 shadow-sm",
        gold:
          "bg-gold text-white hover:bg-gold-hover active:bg-gold/90 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-sm gap-1.5",
        md: "h-10 px-4 text-sm rounded-md gap-2",
        lg: "h-12 px-6 text-base rounded-lg gap-2.5",
        icon: "h-9 w-9 rounded-full p-0 flex items-center justify-center",
        circle: "h-[34px] w-[34px] rounded-full border border-line bg-white text-muted hover:text-ink hover:border-muted p-0 flex items-center justify-center shadow-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
