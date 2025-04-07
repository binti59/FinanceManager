# Personal Finance Manager - Low Level Design

## 1. Introduction

This document provides a detailed low-level design of the Personal Finance Manager application. It describes the internal components, data models, API endpoints, and interactions between different parts of the system.

## 2. Frontend Architecture

### 2.1 Component Structure

The frontend follows a feature-based architecture with the following structure:

```
src/
├── assets/            # Static assets (images, icons, etc.)
├── components/        # Reusable UI components
│   ├── common/        # Common components used across features
│   └── layout/        # Layout components (header, sidebar, etc.)
├── features/          # Feature-specific components
│   ├── auth/          # Authentication-related components
│   ├── dashboard/     # Dashboard components
│   ├── accounts/      # Account management components
│   ├── transactions/  # Transaction management components
│   ├── budgets/       # Budget management components
│   ├── goals/         # Goal tracking components
│   ├── investments/   # Investment portfolio components
│   ├── fire-calculator/ # FIRE calculator components
│   ├── reports/       # Reports and analytics components
│   ├── files/         # File management components
│   ├── settings/      # User settings components
│   └── help/          # Help and support components
├── hooks/             # Custom React hooks
├── routes/            # Routing configuration
├── services/          # API service functions
├── store/             # Redux store configuration
│   ├── slices/        # Redux slices for state management
│   └── index.js       # Store configuration
├── utils/             # Utility functions
├── App.js             # Main application component
├── index.js           # Application entry point
└── theme.js           # Theme configuration
```

### 2.2 State Management

The application uses Redux for state management with the following slices:

- **authSlice**: Authentication state (user info, tokens, login status)
- **accountsSlice**: Financial accounts data
- **transactionsSlice**: Transaction records
- **categoriesSlice**: Transaction categories
- **budgetsSlice**: Budget configurations and progress
- **goalsSlice**: Financial goals and progress
- **investmentsSlice**: Investment portfolio data
- **reportsSlice**: Report configurations and data
- **filesSlice**: Uploaded files and documents
- **uiSlice**: UI state (sidebar open/closed, active page, etc.)

### 2.3 Routing Structure

```
/                     # Redirects to /dashboard or /login
/login                # Login page
/register             # Registration page
/forgot-password      # Password recovery
/reset-password       # Password reset
/dashboard            # Main dashboard
/accounts             # Accounts management
/transactions         # Transaction management
/budgets              # Budget management
/goals                # Financial goals
/investments          # Investment portfolio
/fire-calculator      # FIRE calculator
/reports              # Reports and analytics
/files                # File management
/settings             # User settings
/help                 # Help and support
/404                  # Not found page
```

### 2.4 Authentication Flow

1. User enters credentials on login page
2. Frontend sends credentials to `/api/auth/login` endpoint
3. Backend validates credentials and returns JWT tokens (access and refresh)
4. Frontend stores tokens in memory and secure HTTP-only cookies
5. Access token is included in Authorization header for subsequent API requests
6. Refresh token is used to obtain new access tokens when they expire
7. On logout, tokens are invalidated on the server and removed from the client

## 3. Backend Architecture

### 3.1 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database configuration
│   └── config.js     # Application configuration
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
│   ├── auth.js       # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── models/           # Database models
├── routes/           # API route definitions
├── services/         # Business logic
├── utils/            # Utility functions
├── validators/       # Request validation schemas
├── app.js            # Express application setup
└── server.js         # Server entry point
```

### 3.2 API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and get tokens
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Users

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `PUT /api/users/password` - Change password

#### Accounts

- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create a new account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id/balance-history` - Get account balance history

#### Transactions

- `GET /api/transactions` - List transactions with filtering
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import` - Import transactions from file

#### Categories

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Budgets

- `GET /api/budgets` - List all budgets
- `POST /api/budgets` - Create a new budget
- `GET /api/budgets/:id` - Get budget details
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/:id/progress` - Get budget progress

#### Goals

- `GET /api/goals` - List all goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals/:id` - Get goal details
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/progress` - Get goal progress

#### Investments

- `GET /api/investments` - List all investments
- `POST /api/investments` - Create a new investment
- `GET /api/investments/:id` - Get investment details
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment
- `GET /api/investments/portfolio` - Get portfolio summary
- `GET /api/investments/performance` - Get performance metrics

#### Reports

- `GET /api/reports/income-expense` - Get income vs expense report
- `GET /api/reports/category-breakdown` - Get spending by category
- `GET /api/reports/net-worth` - Get net worth over time
- `GET /api/reports/savings-rate` - Get savings rate over time
- `GET /api/reports/custom` - Generate custom report

#### Files

- `GET /api/files` - List all files
- `POST /api/files` - Upload a new file
- `GET /api/files/:id` - Download file
- `DELETE /api/files/:id` - Delete file

### 3.3 Middleware

- **Authentication Middleware**: Validates JWT tokens and attaches user to request
- **Error Handling Middleware**: Catches errors and returns appropriate responses
- **Validation Middleware**: Validates request data against schemas
- **Logging Middleware**: Logs requests and responses
- **CORS Middleware**: Handles Cross-Origin Resource Sharing
- **Rate Limiting Middleware**: Prevents abuse of API endpoints

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │   Accounts  │       │ Transactions│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ email       │       │ user_id     │──┐    │ account_id  │──┐
│ password    │       │ name        │  │    │ category_id │──┼─┐
│ first_name  │       │ type        │  │    │ amount      │  │ │
│ last_name   │       │ balance     │  │    │ date        │  │ │
│ created_at  │◄──────│ currency    │  │    │ description │  │ │
│ updated_at  │       │ institution │  │    │ type        │  │ │
└─────────────┘       │ created_at  │  │    │ created_at  │  │ │
                      │ updated_at  │  │    │ updated_at  │  │ │
                      └─────────────┘  │    └─────────────┘  │ │
                                       │                     │ │
                                       │    ┌─────────────┐  │ │
                                       └────│ user_id     │◄─┘ │
                                            ├─────────────┤    │
                                            │ Categories  │    │
                                            ├─────────────┤    │
                                            │ id          │    │
                                            │ user_id     │    │
                                            │ name        │    │
                                            │ type        │    │
                                            │ color       │    │
                                            │ icon        │    │
                                            │ created_at  │◄───┘
                                            │ updated_at  │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Budgets   │       │    Goals    │       │ Investments │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ user_id     │       │ user_id     │       │ user_id     │
│ category_id │       │ name        │       │ name        │
│ amount      │       │ target      │       │ type        │
│ period      │       │ current     │       │ value       │
│ start_date  │       │ target_date │       │ quantity    │
│ created_at  │       │ created_at  │       │ price       │
│ updated_at  │       │ updated_at  │       │ created_at  │
└─────────────┘       └─────────────┘       │ updated_at  │
                                            └─────────────┘

┌─────────────┐       ┌─────────────┐
│    Files    │       │ KPI History │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ user_id     │       │ user_id     │
│ name        │       │ date        │
│ type        │       │ net_worth   │
│ size        │       │ savings_rate│
│ path        │       │ created_at  │
│ created_at  │       │ updated_at  │
│ updated_at  │       └─────────────┘
└─────────────┘
```

### 4.2 Data Models

#### User Model

```javascript
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC'
  }
});
```

#### Account Model

```javascript
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('checking', 'savings', 'credit', 'investment', 'loan', 'other'),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});
```

#### Transaction Model

```javascript
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Accounts',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('income', 'expense', 'transfer'),
    allowNull: false
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringFrequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
    allowNull: true
  }
});
```

## 5. Security Implementation

### 5.1 Authentication

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Configuration**: Access tokens (15 min expiry), Refresh tokens (7 days expiry)
- **Token Storage**: Access token in memory, Refresh token in HTTP-only cookie

### 5.2 Authorization

- **Role-Based Access**: Admin and User roles with different permissions
- **Resource Ownership**: Users can only access their own data
- **API Protection**: All endpoints except authentication require valid JWT

### 5.3 Data Protection

- **Input Validation**: Joi schemas for all API requests
- **SQL Injection Prevention**: Parameterized queries via Sequelize ORM
- **XSS Prevention**: Content Security Policy and output encoding
- **CSRF Protection**: CSRF tokens for state-changing operations

## 6. Error Handling

### 6.1 Error Types

- **ValidationError**: Invalid input data
- **AuthenticationError**: Invalid credentials or token
- **AuthorizationError**: Insufficient permissions
- **NotFoundError**: Resource not found
- **ConflictError**: Resource already exists
- **ServerError**: Unexpected server error

### 6.2 Error Response Format

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 7. Performance Optimizations

### 7.1 Database Optimizations

- **Indexing**: Indexes on frequently queried fields
- **Query Optimization**: Limit and pagination for large result sets
- **Connection Pooling**: Reuse database connections

### 7.2 API Optimizations

- **Response Compression**: gzip/deflate compression
- **Caching**: Cache frequently accessed data
- **Pagination**: Limit large responses with pagination

### 7.3 Frontend Optimizations

- **Code Splitting**: Load components on demand
- **Memoization**: Prevent unnecessary re-renders
- **Virtualization**: Efficiently render large lists

## 8. Testing Strategy

### 8.1 Unit Testing

- **Backend**: Jest for controllers, services, and utilities
- **Frontend**: React Testing Library for components

### 8.2 Integration Testing

- **API Testing**: Supertest for API endpoints
- **Database Testing**: Test database interactions

### 8.3 End-to-End Testing

- **User Flows**: Cypress for critical user journeys
- **Cross-Browser Testing**: Test on major browsers

## 9. Deployment Process

### 9.1 Environment Setup

- **Development**: Local development environment
- **Staging**: Pre-production environment for testing
- **Production**: Live environment for end users

### 9.2 Deployment Steps

1. Build frontend assets
2. Run database migrations
3. Deploy backend API
4. Deploy frontend assets
5. Run smoke tests
6. Switch traffic to new version

## 10. Monitoring and Logging

### 10.1 Application Logging

- **Log Levels**: Error, Warning, Info, Debug
- **Log Format**: JSON format with timestamp, level, message, and context
- **Log Storage**: Rotating file logs and centralized logging service

### 10.2 Performance Monitoring

- **API Response Times**: Track endpoint performance
- **Database Query Times**: Monitor slow queries
- **Frontend Load Times**: Track page load and component render times

## 11. Conclusion

This low-level design document provides a detailed blueprint for implementing the Personal Finance Manager application. It covers the frontend and backend architecture, database design, security considerations, and other important aspects of the system. This document should be used as a reference during development and maintained as the system evolves.
