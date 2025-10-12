-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_id_var UUID;
  total_analogies_var INTEGER;
  total_favorites_var INTEGER;
  current_streak_var INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user_id based on the table
  IF TG_TABLE_NAME = 'analogies' THEN
    user_id_var := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'user_stats' THEN
    user_id_var := NEW.user_id;
  ELSE
    RETURN NEW;
  END IF;

  -- Get current stats
  SELECT total_analogies, total_favorites, current_streak
  INTO total_analogies_var, total_favorites_var, current_streak_var
  FROM public.user_stats
  WHERE user_id = user_id_var;

  -- Check each badge
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF EXISTS (
      SELECT 1 FROM public.user_badges
      WHERE user_id = user_id_var AND badge_id = badge_record.id
    ) THEN
      CONTINUE;
    END IF;

    -- Check if user qualifies for this badge
    IF badge_record.requirement_type = 'count' AND 
       total_analogies_var >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (user_id_var, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.requirement_type = 'streak' AND 
          current_streak_var >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (user_id_var, badge_record.id)
      ON CONFLICT DO NOTHING;
    ELSIF badge_record.requirement_type = 'special' THEN
      -- Handle special badges
      IF badge_record.name = 'Colecionador' AND 
         total_favorites_var >= badge_record.requirement_value THEN
        INSERT INTO public.user_badges (user_id, badge_id)
        VALUES (user_id_var, badge_record.id)
        ON CONFLICT DO NOTHING;
      ELSIF badge_record.name = 'Explorador de Públicos' THEN
        DECLARE
          audience_count INTEGER;
        BEGIN
          SELECT COUNT(*) INTO audience_count
          FROM public.audience_profiles
          WHERE user_id = user_id_var;
          
          IF audience_count >= badge_record.requirement_value THEN
            INSERT INTO public.user_badges (user_id, badge_id)
            VALUES (user_id_var, badge_record.id)
            ON CONFLICT DO NOTHING;
          END IF;
        END;
      ELSIF badge_record.name = 'Organizador' THEN
        DECLARE
          categorized_count INTEGER;
        BEGIN
          SELECT COUNT(*) INTO categorized_count
          FROM public.analogies
          WHERE user_id = user_id_var AND category IS NOT NULL;
          
          IF categorized_count >= badge_record.requirement_value THEN
            INSERT INTO public.user_badges (user_id, badge_id)
            VALUES (user_id_var, badge_record.id)
            ON CONFLICT DO NOTHING;
          END IF;
        END;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS check_badges_on_analogy ON public.analogies;
CREATE TRIGGER check_badges_on_analogy
  AFTER INSERT OR UPDATE ON public.analogies
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS check_badges_on_stats ON public.user_stats;
CREATE TRIGGER check_badges_on_stats
  AFTER UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();

DROP TRIGGER IF EXISTS check_badges_on_audience ON public.audience_profiles;
CREATE TRIGGER check_badges_on_audience
  AFTER INSERT ON public.audience_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_badges();
