-- Add credit expiration tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_expires_at TIMESTAMPTZ;

-- Update check_user_access function to handle credit expiration and fair use
CREATE OR REPLACE FUNCTION check_user_access(user_id_param UUID)
RETURNS TABLE(
  can_generate BOOLEAN,
  reason TEXT,
  generations_used INTEGER,
  generations_limit INTEGER
) AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
  trial_end TIMESTAMPTZ;
  user_credits INTEGER;
  credits_expiry TIMESTAMPTZ;
  gen_count INTEGER;
  monthly_gen_count INTEGER;
  start_of_month TIMESTAMPTZ;
BEGIN
  -- Get user info
  SELECT plan_type, subscription_status, trial_ends_at, credits_remaining, credits_expires_at
  INTO user_plan, user_status, trial_end, user_credits, credits_expiry
  FROM public.profiles
  WHERE id = user_id_param;

  -- Count total generations
  SELECT COUNT(*)
  INTO gen_count
  FROM public.generations
  WHERE user_id = user_id_param;

  -- Count monthly generations for fair use policy
  start_of_month := date_trunc('month', NOW());
  SELECT COUNT(*)
  INTO monthly_gen_count
  FROM public.generations
  WHERE user_id = user_id_param
    AND created_at >= start_of_month;

  -- Check access based on plan
  IF user_plan = 'gratuito' THEN
    -- Check trial period (7 days)
    IF trial_end IS NOT NULL AND NOW() > trial_end THEN
      RETURN QUERY SELECT FALSE, 'trial_expired'::TEXT, gen_count, 100;
      RETURN;
    END IF;
    
    -- Check generation limit (100)
    IF gen_count >= 100 THEN
      RETURN QUERY SELECT FALSE, 'limit_reached'::TEXT, gen_count, 100;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'ok'::TEXT, gen_count, 100;
    
  ELSIF user_plan = 'credito' THEN
    -- Check if credits expired (30 days)
    IF credits_expiry IS NOT NULL AND NOW() > credits_expiry THEN
      RETURN QUERY SELECT FALSE, 'credits_expired'::TEXT, 0, 0;
      RETURN;
    END IF;
    
    -- Check credits
      IF user_credits <= 0 THEN
        RETURN QUERY SELECT FALSE, 'no_credits'::TEXT, 300, 300; -- show full used when none remaining
      END IF;
      
      -- Credit plan shows limit=300 and used=(300 - credits_remaining)
      RETURN QUERY SELECT TRUE, 'ok'::TEXT, GREATEST(300 - user_credits, 0), 300;
    
  ELSIF user_plan IN ('mensal', 'anual', 'admin', 'cortesia', 'promo', 'parceria', 'presente') THEN
    -- Check subscription status
    IF user_status = 'cancelada' THEN
      RETURN QUERY SELECT FALSE, 'subscription_cancelled'::TEXT, monthly_gen_count, 3000;
      RETURN;
    END IF;
    
    IF user_status = 'pendente' THEN
      RETURN QUERY SELECT FALSE, 'payment_pending'::TEXT, monthly_gen_count, 3000;
      RETURN;
    END IF;
    
    -- Fair use policy: hard cap at 3000 per current month
    IF monthly_gen_count >= 3000 THEN
      RETURN QUERY SELECT FALSE, 'fair_use_limit'::TEXT, monthly_gen_count, 3000;
      RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'ok'::TEXT, monthly_gen_count, 3000;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits with expiration
CREATE OR REPLACE FUNCTION add_credits(
  user_id_param UUID,
  credits_amount INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET 
    credits_remaining = credits_remaining + credits_amount,
    credits_expires_at = NOW() + INTERVAL '30 days',
    plan_type = 'credito',
    subscription_status = 'ativa',
    updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
