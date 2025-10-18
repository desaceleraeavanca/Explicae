-- Enforce: no anonymous generations, strict RLS on public.generations

-- 1) Ensure RLS is enabled
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing policies on public.generations to avoid permissive overlaps
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generations'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.generations;', pol.policyname);
  END LOOP;
END $$;

-- 3) Create strict policies: only authenticated users can access their own rows
-- SELECT own rows
CREATE POLICY generations_select_own
  ON public.generations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT own rows only
CREATE POLICY generations_insert_own
  ON public.generations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE own rows only
CREATE POLICY generations_update_own
  ON public.generations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE own rows only
CREATE POLICY generations_delete_own
  ON public.generations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4) Optional sanity check: prevent NULL user_id via constraint (defense in depth)
--    CAUTION: This will fail if there are legacy rows with user_id IS NULL.
--    Uncomment only after cleaning or migrating legacy anonymous rows.
-- ALTER TABLE public.generations
--   ALTER COLUMN user_id SET NOT NULL;

-- 5) Diagnostics (run manually):
-- SELECT policyname, polcmd, roles, polqual, polwithcheck
-- FROM pg_policies WHERE schemaname = 'public' AND tablename = 'generations';