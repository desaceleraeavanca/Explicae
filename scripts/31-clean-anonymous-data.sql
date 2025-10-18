-- Limpeza segura do fluxo anônimo e reforços idempotentes

BEGIN;

-- 1) Diagnóstico opcional (contagens e existência de coluna)
DO $$
DECLARE
  v_null_user_id_count BIGINT;
  v_has_anonymous_col BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO v_null_user_id_count FROM public.generations WHERE user_id IS NULL;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='generations' AND column_name='anonymous_id'
  ) INTO v_has_anonymous_col;

  RAISE NOTICE 'Linhas com user_id IS NULL: %', v_null_user_id_count;
  RAISE NOTICE 'Coluna anonymous_id existe? %', v_has_anonymous_col;
END $$;

-- 2) Remover linhas criadas por usuários anônimos (idempotente)
DELETE FROM public.generations WHERE user_id IS NULL;

-- 3) Remover linhas com anonymous_id, apenas se a coluna existir (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='generations' AND column_name='anonymous_id'
  ) THEN
    EXECUTE 'DELETE FROM public.generations WHERE anonymous_id IS NOT NULL';
  END IF;
END $$;

-- 4) Dropar índice e coluna relacionados ao anonymous_id (idempotente)
DROP INDEX IF EXISTS idx_generations_anonymous_id;
ALTER TABLE public.generations DROP COLUMN IF EXISTS anonymous_id;

-- 5) Dropar função legacy de acesso anônimo (idempotente)
DROP FUNCTION IF EXISTS public.check_anonymous_access(TEXT);

COMMIT;

-- Observação: para reforçar regra NOT NULL (opcional, execute manualmente)
-- ALTER TABLE public.generations ALTER COLUMN user_id SET NOT NULL;