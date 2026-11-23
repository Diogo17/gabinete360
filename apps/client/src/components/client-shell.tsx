"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganization } from "../lib/tenant/context";
import { OrganizationSwitcher } from "./org-switcher";
import { signOut } from "../lib/auth/actions";
import { AppShell } from "@gabinete360/ui";
import type { BreadcrumbCrumb, NavGroup } from "@gabinete360/ui";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Calendar,
  CheckSquare,
  FileSpreadsheet,
  Search,
  MessageCircle,
  Sparkles,
  Shield,
  HelpCircle,
  UserCheck,
  Globe,
} from "lucide-react";

export interface ClientShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbCrumb[];
  topbarActions?: React.ReactNode;
}

export function ClientShell({
  children,
  breadcrumbs,
  topbarActions,
}: ClientShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization, profile } = useOrganization();

  const isRouteActive = (routePath: string) => {
    if (routePath === "/" || routePath === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(routePath);
  };

  const navGroups: NavGroup[] = [
    {
      label: "Core do Mandato",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-4 w-4" />,
          active: isRouteActive("/"),
          onClick: () => router.push("/"),
        },
        {
          label: "Atendimentos",
          href: "/demandas",
          icon: <Inbox className="h-4 w-4" />,
          badge: "8",
          badgeVariant: "amber",
          active: isRouteActive("/demandas"),
          onClick: () => router.push("/demandas"),
        },
        {
          label: "CRM de Cidadãos",
          href: "/cidadaos",
          icon: <Users className="h-4 w-4" />,
          active: isRouteActive("/cidadaos"),
          onClick: () => router.push("/cidadaos"),
        },
        {
          label: "Agenda Parlamentar",
          href: "/agenda",
          icon: <Calendar className="h-4 w-4" />,
          badge: "3",
          badgeVariant: "green",
          active: isRouteActive("/agenda"),
          onClick: () => router.push("/agenda"),
        },
        {
          label: "Tarefas da Equipe",
          href: "/tarefas",
          icon: <CheckSquare className="h-4 w-4" />,
          active: isRouteActive("/tarefas"),
          onClick: () => router.push("/tarefas"),
        },
      ],
    },
    {
      label: "Gestão do Gabinete",
      items: [
        {
          label: "Equipe do Mandato",
          href: "/equipe",
          icon: <UserCheck className="h-4 w-4" />,
          active: isRouteActive("/equipe"),
          onClick: () => router.push("/equipe"),
        },
      ],
    },
    {
      label: "Atuação Parlamentar",
      items: [
        {
          label: "Gestão Legislativa",
          href: "/legislativo",
          icon: <FileSpreadsheet className="h-4 w-4" />,
          active: isRouteActive("/legislativo"),
          onClick: () => router.push("/legislativo"),
        },
        {
          label: "Fiscalização",
          href: "/fiscalizacao",
          icon: <Search className="h-4 w-4" />,
          active: isRouteActive("/fiscalizacao"),
          onClick: () => router.push("/fiscalizacao"),
        },
        {
          label: "Participação Popular",
          href: "/participacao",
          icon: <HelpCircle className="h-4 w-4" />,
          active: isRouteActive("/participacao"),
          onClick: () => router.push("/participacao"),
        },
        {
          label: "Canal de Denúncias",
          href: "/denuncias",
          icon: <Shield className="h-4 w-4" />,
          active: isRouteActive("/denuncias"),
          onClick: () => router.push("/denuncias"),
        },
      ],
    },
    {
      label: "Comunicação & IA",
      items: [
        {
          label: "WhatsApp Inbox",
          href: "/whatsapp",
          icon: <MessageCircle className="h-4 w-4" />,
          badge: "5",
          badgeVariant: "blue",
          active: isRouteActive("/whatsapp"),
          onClick: () => router.push("/whatsapp"),
        },
        {
          label: "IA Assistiva",
          href: "/ia",
          icon: <Sparkles className="h-4 w-4" />,
          active: isRouteActive("/ia"),
          onClick: () => router.push("/ia"),
        },
      ],
    },
    {
      label: "Transparência & Cidadão",
      items: [
        {
          label: "Portal Público do Mandato",
          href: "/portal",
          icon: <Globe className="h-4 w-4" />,
          active: isRouteActive("/portal"),
          onClick: () => router.push("/portal"),
        },
      ],
    },
  ];

  const defaultBreadcrumbs: BreadcrumbCrumb[] = breadcrumbs || [
    { label: "Início", href: "/" },
    { label: "Gabinete Operacional", current: true },
  ];

  return (
    <AppShell
      brandTitle="Gabinete 360°"
      brandSubtitle="DM IA STUDIO"
      logoText="360°"
      orgName={organization?.name || "Gabinete Mariana Costa"}
      orgSubtitle={organization?.kind === "chamber" ? "Câmara Municipal" : "Câmara de Santos · SP"}
      orgInitials={organization?.name?.substring(0, 2).toUpperCase() || "MC"}
      userName={profile?.display_name || "Mariana Costa"}
      userRole={profile?.role_title || "Vereadora · 2º Mandato"}
      userInitials="MC"
      navGroups={navGroups}
      breadcrumbs={defaultBreadcrumbs}
      notificationCount={3}
      showDemoWatermark={process.env.NEXT_PUBLIC_DEMO_MODE === "true"}
      onLogoutClick={async () => {
        await signOut();
      }}
      onProfileClick={() => {
        router.push("/equipe");
      }}
      topbarActions={
        <div className="flex items-center gap-2">
          <OrganizationSwitcher />
          <a
            href="/master/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-line bg-paper text-ink hover:bg-mint hover:text-green hover:border-green/30 transition-all"
            title="Acessar o Painel de Controle Master (DM IA Studio)"
          >
            <Shield className="h-3.5 w-3.5 text-green" /> Painel Master
          </a>
          {topbarActions}
        </div>
      }
      sidebarFooter={
        <div className="rounded-md bg-paper border border-line p-2 text-center text-[10px] text-muted">
          <span className="font-semibold text-green">Gabinete 360°</span> v1.0 MVP
          <div className="text-[9px] text-muted/80">Ambiente de Demonstração</div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
