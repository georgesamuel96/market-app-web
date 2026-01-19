-- =============================================
-- ADD ROLE COLUMN TO EXISTING USERS TABLE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozwdsfbfmrazcxfhrxvs/sql
-- =============================================

-- Enable pgcrypto extension for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add role column to users table (if not exists)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client'
CHECK (role IN ('client', 'admin'));

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading users for login check
DROP POLICY IF EXISTS "Allow read access to users" ON users;
CREATE POLICY "Allow read access to users" ON users
  FOR SELECT USING (true);

-- Policy: Allow insert for registration
DROP POLICY IF EXISTS "Allow insert for registration" ON users;
CREATE POLICY "Allow insert for registration" ON users
  FOR INSERT WITH CHECK (true);

-- Policy: Allow update for users
DROP POLICY IF EXISTS "Allow update for users" ON users;
CREATE POLICY "Allow update for users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- FUNCTION: Verify user login with hashed password
-- This function securely verifies the password on the server
-- =============================================

CREATE OR REPLACE FUNCTION verify_user_login(
  user_email TEXT,
  user_password TEXT
)
RETURNS JSON AS $$
DECLARE
  found_user RECORD;
  password_valid BOOLEAN;
BEGIN
  -- Find user by email
  SELECT id, first_name, last_name, email, password, role
  INTO found_user
  FROM users
  WHERE email = user_email
  LIMIT 1;

  -- Check if user exists
  IF found_user IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This email is not registered. Please check your email.'
    );
  END IF;

  -- Verify password using crypt (for bcrypt hashed passwords)
  -- This works with passwords hashed using bcrypt/pgcrypto
  password_valid := found_user.password = crypt(user_password, found_user.password);

  IF NOT password_valid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password. Please try again.'
    );
  END IF;

  -- Check if user is admin
  IF found_user.role != 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This email is not registered as an admin. Access denied.'
    );
  END IF;

  -- Return success with user data (without password)
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', found_user.id,
      'email', found_user.email,
      'first_name', found_user.first_name,
      'last_name', found_user.last_name,
      'role', found_user.role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_user_login(TEXT, TEXT) TO authenticated;

-- =============================================
-- UPDATE EXISTING USER TO ADMIN
-- Replace email with actual admin email
-- =============================================

-- Example: Make a user an admin
-- UPDATE users SET role = 'admin' WHERE email = 'george@test.com';
