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
  Settings,
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
  const { organization, profile, parliamentaryProfile } = useOrganization();

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
        {
          label: "Perfil & Portal Público",
          href: "/configuracoes",
          icon: <Settings className="h-4 w-4" />,
          active: isRouteActive("/configuracoes"),
          onClick: () => router.push("/configuracoes"),
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
          href: parliamentaryProfile?.portal_slug
            ? `/portal/${parliamentaryProfile.portal_slug}`
            : "/portal",
          icon: <Globe className="h-4 w-4" />,
          active: isRouteActive("/portal"),
          onClick: () =>
            router.push(
              parliamentaryProfile?.portal_slug
                ? `/portal/${parliamentaryProfile.portal_slug}`
                : "/portal"
            ),
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
      orgName={organization?.name || "Gabinete"}
      orgSubtitle={organization?.kind === "chamber" ? "Câmara Municipal" : organization?.municipality ? `${organization.municipality} · ${organization.state}` : "Mandato Parlamentar"}
      orgInitials={organization?.name?.substring(0, 2).toUpperCase() || "G3"}
      userName={profile?.display_name || parliamentaryProfile?.legislator_name || "Usuário"}
      userRole={
        profile?.institutional_role ||
        profile?.role_title ||
        (parliamentaryProfile?.legislature_number
          ? `Vereador (${parliamentaryProfile.legislature_number})`
          : "Membro da Equipe")
      }
      userAvatarSrc={profile?.avatar_path || parliamentaryProfile?.avatar_url || organization?.avatar_url || undefined}
      userInitials={profile?.display_name?.substring(0, 2).toUpperCase() || "US"}
      navGroups={navGroups}
      breadcrumbs={defaultBreadcrumbs}
      notificationCount={0}
      showDemoWatermark={false}
      onLogoutClick={async () => {
        await signOut();
      }}
      onProfileClick={() => {
        router.push("/configuracoes");
      }}
      topbarActions={
        <div className="flex items-center gap-2">
          <OrganizationSwitcher />
          {topbarActions}
        </div>
      }
      sidebarFooter={
        <div className="rounded-md bg-paper border border-line p-2 text-center text-[10px] text-muted">
          <span className="font-semibold text-green">Gabinete 360°</span> v1.0 MVP
          <div className="text-[9px] text-muted/80">Ambiente de Produção</div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
