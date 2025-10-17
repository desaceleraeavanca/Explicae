-- Script para debug e correção do monthly_analogies

-- 1. Verificar se a coluna existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_stats' 
AND column_name = 'monthly_analogies';

-- 2. Verificar dados atuais dos usuários gratuitos
SELECT 
  p.id,
  p.email,
  p.plan_type,
  p.credits_remaining,
  s.monthly_analogies,
  s.total_analogies
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
WHERE p.plan_type = 'gratuito'
LIMIT 10;

-- 3. Forçar atualização do monthly_analogies para 0 (para não bloquear usuários)
UPDATE user_stats 
SET monthly_analogies = 0
WHERE monthly_analogies IS NULL;

-- 4. Para usuários que já criaram analogias, definir um valor baixo
UPDATE user_stats 
SET monthly_analogies = LEAST(5, total_analogies)
WHERE monthly_analogies > 50 OR monthly_analogies IS NULL;

-- 5. Verificar resultado final
SELECT 
  p.id,
  p.email,
  p.plan_type,
  p.credits_remaining,
  s.monthly_analogies,
  s.total_analogies
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
WHERE p.plan_type = 'gratuito'
LIMIT 10;