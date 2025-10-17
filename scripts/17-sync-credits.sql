-- Script para sincronizar os dados entre profiles e user_credits
-- Isso vai garantir que todos os usuários tenham registros na tabela user_credits

-- Primeiro, insere registros para usuários que não têm na tabela user_credits
INSERT INTO public.user_credits (user_id, credits_remaining, expiry_date)
SELECT 
  id as user_id, 
  CASE 
    WHEN plan_type = 'gratuito' THEN 100
    WHEN plan_type = 'credito' THEN 300
    ELSE 100
  END as credits_remaining,
  (CURRENT_DATE + INTERVAL '1 year')::date as expiry_date
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.id
);

-- Atualiza os registros existentes que têm 0 créditos
UPDATE public.user_credits uc
SET credits_remaining = 100
FROM public.profiles p
WHERE uc.user_id = p.id
  AND p.plan_type = 'gratuito'
  AND uc.credits_remaining = 0;

UPDATE public.user_credits uc
SET credits_remaining = 300
FROM public.profiles p
WHERE uc.user_id = p.id
  AND p.plan_type = 'credito'
  AND uc.credits_remaining = 0;

-- Atualiza os registros na tabela profiles para manter consistência
UPDATE public.profiles p
SET credits_remaining = uc.credits_remaining
FROM public.user_credits uc
WHERE p.id = uc.user_id;