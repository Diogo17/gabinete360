-- ============================================================================
-- GABINETE 360 - Políticas RLS para tabelas WhatsApp
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_instances' AND policyname = 'tenant_isolation_whatsapp_instances'
  ) THEN
    CREATE POLICY tenant_isolation_whatsapp_instances ON public.whatsapp_instances
      FOR ALL TO authenticated
      USING (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()))
      WITH CHECK (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_contacts' AND policyname = 'tenant_isolation_whatsapp_contacts'
  ) THEN
    CREATE POLICY tenant_isolation_whatsapp_contacts ON public.whatsapp_contacts
      FOR ALL TO authenticated
      USING (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()))
      WITH CHECK (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_messages' AND policyname = 'tenant_isolation_whatsapp_messages'
  ) THEN
    CREATE POLICY tenant_isolation_whatsapp_messages ON public.whatsapp_messages
      FOR ALL TO authenticated
      USING (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()))
      WITH CHECK (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_outbound_queue' AND policyname = 'tenant_isolation_whatsapp_queue'
  ) THEN
    CREATE POLICY tenant_isolation_whatsapp_queue ON public.whatsapp_outbound_queue
      FOR ALL TO authenticated
      USING (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()))
      WITH CHECK (gabinete_id = COALESCE((auth.jwt() -> 'user_metadata' ->> 'gabinete_id')::uuid, auth.uid()));
  END IF;
END $$;
