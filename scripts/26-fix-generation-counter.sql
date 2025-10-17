-- Corrige a função de geração para incrementar apenas o contador mensal
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Incrementa APENAS o contador mensal (faíscas)
  INSERT INTO public.user_stats (
    user_id, 
    monthly_analogies,
    last_activity_date,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id, 
    1,
    CURRENT_DATE,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    monthly_analogies = COALESCE(public.user_stats.monthly_analogies, 0) + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();

  -- A lógica de consumo de créditos continua sendo tratada separadamente na API
  -- e não precisa ser alterada aqui.

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_user_usage(UUID) IS 'Incrementa apenas o contador de uso mensal (faíscas) do usuário.';