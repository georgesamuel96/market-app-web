-- =============================================
-- ADD ROLE COLUMN TO EXISTING USERS TABLE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozwdsfbfmrazcxfhrxvs/sql
-- =============================================

-- Add role column to users table (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client'
CHECK (role IN ('client', 'admin'));

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading users for login check
CREATE POLICY IF NOT EXISTS "Allow read access to users" ON users
  FOR SELECT USING (true);

-- Policy: Allow insert for registration
CREATE POLICY IF NOT EXISTS "Allow insert for registration" ON users
  FOR INSERT WITH CHECK (true);

-- Policy: Allow update for users
CREATE POLICY IF NOT EXISTS "Allow update for users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- UPDATE EXISTING USER TO ADMIN
-- Replace 'your-email@example.com' with actual admin email
-- =============================================

-- Example: Make a user an admin
-- UPDATE users SET role = 'admin' WHERE email = 'george@test.com';
