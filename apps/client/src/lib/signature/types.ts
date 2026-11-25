export type SignatureLevel =
  | 'none'
  | 'simple'
  | 'advanced_native'
  | 'qualified_icp_brasil'
  | 'govbr_advanced';

export type SigningMode = 'single' | 'sequential' | 'parallel';

export type SignatureRequestStatus =
  | 'draft'
  | 'awaiting_signers'
  | 'invitation_sent'
  | 'identity_verification_pending'
  | 'ready_to_sign'
  | 'signed_partially'
  | 'signed_completed'
  | 'declined'
  | 'expired'
  | 'cancelled'
  | 'verification_failed'
  | 'integrity_invalid'
  | 'revoked_credentials';

export type ParticipantStatus =
  | 'pending'
  | 'invited'
  | 'viewed'
  | 'signed'
  | 'declined'
  | 'expired';

export interface SignaturePolicy {
  id: string;
  organizationId: string;
  policyName: string;
  documentType: string;
  requiredLevel: SignatureLevel;
  requiredAuthentication: string;
  acceptedByRecipient: boolean;
  legalBasisReference?: string;
  ruleSourceUrl?: string;
}

export interface SignatureParticipantInput {
  userId?: string;
  externalSignerName?: string;
  externalSignerEmail?: string;
  signerRole: string;
  sequenceOrder: number;
}

export interface SignatureEvidenceInput {
  signatureRequestId: string;
  participantId: string;
  authenticationMethod: string;
  intentConfirmationText: string;
  ipAddress?: string;
  userAgent?: string;
  documentHash: string;
}

export interface SignatureAuditEvent {
  id: string;
  signatureRequestId: string;
  actorId?: string;
  eventType: string;
  timestamp: string;
  metadataMinimized: Record<string, unknown>;
  previousEventHash: string | null;
  eventHash: string;
}

export const SIGNATURE_LEGAL_DISCLAIMERS: Record<SignatureLevel, string> = {
  none: 'Documento sem exigência de assinatura eletrônica.',
  simple:
    'Assinatura Eletrônica Simples (Lei 14.063/2020, art. 4º, I). Não é assinatura qualificada ICP-Brasil e sua aceitação depende da norma ou concordância do destinatário.',
  advanced_native:
    'Assinatura Eletrônica Avançada Nativa (Lei 14.063/2020, art. 4º, II; MP 2.200-2/2001, art. 10, § 2º). Não é certificado ICP-Brasil; sujeita à aceitação do destinatário.',
  qualified_icp_brasil:
    'Assinatura Eletrônica Qualificada (ICP-Brasil, Lei 14.063/2020, art. 4º, III). Requer certificado digital ICP-Brasil válido e provedor integrado.',
  govbr_advanced:
    'Assinatura Eletrônica Avançada via Gov.br. Sujeita à disponibilidade e autorização de integração oficial.',
};
