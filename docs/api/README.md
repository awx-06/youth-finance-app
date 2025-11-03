# API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PARENT"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

#### Refresh Token
```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

**Response:** `200 OK`

#### Logout
```
POST /auth/logout
```

**Response:** `200 OK`

### Users

#### Get Profile
```
GET /users/profile
```

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "parent@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PARENT",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Profile
```
PUT /users/profile
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}
```

**Response:** `200 OK`

#### Link Child
```
POST /users/link-child
```

**Auth Required:** Yes (Parent only)

**Request Body:**
```json
{
  "childId": "uuid"
}
```

**Response:** `200 OK`

#### Get Children
```
GET /users/children
```

**Auth Required:** Yes (Parent only)

**Response:** `200 OK`

### Accounts

#### Get All Accounts
```
GET /accounts
```

**Auth Required:** Yes

**Response:** `200 OK`

#### Get Account by ID
```
GET /accounts/:id
```

**Auth Required:** Yes

**Response:** `200 OK`

#### Get Account Balance
```
GET /accounts/:id/balance
```

**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 100.50
  }
}
```

#### Create Account
```
POST /accounts
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "childId": "uuid",
  "name": "Savings Account"
}
```

**Response:** `201 Created`

### Transactions

#### Create Transaction
```
POST /transactions
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "type": "TRANSFER",
  "amount": 25.00,
  "description": "Birthday money"
}
```

**Response:** `201 Created`

#### Get Transactions
```
GET /transactions?accountId=uuid&status=COMPLETED&limit=50&offset=0
```

**Auth Required:** Yes

**Query Parameters:**
- `accountId` (optional): Filter by account
- `type` (optional): Filter by transaction type
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset

**Response:** `200 OK`

#### Approve Transaction
```
PUT /transactions/:id/approve
```

**Auth Required:** Yes (Parent only)

**Response:** `200 OK`

#### Decline Transaction
```
PUT /transactions/:id/decline
```

**Auth Required:** Yes (Parent only)

**Request Body:**
```json
{
  "declinedReason": "Insufficient funds"
}
```

**Response:** `200 OK`

### Allowances

#### Create Allowance
```
POST /allowances
```

**Auth Required:** Yes (Parent only)

**Request Body:**
```json
{
  "childId": "uuid",
  "amount": 10.00,
  "frequency": "WEEKLY",
  "startDate": "2024-01-01T00:00:00Z",
  "description": "Weekly allowance"
}
```

**Response:** `201 Created`

#### Get Allowances
```
GET /allowances
```

**Auth Required:** Yes

**Response:** `200 OK`

#### Update Allowance
```
PUT /allowances/:id
```

**Auth Required:** Yes (Parent only)

**Request Body:**
```json
{
  "amount": 15.00,
  "isActive": true
}
```

**Response:** `200 OK`

#### Delete Allowance
```
DELETE /allowances/:id
```

**Auth Required:** Yes (Parent only)

**Response:** `200 OK`

#### Process Allowances (Cron)
```
POST /allowances/process
```

**Auth Required:** Yes (Admin/System)

**Response:** `200 OK`

### Savings Goals

#### Create Savings Goal
```
POST /savings-goals
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "accountId": "uuid",
  "name": "New Bike",
  "targetAmount": 200.00,
  "deadline": "2024-12-31T00:00:00Z",
  "description": "Save for a new bicycle"
}
```

**Response:** `201 Created`

#### Get Savings Goals
```
GET /savings-goals
```

**Auth Required:** Yes

**Response:** `200 OK`

#### Update Savings Goal
```
PUT /savings-goals/:id
```

**Auth Required:** Yes

**Request Body:**
```json
{
  "currentAmount": 50.00
}
```

**Response:** `200 OK`

#### Delete Savings Goal
```
DELETE /savings-goals/:id
```

**Auth Required:** Yes

**Response:** `200 OK`

### Notifications

#### Get Notifications
```
GET /notifications?limit=50&offset=0
```

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:** `200 OK`

#### Mark as Read
```
PUT /notifications/:id/read
```

**Auth Required:** Yes

**Response:** `200 OK`

#### Mark All as Read
```
PUT /notifications/read-all
```

**Auth Required:** Yes

**Response:** `200 OK`

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Transaction endpoints: 10 requests per minute
