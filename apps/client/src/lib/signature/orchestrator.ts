import { createHash, randomBytes } from 'crypto';
import type {
  SignatureAuditEvent,
  SignatureEvidenceInput,
  SignatureLevel,
  SignaturePolicy,
} from './types';
import { SIGNATURE_LEGAL_DISCLAIMERS } from './types';

/**
 * Computes SHA-256 hex digest for document content or binary buffer.
 */
export function computeDocumentHash(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generates an opaque, non-sequential verification code for /validar-assinatura.
 */
export function generateOpaqueVerificationCode(): {
  rawCode: string;
  codeHash: string;
} {
  const rawCode = randomBytes(12).toString('base64url').toUpperCase();
  const codeHash = createHash('sha256').update(rawCode).digest('hex');
  return { rawCode, codeHash };
}

/**
 * Builds minimized evidence payload (never stores passwords, OTPs, or session tokens).
 */
export function buildMinimizedEvidence(input: SignatureEvidenceInput) {
  const capturedAt = new Date().toISOString();
  const canonical = JSON.stringify({
    signatureRequestId: input.signatureRequestId,
    participantId: input.participantId,
    authenticationMethod: input.authenticationMethod,
    intentConfirmationText: input.intentConfirmationText,
    documentHash: input.documentHash,
    capturedAt,
  });

  const evidenceHash = createHash('sha256').update(canonical).digest('hex');

  return {
    evidenceHash,
    capturedAt,
    metadataMinimized: {
      authenticationMethod: input.authenticationMethod,
      intentConfirmationText: input.intentConfirmationText,
      ipMasked: input.ipAddress ? maskIp(input.ipAddress) : undefined,
      userAgentSummary: input.userAgent ? input.userAgent.slice(0, 120) : undefined,
    },
  };
}

/**
 * Appends a hash-chained audit event.
 */
export function createChainedAuditEvent(params: {
  id: string;
  signatureRequestId: string;
  actorId?: string;
  eventType: string;
  metadataMinimized: Record<string, unknown>;
  previousEventHash: string | null;
}): SignatureAuditEvent {
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({
    id: params.id,
    signatureRequestId: params.signatureRequestId,
    actorId: params.actorId ?? null,
    eventType: params.eventType,
    timestamp,
    metadataMinimized: params.metadataMinimized,
    previousEventHash: params.previousEventHash,
  });

  const eventHash = createHash('sha256').update(payload).digest('hex');

  return {
    id: params.id,
    signatureRequestId: params.signatureRequestId,
    actorId: params.actorId,
    eventType: params.eventType,
    timestamp,
    metadataMinimized: params.metadataMinimized,
    previousEventHash: params.previousEventHash,
    eventHash,
  };
}

/**
 * Evaluates policy compatibility and returns legal disclaimer + warnings.
 */
export function evaluateSignaturePolicy(
  policy: SignaturePolicy | null,
  requestedLevel: SignatureLevel
): {
  allowed: boolean;
  disclaimer: string;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (requestedLevel === 'qualified_icp_brasil') {
    warnings.push(
      'Assinatura qualificada exige certificado ICP-Brasil válido via provedor integrado; não pode ser simulada.'
    );
  }

  if (policy && !policy.acceptedByRecipient) {
    warnings.push(
      'Aceitação pelo destinatário não confirmada para esta política. Verifique a norma local ou canal de protocolo.'
    );
  }

  return {
    allowed: true,
    disclaimer: SIGNATURE_LEGAL_DISCLAIMERS[requestedLevel],
    warnings,
  };
}

function maskIp(ip: string): string {
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.*.*` : '***';
  }
  return ip.slice(0, 8) + ':***';
}
