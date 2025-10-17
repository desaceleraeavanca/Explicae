-- Remover tabelas se existirem
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.user_feedback CASCADE;

-- Criação da tabela support_tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'resolvido', 'fechado')) DEFAULT 'pendente',
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'normal', 'alta', 'urgente')) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentários da tabela
COMMENT ON TABLE public.support_tickets IS 'Tickets de suporte enviados pelos usuários';
COMMENT ON COLUMN public.support_tickets.id IS 'ID único do ticket';
COMMENT ON COLUMN public.support_tickets.user_id IS 'ID do usuário que criou o ticket';
COMMENT ON COLUMN public.support_tickets.subject IS 'Assunto do ticket';
COMMENT ON COLUMN public.support_tickets.message IS 'Mensagem do ticket';
COMMENT ON COLUMN public.support_tickets.status IS 'Status do ticket (pendente, em_andamento, resolvido, fechado)';
COMMENT ON COLUMN public.support_tickets.priority IS 'Prioridade do ticket (baixa, normal, alta, urgente)';
COMMENT ON COLUMN public.support_tickets.created_at IS 'Data de criação do ticket';
COMMENT ON COLUMN public.support_tickets.updated_at IS 'Data da última atualização do ticket';

-- Criação da tabela feedback
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Comentários da tabela
COMMENT ON TABLE public.user_feedback IS 'Feedback dos usuários sobre o sistema';
COMMENT ON COLUMN public.user_feedback.id IS 'ID único do feedback';
COMMENT ON COLUMN public.user_feedback.user_id IS 'ID do usuário que enviou o feedback';
COMMENT ON COLUMN public.user_feedback.rating IS 'Avaliação de 1 a 5 estrelas';
COMMENT ON COLUMN public.user_feedback.message IS 'Mensagem de feedback (opcional)';
COMMENT ON COLUMN public.user_feedback.feature IS 'Recurso ou área do sistema avaliada';
COMMENT ON COLUMN public.user_feedback.created_at IS 'Data de envio do feedback';

-- Configuração de RLS (Row Level Security)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas para support_tickets
CREATE POLICY "Usuários podem ver seus próprios tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios tickets" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins podem atualizar todos os tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para user_feedback
CREATE POLICY "Usuários podem ver seus próprios feedbacks" 
  ON public.user_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios feedbacks" 
  ON public.user_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os feedbacks" 
  ON public.user_feedback 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Dados de exemplo para testes (usando um usuário admin existente)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Pegar o ID de um usuário admin
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- Inserir tickets de exemplo
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.support_tickets (user_id, subject, message, status, priority)
        VALUES 
            (admin_id, 'Problema com geração de analogias', 'Estou tentando gerar uma analogia sobre programação, mas está dando erro.', 'pendente', 'alta'),
            (admin_id, 'Dúvida sobre planos', 'Gostaria de saber a diferença entre os planos mensal e anual.', 'em_andamento', 'normal'),
            (admin_id, 'Sugestão de melhoria', 'Seria interessante ter uma opção para exportar as analogias em PDF.', 'resolvido', 'baixa');
            
        -- Inserir feedbacks de exemplo
        INSERT INTO public.user_feedback (user_id, rating, message, feature)
        VALUES
            (admin_id, 5, 'Excelente ferramenta! Tem me ajudado muito nas explicações para meus alunos.', 'Gerador de Analogias'),
            (admin_id, 4, 'Muito bom, mas poderia ter mais opções de personalização.', 'Analisador de Clareza'),
            (admin_id, 3, 'Funciona bem, mas a interface poderia ser mais intuitiva.', 'Dashboard');
    END IF;
END $$;