# Architecture Overview

## System Architecture

The Youth Finance App is built as a modern, scalable full-stack application using a monorepo structure.

```
┌─────────────────┐     ┌─────────────────┐
│  Mobile App     │     │  Web Dashboard  │
│  (React Native) │     │  (React + Vite) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    HTTP/REST          │
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Backend   │
              │   (Express) │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  PostgreSQL │
              │  (Database) │
              └─────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, bcrypt, rate limiting
- **Logging**: Winston

### Web Dashboard (Parent)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: 
  - Server State: React Query
  - Client State: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### Mobile App (Child)
- **Framework**: React Native
- **Platform**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand
- **HTTP Client**: Axios

### Shared
- Common TypeScript types and constants
- Shared between all applications

## Architecture Principles

### 1. Separation of Concerns

Each layer has a specific responsibility:

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data structure (Prisma)
- **Middleware**: Handle cross-cutting concerns
- **Validators**: Validate input data

### 2. Security First

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all routes
- Input validation with Zod
- CORS protection
- Security headers with Helmet
- SQL injection prevention (Prisma)

### 3. Scalability

- Stateless API design
- Database connection pooling
- Horizontal scaling support
- Caching strategies (future)
- Background job processing (future)

### 4. Developer Experience

- TypeScript strict mode
- Hot module reloading
- Comprehensive error handling
- Structured logging
- API documentation
- Docker support

## Data Flow

### Authentication Flow

```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT tokens
4. Tokens stored in client
5. Subsequent requests include token
6. Server validates token on each request
7. Refresh token used to get new access token
```

### Transaction Flow

```
1. Child creates transaction request
2. Transaction marked as PENDING
3. Parent receives notification
4. Parent approves/declines transaction
5. If approved:
   a. Transaction processed
   b. Account balances updated
   c. Transaction marked as COMPLETED
   d. Notification sent to child
6. If declined:
   a. Transaction marked as DECLINED
   b. Notification sent to child with reason
```

### Allowance Flow

```
1. Parent creates allowance schedule
2. Cron job checks for due allowances
3. For each due allowance:
   a. Create ALLOWANCE transaction
   b. Auto-approve transaction
   c. Process transaction
   d. Update account balance
   e. Calculate next due date
   f. Send notification
```

## Security Architecture

### Authentication

1. **Password Security**
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, special character
   - Hashed with bcrypt (10 rounds)

2. **JWT Tokens**
   - Access Token: 15 minutes expiry
   - Refresh Token: 7 days expiry
   - Tokens stored securely
   - Refresh token rotation

3. **Session Management**
   - Sessions tracked in database
   - Logout invalidates refresh token
   - Expired sessions cleaned up

### Authorization

1. **Role-Based Access Control**
   - PARENT: Full control over children's accounts
   - CHILD: Limited access to own account

2. **Resource Ownership**
   - Users can only access their own resources
   - Parents can access children's resources
   - Children cannot access parent resources

### Rate Limiting

- General: 100 requests / 15 minutes
- Authentication: 5 requests / 15 minutes
- Transactions: 10 requests / minute

## Database Architecture

### Schema Design

- Normalized schema
- Foreign key constraints
- Indexes on frequently queried fields
- Cascade deletes where appropriate
- Soft deletes for accounts

### Data Types

- UUIDs for primary keys
- Decimal for currency (precision 10, scale 2)
- Timestamps for audit trail
- JSON for flexible metadata

### Migrations

- Prisma migrations
- Version controlled
- Rollback support

## Deployment Architecture

### Development

```
Docker Compose:
- PostgreSQL container
- Backend container (hot reload)
- Web dashboard container (hot reload)
```

### Production

```
Docker Compose:
- PostgreSQL container (persistent volume)
- Backend container (optimized build)
- Nginx container (serves web dashboard)
- SSL/TLS termination at Nginx
- Environment variables for configuration
```

## API Design

### RESTful Principles

- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Proper status codes
- JSON request/response

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Monitoring & Logging

### Logging

- Structured logging with Winston
- Log levels: error, warn, info, http, debug
- Request/response logging
- Error stack traces in development
- Log files for persistence

### Monitoring (Future)

- Health check endpoints
- Performance metrics
- Database query performance
- API response times
- Error rates

## Scalability Considerations

### Current Architecture

- Stateless API design
- Database connection pooling
- Horizontal scaling ready

### Future Enhancements

- Redis for caching
- Message queue for background jobs
- CDN for static assets
- Database read replicas
- Microservices architecture

## Testing Strategy

### Backend

- Unit tests for services
- Integration tests for API
- Database tests with test database

### Frontend

- Component tests
- Integration tests
- E2E tests

## CI/CD Pipeline

GitHub Actions workflow:

1. **Lint**: ESLint + Prettier
2. **Test**: Run test suites
3. **Build**: Compile TypeScript
4. **Deploy**: (Future) Deploy to production

## Best Practices

1. **Code Quality**
   - TypeScript strict mode
   - ESLint + Prettier
   - No unused imports
   - Consistent naming conventions

2. **Security**
   - No secrets in code
   - Environment variables
   - Regular dependency updates
   - Security audits

3. **Performance**
   - Database indexes
   - Connection pooling
   - Efficient queries
   - Response compression

4. **Maintainability**
   - Clear documentation
   - Consistent code style
   - Modular architecture
   - Comprehensive comments
