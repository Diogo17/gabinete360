"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Organization, Membership, UserProfile, UserRole } from "@gabinete360/types";

export interface OrganizationContextValue {
  organization: Organization | null;
  slug: string;
  membership: Membership | null;
  role: UserRole | null;
  profile: UserProfile | null;
  availableOrganizations: Organization[];
  isLoading: boolean;
  switchOrganization: (slug: string) => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const DEFAULT_DEMO_ORGS: Organization[] = [
  {
    id: "org-mariana-costa",
    platform_tenant_id: "ten-mariana-costa",
    name: "Gabinete Mariana Costa",
    slug: "mariana-costa",
    kind: "individual",
    status: "active",
    parliamentarian_name: "Mariana Costa",
    municipality: "Santos",
    state: "SP",
    created_at: new Date("2026-01-15T10:00:00Z").toISOString(),
  },
  {
    id: "org-camara-santos",
    platform_tenant_id: "ten-camara-santos",
    name: "Câmara Municipal de Santos",
    slug: "camara-santos",
    kind: "chamber",
    status: "active",
    parliamentarian_name: "Mesa Diretora",
    municipality: "Santos",
    state: "SP",
    created_at: new Date("2026-01-10T10:00:00Z").toISOString(),
  },
  {
    id: "org-demo-uuid",
    platform_tenant_id: "ten-demo-uuid",
    name: "Gabinete Modelo Demonstração",
    slug: "gabinete-demo",
    kind: "individual",
    status: "active",
    parliamentarian_name: "Gabinete Demonstrativo",
    municipality: "São Paulo",
    state: "SP",
    created_at: new Date("2026-01-01T10:00:00Z").toISOString(),
  },
];

const DEFAULT_MEMBERSHIP: Membership = {
  id: "mem-mariana-owner",
  organization_id: "org-mariana-costa",
  user_id: "usr-mariana-costa",
  role: "owner",
  status: "active",
  joined_at: new Date("2026-01-15T10:00:00Z").toISOString(),
  created_at: new Date("2026-01-15T10:00:00Z").toISOString(),
  profile: {
    user_id: "usr-mariana-costa",
    display_name: "Mariana Costa",
    avatar_path: null,
    phone: "(13) 99876-5432",
    locale: "pt-BR",
    role_title: "Vereadora · 2º Mandato",
  },
};

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export interface OrganizationProviderProps {
  children: React.ReactNode;
  initialSlug?: string;
  initialOrganization?: Organization;
  initialMembership?: Membership;
}

export function OrganizationProvider({
  children,
  initialSlug = "mariana-costa",
  initialOrganization,
  initialMembership,
}: OrganizationProviderProps) {
  const [slug, setSlug] = useState<string>(initialSlug);
  const [availableOrganizations] = useState<Organization[]>(DEFAULT_DEMO_ORGS);
  const [organization, setOrganization] = useState<Organization | null>(() => {
    if (initialOrganization) return initialOrganization;
    return DEFAULT_DEMO_ORGS.find((org) => org.slug === initialSlug) ?? DEFAULT_DEMO_ORGS[0] ?? null;
  });
  const [membership, setMembership] = useState<Membership | null>(() => {
    return initialMembership || DEFAULT_MEMBERSHIP;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const switchOrganization = useCallback(async (targetSlug: string) => {
    setIsLoading(true);
    try {
      const targetOrg = availableOrganizations.find((o) => o.slug === targetSlug);
      if (targetOrg) {
        setSlug(targetSlug);
        setOrganization(targetOrg);
        setMembership((prev) =>
          prev
            ? {
                ...prev,
                organization_id: targetOrg.id,
              }
            : null
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [availableOrganizations]);

  const refreshMembership = useCallback(async () => {
    setIsLoading(true);
    try {
      // Refresh logic hook
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: OrganizationContextValue = {
    organization,
    slug,
    membership,
    role: membership?.role || null,
    profile: membership?.profile || null,
    availableOrganizations,
    isLoading,
    switchOrganization,
    refreshMembership,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
