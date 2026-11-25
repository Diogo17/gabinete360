"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { PlatformAdmin } from "@gabinete360/types";
import { adminSignOut } from "./actions";

export interface MasterAdminContextValue {
  admin: PlatformAdmin | null;
  mfaVerified: boolean;
  isLoading: boolean;
  setAdmin: (admin: PlatformAdmin | null) => void;
  setMfaVerified: (verified: boolean) => void;
  signOut: () => Promise<void>;
}

const MasterAdminContext = createContext<MasterAdminContextValue | undefined>(undefined);

export interface MasterAdminProviderProps {
  children: React.ReactNode;
  initialAdmin?: PlatformAdmin | null;
  initialMfaVerified?: boolean;
}

export function MasterAdminProvider({
  children,
  initialAdmin = null,
  initialMfaVerified = false,
}: MasterAdminProviderProps) {
  const [admin, setAdmin] = useState<PlatformAdmin | null>(initialAdmin);
  const [mfaVerified, setMfaVerified] = useState<boolean>(initialMfaVerified);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminSignOut();
    } catch {
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: MasterAdminContextValue = {
    admin,
    mfaVerified,
    isLoading,
    setAdmin,
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
