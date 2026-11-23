import * as React from "react";
import { cn } from "../lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, helperText, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-ink"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-line bg-white px-3 py-2 text-sm text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 pr-8",
              error && "border-red focus-visible:ring-red",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-red">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
