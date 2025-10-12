-- Function to increment analogy count and update stats
CREATE OR REPLACE FUNCTION increment_analogy_count(user_id_param UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, total_analogies, last_activity_date)
  VALUES (user_id_param, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_analogies = user_stats.total_analogies + 1,
    last_activity_date = CURRENT_DATE,
    current_streak = CASE
      WHEN user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN user_stats.current_streak + 1
      WHEN user_stats.last_activity_date = CURRENT_DATE THEN user_stats.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      user_stats.longest_streak,
      CASE
        WHEN user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN user_stats.current_streak + 1
        WHEN user_stats.last_activity_date = CURRENT_DATE THEN user_stats.current_streak
        ELSE 1
      END
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
