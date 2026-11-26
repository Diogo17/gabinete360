"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type {
  Organization,
  Membership,
  UserProfile,
  UserRole,
  ParliamentaryProfile,
} from "@gabinete360/types";
import { createClient } from "../supabase/client";

export interface OrganizationContextValue {
  organization: Organization | null;
  slug: string;
  membership: Membership | null;
  role: UserRole | null;
  profile: UserProfile | null;
  parliamentaryProfile: ParliamentaryProfile | null;
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
  const [parliamentaryProfile, setParliamentaryProfile] = useState<ParliamentaryProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialOrganization);

  const loadParliamentaryProfile = useCallback(async (orgId: string | undefined) => {
    if (!orgId) {
      setParliamentaryProfile(null);
      return;
    }
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("parliamentary_profiles")
        .select("*")
        .eq("organization_id", orgId)
        .maybeSingle();
      setParliamentaryProfile((data as ParliamentaryProfile | null) ?? null);
    } catch {
      setParliamentaryProfile(null);
    }
  }, []);

  useEffect(() => {
    if (initialOrganization && initialMembership) return;

    async function loadUserContext() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: memberships, error: memErr } = await supabase
          .from("memberships")
          .select("*, organization:organizations(*)")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (memErr || !memberships || memberships.length === 0) {
          setIsLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const orgs = memberships
          .map((m: any) => m.organization)
          .filter(Boolean) as Organization[];
        setAvailableOrganizations(orgs);

        const targetMembership = initialSlug
          ? memberships.find((m: any) => m.organization?.slug === initialSlug) || memberships[0]
          : memberships[0];

        if (targetMembership) {
          const orgObj = (targetMembership.organization || null) as Organization | null;
          setOrganization(orgObj);
          setSlug(orgObj?.slug || "");
          setMembership({
            id: targetMembership.id,
            organization_id: targetMembership.organization_id,
            user_id: targetMembership.user_id,
            role: targetMembership.role || "parliamentarian",
            status: targetMembership.status,
            joined_at: targetMembership.joined_at,
            created_at: targetMembership.created_at,
            profile: profileData || null,
          });
          await loadParliamentaryProfile(orgObj?.id);
        }
      } catch (err) {
        console.error("Erro ao carregar contexto de organização:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserContext();
  }, [initialOrganization, initialMembership, initialSlug, loadParliamentaryProfile]);

  const switchOrganization = useCallback(
    async (targetSlug: string) => {
      setIsLoading(true);
      try {
        const targetOrg = availableOrganizations.find((o) => o.slug === targetSlug);
        if (!targetOrg) return;

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: mem }, { data: profileData }] = await Promise.all([
          supabase
            .from("memberships")
            .select("*")
            .eq("user_id", user.id)
            .eq("organization_id", targetOrg.id)
            .eq("status", "active")
            .maybeSingle(),
          supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        ]);

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
            profile: profileData || null,
          });
        }
        await loadParliamentaryProfile(targetOrg.id);
      } finally {
        setIsLoading(false);
      }
    },
    [availableOrganizations, loadParliamentaryProfile]
  );

  const refreshMembership = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !organization) return;

      const [{ data: mem }, { data: orgData }, { data: profileData }] = await Promise.all([
        supabase
          .from("memberships")
          .select("*")
          .eq("user_id", user.id)
          .eq("organization_id", organization.id)
          .eq("status", "active")
          .maybeSingle(),
        supabase.from("organizations").select("*").eq("id", organization.id).maybeSingle(),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      if (orgData) {
        const updatedOrg = orgData as Organization;
        setOrganization(updatedOrg);
        setAvailableOrganizations((prev) =>
          prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o))
        );
      }

      if (mem) {
        setMembership({
          id: mem.id,
          organization_id: mem.organization_id,
          user_id: mem.user_id,
          role: mem.role,
          status: mem.status,
          joined_at: mem.joined_at,
          created_at: mem.created_at,
          profile: profileData || null,
        });
      }
      await loadParliamentaryProfile(organization.id);
    } finally {
      setIsLoading(false);
    }
  }, [organization, loadParliamentaryProfile]);

  const value: OrganizationContextValue = {
    organization,
    slug,
    membership,
    role: membership?.role || null,
    profile: membership?.profile || null,
    parliamentaryProfile,
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
