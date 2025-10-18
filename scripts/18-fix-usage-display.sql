-- Script para corrigir a exibição das faíscas no dashboard
-- Este script atualiza diretamente os valores nas tabelas user_stats e profiles

-- Primeiro, vamos adicionar a coluna monthly_analogies se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'monthly_analogies'
  ) THEN
    ALTER TABLE public.user_stats ADD COLUMN monthly_analogies INTEGER DEFAULT 0;
  END IF;
END $$;

-- Agora, atualiza a tabela user_stats para garantir que monthly_analogies seja 0
-- para usuários que não têm registros de uso
UPDATE public.user_stats
SET monthly_analogies = 0
WHERE monthly_analogies IS NULL OR monthly_analogies > 30;

-- Em seguida, atualiza a tabela profiles para garantir que credits_remaining
-- tenha o valor correto baseado no plano
UPDATE public.profiles
SET credits_remaining = 
  CASE 
    WHEN plan_type = 'gratuito' THEN 30
    WHEN plan_type = 'credito' THEN 300
    WHEN plan_type IN ('mensal', 'anual', 'admin', 'cortesia', 'promo', 'parceria', 'presente') THEN 999999
    ELSE 30
  END
WHERE credits_remaining = 0 OR credits_remaining IS NULL;

-- Atualiza a tabela user_credits para manter consistência com profiles
INSERT INTO public.user_credits (user_id, credits_remaining, expiry_date)
SELECT 
  id as user_id, 
  credits_remaining,
  (CURRENT_DATE + INTERVAL '1 year')::date as expiry_date
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.id
)
ON CONFLICT (user_id) DO UPDATE
SET credits_remaining = EXCLUDED.credits_remaining,
    expiry_date = EXCLUDED.expiry_date;