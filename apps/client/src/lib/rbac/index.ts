import type { UserRole } from "@gabinete360/types";
import { getCurrentMembership } from "../auth/actions";

export type CabinetRole =
  | "parliamentarian"
  | "chief_of_staff"
  | "staff"
  | "owner"
  | "admin"
  | "advisor"
  | "assistant"
  | "attendant"
  | "intern"
  | "citizen";

const OWNER_PERMISSIONS = [
  "demands.create",
  "demands.edit",
  "demands.delete",
  "team.manage",
  "settings.edit",
  "reports.view",
  "agenda.create",
  "agenda.edit",
  "agenda.delete",
  "citizens.create",
  "citizens.edit",
  "citizens.delete",
  "legislative.manage",
  "inspections.manage",
];

const ADMIN_PERMISSIONS = [
  "demands.create",
  "demands.edit",
  "demands.delete",
  "team.manage",
  "settings.edit",
  "reports.view",
  "agenda.create",
  "agenda.edit",
  "citizens.create",
  "citizens.edit",
  "legislative.manage",
  "inspections.manage",
];

const ADVISOR_PERMISSIONS = [
  "demands.create",
  "demands.edit",
  "agenda.create",
  "citizens.create",
  "citizens.edit",
  "legislative.create",
  "inspections.create",
];

export const ROLE_PERMISSIONS: Record<CabinetRole, string[]> = {
  parliamentarian: OWNER_PERMISSIONS,
  chief_of_staff: ADMIN_PERMISSIONS,
  staff: ADVISOR_PERMISSIONS,
  owner: OWNER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  advisor: ADVISOR_PERMISSIONS,
  assistant: [
    "demands.create",
    "citizens.create",
    "agenda.view",
  ],
  attendant: [
    "demands.create",
    "citizens.create",
  ],
  intern: [
    "demands.create",
    "citizens.view",
  ],
  citizen: [
    "participation.create",
  ],
};

/**
 * Checks if a given role possesses a specific capability.
 */
export function hasPermission(role: CabinetRole | UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as CabinetRole];
  return perms ? perms.includes(permission) : false;
}

/**
 * Enforces that caller has an active membership in the given organization.
 */
export async function requireMembership(organizationId: string) {
  const membership = await getCurrentMembership(organizationId);
  if (!membership || membership.status !== "active") {
    throw new Error(
      `UNAUTHORIZED_TENANT_ACCESS: Acesso não autorizado à organização ${organizationId}.`
    );
  }
  return membership;
}

/**
 * Enforces that caller holds one of the required roles in the organization.
 */
export async function requireRole(allowedRoles: UserRole[], organizationId?: string) {
  const membership = await getCurrentMembership(organizationId);
  if (!membership || membership.status !== "active") {
    throw new Error("UNAUTHORIZED_ACCESS: Sessão sem membership ativo.");
  }

  if (!allowedRoles.includes(membership.role as UserRole)) {
    throw new Error(
      `FORBIDDEN_ROLE: O papel '${membership.role}' não possui permissão para executar esta operação.`
    );
  }

  return membership;
}

/**
 * Wrapper to ensure server actions strictly operate on the tenant's scoped organizationId.
 */
export async function withTenantContext<T>(
  organizationId: string,
  allowedRoles: UserRole[] | null,
  action: (context: { organizationId: string; userId: string; role: UserRole }) => Promise<T>
): Promise<T> {
  const membership = allowedRoles
    ? await requireRole(allowedRoles, organizationId)
    : await requireMembership(organizationId);

  return action({
    organizationId: membership.organization_id,
    userId: membership.user_id,
    role: membership.role as UserRole,
  });
}
