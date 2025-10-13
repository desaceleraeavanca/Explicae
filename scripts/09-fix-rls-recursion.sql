-- Fix infinite recursion in RLS policies
-- The issue: admin policies were checking profiles table while being ON profiles table

-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all analogies" ON public.analogies;
DROP POLICY IF EXISTS "Admins can view all generations" ON public.generations;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS and prevents infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now recreate admin policies using the security definer function
-- This prevents infinite recursion because the function bypasses RLS

-- Profiles: Admins can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Analogies: Admins can view all analogies
CREATE POLICY "Admins can view all analogies" ON public.analogies
  FOR SELECT USING (public.is_admin());

-- System settings: Only admins can manage
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.is_admin());

-- Audit logs: Only admins can view
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Support tickets: Admins can view and update all tickets
CREATE POLICY "Admins can view all tickets" ON public.support_tickets
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all tickets" ON public.support_tickets
  FOR UPDATE USING (public.is_admin());

-- Feedback: Admins can view and update all feedback
CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update feedback" ON public.feedback
  FOR UPDATE USING (public.is_admin());

-- User stats: Admins can view all stats
CREATE POLICY "Admins can view all stats" ON public.user_stats
  FOR SELECT USING (public.is_admin());
