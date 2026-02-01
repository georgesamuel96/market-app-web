-- =============================================
-- ADMINS TABLE FOR DASHBOARD AUTHENTICATION
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozwdsfbfmrazcxfhrxvs/sql
-- =============================================

-- Enable pgcrypto extension for password verification
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admins table for dashboard login
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading admins for login check
CREATE POLICY "Allow read access to admins" ON admins
  FOR SELECT USING (true);

-- Policy: Allow insert for registration
CREATE POLICY "Allow insert for admins" ON admins
  FOR INSERT WITH CHECK (true);

-- Policy: Allow update for admins
CREATE POLICY "Allow update for admins" ON admins
  FOR UPDATE USING (true) WITH CHECK (true);

-- Policy: Allow delete for admins
CREATE POLICY "Allow delete for admins" ON admins
  FOR DELETE USING (true);

-- =============================================
-- FUNCTION: Verify admin login with SHA-256 hashed password
-- This function securely verifies the password on the server
-- =============================================

CREATE OR REPLACE FUNCTION verify_admin_login(
  admin_email TEXT,
  admin_password TEXT
)
RETURNS JSON AS $$
DECLARE
  found_admin RECORD;
  hashed_input TEXT;
  password_valid BOOLEAN;
BEGIN
  -- Find admin by email
  SELECT id, first_name, last_name, email, password
  INTO found_admin
  FROM admins
  WHERE email = admin_email
  LIMIT 1;

  -- Check if admin exists
  IF found_admin IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This email is not registered as an admin.'
    );
  END IF;

  -- Hash the input password with SHA-256 and encode as hex
  hashed_input := encode(digest(admin_password, 'sha256'), 'hex');

  -- Compare with stored hash (case-insensitive comparison)
  password_valid := lower(found_admin.password) = lower(hashed_input);

  IF NOT password_valid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password. Please try again.'
    );
  END IF;

  -- Return success with admin data (without password)
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', found_admin.id,
      'email', found_admin.email,
      'first_name', found_admin.first_name,
      'last_name', found_admin.last_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO authenticated;

-- =============================================
-- HELPER FUNCTION: Create admin with hashed password
-- =============================================

CREATE OR REPLACE FUNCTION create_admin(
  admin_email TEXT,
  admin_password TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT
)
RETURNS JSON AS $$
DECLARE
  hashed_password TEXT;
  new_admin RECORD;
BEGIN
  -- Check if admin already exists
  IF EXISTS (SELECT 1 FROM admins WHERE email = admin_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'An admin with this email already exists.'
    );
  END IF;

  -- Hash the password with SHA-256
  hashed_password := encode(digest(admin_password, 'sha256'), 'hex');

  -- Insert new admin
  INSERT INTO admins (email, password, first_name, last_name)
  VALUES (admin_email, hashed_password, admin_first_name, admin_last_name)
  RETURNING id, email, first_name, last_name INTO new_admin;

  RETURN json_build_object(
    'success', true,
    'admin', json_build_object(
      'id', new_admin.id,
      'email', new_admin.email,
      'first_name', new_admin.first_name,
      'last_name', new_admin.last_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_admin(TEXT, TEXT, TEXT, TEXT) TO authenticated;
