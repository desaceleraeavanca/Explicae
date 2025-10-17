-- Add monetization fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'gratuito' CHECK (plan_type IN ('gratuito', 'credito', 'mensal', 'anual', 'admin', 'cortesia', 'promo', 'parceria', 'presente'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'ativa' CHECK (subscription_status IN ('ativa', 'pendente', 'cancelada'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kiwify_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Create generations tracking table
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  concept TEXT NOT NULL,
  audience TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generations
CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_anonymous_id ON public.generations(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);

-- Function to check user access
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
  gen_count INTEGER;
BEGIN
  -- Get user info
  SELECT plan_type, subscription_status, trial_ends_at, credits_remaining
  INTO user_plan, user_status, trial_end, user_credits
  FROM public.profiles
  WHERE id = user_id_param;

  -- Count generations
  SELECT COUNT(*)
  INTO gen_count
  FROM public.generations
  WHERE user_id = user_id_param;

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
    -- Check credits
    IF user_credits <= 0 THEN
      RETURN QUERY SELECT FALSE, 'no_credits'::TEXT, 0, 0;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'ok'::TEXT, user_credits, user_credits;
  ELSIF user_plan IN ('mensal', 'anual', 'admin', 'cortesia', 'promo', 'parceria', 'presente') THEN
    -- Check subscription status
    IF user_status = 'cancelada' THEN
      RETURN QUERY SELECT FALSE, 'subscription_cancelled'::TEXT, 0, 0;
      RETURN;
    END IF;
    
    IF user_status = 'pendente' THEN
      RETURN QUERY SELECT FALSE, 'payment_pending'::TEXT, 0, 0;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'ok'::TEXT, 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to consume credit
CREATE OR REPLACE FUNCTION consume_credit(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  current_credits INT;
BEGIN
  SELECT plan_type, credits_remaining INTO user_plan, current_credits
  FROM public.profiles
  WHERE id = user_id_param;

  -- Inicializa créditos para planos gratuitos se for NULL
  IF user_plan = 'gratuito' AND current_credits IS NULL THEN
    UPDATE public.profiles
    SET credits_remaining = 99
    WHERE id = user_id_param;
    RETURN TRUE;
  -- Atualiza os créditos para planos gratuitos
  ELSIF user_plan = 'gratuito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(COALESCE(credits_remaining, 99) - 1, 0)
    WHERE id = user_id_param;
    RETURN TRUE;
  ELSIF user_plan = 'credito' THEN
    UPDATE public.profiles
    SET credits_remaining = GREATEST(credits_remaining - 1, 0)
    WHERE id = user_id_param;
    RETURN TRUE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set trial period on signup
CREATE OR REPLACE FUNCTION set_trial_period()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trial_ends_at = NOW() + INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set trial period on profile creation
DROP TRIGGER IF EXISTS set_trial_on_signup ON public.profiles;
CREATE TRIGGER set_trial_on_signup
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_period();
