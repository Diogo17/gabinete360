-- Migration 006: 14-state Document Workflow, Versions & Approvals

ALTER TABLE IF EXISTS public.legislative_items
  DROP CONSTRAINT IF EXISTS legislative_items_status_check;

ALTER TABLE IF EXISTS public.legislative_items
  ADD CONSTRAINT legislative_items_status_check
  CHECK (status IN (
    'draft', 'generated', 'needs_review', 'reviewed', 'approved',
    'ready_to_sign', 'signed', 'exported', 'protocol_pending',
    'protocol_submitted', 'protocol_confirmed', 'returned', 'archived', 'cancelled'
  ));

CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.legislative_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  content TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_versions_tenant_isolation" ON public.document_versions;
CREATE POLICY "document_versions_tenant_isolation"
  ON public.document_versions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE TABLE IF NOT EXISTS public.document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.legislative_items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reviewer_id UUID,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'returned', 'needs_review')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_approvals_tenant_isolation" ON public.document_approvals;
CREATE POLICY "document_approvals_tenant_isolation"
  ON public.document_approvals
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
