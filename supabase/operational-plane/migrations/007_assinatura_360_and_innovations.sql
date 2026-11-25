-- Migration 007: Assinatura 360° (Native Electronic Signature) & v2 Innovations
-- Implements Sections 23.13 (Signature Entities) and 24 (Smart Recipients & Protocol Tracking)

-- 1. Signature Policies
CREATE TABLE IF NOT EXISTS public.signature_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  required_level TEXT NOT NULL CHECK (required_level IN ('none', 'simple', 'advanced_native', 'qualified_icp_brasil', 'govbr_advanced')),
  required_authentication TEXT NOT NULL DEFAULT 'session_reauth',
  accepted_by_recipient BOOLEAN NOT NULL DEFAULT false,
  legal_basis_reference TEXT,
  rule_source_url TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Signature Requests
CREATE TABLE IF NOT EXISTS public.signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.legislative_items(id) ON DELETE CASCADE,
  document_version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.signature_policies(id) ON DELETE SET NULL,
  document_hash TEXT NOT NULL,
  signing_mode TEXT NOT NULL CHECK (signing_mode IN ('sequential', 'parallel', 'single')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'awaiting_signers', 'invitation_sent', 'identity_verification_pending',
    'ready_to_sign', 'signed_partially', 'signed_completed', 'declined',
    'expired', 'cancelled', 'verification_failed', 'integrity_invalid', 'revoked_credentials'
  )),
  requested_by UUID,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Signature Participants
CREATE TABLE IF NOT EXISTS public.signature_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID NOT NULL REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  user_id UUID,
  external_signer_identity JSONB,
  signer_role TEXT NOT NULL,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'viewed', 'signed', 'declined', 'expired')),
  invited_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  authentication_method TEXT,
  identity_verification_status TEXT DEFAULT 'unverified'
);

-- 4. Signature Evidence (Minimized, no secrets/OTP stored)
CREATE TABLE IF NOT EXISTS public.signature_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID NOT NULL REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.signature_participants(id) ON DELETE SET NULL,
  evidence_type TEXT NOT NULL,
  evidence_reference TEXT,
  evidence_hash TEXT NOT NULL,
  metadata_minimized JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retention_policy_id TEXT
);

-- 5. Signature Artifacts
CREATE TABLE IF NOT EXISTS public.signature_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID NOT NULL REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  signed_file_id TEXT NOT NULL,
  signed_file_hash TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'pdf',
  signature_validation_status TEXT NOT NULL DEFAULT 'valid',
  validation_report_file_id TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Signature Verification Codes (Opaque, non-sequential)
CREATE TABLE IF NOT EXISTS public.signature_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_artifact_id UUID NOT NULL REFERENCES public.signature_artifacts(id) ON DELETE CASCADE,
  public_code_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  privacy_mode TEXT NOT NULL DEFAULT 'metadata_only' CHECK (privacy_mode IN ('metadata_only', 'disabled', 'full_authorized'))
);

-- 7. Signature Audit Events (Append-only hash chain)
CREATE TABLE IF NOT EXISTS public.signature_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  signature_request_id UUID NOT NULL REFERENCES public.signature_requests(id) ON DELETE CASCADE,
  actor_id UUID,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata_minimized JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_event_hash TEXT,
  event_hash TEXT NOT NULL
);

-- 8. Smart Recipient Directory (Section 24.3)
CREATE TABLE IF NOT EXISTS public.smart_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  institution TEXT NOT NULL,
  unit TEXT,
  address TEXT,
  email TEXT,
  protocol_channel TEXT,
  preferred_format TEXT DEFAULT 'pdf',
  accepted_signature_level TEXT DEFAULT 'advanced_native',
  official_source_url TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Document Protocols (Section 13 & 24.4)
CREATE TABLE IF NOT EXISTS public.document_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.legislative_items(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.smart_recipients(id) ON DELETE SET NULL,
  protocol_number TEXT,
  channel TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  receipt_file_id TEXT,
  receipt_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'returned', 'archived')),
  deadline_at TIMESTAMPTZ,
  deadline_type TEXT CHECK (deadline_type IN ('legal', 'regimental', 'administrative', 'internal', 'estimated')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.signature_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_protocols ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'signature_policies',
    'signature_requests',
    'signature_audit_events',
    'smart_recipients',
    'document_protocols'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_tenant_isolation" ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "%s_tenant_isolation" ON public.%I FOR ALL USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid() AND status = ''active'')) WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid() AND status = ''active''))',
      tbl, tbl
    );
  END LOOP;
END $$;
