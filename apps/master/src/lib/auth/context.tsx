"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { PlatformAdmin } from "@gabinete360/types";

export interface MasterAdminContextValue {
  admin: PlatformAdmin | null;
  mfaVerified: boolean;
  isLoading: boolean;
  setMfaVerified: (verified: boolean) => void;
  signOut: () => Promise<void>;
}

const DEFAULT_MASTER_ADMIN: PlatformAdmin = {
  id: "adm-master-root",
  auth_user_id: "usr-admin-root",
  display_name: "Super Admin DM IA",
  email: "admin@dmiastudio.com",
  status: "active",
  mfa_required: true,
  mfa_enabled: true,
  role: "platform_super_admin",
  created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  last_login_at: new Date().toISOString(),
};

const MasterAdminContext = createContext<MasterAdminContextValue | undefined>(undefined);

export interface MasterAdminProviderProps {
  children: React.ReactNode;
  initialAdmin?: PlatformAdmin;
  initialMfaVerified?: boolean;
}

export function MasterAdminProvider({
  children,
  initialAdmin,
  initialMfaVerified = true,
}: MasterAdminProviderProps) {
  const [admin] = useState<PlatformAdmin | null>(() => initialAdmin || DEFAULT_MASTER_ADMIN);
  const [mfaVerified, setMfaVerified] = useState<boolean>(initialMfaVerified);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: MasterAdminContextValue = {
    admin,
    mfaVerified,
    isLoading,
    setMfaVerified,
    signOut,
  };

  return (
    <MasterAdminContext.Provider value={value}>
      {children}
    </MasterAdminContext.Provider>
  );
}

export function useMasterAdmin(): MasterAdminContextValue {
  const context = useContext(MasterAdminContext);
  if (!context) {
    throw new Error("useMasterAdmin must be used within a MasterAdminProvider");
  }
  return context;
}
