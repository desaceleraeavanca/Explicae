-- Adicionar a coluna monthly_analogies na tabela user_stats se ela não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'user_stats' 
    AND column_name = 'monthly_analogies'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN monthly_analogies INTEGER DEFAULT 0;
  END IF;
END $$;

-- Atualizar os valores de monthly_analogies com base no total_analogies
-- Limitando a 30 para planos gratuitos para não bloquear o acesso
UPDATE user_stats 
SET monthly_analogies = LEAST(total_analogies, 30)
WHERE monthly_analogies IS NULL OR monthly_analogies = 0;

-- Garantir que os valores de credits_remaining estejam corretos na tabela profiles
UPDATE profiles
SET credits_remaining = 
  CASE 
    WHEN plan_type = 'gratuito' THEN 30
    WHEN plan_type = 'credito' THEN 300
    ELSE 999999
  END
WHERE credits_remaining = 0 OR credits_remaining IS NULL;

-- Sincronizar user_credits com profiles para garantir consistência
INSERT INTO user_credits (user_id, credits_remaining, expiry_date)
SELECT 
  id, 
  credits_remaining, 
  (CURRENT_DATE + INTERVAL '1 year')::timestamp
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_credits)
AND credits_remaining > 0;

-- Atualizar user_credits existentes que estão com 0 créditos
UPDATE user_credits
SET credits_remaining = p.credits_remaining,
    expiry_date = (CURRENT_DATE + INTERVAL '1 year')::timestamp
FROM profiles p
WHERE user_credits.user_id = p.id
AND user_credits.credits_remaining = 0
AND p.credits_remaining > 0;

-- Garantir que os valores de monthly_analogies sejam menores que 30 para planos gratuitos
UPDATE user_stats
SET monthly_analogies = 0
FROM profiles
WHERE user_stats.user_id = profiles.id
AND profiles.plan_type = 'gratuito'
AND user_stats.monthly_analogies >= 30;