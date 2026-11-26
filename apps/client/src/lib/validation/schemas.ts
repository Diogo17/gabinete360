import { z } from "zod";

// ============================================================================
// REGEX PATTERNS (aligned with tests/e2e/tier2-boundaries/01-input-validation.test.ts)
// ============================================================================
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[0-9\s().-]{8,20}$/;
export const TENANT_SLUG_REGEX = /^[a-z0-9-]+$/;

// ============================================================================
// 1. CITIZEN SCHEMA
// ============================================================================
export const citizenSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(150, "Nome excede o limite de 150 caracteres"),
  display_name: z.string().trim().max(150).optional(),
  email: z
    .string()
    .trim()
    .refine((val) => !val || EMAIL_REGEX.test(val), {
      message: "E-mail inválido",
    })
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .refine((val) => PHONE_REGEX.test(val), {
      message: "Telefone inválido",
    }),
  preferred_channel: z.enum(["whatsapp", "email", "phone", "in_person"]),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cpf: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable().default(""),
  state: z.string().trim().optional().nullable().default(""),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().trim().optional().nullable(),
});

export type CitizenFormData = z.infer<typeof citizenSchema>;

// ============================================================================
// 1B. PARLIAMENTARY PORTAL PROFILE SCHEMA
// ============================================================================
export const parliamentaryProfileSchema = z.object({
  organizationId: z.string().uuid("Organização inválida."),
  cabinetName: z.string().trim().min(3, "Nome do gabinete é obrigatório.").max(160),
  portalSlug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug do portal deve ter ao menos 3 caracteres.")
    .max(80)
    .regex(TENANT_SLUG_REGEX, "Use apenas letras minúsculas, números e hífen no slug."),
  jurisdiction: z.enum(["municipal", "state", "federal"]),
  institutionType: z.enum(["city_council", "state_assembly", "house", "senate"]),
  parliamentaryRole: z.enum(["vereador", "deputado_estadual", "deputado_federal", "senador"]),
  legislatorName: z.string().trim().min(2, "Nome parlamentar é obrigatório.").max(140),
  fullName: z.string().trim().max(160).optional().nullable(),
  party: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().min(2, "UF obrigatória.").max(4),
  municipality: z.string().trim().min(2, "Município obrigatório.").max(120),
  district: z.string().trim().max(140).optional().nullable(),
  legislatureNumber: z.string().trim().max(40).optional().nullable(),
  officeAddress: z.string().trim().max(240).optional().nullable(),
  officialEmail: z
    .string()
    .trim()
    .refine((val) => !val || EMAIL_REGEX.test(val), { message: "E-mail oficial inválido." })
    .optional()
    .nullable(),
  officialPhone: z
    .string()
    .trim()
    .refine((val) => !val || PHONE_REGEX.test(val), { message: "Telefone oficial inválido." })
    .optional()
    .nullable(),
  officialSite: z.string().trim().max(240).optional().nullable(),
  avatarUrl: z.string().trim().max(500).optional().nullable(),
  bioHeadline: z.string().trim().max(200).optional().nullable(),
  biography: z.string().trim().max(3000).optional().nullable(),
  highlights: z.array(z.string().trim().min(1).max(120)).max(6).default([]),
  chamberName: z.string().trim().min(2, "Nome da Casa Legislativa é obrigatório.").max(160),
  chamberAddress: z.string().trim().max(240).optional().nullable(),
  chamberCep: z.string().trim().max(20).optional().nullable(),
  agendaSyncUrl: z.string().trim().max(500).optional().nullable(),
  portalEnabled: z.boolean().default(true),
  portalCtaLabel: z.string().trim().max(120).optional().nullable(),
  neighborhoodPlaceholder: z.string().trim().max(120).optional().nullable(),
});

export type ParliamentaryProfileFormData = z.infer<typeof parliamentaryProfileSchema>;

// ============================================================================
// 2. DEMAND SCHEMA
// ============================================================================
export const demandSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Assunto deve ter pelo menos 3 caracteres")
    .max(200, "Assunto excede o limite de 200 caracteres"),
  category: z.enum([
    "iluminacao",
    "saude",
    "educacao",
    "zeladoria",
    "seguranca",
    "saneamento",
    "transporte",
    "outros",
  ]),
  priority: z.enum(["low", "normal", "medium", "high", "urgent"]),
  status: z
    .enum(["received", "triage", "in_progress", "waiting", "resolved", "closed"])
    .default("received"),
  citizen_id: z.string().optional().nullable(),
  citizen_name: z.string().trim().optional().nullable(),
  neighborhood: z.string().trim().optional().nullable(),
  description: z
    .string()
    .trim()
    .min(5, "Descrição deve ter pelo menos 5 caracteres")
    .optional()
    .nullable(),
  assigned_to: z.string().optional().nullable(),
});

export type DemandFormData = z.infer<typeof demandSchema>;

// ============================================================================
// 3. AGENDA EVENT SCHEMA
// ============================================================================
export const agendaEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Título deve ter pelo menos 3 caracteres")
      .max(150, "Título excede 150 caracteres"),
    event_type: z.enum([
      "session",
      "hearing",
      "visit",
      "meeting",
      "event",
      "other",
    ]),
    starts_at: z.string().min(1, "Data e horário de início são obrigatórios"),
    ends_at: z.string().min(1, "Data e horário de término são obrigatórios"),
    location: z
      .string()
      .trim()
      .min(2, "Local deve ter pelo menos 2 caracteres"),
    visibility: z
      .enum(["public", "internal", "confidential", "private"])
      .default("internal"),
    description: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) => {
      const start = new Date(data.starts_at).getTime();
      const end = new Date(data.ends_at).getTime();
      if (isNaN(start) || isNaN(end)) return false;
      return end > start;
    },
    {
      message: "Data final deve ser posterior à data inicial",
      path: ["ends_at"],
    }
  );

export type AgendaEventFormData = z.infer<typeof agendaEventSchema>;

// ============================================================================
// 4. TASK SCHEMA
// ============================================================================
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título excede 200 caracteres"),
  assigned_to: z.string().min(1, "Selecione um responsável"),
  priority: z.enum(["low", "normal", "medium", "high", "urgent"]),
  status: z
    .enum([
      "pending",
      "in_progress",
      "completed",
      "cancelled",
      "todo",
      "review",
      "done",
    ])
    .default("pending"),
  due_at: z.string().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  demand_id: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// ============================================================================
// 5. TEAM INVITE SCHEMA
// ============================================================================
export const teamInviteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome excede o limite de 100 caracteres"),
  email: z
    .string()
    .trim()
    .refine((val) => EMAIL_REGEX.test(val), {
      message: "E-mail inválido",
    }),
  role: z.enum(["admin", "advisor", "assistant", "attendant", "intern"]),
  role_title: z.string().trim().optional().nullable(),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || PHONE_REGEX.test(val), {
      message: "Telefone inválido",
    })
    .optional()
    .nullable(),
});

export type TeamInviteFormData = z.infer<typeof teamInviteSchema>;

// ============================================================================
// HELPER VALIDATORS
// ============================================================================
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
