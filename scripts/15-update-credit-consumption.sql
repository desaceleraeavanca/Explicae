-- Script para atualizar o consumo de créditos (1 crédito por analogia)
-- Cada chamada consome apenas 1 crédito

CREATE OR REPLACE FUNCTION consume_credit(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  current_credits INT;
BEGIN
  SELECT plan_type, credits_remaining INTO user_plan, current_credits
  FROM public.profiles
  WHERE id = user_id_param;

  -- Inicializa créditos para planos gratuitos se for NULL
  IF user_plan = 'gratuito' AND current_credits IS NULL THEN
    UPDATE public.profiles
    SET credits_remaining = 100
    WHERE id = user_id_param;
    RETURN TRUE;
  -- Atualiza os créditos para planos gratuitos
  ELSIF user_plan = 'gratuito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(COALESCE(credits_remaining, 99) - 1, 0)
    WHERE id = user_id_param;
    RETURN TRUE;
  ELSIF user_plan = 'credito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(credits_remaining - 1, 0)
    WHERE id = user_id_param;
    RETURN TRUE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário explicativo para documentação
COMMENT ON FUNCTION consume_credit(UUID) IS 'Consome 1 crédito por chamada, cada analogia consome 1 faísca';