import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new Database(join(__dirname, 'dashboard.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed sample data if tables are empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)
  `);

  const products = [
    ['Laptop Pro 15"', 'Electronics', 1299.99, 50],
    ['Wireless Mouse', 'Electronics', 29.99, 200],
    ['Mechanical Keyboard', 'Electronics', 149.99, 75],
    ['Monitor 27" 4K', 'Electronics', 499.99, 30],
    ['USB-C Hub', 'Accessories', 49.99, 150],
    ['Webcam HD', 'Electronics', 79.99, 100],
    ['Desk Chair', 'Furniture', 299.99, 25],
    ['Standing Desk', 'Furniture', 599.99, 15],
    ['Notebook Set', 'Office', 19.99, 500],
    ['Pen Pack', 'Office', 9.99, 1000],
  ];

  products.forEach(p => insertProduct.run(...p));
}

const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
if (customerCount.count === 0) {
  const insertCustomer = db.prepare(`
    INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)
  `);

  const customers = [
    ['John Doe', 'john@example.com', '555-0101', '123 Main St, NYC'],
    ['Jane Smith', 'jane@example.com', '555-0102', '456 Oak Ave, LA'],
    ['Bob Johnson', 'bob@example.com', '555-0103', '789 Pine Rd, Chicago'],
    ['Alice Brown', 'alice@example.com', '555-0104', '321 Elm St, Houston'],
    ['Charlie Wilson', 'charlie@example.com', '555-0105', '654 Maple Dr, Phoenix'],
  ];

  customers.forEach(c => insertCustomer.run(...c));
}

const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get();
if (orderCount.count === 0) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (customer_id, product_id, quantity, total_amount, status) VALUES (?, ?, ?, ?, ?)
  `);

  const orders = [
    [1, 1, 1, 1299.99, 'completed'],
    [1, 2, 2, 59.98, 'completed'],
    [2, 3, 1, 149.99, 'shipped'],
    [2, 4, 1, 499.99, 'pending'],
    [3, 5, 3, 149.97, 'completed'],
    [3, 7, 1, 299.99, 'shipped'],
    [4, 8, 1, 599.99, 'pending'],
    [4, 9, 5, 99.95, 'completed'],
    [5, 6, 2, 159.98, 'shipped'],
    [5, 10, 10, 99.90, 'completed'],
  ];

  orders.forEach(o => insertOrder.run(...o));
}

// ==================== API ROUTES ====================

// Dashboard Stats
app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"').get().total || 0;
    const lowStockProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock < 30').get().count;
    const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "pending"').get().count;

    res.json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      lowStockProducts,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Category stats for charts
app.get('/api/stats/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(stock) as totalStock
      FROM products GROUP BY category
    `).all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order stats for charts
app.get('/api/stats/orders', (req, res) => {
  try {
    const orderStats = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as total
      FROM orders GROUP BY status
    `).all();
    res.json(orderStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRODUCTS CRUD ====================

app.get('/api/products', (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'stock_asc') query += ' ORDER BY stock ASC';
    else if (sort === 'stock_desc') query += ' ORDER BY stock DESC';
    else query += ' ORDER BY id DESC';

    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }
    const result = db.prepare(`
      INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)
    `).run(name, category, price, stock || 0);
    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    const result = db.prepare(`
      UPDATE products SET name = ?, category = ?, price = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, category, price, stock, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CUSTOMERS CRUD ====================

app.get('/api/customers', (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY id DESC';

    const customers = db.prepare(query).all(...params);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', (req, res) => {
  try {
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const result = db.prepare(`
      INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)
    `).run(name, email, phone || null, address || null);
    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCustomer);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const result = db.prepare(`
      UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?
    `).run(name, email, phone, address, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json(updatedCustomer);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORDERS CRUD ====================

app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN products p ON o.product_id = p.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    query += ' ORDER BY o.id DESC';

    const orders = db.prepare(query).all(...params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { customer_id, product_id, quantity, status } = req.body;
    if (!customer_id || !product_id || !quantity) {
      return res.status(400).json({ error: 'Customer, product, and quantity are required' });
    }

    const product = db.prepare('SELECT price FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    const total_amount = product.price * quantity;
    const result = db.prepare(`
      INSERT INTO orders (customer_id, product_id, quantity, total_amount, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(customer_id, product_id, quantity, total_amount, status || 'pending');

    const newOrder = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', (req, res) => {
  try {
    const { customer_id, product_id, quantity, status } = req.body;

    const product = db.prepare('SELECT price FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    const total_amount = product.price * quantity;
    const result = db.prepare(`
      UPDATE orders SET customer_id = ?, product_id = ?, quantity = ?, total_amount = ?, status = ?
      WHERE id = ?
    `).run(customer_id, product_id, quantity, total_amount, status, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });

    const updatedOrder = db.prepare(`
      SELECT o.*, c.name as customer_name, p.name as product_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ?
    `).get(req.params.id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
