-- Script para resetar o uso de todos os usuários
-- Atualiza os créditos para usuários gratuitos
UPDATE public.profiles
SET credits_remaining = 30
WHERE plan_type = 'gratuito';

-- Atualiza créditos para planos de crédito
UPDATE public.profiles
SET credits_remaining = 300
WHERE plan_type = 'credito';

-- Atualiza especificamente o usuário pereiraadiilson@gmail.com
-- Define manualmente o valor correto para total_analogies (8) e credits_remaining (22)
UPDATE public.user_stats us
SET 
  total_analogies = 8,
  updated_at = NOW()
FROM public.profiles p
WHERE us.user_id = p.id AND p.email = 'pereiraadiilson@gmail.com';

-- Atualiza os créditos do usuário pereiraadiilson@gmail.com para 22 (30 créditos iniciais - 8 analogias geradas)
UPDATE public.profiles p
SET credits_remaining = 22
WHERE p.email = 'pereiraadiilson@gmail.com';

-- Atualiza também a tabela de gerações para garantir que a contagem seja consistente
INSERT INTO public.generations (user_id, concept, audience, created_at)
SELECT 
  p.id, 
  'Ajuste de contagem', 
  'Sistema', 
  NOW()
FROM public.profiles p
WHERE p.email = 'pereiraadiilson@gmail.com'
AND (
  SELECT COUNT(*) FROM public.generations g WHERE g.user_id = p.id
) < 8;

-- Recalcula o contador de analogias para todos os usuários com base nas gerações
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