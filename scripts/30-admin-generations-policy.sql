-- Restore admin full access policies on public.generations (after 28-enforce-no-anonymous.sql)

-- Ensure the security definer function exists to check admin (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT: Admins can view all generations
CREATE POLICY generations_admin_select_all
  ON public.generations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- UPDATE: Admins can update any generation
CREATE POLICY generations_admin_update_all
  ON public.generations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: Admins can delete any generation
CREATE POLICY generations_admin_delete_all
  ON public.generations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Optional: Allow admins to insert any generation (including for other users)
-- Uncomment if you want admins to create rows on behalf of other users
-- CREATE POLICY generations_admin_insert_any
--   ON public.generations
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (public.is_admin());