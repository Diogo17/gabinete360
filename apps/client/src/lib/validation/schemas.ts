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
  city: z.string().trim().optional().nullable().default("Santos"),
  state: z.string().trim().optional().nullable().default("SP"),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().trim().optional().nullable(),
});

export type CitizenFormData = z.infer<typeof citizenSchema>;

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
