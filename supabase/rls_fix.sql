-- RLS fix for AttendX
-- This file creates a SECURITY DEFINER helper to check professor role
-- and replaces the profiles/attendance/login_logs policies to avoid
-- recursive policy evaluation.

-- IMPORTANT: Run this in Supabase SQL editor for your project.

-- Set a safe search path for the function
SET search_path = public, pg_catalog;

-- SECURITY DEFINER helper to check whether a uid belongs to a professor
CREATE OR REPLACE FUNCTION public.is_professor(p_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- The function runs with the privileges of its owner and avoids
  -- triggering RLS recursion when called from a policy.
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = p_uid AND role = 'professor');
END;
$$;

-- Drop possibly problematic policies and recreate safe ones
-- (these DROP statements are idempotent and safe to run multiple times)
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;

CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = id
      OR public.is_professor(auth.uid())
    )
  );

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Attendance policies
DROP POLICY IF EXISTS attendance_select ON public.attendance;
DROP POLICY IF EXISTS attendance_manage_professors ON public.attendance;

CREATE POLICY attendance_select ON public.attendance
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (
      public.is_professor(auth.uid())
      OR auth.uid() = student_id
    )
  );

CREATE POLICY attendance_manage_professors ON public.attendance
  FOR ALL USING (
    public.is_professor(auth.uid())
  ) WITH CHECK (
    public.is_professor(auth.uid())
  );

-- login_logs policies
DROP POLICY IF EXISTS login_logs_insert_own ON public.login_logs;
DROP POLICY IF EXISTS login_logs_professor_select ON public.login_logs;

CREATE POLICY login_logs_insert_own ON public.login_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY login_logs_professor_select ON public.login_logs
  FOR SELECT USING (
    public.is_professor(auth.uid())
  );

-- Notes:
-- 1) The helper function `public.is_professor(uid)` is SECURITY DEFINER
--    so it runs with the function owner's privileges and avoids recursive
--    evaluation of RLS that would happen if policies queried `profiles`.
-- 2) After running this, test with an authenticated student and professor
--    account to ensure expected behavior. Do NOT disable RLS.
