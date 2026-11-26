import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

// SEC-001: Master middleware must not allow cookie-only auth bypass
const masterMiddleware = read("apps/master/src/middleware.ts");
assert.equal(
  masterMiddleware.includes('request.cookies.get("master_admin_auth")'),
  false,
  "SEC-001 regression: master_admin_auth cookie bypass detected"
);
assert.equal(
  masterMiddleware.includes("getAuthenticatorAssuranceLevel"),
  true,
  "SEC-001 regression: AAL2 MFA check missing in master middleware"
);

// SEC-002: WhatsApp webhook must fail-closed when WHATSAPP_WEBHOOK_SECRET is missing
const whatsappWebhook = read("apps/client/src/app/api/whatsapp/webhook/route.ts");
assert.equal(
  whatsappWebhook.includes("if (!webhookSecret)"),
  true,
  "SEC-002 regression: webhook must fail-closed when WHATSAPP_WEBHOOK_SECRET is missing"
);

// SEC-003: Public intake must not use hardcoded fallback organization_id
const publicIntake = read("apps/client/src/app/api/public/intake/route.ts");
assert.equal(
  publicIntake.includes("a0000000-0000-0000-0000-000000000001"),
  false,
  "SEC-003 regression: hardcoded organization_id fallback detected"
);

// SEC-004: Signature request must check memberships and persist to signature_requests
const signatureRequest = read("apps/client/src/app/api/signature/request/route.ts");
assert.equal(
  signatureRequest.includes('.from("memberships")') || signatureRequest.includes(".from('memberships')"),
  true,
  "SEC-004 regression: membership check missing in /api/signature/request"
);
assert.equal(
  signatureRequest.includes("signature_requests"),
  true,
  "SEC-004 regression: persistence to signature_requests missing"
);

// SEC-005: IA assist must check memberships
const iaAssist = read("apps/client/src/app/api/ia/assist/route.ts");
assert.equal(
  iaAssist.includes('.from("memberships")'),
  true,
  "SEC-005 regression: membership check missing in /api/ia/assist"
);

console.log("✔ Security regression checks passed (SEC-001..SEC-005)");
