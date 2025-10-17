-- Script para atualizar os limites de fair use para planos mensal e anual
-- Cada plano mensal e anual terá direito a 3000 chamadas por mês (mesmo que gere 9000 analogias)

-- Atualiza a função check_user_access para refletir o novo limite de fair use
CREATE OR REPLACE FUNCTION check_user_access(user_id_param UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  reason TEXT,
  generations_used INT,
  generations_limit INT
) AS $$
DECLARE
  user_plan TEXT;
  user_credits INT;
  monthly_usage INT;
  monthly_limit INT := 3000; -- Novo limite para planos mensal e anual (3000 chamadas)
  free_limit INT := 100;     -- Limite para plano gratuito
BEGIN
  -- Obtém o plano e créditos do usuário
  SELECT plan_type, credits_remaining INTO user_plan, user_credits
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Conta o uso mensal para planos com fair use
  SELECT COUNT(*) INTO monthly_usage
  FROM public.generations
  WHERE user_id = user_id_param
  AND created_at >= date_trunc('month', CURRENT_DATE);

  -- Verifica acesso com base no plano
  CASE
    -- Plano gratuito
    WHEN user_plan = 'gratuito' THEN
      RETURN QUERY SELECT 
        monthly_usage < free_limit,
        CASE WHEN monthly_usage >= free_limit THEN 'Limite de analogias atingido' ELSE NULL END,
        monthly_usage,
        free_limit;
    
    -- Plano de créditos (Faísca)
    WHEN user_plan = 'credito' THEN
      RETURN QUERY SELECT 
        user_credits > 0,
        CASE WHEN user_credits <= 0 THEN 'Seus créditos acabaram' ELSE NULL END,
        300 - user_credits,
        300;
    
    -- Planos mensal e anual (com fair use)
    WHEN user_plan IN ('mensal', 'anual') THEN
      RETURN QUERY SELECT 
        TRUE, -- Sempre pode gerar, mas com fair use
        NULL::TEXT,
        monthly_usage,
        monthly_limit;
    
    -- Planos especiais (admin, cortesia, etc.)
    WHEN user_plan IN ('admin', 'cortesia', 'promo', 'parceria', 'presente') THEN
      RETURN QUERY SELECT 
        TRUE,
        NULL::TEXT,
        0,
        999999;
    
    -- Plano não reconhecido
    ELSE
      RETURN QUERY SELECT 
        FALSE,
        'Plano não reconhecido',
        0,
        0;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário explicativo para documentação
COMMENT ON FUNCTION check_user_access(UUID) IS 'Verifica se um usuário pode gerar analogias com base em seu plano. Planos mensal e anual têm limite de 3000 chamadas por mês (fair use).';