import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, rows = 3, ...props }, ref) => {
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
        <textarea
          id={inputId}
          rows={rows}
          ref={ref}
          className={cn(
            "flex w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
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
Textarea.displayName = "Textarea";
