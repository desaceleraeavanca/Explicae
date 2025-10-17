-- Verifica os dados do usuário joao@explicae.com
SELECT
  p.id,
  p.email,
  p.plan_type,
  p.credits_remaining,
  us.total_analogies,
  us.monthly_analogies
FROM
  public.profiles AS p
JOIN
  public.user_stats AS us ON p.id = us.user_id
WHERE
  p.email = 'joao@explicae.com';