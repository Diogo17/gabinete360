-- ============================================================================
-- GABINETE 360 - Integração WhatsApp (whatsapp-api-go + Anti-Ban Queue)
-- ============================================================================

-- 0. Nós de Execução (Fly.io Sprites) para Escala Horizontal (Multi-Node)
CREATE TABLE IF NOT EXISTS public.whatsapp_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  global_token TEXT NOT NULL,
  max_instances INT NOT NULL DEFAULT 150,
  active_instances INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draining', 'offline')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed do primeiro nó Fly.io Sprite
INSERT INTO public.whatsapp_nodes (name, base_url, global_token, max_instances, status)
VALUES (
  'gabinete-360-whatsapp-01',
  'https://gabinete-360-whatsapp-b6xo7.sprites.app',
  'gab360_global_tok3n_2026_prod',
  150,
  'active'
)
ON CONFLICT (name) DO NOTHING;

-- 1. Instâncias do WhatsApp por Gabinete (Tenant)
CREATE TABLE IF NOT EXISTS public.whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gabinete_id UUID NOT NULL UNIQUE,
  node_id UUID REFERENCES public.whatsapp_nodes(id),
  instance_name TEXT NOT NULL UNIQUE,
  instance_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected')),
  phone_number TEXT,
  qr_code TEXT,
  pairing_code TEXT,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_instances_gabinete ON public.whatsapp_instances(gabinete_id);

-- 2. Contatos extraídos do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gabinete_id UUID NOT NULL,
  jid TEXT NOT NULL,
  phone TEXT NOT NULL,
  name TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gabinete_id, jid)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_gabinete_phone ON public.whatsapp_contacts(gabinete_id, phone);

-- 3. Histórico de Mensagens (Inbound & Outbound)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gabinete_id UUID NOT NULL,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.whatsapp_contacts(id) ON DELETE CASCADE,
  message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_contact ON public.whatsapp_messages(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_gabinete ON public.whatsapp_messages(gabinete_id, created_at DESC);

-- 4. Fila de Envio Anti-Ban (Rate Limiting & Delay Randômico)
CREATE TABLE IF NOT EXISTS public.whatsapp_outbound_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gabinete_id UUID NOT NULL,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_pending ON public.whatsapp_outbound_queue(status, scheduled_at) WHERE status = 'queued';

-- 5. Habilitar RLS
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_outbound_queue ENABLE ROW LEVEL SECURITY;

-- 6. Habilitar Realtime para atualizações ao vivo no Inbox e QR Code (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'whatsapp_instances'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_instances;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'whatsapp_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
  END IF;
END $$;
