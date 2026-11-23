"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Sidebar, type NavGroup } from "./sidebar";
import { Topbar, type BreadcrumbCrumb } from "./topbar";
import { MobileNav } from "./mobile-nav";

export interface AppShellProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
  logoText?: string;
  orgName?: string;
  orgSubtitle?: string;
  orgInitials?: string;
  navGroups: NavGroup[];
  breadcrumbs?: BreadcrumbCrumb[];
  userName?: string;
  userRole?: string;
  userAvatarSrc?: string;
  userInitials?: string;
  notificationCount?: number;
  topbarActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  showDemoWatermark?: boolean;
  className?: string;
}

export function AppShell({
  children,
  brandTitle = "Gabinete 360°",
  brandSubtitle = "DM IA STUDIO",
  logoText = "360°",
  orgName,
  orgSubtitle,
  orgInitials,
  navGroups,
  breadcrumbs = [],
  userName = "Mariana Costa",
  userRole = "Vereadora",
  userAvatarSrc,
  userInitials = "MC",
  notificationCount = 0,
  topbarActions,
  sidebarFooter,
  showDemoWatermark = true,
  className,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full bg-paper text-ink font-body">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          brandTitle={brandTitle}
          brandSubtitle={brandSubtitle}
          logoText={logoText}
          orgName={orgName}
          orgSubtitle={orgSubtitle}
          orgInitials={orgInitials}
          groups={navGroups}
          footer={sidebarFooter}
        />
      </div>

      {/* Mobile Sliding Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        logoText={logoText}
        orgName={orgName}
        orgSubtitle={orgSubtitle}
        orgInitials={orgInitials}
        groups={navGroups}
        footer={sidebarFooter}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          breadcrumbs={breadcrumbs}
          userName={userName}
          userRole={userRole}
          userAvatarSrc={userAvatarSrc}
          userInitials={userInitials}
          notificationCount={notificationCount}
          onMobileMenuClick={() => setMobileNavOpen(true)}
          actions={topbarActions}
          showDemoWatermark={showDemoWatermark}
        />

        <main
          className={cn(
            "flex-1 w-full max-w-[1360px] mx-auto px-4 py-6 sm:px-6 md:px-8 md:py-8",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
