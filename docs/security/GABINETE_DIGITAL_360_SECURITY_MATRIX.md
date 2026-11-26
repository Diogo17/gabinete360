# MATRIZ DE SEGURANÇA — GABINETE DIGITAL 360°

| API / Rota | Método | Auth | Authorization | Tenant Isolation | Input Validation | Rate Limit | Status | Risco |
|---|---|---|---|---|---|---|---|---|
| `/api/ia/assist` | POST | Sim (`getUser`) | Sim (`memberships`) | Sim (`organizationId`) | Zod (`AssistSchema`) | Não | 🟢 Corrigido (P1) | P3 |
| `/api/public/intake` | POST | Pública | N/A | `organization_id` UUID obrigatório | Zod (`PublicIntakeSchema`) | Não | 🟢 Corrigido (P0) | P3 |
| `/api/signature/request` | POST | Sim (`getUser`) | Sim (`memberships`) | Sim (`organizationId`) | Zod (`SignatureRequestSchema`) | Não | 🟢 Corrigido (P1) | P3 |
| `/api/signature/verify` | POST | Pública | N/A | Por código/hash | Regex SHA-256 | Não | 🟡 Monitorar | P2 |
| `/api/whatsapp/instance` | GET/POST/DELETE | Sim (`getUser`) | Sim (`memberships`) | Sim (`gabinete_id`) | Zod (`UuidSchema`) | Não | 🟢 Protegido | P3 |
| `/api/whatsapp/send` | POST | Sim (`getUser`) | Sim (`memberships`) | Sim (`gabinete_id`) | Zod | Não | 🟢 Protegido | P3 |
| `/api/whatsapp/webhook` | POST | Obrigatória (`WHATSAPP_WEBHOOK_SECRET` fail-closed) | N/A | Por `instance_name` | Parcial | Não | 🟢 Corrigido (P0) | P3 |
| `apps/master/src/middleware.ts` | ALL | Supabase `getUser()` | AAL2 MFA via Supabase | Control Plane | N/A | N/A | 🟢 Corrigido (P0) | P3 |
