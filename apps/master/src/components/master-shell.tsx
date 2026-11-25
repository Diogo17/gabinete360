"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppShell,
  Badge,
  DemoWatermark,
  type BreadcrumbCrumb,
} from "@gabinete360/ui";
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShieldCheck,
  Cpu,
  Activity,
  FileText,
  LifeBuoy,
  User,
} from "lucide-react";
import { adminSignOut } from "../lib/auth/actions";

export interface MasterShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  breadcrumbs?: BreadcrumbCrumb[];
  actions?: React.ReactNode;
}

export function MasterShell({
  children,
  title,
  subtitle,
  badgeText = "Infraestrutura Operacional",
  breadcrumbs,
  actions,
}: MasterShellProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const isCurrent = (path: string) => {
    if (path === "/" || path === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const navGroups = [
    {
      label: "Control Plane",
      items: [
        {
          label: "Dashboard Master",
          icon: <LayoutDashboard className="h-4 w-4" />,
          active: isCurrent("/"),
          onClick: () => router.push("/"),
        },
        {
          label: "Gestão de Clientes",
          icon: <Users className="h-4 w-4" />,
          active: isCurrent("/clientes"),
          badge: "18",
          onClick: () => router.push("/clientes"),
        },
        {
          label: "Organizações & Gabinetes",
          icon: <Building2 className="h-4 w-4" />,
          active: isCurrent("/organizacoes"),
          badge: "49",
          onClick: () => router.push("/organizacoes"),
        },
        {
          label: "Planos & Módulos",
          icon: <Package className="h-4 w-4" />,
          active: isCurrent("/planos"),
          onClick: () => router.push("/planos"),
        },
      ],
    },
    {
      label: "Governança & Segurança",
      items: [
        {
          label: "Administradores (MFA)",
          icon: <ShieldCheck className="h-4 w-4" />,
          active: isCurrent("/administradores"),
          badge: "MFA",
          onClick: () => router.push("/administradores"),
        },
        {
          label: "Provisionamento",
          icon: <Cpu className="h-4 w-4" />,
          active: isCurrent("/provisionamento"),
          badge: "2 ativ.",
          onClick: () => router.push("/provisionamento"),
        },
        {
          label: "Monitoramento & Saúde",
          icon: <Activity className="h-4 w-4" />,
          active: isCurrent("/monitoramento"),
          badge: "100%",
          onClick: () => router.push("/monitoramento"),
        },
        {
          label: "Auditoria Administrativa",
          icon: <FileText className="h-4 w-4" />,
          active: isCurrent("/auditoria"),
          onClick: () => router.push("/auditoria"),
        },
        {
          label: "Suporte & Acesso JIT",
          icon: <LifeBuoy className="h-4 w-4" />,
          active: isCurrent("/suporte"),
          badge: "1 pend.",
          onClick: () => router.push("/suporte"),
        },
      ],
    },
  ];

  const defaultBreadcrumbs: BreadcrumbCrumb[] = [
    { label: "Master", href: "/" },
    { label: title || "Visão Geral", current: true },
  ];

  return (
    <AppShell
      brandTitle="DM IA Studio"
      brandSubtitle="CONTROL PLANE"
      logoText="DM"
      userName="Operador Master"
      userRole="Platform Admin · MFA Ativo"
      userInitials="DM"
      navGroups={navGroups}
      breadcrumbs={breadcrumbs || defaultBreadcrumbs}
      notificationCount={2}
      topbarActions={actions}
      showDemoWatermark={false}
      onLogoutClick={async () => {
        await adminSignOut();
      }}
      onProfileClick={() => {
        router.push("/administradores");
      }}
    >
      <div className="space-y-6">
        {title && (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-green">
                  Painel Master DM IA Studio
                </span>
              </div>
              <h1 className="mt-1 font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-muted">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="green" dot>
                {badgeText}
              </Badge>
            </div>
          </div>
        )}
        {children}
      </div>
    </AppShell>
  );
}
