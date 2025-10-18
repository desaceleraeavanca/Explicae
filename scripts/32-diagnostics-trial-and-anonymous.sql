-- Diagnostics: Trial & Credits (profiles) + Anonymous cleanup (generations)
-- Execute este arquivo inteiro no SQL Editor do Supabase. Ele não altera dados (somente SELECTs).
-- Dica: Rode antes e depois do 31-clean-anonymous-data.sql. As seções 5.x são para validação após a limpeza.

-- 1) Colunas e defaults em public.profiles
SELECT '1. columns profiles' AS section_label;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles' AND column_name IN ('trial_ends_at','credits_remaining');

-- 2) Função e trigger do período de trial
SELECT '2a. função set_trial_period existe?' AS section_label;
SELECT n.nspname AS schema, p.proname AS function
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND p.proname='set_trial_period';

SELECT '2b. trigger profiles_set_trial_period ativo?' AS section_label;
SELECT t.tgname AS trigger_name, t.tgenabled AS enabled, p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname='public'
  AND c.relname='profiles'
  AND NOT t.tgisinternal
  AND t.tgname='profiles_set_trial_period';

-- 3) Estatísticas pré-limpeza em public.generations
SELECT '3a. pré-limpeza anonymous (generations)' AS section_label;
-- OBS: Após rodar o 31-clean-anonymous-data.sql, a coluna anonymous_id não existe mais.
-- Use o bloco 3a-pos-limpeza abaixo. Este bloco 3a-pre-limpeza é apenas para antes da limpeza.
SELECT
  SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS sem_user_id
  -- , SUM(CASE WHEN anonymous_id IS NOT NULL THEN 1 ELSE 0 END) AS com_anonymous_id
FROM public.generations;

SELECT '3a-pos. pós-limpeza anonymous (generations)' AS section_label;
SELECT
  SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) AS sem_user_id
FROM public.generations;

SELECT '3b. índice anonymous_id existe?' AS section_label;
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname='public' AND tablename='generations' AND indexname='idx_generations_anonymous_id';

SELECT '3c. função check_anonymous_access existe?' AS section_label;
SELECT n.nspname AS schema, p.proname AS function
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND p.proname='check_anonymous_access';

-- 4) Políticas RLS em public.generations (admin e own)
SELECT '4. políticas RLS em public.generations' AS section_label;
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='generations'
ORDER BY policyname;

-- 5) Validações pós-limpeza (execute após rodar 31-clean-anonymous-data.sql)
SELECT '5a. coluna anonymous_id removida?' AS section_label;
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='generations' AND column_name='anonymous_id';

SELECT '5b. há linhas sem user_id?' AS section_label;
SELECT COUNT(*) AS linhas_sem_user_id FROM public.generations WHERE user_id IS NULL;

SELECT '5c. função check_anonymous_access removida?' AS section_label;
SELECT proname
FROM pg_proc
JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
WHERE n.nspname='public' AND proname='check_anonymous_access';

-- 6) Reforço opcional (DDL) — execute manualmente se desejar
-- ALTER TABLE public.generations ALTER COLUMN user_id SET NOT NULL;