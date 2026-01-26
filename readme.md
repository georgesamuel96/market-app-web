# Market App Backend

A Node.js backend API with Supabase for customer authentication and database management.

## Tech Stack

- Node.js with Express
- Supabase (PostgreSQL database)
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```
market-app-backend/
├── src/
│   ├── config/
│   │   └── supabase.js       # Supabase client config
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   └── auth.js           # Authentication routes
│   └── server.js             # Express server entry point
├── supabase/
│   ├── schema.sql            # Database schema
│   ├── auth-schema.sql       # Auth tables schema
│   └── customer-auth-migration.sql
├── .env.example              # Example environment variables
├── package.json
└── railway.json              # Railway deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Supabase account and project

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to **SQL Editor** in your Supabase dashboard

3. Run the SQL files in the `supabase/` folder to create tables

4. Get your credentials from **Project Settings > API**:
   - Project URL
   - Service role key (for backend)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
PORT=3001
```

### Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at http://localhost:3001

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Authentication
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Login customer
- `GET /api/auth/profile` - Get authenticated customer profile

## Deployment

This project includes Railway deployment configuration. Push to deploy automatically.

## License

MIT
