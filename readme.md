# Database Dashboard

A full-stack web application built with React.js and Supabase for managing a database with products, customers, and orders.

## Features

- **Dashboard Overview**: View key metrics and charts
  - Total products, customers, orders, and revenue
  - Products by category chart
  - Orders by status distribution

- **Products Management**: Full CRUD operations
  - Search and filter by category
  - Sort by price or stock
  - Low stock indicators

- **Customers Management**: Full CRUD operations
  - Search by name or email
  - Contact information management

- **Orders Management**: Full CRUD operations
  - Filter by order status
  - Automatic total calculation
  - Status tracking (pending, shipped, completed)

## Tech Stack

### Frontend
- React 18
- React Router DOM (navigation)
- Recharts (data visualization)
- Vite (build tool)
- Supabase JS Client

### Backend
- Supabase (PostgreSQL database + REST API)

## Project Structure

```
market-app-web/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js    # Supabase client config
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   ├── services/
│   │   │   └── api.js         # Supabase API functions
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env                   # Supabase credentials (not in git)
│   ├── .env.example           # Example env file
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── supabase/
│   └── schema.sql             # Database schema & seed data
├── backend/                   # Legacy SQLite backend (optional)
├── package.json
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** in your Supabase dashboard

3. Copy and run the contents of `supabase/schema.sql` to create tables and seed data

4. Get your credentials from **Project Settings > API**:
   - Project URL
   - anon/public key

### Installation

1. Clone the repository and install dependencies:
```bash
npm run install:all
# or just frontend
cd frontend && npm install
```

2. Configure environment variables:
```bash
cd frontend
cp .env.example .env
```

3. Edit `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Running the Application

Start the frontend development server:
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

Open http://localhost:3000 in your browser.

> **Note**: No backend server needed! The app connects directly to Supabase.

## Database Schema

### Products Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | TEXT | Product name |
| category | TEXT | Product category |
| price | DECIMAL | Product price |
| stock | INTEGER | Stock quantity |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Update timestamp |

### Customers Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| name | TEXT | Customer name |
| email | TEXT | Unique email |
| phone | TEXT | Phone number |
| address | TEXT | Address |
| created_at | TIMESTAMPTZ | Creation timestamp |

### Orders Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| customer_id | BIGINT | Foreign key to customers |
| product_id | BIGINT | Foreign key to products |
| quantity | INTEGER | Order quantity |
| total_amount | DECIMAL | Calculated total |
| status | TEXT | pending/shipped/completed |
| created_at | TIMESTAMPTZ | Creation timestamp |

## API Functions

The `src/services/api.js` provides these functions:

### Stats
- `fetchStats()` - Get dashboard statistics
- `fetchCategoryStats()` - Get category breakdown
- `fetchOrderStats()` - Get order status breakdown

### Products
- `fetchProducts(params)` - List products with search/filter/sort
- `fetchProduct(id)` - Get single product
- `createProduct(data)` - Create product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product

### Customers
- `fetchCustomers(params)` - List customers with search
- `fetchCustomer(id)` - Get single customer
- `createCustomer(data)` - Create customer
- `updateCustomer(id, data)` - Update customer
- `deleteCustomer(id)` - Delete customer

### Orders
- `fetchOrders(params)` - List orders with status filter
- `fetchOrder(id)` - Get single order
- `createOrder(data)` - Create order
- `updateOrder(id, data)` - Update order
- `deleteOrder(id)` - Delete order

## License

MIT
