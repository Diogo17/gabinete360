"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-floating transition-opacity duration-150 animate-in fade-in",
            position === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
            position === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-1.5",
            position === "left" && "right-full top-1/2 -translate-y-1/2 mr-1.5",
            position === "right" && "left-full top-1/2 -translate-y-1/2 ml-1.5",
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
