-- =============================================
-- DATABASE SCHEMA FOR DASHBOARD
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ozwdsfbfmrazcxfhrxvs/sql
-- =============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable read/write access for authenticated and anonymous users
-- =============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies (allow all operations for demo)
CREATE POLICY "Allow all access to products" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Customers policies
CREATE POLICY "Allow all access to customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all access to orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample products
INSERT INTO products (name, category, price, stock) VALUES
  ('Laptop Pro 15"', 'Electronics', 1299.99, 50),
  ('Wireless Mouse', 'Electronics', 29.99, 200),
  ('Mechanical Keyboard', 'Electronics', 149.99, 75),
  ('Monitor 27" 4K', 'Electronics', 499.99, 30),
  ('USB-C Hub', 'Accessories', 49.99, 150),
  ('Webcam HD', 'Electronics', 79.99, 100),
  ('Desk Chair', 'Furniture', 299.99, 25),
  ('Standing Desk', 'Furniture', 599.99, 15),
  ('Notebook Set', 'Office', 19.99, 500),
  ('Pen Pack', 'Office', 9.99, 1000);

-- Insert sample customers
INSERT INTO customers (name, email, phone, address) VALUES
  ('John Doe', 'john@example.com', '555-0101', '123 Main St, NYC'),
  ('Jane Smith', 'jane@example.com', '555-0102', '456 Oak Ave, LA'),
  ('Bob Johnson', 'bob@example.com', '555-0103', '789 Pine Rd, Chicago'),
  ('Alice Brown', 'alice@example.com', '555-0104', '321 Elm St, Houston'),
  ('Charlie Wilson', 'charlie@example.com', '555-0105', '654 Maple Dr, Phoenix');

-- Insert sample orders
INSERT INTO orders (customer_id, product_id, quantity, total_amount, status) VALUES
  (1, 1, 1, 1299.99, 'completed'),
  (1, 2, 2, 59.98, 'completed'),
  (2, 3, 1, 149.99, 'shipped'),
  (2, 4, 1, 499.99, 'pending'),
  (3, 5, 3, 149.97, 'completed'),
  (3, 7, 1, 299.99, 'shipped'),
  (4, 8, 1, 599.99, 'pending'),
  (4, 9, 5, 99.95, 'completed'),
  (5, 6, 2, 159.98, 'shipped'),
  (5, 10, 10, 99.90, 'completed');
