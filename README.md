# 📝 Task Manager API

A robust, feature-rich **Task Management REST API** built with **NestJS**, **TypeScript**, and **MySQL**. This application provides complete task management functionality with advanced features like Redis caching, rate limiting, JWT authentication, and comprehensive API documentation.

## 🚀 Features

### Core Functionality

- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete tasks
- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 👤 **User Management** - User registration and profile management
- 🔍 **Advanced Filtering** - Filter tasks by status and search terms
- 📊 **Task Status Management** - OPEN, IN_PROGRESS, DONE status workflow

### Advanced Features

- 🚀 **Redis Caching** - High-performance caching for improved response times
- 🛡️ **Rate Limiting** - Multi-tier throttling protection against abuse
- 📡 **Real-time Updates** - Redis Pub/Sub for real-time notifications
- 📚 **Swagger Documentation** - Complete API documentation with interactive UI
- ✨ **Input Validation** - Comprehensive request validation with class-validator
- 🧪 **Comprehensive Testing**

### Security & Performance

- 🔒 **JWT Token Security** - Stateless authentication with configurable expiration
- 🛑 **Rate Limiting** - Multiple throttling tiers (per-second, per-minute)
- 🗄️ **Database Security** - Parameterized queries and ORM protection
- ⚡ **Optimized Caching** - Smart cache invalidation and refresh strategies

## 🛠️ Tech Stack

### Backend Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript

### Database & Caching

- **MySQL** - Primary database
- **TypeORM** - Object-Relational Mapping
- **Redis** - Caching and Pub/Sub messaging

### Authentication & Security

- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Passport** - Authentication middleware
- **class-validator** - Input validation

### Development & Testing

- **Jest** - Testing framework
- **Swagger** - API documentation
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MySQL** >= 8.0
- **Redis** >= 6.0

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd task-manager-crud
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create environment files:

**.env.stage.dev**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=task_manager_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Application
PORT=3001
STAGE=dev
```

### 4. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE task_manager_dev;
```

### 5. Start Services

```bash
# Start Redis (if using local Redis)
redis-server

# Start MySQL service
# On macOS: brew services start mysql
# On Linux: sudo systemctl start mysql
```

### 6. Run Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Interactive Documentation

Visit `http://localhost:3001/api` for **Swagger UI** with interactive API documentation.

### Authentication

All task endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication

```http
POST /auth/signin          # Sign in user
```

#### User Management

```http
GET  /users/:id           # Get user by ID
POST /users               # Create new user
```

#### Task Management

```http
GET    /tasks             # Get all tasks (with optional filters)
GET    /tasks/:id         # Get specific task
POST   /tasks             # Create new task
PATCH  /tasks/:id/status  # Update task status
DELETE /tasks/:id         # Delete task
```

### Request/Response Examples

#### Create User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

#### Sign In

```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

#### Create Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs"
  }'
```

#### Filter Tasks

```bash
# Filter by status
GET /tasks?status=OPEN

# Search tasks
GET /tasks?search=documentation

# Combined filters
GET /tasks?status=IN_PROGRESS&search=project
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# Specific test files
npm test -- --testPathPatterns="auth|users|tasks"
```

### Test Coverage

- **27 Unit Tests** - Services and controllers
- **100% Core Functionality** - All modules covered
- **Authentication Flow** - Complete auth testing
- **Caching Logic** - Redis cache hit/miss scenarios
- **Error Handling** - 401, 404, 400 responses
- **Rate Limiting** - Throttling verification

## 🏗️ Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators
│   ├── enums/               # Application enums
│   ├── guards/              # Custom guards
│   └── interfaces/          # TypeScript interfaces
├── config/                   # Configuration files
│   └── redis.config.ts      # Redis configuration
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/           # Data Transfer Objects
│   │   └── strategies/    # Passport strategies
│   ├── users/             # User management module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── user.entity.ts
│   │   ├── user.repository.ts
│   │   └── dto/
│   ├── tasks/             # Task management module
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   ├── tasks.entity.ts
│   │   ├── tasks.repository.ts
│   │   └── dto/
│   └── redis/             # Redis module
│       ├── redis.service.ts
│       ├── redis.module.ts
│       └── redis-pubsub.service.ts
└── test/                   # Test files
    ├── *.spec.ts          # Unit tests
    └── *.e2e-spec.ts      # E2E tests
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

### Git Hooks

Pre-commit hooks automatically run:

- ESLint for code quality
- Prettier for formatting
- Tests for functionality

### Environment Variables

The application uses different configurations for different environments:

- **Development**: `.env.stage.dev`
- **Production**: `.env.stage.prod`
- **Test**: Uses in-memory/test configurations

## 📊 Performance Features

### Redis Caching

- **Cache Strategy**: Cache-first with fallback to database
- **Smart Invalidation**: Automatic cache cleanup on data changes
- **Performance Gain**: faster response times for cached data

### Rate Limiting

- **Multi-tier Protection**:
  - Short: 3 requests/second
  - Medium: 20 requests/10 seconds
  - Long: 100 requests/minute

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Configurable expiration and refresh
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Parameterized queries via TypeORM
- **Rate Limiting**: Multi-tier request throttling

**⚡ Built with NestJS, TypeScript, and Redis for maximum performance and scalability.**
