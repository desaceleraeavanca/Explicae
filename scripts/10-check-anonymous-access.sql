-- DEPRECADO: fluxo anônimo removido
-- Este script foi atualizado para evitar recriar a função legacy e para
-- garantir limpeza segura caso ainda exista algo no banco.

BEGIN;

-- Remove a função antiga caso exista
DROP FUNCTION IF EXISTS public.check_anonymous_access(TEXT);

-- Mensagem informativa para quem executar este script
DO $$
BEGIN
  RAISE NOTICE 'Função check_anonymous_access removida. Use o fluxo autenticado (check_user_access) na aplicação.';
END
$$;

COMMIT;