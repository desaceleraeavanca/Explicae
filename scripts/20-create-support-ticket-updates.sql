-- Create a history table to store all admin replies/updates for support tickets
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.support_ticket_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  new_status TEXT CHECK (new_status IN ('aberto','pendente','em_andamento','resolvido','fechado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.support_ticket_updates IS 'Histórico de respostas/atualizações de tickets';
COMMENT ON COLUMN public.support_ticket_updates.ticket_id IS 'Ticket relacionado';
COMMENT ON COLUMN public.support_ticket_updates.admin_id IS 'Admin que respondeu/atualizou';
COMMENT ON COLUMN public.support_ticket_updates.message IS 'Mensagem enviada ao usuário';
COMMENT ON COLUMN public.support_ticket_updates.new_status IS 'Status após a atualização';

-- RLS
ALTER TABLE public.support_ticket_updates ENABLE ROW LEVEL SECURITY;

-- Usuários veem atualizações dos seus próprios tickets
DROP POLICY IF EXISTS "Users can view updates for own tickets" ON public.support_ticket_updates;
CREATE POLICY "Users can view updates for own tickets" ON public.support_ticket_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_ticket_updates.ticket_id
        AND t.user_id = auth.uid()
    )
  );

-- Admins podem ver todas as atualizações
DROP POLICY IF EXISTS "Admins can view all ticket updates" ON public.support_ticket_updates;
CREATE POLICY "Admins can view all ticket updates" ON public.support_ticket_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins podem inserir atualizações
DROP POLICY IF EXISTS "Admins can insert ticket updates" ON public.support_ticket_updates;
CREATE POLICY "Admins can insert ticket updates" ON public.support_ticket_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Optional index for faster listing per ticket
CREATE INDEX IF NOT EXISTS idx_support_ticket_updates_ticket_id ON public.support_ticket_updates(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_updates_created_at ON public.support_ticket_updates(created_at DESC);