-- Migration 005: Parliamentary Profiles (Jurisdiction, Role, Institution, Term)

CREATE TABLE IF NOT EXISTS public.parliamentary_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('municipal', 'state', 'federal')),
  institution_type TEXT NOT NULL CHECK (institution_type IN ('city_council', 'state_assembly', 'house', 'senate')),
  parliamentary_role TEXT NOT NULL CHECK (parliamentary_role IN ('vereador', 'deputado_estadual', 'deputado_federal', 'senador')),
  legislator_name TEXT NOT NULL,
  full_name TEXT,
  party TEXT,
  state TEXT NOT NULL,
  municipality TEXT,
  district TEXT,
  legislature_number TEXT,
  term_start DATE,
  term_end DATE,
  office_address TEXT,
  official_email TEXT,
  official_phone TEXT,
  official_site TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parliamentary_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parliamentary_profiles_tenant_isolation" ON public.parliamentary_profiles;

CREATE POLICY "parliamentary_profiles_tenant_isolation"
  ON public.parliamentary_profiles
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
