import * as React from "react";
import { cn } from "../../lib/utils";
import { Avatar } from "../avatar";

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  badgeVariant?: "green" | "amber" | "blue" | "red" | "neutral";
  onClick?: () => void;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brandTitle?: string;
  brandSubtitle?: string;
  logoText?: string;
  logoNode?: React.ReactNode;
  orgName?: string;
  orgSubtitle?: string;
  orgInitials?: string;
  groups: NavGroup[];
  footer?: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      brandTitle = "Gabinete 360°",
      brandSubtitle = "DM IA STUDIO",
      logoText = "360°",
      logoNode,
      orgName,
      orgSubtitle,
      orgInitials = "GD",
      groups,
      footer,
      ...props
    },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={cn(
          "flex h-screen w-60 shrink-0 flex-col border-r border-line bg-white select-none transition-all duration-200",
          className
        )}
        {...props}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          {logoNode || (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-squircle bg-green text-white font-heading text-sm font-extrabold shadow-sm">
              {logoText}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="truncate font-heading text-sm font-extrabold tracking-tight text-ink">
              {brandTitle}
            </span>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
              {brandSubtitle}
            </span>
          </div>
        </div>

        {/* Org Banner (Optional) */}
        {orgName && (
          <div className="flex items-center gap-2.5 border-b border-line bg-paper/60 px-4 py-3">
            <Avatar initials={orgInitials} name={orgName} size="sm" paletteIndex={1} />
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-bold text-ink leading-tight">
                {orgName}
              </span>
              {orgSubtitle && (
                <span className="truncate text-[10px] text-muted">
                  {orgSubtitle}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-[#a4ada8]">
                {group.label}
              </div>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-medium transition-colors text-left",
                      item.active
                        ? "bg-mint text-green font-bold shadow-xs"
                        : "text-[#65736d] hover:bg-mint/40 hover:text-ink"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon && (
                        <span className="shrink-0 text-current">{item.icon}</span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "rounded-pill px-1.5 py-0.2 text-[9px] font-bold",
                          item.active
                            ? "bg-green text-white"
                            : "bg-paper text-muted border border-line"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        {footer && (
          <div className="border-t border-line p-3">
            {footer}
          </div>
        )}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";
