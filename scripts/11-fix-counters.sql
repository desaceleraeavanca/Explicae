-- Script para corrigir os contadores de créditos e analogias
-- Inicializa os créditos para usuários gratuitos que estão com valor 0 ou NULL
UPDATE public.profiles
SET credits_remaining = 100
WHERE (credits_remaining IS NULL OR credits_remaining = 0)
AND plan_type = 'gratuito';

-- Inicializa os créditos para usuários do plano credito que estão com valor 0 ou NULL
UPDATE public.profiles
SET credits_remaining = 150
WHERE (credits_remaining IS NULL OR credits_remaining = 0)
AND plan_type = 'credito';

-- Inicializa o contador de analogias para usuários que têm entradas na tabela generations
-- mas o contador está zerado ou não existe na tabela user_stats
WITH user_analogy_counts AS (
  SELECT user_id, COUNT(*) as analogy_count
  FROM public.generations
  WHERE user_id IS NOT NULL
  GROUP BY user_id
)
INSERT INTO public.user_stats (user_id, total_analogies, last_activity_date, created_at, updated_at)
SELECT 
  uac.user_id, 
  uac.analogy_count, 
  CURRENT_DATE, 
  NOW(), 
  NOW()
FROM user_analogy_counts uac
LEFT JOIN public.user_stats us ON uac.user_id = us.user_id
WHERE us.user_id IS NULL
ON CONFLICT (user_id) 
DO UPDATE SET 
  total_analogies = EXCLUDED.total_analogies,
  updated_at = NOW();

-- Atualiza o contador de analogias para usuários que já têm entrada na tabela user_stats
-- mas o contador está zerado
WITH user_analogy_counts AS (
  SELECT user_id, COUNT(*) as analogy_count
  FROM public.generations
  WHERE user_id IS NOT NULL
  GROUP BY user_id
)
UPDATE public.user_stats us
SET 
  total_analogies = uac.analogy_count,
  updated_at = NOW()
FROM user_analogy_counts uac
WHERE us.user_id = uac.user_id
AND us.total_analogies = 0
AND uac.analogy_count > 0;