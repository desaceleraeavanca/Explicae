-- Corrige a função para incrementar o contador de analogias mensais (monthly_analogies)
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Incrementa ambos os contadores: total e mensal
  INSERT INTO public.user_stats (
    user_id, 
    total_analogies, 
    monthly_analogies,
    last_activity_date,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id, 
    1, 
    1,
    CURRENT_DATE,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_analogies = COALESCE(public.user_stats.total_analogies, 0) + 1,
    monthly_analogies = COALESCE(public.user_stats.monthly_analogies, 0) + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();

  -- O consumo de créditos continua o mesmo, não precisa mexer aqui
  -- A função consume_credit é chamada separadamente na API

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_user_usage(UUID) IS 'Incrementa o contador de uso total e mensal do usuário.';