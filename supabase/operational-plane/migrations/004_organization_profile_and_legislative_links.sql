-- Migration 004: Organization profile (photo, description, agenda sync) & Legislative external links

ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS agenda_sync_url TEXT;

CREATE TABLE IF NOT EXISTS public.legislative_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('indicacao', 'projeto_lei', 'requerimento', 'mocao', 'emenda')),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'filed', 'in_committee', 'approved', 'rejected', 'archived')),
  external_url TEXT,
  document_url TEXT,
  author_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legislative_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legislative_items_tenant_isolation" ON public.legislative_items;

CREATE POLICY "legislative_items_tenant_isolation"
  ON public.legislative_items
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
