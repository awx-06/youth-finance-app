# Youth Finance App

A comprehensive youth financial management platform that enables children and teenagers to learn financial literacy while giving parents complete oversight and control over their finances. Similar to GoHenry.

## 🌟 Features

### For Parents
- **Complete Oversight**: Monitor all transactions and account activity
- **Allowance Management**: Set up automatic allowances (daily, weekly, monthly)
- **Transaction Approval**: Approve or decline child transactions
- **Multiple Children**: Manage accounts for multiple children
- **Real-time Notifications**: Get notified of important events
- **Savings Goals**: Help children set and track savings goals
- **Audit Trail**: Complete history of all financial activities

### For Children
- **Personal Account**: Own account with real-time balance
- **Transaction History**: View all past transactions
- **Savings Goals**: Set and track personal savings goals
- **Request Transactions**: Request money or purchases (requires parent approval)
- **Financial Learning**: Learn money management in a safe environment
- **Mobile App**: Easy-to-use mobile interface

## 🏗️ Architecture

This is a monorepo containing:

- **Backend API**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Web Dashboard**: React + TypeScript + Vite + Tailwind CSS (for parents)
- **Mobile App**: React Native + Expo (for children)
- **Shared**: Common types and constants

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for local development)
- PostgreSQL (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/awx-06/youth-finance-app.git
cd youth-finance-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Web Dashboard
cp web-dashboard/.env.example web-dashboard/.env
# Edit web-dashboard/.env with your configuration
```

4. **Start with Docker (Recommended)**
```bash
npm run docker:dev
```

Or manually:

5. **Set up the database**
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. **Start development servers**
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3000`
- Web Dashboard on `http://localhost:5173`

### Mobile App Setup

```bash
cd mobile-app
npm install
npm start
```

## 📚 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, bcrypt, rate limiting
- **Logging**: Winston

### Web Dashboard
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### Mobile App
- **Framework**: React Native
- **Platform**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand
- **HTTP Client**: Axios

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier

## 📖 Documentation

- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api/README.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all development servers
npm run dev:backend      # Start only backend
npm run dev:web          # Start only web dashboard

# Building
npm run build            # Build all projects
npm run build:backend    # Build only backend
npm run build:web        # Build only web dashboard

# Testing
npm test                 # Run all tests

# Code Quality
npm run lint             # Lint all projects
npm run format           # Format all files with Prettier

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations

# Docker
npm run docker:dev       # Start development environment
npm run docker:prod      # Start production environment

# Cleanup
npm run clean            # Remove all node_modules
```

### Project Structure

```
youth-finance-app/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── validators/   # Zod schemas
│   │   └── server.ts     # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── tests/            # Backend tests
├── web-dashboard/        # React parent dashboard
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── stores/       # State management
│   │   └── App.tsx       # Main app component
│   └── public/           # Static assets
├── mobile-app/           # React Native child app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── screens/      # Screen components
│   │   ├── navigation/   # Navigation setup
│   │   └── services/     # API services
│   └── assets/           # Images, fonts, etc.
├── shared/               # Shared types and constants
│   └── src/
│       ├── types/        # TypeScript types
│       └── constants/    # Shared constants
├── docs/                 # Documentation
└── .github/              # GitHub configuration
    └── workflows/        # CI/CD workflows
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/youth_finance

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Web Dashboard (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚢 Deployment

### Docker Production

```bash
npm run docker:prod
```

### Manual Deployment

1. **Build all projects**
```bash
npm run build
```

2. **Set production environment variables**

3. **Run database migrations**
```bash
npm run prisma:migrate
```

4. **Start the backend**
```bash
cd backend
npm start
```

5. **Serve the web dashboard** (use nginx or similar)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 API Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/link-child` - Link child to parent
- `GET /api/v1/users/children` - Get all children

### Accounts
- `GET /api/v1/accounts` - Get all accounts
- `GET /api/v1/accounts/:id` - Get account by ID
- `GET /api/v1/accounts/:id/balance` - Get account balance
- `POST /api/v1/accounts` - Create new account

### Transactions
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions` - Get transactions (with filters)
- `PUT /api/v1/transactions/:id/approve` - Approve transaction
- `PUT /api/v1/transactions/:id/decline` - Decline transaction

### Allowances
- `POST /api/v1/allowances` - Create allowance
- `GET /api/v1/allowances` - Get allowances
- `PUT /api/v1/allowances/:id` - Update allowance
- `DELETE /api/v1/allowances/:id` - Delete allowance
- `POST /api/v1/allowances/process` - Process due allowances

### Savings Goals
- `POST /api/v1/savings-goals` - Create savings goal
- `GET /api/v1/savings-goals` - Get savings goals
- `PUT /api/v1/savings-goals/:id` - Update savings goal
- `DELETE /api/v1/savings-goals/:id` - Delete savings goal

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by GoHenry and similar youth banking platforms
- Built with modern web technologies and best practices
- Designed for scalability and maintainability

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for youth financial education**
