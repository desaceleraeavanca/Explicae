-- Função para obter a configuração do OpenRouter diretamente do banco
CREATE OR REPLACE FUNCTION get_raw_openrouter_config()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT value::jsonb
    FROM system_settings
    WHERE key = 'openrouter_config'
  );
END;
$$;

-- Garantir que a função é acessível para todos os usuários autenticados
GRANT EXECUTE ON FUNCTION get_raw_openrouter_config() TO authenticated;
GRANT EXECUTE ON FUNCTION get_raw_openrouter_config() TO anon;
GRANT EXECUTE ON FUNCTION get_raw_openrouter_config() TO service_role;