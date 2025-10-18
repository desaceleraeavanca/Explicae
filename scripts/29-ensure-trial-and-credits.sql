-- Ensure trial configuration and credits defaults on public.profiles

-- 1) Columns: trial_ends_at and credits_remaining
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits_remaining integer;

-- 2) Default credits_remaining = 30 (for new profiles)
ALTER TABLE public.profiles
  ALTER COLUMN credits_remaining SET DEFAULT 30;

-- 3) Trigger to set trial_ends_at = NOW() + 7 days on creation
CREATE OR REPLACE FUNCTION public.set_trial_period()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at := NOW() + interval '7 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_trial_period ON public.profiles;
CREATE TRIGGER profiles_set_trial_period
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_trial_period();

-- 4) Diagnostics (run manually):
-- SELECT column_name, data_type, column_default FROM information_schema.columns
-- WHERE table_schema='public' AND table_name='profiles' AND column_name IN ('trial_ends_at','credits_remaining');