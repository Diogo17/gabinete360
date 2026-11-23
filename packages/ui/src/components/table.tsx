import * as React from "react";
import { cn } from "../lib/utils";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-left text-xs text-ink", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const Thead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("border-b border-line bg-paper/60", className)} {...props} />
));
Thead.displayName = "Thead";

export const Tbody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-[#f0f3f1] [&_tr:last-child]:border-0", className)}
    {...props}
  />
));
Tbody.displayName = "Tbody";

export const Tr = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-[#fafcfa] data-[state=selected]:bg-mint/40",
      className
    )}
    {...props}
  />
));
Tr.displayName = "Tr";

export const Th = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-3.5 py-2.5 text-left text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[#98a39d] select-none",
      className
    )}
    {...props}
  />
));
Th.displayName = "Th";

export const Td = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-3.5 py-3 align-middle text-xs text-ink", className)}
    {...props}
  />
));
Td.displayName = "Td";
