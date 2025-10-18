-- Debug dos usuários específicos testados

-- 1. Verificar dados completos dos usuários testados
SELECT 
  p.id,
  p.email,
  p.plan_type,
  p.credits_remaining,
  s.monthly_analogies,
  s.total_analogies,
  s.current_streak,
  s.last_activity_date,
  uc.credits_remaining as user_credits_remaining,
  uc.expiry_date
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
LEFT JOIN user_credits uc ON p.id = uc.user_id
WHERE p.email IN ('maria@explicae.com', 'pereiraadilson@ymail.com', 'pereiraadiilson@gmail.com')
ORDER BY p.email;

-- 2. Verificar se há discrepâncias nos dados
SELECT 
  'Inconsistência detectada' as status,
  p.email,
  s.total_analogies as total_no_stats,
  s.monthly_analogies as monthly_no_stats,
  CASE 
    WHEN s.total_analogies != s.monthly_analogies AND p.plan_type = 'gratuito' 
    THEN 'PROBLEMA: total != monthly para plano gratuito'
    WHEN s.monthly_analogies > 30 AND p.plan_type = 'gratuito'
    THEN 'PROBLEMA: monthly > 30 para plano gratuito'
    ELSE 'OK'
  END as diagnostico
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
WHERE p.email IN ('maria@explicae.com', 'pereiraadilson@ymail.com', 'pereiraadiilson@gmail.com');

-- 3. Corrigir os dados para que monthly_analogies seja consistente
-- Para planos gratuitos, monthly_analogies deve refletir o uso mensal real
UPDATE user_stats 
SET monthly_analogies = CASE 
  WHEN (SELECT plan_type FROM profiles WHERE id = user_stats.user_id) = 'gratuito' 
  THEN LEAST(total_analogies, 30)  -- Máximo 30 para planos gratuitos
  ELSE monthly_analogies  -- Manter valor atual para outros planos
END
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('maria@explicae.com', 'pereiraadilson@ymail.com', 'pereiraadiilson@gmail.com')
);

-- 4. Verificar resultado final
SELECT 
  p.id,
  p.email,
  p.plan_type,
  p.credits_remaining,
  s.monthly_analogies,
  s.total_analogies,
  CASE 
    WHEN p.plan_type = 'gratuito' THEN CONCAT(s.monthly_analogies, '/30')
    WHEN p.plan_type = 'credito' THEN CONCAT('Créditos: ', p.credits_remaining)
    ELSE 'Ilimitado'
  END as display_esperado
FROM profiles p
LEFT JOIN user_stats s ON p.id = s.user_id
WHERE p.email IN ('maria@explicae.com', 'pereiraadilson@ymail.com', 'pereiraadiilson@gmail.com')
ORDER BY p.email;