-- =============================================
-- SHOP AUTHENTICATION FUNCTIONS
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozwdsfbfmrazcxfhrxvs/sql
-- =============================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- FUNCTION: Register a new shop
-- =============================================

CREATE OR REPLACE FUNCTION register_shop(
  shop_name TEXT,
  shop_email TEXT,
  shop_password TEXT,
  shop_phone TEXT DEFAULT NULL,
  shop_address TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  hashed_password TEXT;
  new_shop RECORD;
BEGIN
  -- Check if shop with this email already exists
  IF EXISTS (SELECT 1 FROM shops WHERE email = shop_email) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'A shop with this email already exists.'
    );
  END IF;

  -- Hash the password with SHA-256
  hashed_password := encode(digest(shop_password, 'sha256'), 'hex');

  -- Insert new shop
  INSERT INTO shops (name, email, password, phone, address)
  VALUES (shop_name, shop_email, hashed_password, shop_phone, shop_address)
  RETURNING id, name, email, phone, address, created_at INTO new_shop;

  RETURN json_build_object(
    'success', true,
    'shop', json_build_object(
      'id', new_shop.id,
      'name', new_shop.name,
      'email', new_shop.email,
      'phone', new_shop.phone,
      'address', new_shop.address,
      'created_at', new_shop.created_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_shop(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_shop(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- =============================================
-- FUNCTION: Verify shop login
-- =============================================

CREATE OR REPLACE FUNCTION verify_shop_login(
  shop_email TEXT,
  shop_password TEXT
)
RETURNS JSON AS $$
DECLARE
  found_shop RECORD;
  hashed_input TEXT;
  password_valid BOOLEAN;
BEGIN
  -- Find shop by email
  SELECT id, name, email, password, phone, address, created_at
  INTO found_shop
  FROM shops
  WHERE email = shop_email
  LIMIT 1;

  -- Check if shop exists
  IF found_shop IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No shop found with this email.'
    );
  END IF;

  -- Hash the input password with SHA-256
  hashed_input := encode(digest(shop_password, 'sha256'), 'hex');

  -- Compare with stored hash (case-insensitive comparison)
  password_valid := lower(found_shop.password) = lower(hashed_input);

  IF NOT password_valid THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password. Please try again.'
    );
  END IF;

  -- Return success with shop data (without password)
  RETURN json_build_object(
    'success', true,
    'shop', json_build_object(
      'id', found_shop.id,
      'name', found_shop.name,
      'email', found_shop.email,
      'phone', found_shop.phone,
      'address', found_shop.address,
      'created_at', found_shop.created_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_shop_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_shop_login(TEXT, TEXT) TO authenticated;
