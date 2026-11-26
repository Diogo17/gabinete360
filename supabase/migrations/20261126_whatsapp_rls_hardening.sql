-- ============================================================================
-- GABINETE 360 - Hardening RLS WhatsApp (P0-5 e P0-6)
-- 1. Habilita RLS em whatsapp_nodes (default-deny para anon/authenticated)
-- 2. Substitui isolamento via user_metadata por verificação real em memberships
-- ============================================================================

ALTER TABLE IF EXISTS public.whatsapp_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_whatsapp_instances ON public.whatsapp_instances;
CREATE POLICY tenant_isolation_whatsapp_instances ON public.whatsapp_instances
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_instances.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_instances.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS tenant_isolation_whatsapp_contacts ON public.whatsapp_contacts;
CREATE POLICY tenant_isolation_whatsapp_contacts ON public.whatsapp_contacts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_contacts.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_contacts.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS tenant_isolation_whatsapp_messages ON public.whatsapp_messages;
CREATE POLICY tenant_isolation_whatsapp_messages ON public.whatsapp_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_messages.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_messages.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS tenant_isolation_whatsapp_queue ON public.whatsapp_outbound_queue;
CREATE POLICY tenant_isolation_whatsapp_queue ON public.whatsapp_outbound_queue
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_outbound_queue.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.organization_id = whatsapp_outbound_queue.gabinete_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );
