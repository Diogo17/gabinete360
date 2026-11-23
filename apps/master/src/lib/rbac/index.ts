import { getMasterAdminSession } from "../auth/actions";
import { createAdminClient } from "../supabase/server";

export interface AdminCriticalCheckParams {
  email: string;
  mfa_verified: boolean;
}

/**
 * Validates that an administrator has completed MFA TOTP verification (AAL2).
 * Required for critical operations: provisioning, tenant suspension, schema updates.
 */
export function executeAdminCriticalAction(admin: AdminCriticalCheckParams) {
  if (!admin.mfa_verified) {
    throw new Error("AAL2_REQUIRED: Operação crítica requer step-up MFA TOTP");
  }
  return {
    success: true,
    authorizedAdmin: admin.email,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Server-side guard to verify current caller is an authenticated Master Admin with MFA verified.
 */
export async function requireMasterAdmin() {
  const { user, mfaVerified } = await getMasterAdminSession();

  if (!user) {
    throw new Error("UNAUTHORIZED: Sessão de administrador não encontrada.");
  }

  if (!mfaVerified) {
    throw new Error("AAL2_REQUIRED: Operação crítica requer step-up MFA TOTP");
  }

  return {
    user,
    mfaVerified,
  };
}

export interface PlatformAuditLogParams {
  action: string;
  resourceType: string;
  resourceId?: string | null;
  tenantId?: string | null;
  result?: "success" | "denied" | "failure";
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Records an append-only platform audit entry in the Control Plane database.
 */
export async function logPlatformAuditEvent(params: PlatformAuditLogParams) {
  try {
    const adminClient = await createAdminClient();
    const { error } = await adminClient.from("platform_audit_events").insert({
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      tenant_id: params.tenantId || null,
      result: params.result || "success",
      reason: params.reason || null,
      metadata_minimized: params.metadata || {},
    });

    if (error) {
      console.warn("Falha ao registrar auditoria de plataforma:", error.message);
    }
  } catch (err: unknown) {
    console.warn("Audit logger bypass in local mock:", err instanceof Error ? err.message : err);
  }
}
