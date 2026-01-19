# Database Dashboard

A full-stack web application built with React.js and Express.js for managing a database with products, customers, and orders.

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

### Backend
- Node.js
- Express.js
- better-sqlite3 (SQLite database)
- CORS middleware

## Project Structure

```
market-app-web/
├── backend/
│   ├── package.json
│   ├── server.js          # Express API server
│   └── dashboard.db       # SQLite database (created on first run)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   ├── services/
│   │   │   └── api.js     # API service functions
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Running the Application

1. Start the backend server (Terminal 1):
```bash
npm run dev:backend
# or
cd backend && npm run dev
```
The API server will run on http://localhost:3001

2. Start the frontend development server (Terminal 2):
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```
The React app will run on http://localhost:3000

3. Open your browser and navigate to http://localhost:3000

## API Endpoints

### Stats
- `GET /api/stats` - Get dashboard statistics
- `GET /api/stats/categories` - Get category statistics
- `GET /api/stats/orders` - Get order statistics

### Products
- `GET /api/products` - List all products (supports ?search, ?category, ?sort)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - List all customers (supports ?search)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - List all orders (supports ?status)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

## License

MIT
