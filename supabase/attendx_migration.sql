-- AttendX Supabase schema and RLS policies
-- Run this in Supabase SQL editor (Settings > SQL Editor)

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PROFILES: linked to auth.users(id)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  role text CHECK (role IN ('student','professor')),
  roll_number text UNIQUE,
  email text,
  avatar_initial text,
  department text,
  semester text,
  created_at timestamptz DEFAULT now()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text CHECK (status IN ('present','absent')),
  marked_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, date)
);

-- LOGIN LOGS
CREATE TABLE IF NOT EXISTS login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text,
  login_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- profiles: allow users to SELECT their own profile; allow professors to SELECT any profile
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = id)
    OR (
      EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'professor')
    )
  );

-- profiles: allow users to INSERT their own profile (after signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- attendance: students can SELECT their own attendance; professors can select all
CREATE POLICY attendance_select ON attendance
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'professor')
    OR (auth.uid() = attendance.student_id)
  );

-- attendance: only professors can INSERT/UPDATE/DELETE
CREATE POLICY attendance_manage_professors ON attendance
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'professor')
  ) WITH CHECK (
    EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'professor')
  );

-- login_logs: allow users to INSERT their own login log
CREATE POLICY login_logs_insert_own ON login_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- login_logs: allow professors to SELECT logs
CREATE POLICY login_logs_professor_select ON login_logs
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'professor')
  );

-- Notes:
-- 1) After creating Auth users in Supabase (Auth > Users), create a matching
--    row in `profiles` where `id` = the auth user's id and set `role` appropriately.
-- 2) Adjust policies as needed for your security model. Test with different accounts.
