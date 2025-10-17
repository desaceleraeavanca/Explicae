-- Function to check anonymous access bypassing RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.check_anonymous_access(
  anonymous_id_param TEXT
)
RETURNS TABLE(
  can_generate BOOLEAN,
  reason TEXT,
  generations_used INTEGER,
  generations_limit INTEGER
) AS $$
DECLARE
  gen_count INTEGER;
  limit_val INTEGER := 3; -- 3 uses x 3 analogies each
BEGIN
  -- Count generations for provided anonymous id
  SELECT COUNT(*) INTO gen_count
  FROM public.generations
  WHERE anonymous_id = anonymous_id_param;

  IF gen_count >= limit_val THEN
    RETURN QUERY SELECT FALSE, 'anonymous_limit_reached'::TEXT, gen_count, limit_val;
  ELSE
    RETURN QUERY SELECT TRUE, 'ok'::TEXT, gen_count, limit_val;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure function runs in the correct schema
ALTER FUNCTION public.check_anonymous_access(TEXT) SET search_path = public;