"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Organization, Membership, UserProfile, UserRole } from "@gabinete360/types";
import { createClient } from "../supabase/client";

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

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export interface OrganizationProviderProps {
  children: React.ReactNode;
  initialSlug?: string;
  initialOrganization?: Organization | null;
  initialMembership?: Membership | null;
  initialOrganizations?: Organization[];
}

export function OrganizationProvider({
  children,
  initialSlug = "",
  initialOrganization = null,
  initialMembership = null,
  initialOrganizations = [],
}: OrganizationProviderProps) {
  const [slug, setSlug] = useState<string>(initialSlug);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>(initialOrganizations);
  const [organization, setOrganization] = useState<Organization | null>(initialOrganization);
  const [membership, setMembership] = useState<Membership | null>(initialMembership);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrganization);

  // Fetch real organizations and membership from Supabase on mount
  useEffect(() => {
    if (initialOrganization && initialMembership) return;

    async function loadUserContext() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch active memberships with organization data
        const { data: memberships, error: memErr } = await supabase
          .from("memberships")
          .select("*, organization:organizations(*), profile:profiles(*)")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (memErr || !memberships || memberships.length === 0) {
          setIsLoading(false);
          return;
        }

        // Set available organizations from memberships
        const orgs = memberships
          .map((m: any) => m.organization)
          .filter(Boolean) as Organization[];
        setAvailableOrganizations(orgs);

        // Select first organization or match initial slug
        const targetMembership = initialSlug
          ? memberships.find((m: any) => m.organization?.slug === initialSlug) || memberships[0]
          : memberships[0];

        if (targetMembership) {
          setOrganization(targetMembership.organization || null);
          setSlug(targetMembership.organization?.slug || "");
          setMembership({
            id: targetMembership.id,
            organization_id: targetMembership.organization_id,
            user_id: targetMembership.user_id,
            role: targetMembership.role,
            status: targetMembership.status,
            joined_at: targetMembership.joined_at,
            created_at: targetMembership.created_at,
            profile: targetMembership.profile || null,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar contexto de organização:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserContext();
  }, [initialOrganization, initialMembership, initialSlug]);

  const switchOrganization = useCallback(async (targetSlug: string) => {
    setIsLoading(true);
    try {
      const targetOrg = availableOrganizations.find((o) => o.slug === targetSlug);
      if (!targetOrg) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mem } = await supabase
        .from("memberships")
        .select("*, profile:profiles(*)")
        .eq("user_id", user.id)
        .eq("organization_id", targetOrg.id)
        .eq("status", "active")
        .maybeSingle();

      setSlug(targetSlug);
      setOrganization(targetOrg);
      if (mem) {
        setMembership({
          id: mem.id,
          organization_id: mem.organization_id,
          user_id: mem.user_id,
          role: mem.role,
          status: mem.status,
          joined_at: mem.joined_at,
          created_at: mem.created_at,
          profile: mem.profile || null,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [availableOrganizations]);

  const refreshMembership = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !organization) return;

      const { data: mem } = await supabase
        .from("memberships")
        .select("*, profile:profiles(*)")
        .eq("user_id", user.id)
        .eq("organization_id", organization.id)
        .eq("status", "active")
        .maybeSingle();

      if (mem) {
        setMembership({
          id: mem.id,
          organization_id: mem.organization_id,
          user_id: mem.user_id,
          role: mem.role,
          status: mem.status,
          joined_at: mem.joined_at,
          created_at: mem.created_at,
          profile: mem.profile || null,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [organization]);

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
