import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-ink"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red focus-visible:ring-red",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-medium text-red">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
