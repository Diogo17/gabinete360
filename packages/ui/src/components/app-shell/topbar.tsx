import * as React from "react";
import { Bell, Menu, Sun, Moon, LogOut, User } from "lucide-react";
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
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
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
      onLogoutClick,
      onProfileClick,
      actions,
      showDemoWatermark = true,
      ...props
    },
    ref
  ) => {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
      // Checa tema salvo no localStorage ou preferência do sistema
      const saved = localStorage.getItem("gabinete360_theme");
      if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    }, []);

    const toggleTheme = () => {
      if (isDark) {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("gabinete360_theme", "light");
      } else {
        setIsDark(true);
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("gabinete360_theme", "dark");
      }
    };

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-30 flex h-14 md:h-16 w-full shrink-0 items-center justify-between border-b border-line bg-card/95 px-3 md:px-6 backdrop-blur-xs select-none transition-all",
          className
        )}
        {...props}
      >
        {/* Left: Mobile hamburger + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onMobileMenuClick && (
            <button
              type="button"
              onClick={onMobileMenuClick}
              className="md:hidden rounded-md p-1.5 text-muted hover:text-ink hover:bg-muted-bg transition-colors"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-muted/60">/</span>}
                  <span
                    className={cn(
                      "truncate font-medium text-[11px] sm:text-xs",
                      crumb.current
                        ? "font-bold text-foreground"
                        : "text-muted hover:text-foreground transition-colors cursor-pointer"
                    )}
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Theme Toggle, Actions, Demo Watermark, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showDemoWatermark && (
            <div className="hidden sm:block">
              <DemoWatermark size="sm" />
            </div>
          )}

          {actions}

          {/* Theme Toggle Button (Modo Escuro / Noturno) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-line bg-card text-muted hover:border-primary hover:text-foreground transition-colors shadow-2xs"
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            title={isDark ? "Modo Claro" : "Modo Noturno"}
          >
            {isDark ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-line bg-card text-muted hover:border-muted hover:text-foreground transition-colors shadow-2xs"
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
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1 border-l border-line ml-0.5 sm:ml-1">
            <button
              type="button"
              onClick={onProfileClick}
              className="flex items-center gap-1.5 sm:gap-2 text-left p-1 rounded-md hover:bg-muted-bg transition-colors"
              title="Meu Perfil e Acessos"
            >
              <Avatar
                name={userName}
                initials={userInitials}
                src={userAvatarSrc}
                size="md"
                paletteIndex={0}
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-foreground leading-tight hover:underline flex items-center gap-1">
                  {userName}
                </span>
                {userRole && (
                  <span className="text-[10px] text-muted">
                    {userRole}
                  </span>
                )}
              </div>
            </button>

            {/* Logout Action Button */}
            {onLogoutClick && (
              <button
                type="button"
                onClick={onLogoutClick}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-line bg-card text-muted hover:border-red hover:text-red hover:bg-red/5 transition-colors shadow-2xs ml-0.5"
                title="Sair do Sistema (Logout)"
                aria-label="Sair do Sistema"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }
);
Topbar.displayName = "Topbar";
