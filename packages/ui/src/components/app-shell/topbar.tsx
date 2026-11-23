import * as React from "react";
import { Bell, Menu } from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar } from "../avatar";
import { DemoWatermark } from "../demo-watermark";

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
  current?: boolean;
}

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  breadcrumbs?: BreadcrumbCrumb[];
  userName?: string;
  userRole?: string;
  userAvatarSrc?: string;
  userInitials?: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onMobileMenuClick?: () => void;
  actions?: React.ReactNode;
  showDemoWatermark?: boolean;
}

export const Topbar = React.forwardRef<HTMLElement, TopbarProps>(
  (
    {
      className,
      breadcrumbs = [],
      userName = "Usuário",
      userRole,
      userAvatarSrc,
      userInitials = "US",
      notificationCount = 0,
      onNotificationClick,
      onMobileMenuClick,
      actions,
      showDemoWatermark = true,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-30 flex h-16 md:h-[70px] w-full shrink-0 items-center justify-between border-b border-line bg-white/95 px-4 md:px-8 backdrop-blur-xs select-none transition-all",
          className
        )}
        {...props}
      >
        {/* Left: Mobile hamburger + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {onMobileMenuClick && (
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="md:hidden rounded-md p-1.5 text-muted hover:text-ink hover:bg-paper"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-[#bdc5c0]">/</span>}
                  <span
                    className={cn(
                      "truncate font-medium",
                      crumb.current
                        ? "font-bold text-ink"
                        : "text-muted hover:text-ink transition-colors cursor-pointer"
                    )}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Actions, Demo Watermark, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {showDemoWatermark && <DemoWatermark size="sm" />}

          {actions}

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-line bg-white text-muted hover:border-muted hover:text-ink transition-colors shadow-2xs"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red px-1 text-[8px] font-extrabold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 border-l border-line ml-1">
            <Avatar
              name={userName}
              initials={userInitials}
              src={userAvatarSrc}
              size="md"
              paletteIndex={0}
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-ink leading-tight">
                {userName}
              </span>
              {userRole && (
                <span className="text-[10px] text-muted">
                  {userRole}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
);
Topbar.displayName = "Topbar";
