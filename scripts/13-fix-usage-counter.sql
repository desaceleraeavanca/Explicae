DROP FUNCTION IF EXISTS increment_user_usage(uuid);

-- Função para incrementar o uso e atualizar os créditos corretamente
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  current_credits INT;
BEGIN
  -- Incrementa o contador de analogias
  INSERT INTO public.user_stats (
    user_id, 
    total_analogies, 
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
    total_analogies = COALESCE(public.user_stats.total_analogies, 0) + 1,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();

  -- Atualiza os créditos
  SELECT plan_type, credits_remaining INTO user_plan, current_credits
  FROM public.profiles
  WHERE id = p_user_id;

  -- Inicializa créditos para planos gratuitos se for NULL
  IF user_plan = 'gratuito' AND current_credits IS NULL THEN
    UPDATE public.profiles
    SET credits_remaining = 99
    WHERE id = p_user_id;
  -- Atualiza os créditos para planos gratuitos
  ELSIF user_plan = 'gratuito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(COALESCE(credits_remaining, 99) - 1, 0)
    WHERE id = p_user_id;
  ELSIF user_plan = 'credito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(credits_remaining - 1, 0)
    WHERE id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;