# Youth Finance App - Setup Guide

This guide will help you set up and run the Youth Finance App on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/get-started)) - Optional but recommended
- **PostgreSQL** >= 15 ([Download](https://www.postgresql.org/download/)) - Only if not using Docker

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker Compose:

### 1. Clone the Repository

```bash
git clone https://github.com/awx-06/youth-finance-app.git
cd youth-finance-app
```

### 2. Set Up Environment Variables

```bash
# Copy environment file for backend
cp backend/.env.example backend/.env

# Copy environment file for web dashboard
cp web-dashboard/.env.example web-dashboard/.env
```

### 3. Start with Docker Compose

```bash
npm run docker:dev
```

This will start:
- **PostgreSQL** on port 5432
- **Backend API** on port 3000
- **Web Dashboard** on port 5173

### 4. Access the Application

- **Web Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health

## Manual Setup (Without Docker)

If you prefer not to use Docker:

### 1. Clone the Repository

```bash
git clone https://github.com/awx-06/youth-finance-app.git
cd youth-finance-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE youth_finance;
```

### 4. Configure Environment Variables

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1
DATABASE_URL=postgresql://postgres:password@localhost:5432/youth_finance
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Edit `web-dashboard/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
```

### 5. Set Up the Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 6. Start the Application

In separate terminal windows:

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start web dashboard
npm run dev:web
```

## Mobile App Setup

### 1. Install Expo CLI

```bash
npm install -g expo-cli
```

### 2. Navigate to Mobile App

```bash
cd mobile-app
npm install
```

### 3. Start Expo

```bash
npm start
```

### 4. Run on Device or Emulator

- Scan the QR code with Expo Go app (iOS/Android)
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

## Testing the Application

### 1. Register a Parent Account

1. Navigate to http://localhost:5173/register
2. Fill in the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: parent@example.com
   - Password: SecurePass123!
   - Role: PARENT
3. Click "Create Account"

### 2. Login

1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - Email: parent@example.com
   - Password: SecurePass123!
3. Click "Sign In"

### 3. Explore the Dashboard

You should now see the parent dashboard with:
- Overview cards (Total Children, Balance, Transactions, Allowances)
- Navigation sidebar
- Empty states for children, transactions, etc.

## API Testing with cURL

### Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PARENT"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "SecurePass123!"
  }'
```

Save the `accessToken` from the response.

### Get User Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create an Account

```bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "childId": "CHILD_PROFILE_ID",
    "name": "Savings Account"
  }'
```

## Database Management

### Access Prisma Studio

Prisma Studio provides a visual interface to view and edit your database:

```bash
npm run prisma:studio
```

Navigate to http://localhost:5555

### Run Migrations

```bash
npm run prisma:migrate
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

**Warning**: This will delete all data!

## Troubleshooting

### Port Already in Use

If ports 3000 or 5173 are already in use:

**Backend:**
Edit `backend/.env` and change `PORT=3000` to another port.

**Web Dashboard:**
Edit `web-dashboard/vite.config.ts` and change the server port.

### Database Connection Error

Make sure PostgreSQL is running and credentials are correct in `backend/.env`.

### Prisma Client Not Generated

Run:
```bash
npm run prisma:generate
```

### TypeScript Errors

Make sure all dependencies are installed:
```bash
npm install
```

### Docker Issues

If Docker containers fail to start:

1. Check if ports are available
2. Try rebuilding:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

## Development Tools

### Available Scripts

```bash
# Root level
npm run dev              # Start all dev servers
npm run dev:backend      # Start only backend
npm run dev:web          # Start only web
npm run build            # Build all projects
npm run lint             # Lint all projects
npm run format           # Format all files

# Backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Docker
npm run docker:dev       # Start dev environment
npm run docker:prod      # Start prod environment

# Cleanup
npm run clean            # Remove all node_modules
```

### Code Quality Tools

- **ESLint**: Linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Prisma**: Database management

### VSCode Extensions (Recommended)

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Next Steps

Now that you have the application running:

1. **Explore the API**: See [API Documentation](docs/api/README.md)
2. **Understand the Architecture**: Read [Architecture Overview](docs/architecture/overview.md)
3. **Review Database Schema**: Check [Database Schema](docs/database-schema.md)
4. **Start Developing**: Add new features or customize existing ones
5. **Deploy**: Set up production environment with `docker-compose.prod.yml`

## Production Deployment

For production deployment:

1. Set strong JWT secrets
2. Use production database credentials
3. Enable SSL/TLS
4. Configure proper CORS origins
5. Set up monitoring and logging
6. Review security settings
7. Use `docker-compose.prod.yml`

See the main [README.md](README.md) for more deployment options.

## Getting Help

- **Documentation**: See [docs/](docs/) directory
- **Issues**: Open an issue on GitHub
- **API Reference**: [docs/api/README.md](docs/api/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Coding! 🚀**
