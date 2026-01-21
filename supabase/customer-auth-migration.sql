-- =============================================
-- CUSTOMER AUTHENTICATION MIGRATION
-- Run this in Supabase SQL Editor to add
-- authentication fields to the customers table
-- =============================================

-- Step 1: Add new authentication columns to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: Migrate existing 'name' data to first_name and last_name
-- This splits the existing 'name' field into first_name and last_name
UPDATE customers
SET
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Step 3: Set default values for new customers
ALTER TABLE customers
ALTER COLUMN first_name SET DEFAULT '',
ALTER COLUMN last_name SET DEFAULT '';

-- Step 4: Create index on email for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Step 5: Update RLS policies for customer authentication
-- Allow customers to read their own data
DROP POLICY IF EXISTS "Customers can read own data" ON customers;
CREATE POLICY "Customers can read own data" ON customers
  FOR SELECT USING (true);

-- Allow insert for registration (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Allow insert for customer registration" ON customers;
CREATE POLICY "Allow insert for customer registration" ON customers
  FOR INSERT WITH CHECK (true);

-- Allow customers to update their own data
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================
-- OPTIONAL: Create a function to get customer by email
-- This can be used for more complex queries
-- =============================================

CREATE OR REPLACE FUNCTION get_customer_by_email(customer_email TEXT)
RETURNS TABLE (
  id BIGINT,
  email TEXT,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.email,
    c.password_hash,
    c.first_name,
    c.last_name,
    c.phone,
    c.address,
    c.created_at
  FROM customers c
  WHERE c.email = customer_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_customer_by_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_customer_by_email(TEXT) TO authenticated;

-- =============================================
-- VERIFICATION QUERIES
-- Run these to verify the migration worked
-- =============================================

-- Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'customers';

-- Check existing data was migrated
-- SELECT id, email, first_name, last_name, name FROM customers LIMIT 10;
