-- Script para corrigir a exibição de faíscas no dashboard
-- Sincroniza os dados entre as tabelas profiles e user_credits

-- Cria a tabela user_credits se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_credits'
  ) THEN
    CREATE TABLE public.user_credits (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      credits_remaining INTEGER DEFAULT 0,
      expiry_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Adiciona constraint UNIQUE para user_id
    ALTER TABLE public.user_credits ADD CONSTRAINT user_credits_user_id_key UNIQUE (user_id);
  END IF;
END
$$;

-- Insere registros em user_credits para usuários que não têm registro
INSERT INTO public.user_credits (user_id, credits_remaining)
SELECT 
  id as user_id,
  COALESCE(credits_remaining, 
    CASE 
      WHEN plan_type = 'gratuito' THEN 100
      WHEN plan_type = 'credito' THEN 300
      ELSE 100
    END
  ) as credits_remaining
FROM 
  public.profiles p
WHERE 
  NOT EXISTS (
    SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.id
  );

-- Atualiza os registros em user_credits para usuários com plano gratuito que têm 0 faíscas
UPDATE public.user_credits uc
SET credits_remaining = 100
FROM public.profiles p
WHERE 
  uc.user_id = p.id
  AND p.plan_type = 'gratuito'
  AND uc.credits_remaining = 0;

-- Atualiza os registros em user_credits para usuários com plano de crédito que têm 0 faíscas
UPDATE public.user_credits uc
SET credits_remaining = 300
FROM public.profiles p
WHERE 
  uc.user_id = p.id
  AND p.plan_type = 'credito'
  AND uc.credits_remaining = 0;

-- Para um usuário específico (opcional, descomente se necessário)
-- UPDATE public.user_credits
-- SET credits_remaining = 98
-- WHERE user_id = 'ID_DO_USUARIO_AQUI';