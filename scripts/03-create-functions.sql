-- Function to increment analogy count and update stats
CREATE OR REPLACE FUNCTION increment_analogy_count(user_id_param UUID)
RETURNS void AS $$
BEGIN
  -- Insere um novo registro ou atualiza o existente usando INSERT ... ON CONFLICT
  INSERT INTO public.user_stats (
    user_id, 
    total_analogies, 
    last_activity_date,
    current_streak,
    longest_streak,
    created_at,
    updated_at
  )
  VALUES (
    user_id_param, 
    1, 
    CURRENT_DATE,
    1,
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_analogies = COALESCE(public.user_stats.total_analogies, 0) + 1,
    last_activity_date = CURRENT_DATE,
    current_streak = CASE
      WHEN public.user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(public.user_stats.current_streak, 0) + 1
      WHEN public.user_stats.last_activity_date = CURRENT_DATE THEN COALESCE(public.user_stats.current_streak, 1)
      ELSE 1
    END,
    longest_streak = GREATEST(
      COALESCE(public.user_stats.longest_streak, 0),
      CASE
        WHEN public.user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN COALESCE(public.user_stats.current_streak, 0) + 1
        WHEN public.user_stats.last_activity_date = CURRENT_DATE THEN COALESCE(public.user_stats.current_streak, 1)
        ELSE 1
      END
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
