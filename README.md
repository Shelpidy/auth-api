# USERS AND TENANTS MANAGEMENT AUTH API

A multi-tenant authentication and user management API with role-based access control and OAuth2 integration. This API uses NestJS with PostgreSQL (via Drizzle ORM), JWT-based authentication, and email verification. All keys and endpoints follow snake-case naming conventions throughout.

## Features

- User registration with email verification and password reset via OTP
- Role-based access control supporting roles such as super-admin, admin, manager, and user
- Multi-tenant support including tenant creation, contact, settings, locations, and subscription management
- OAuth2 authentication (Google and Microsoft)
- Structured logging with daily rotation
- Fully documented REST API endpoints

## Technologies

- Node.js (v20+), TypeScript, NestJS
- Drizzle ORM with PostgreSQL
- JWT Authentication and Passport strategies
- Nodemailer for email delivery
- Docker Compose for containerized development environment

## Table of Contents

- [Project Setup](#project-setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Tenant Management](#tenant-management)
  - [Role Management](#role-management)
  - [User Management](#user-management)
- [Logging & Error Handling](#logging--error-handling)
- [Scripts and Commands](#scripts-and-commands)
- [Testing](#testing)

## Project Setup

### Available Scripts

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start development server with hot-reload
npm run format       # Format code using Prettier
npm run build        # Build TypeScript code
npm run start        # Start production server

# Database Management
npm run push         # Apply migrations to development database
npm run push:test    # Apply migrations to test database
npm run studio      # Open Drizzle Studio for database management

# Environment Setup
npm run setup:dev    # Initialize development environment
npm run setup:test   # Initialize test environment
npm run seed         # Seed database with initial data

# Testing
npm test            # Run tests with open handle detection
npm run test:watch  # Run tests in watch mode
npm run test:cov # Run tests with coverage report
npm run test:debug 

# Lint
npm run lint
```

### Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd auth-api
```

2. Install dependencies:

  ```bash
  npm install
  ```

3. Create environment file:

  ```bash
  touch .env
  ```

## Environment Variables

Add in the .env file with the envs below - Use actual values,these are dummy values.

  ```.env
  # Server
  PORT=5000

  # Database
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=postgres
  POSTGRES_DB=authdb
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432

  # Authentication
  JWT_SECRET=your-secret-key

  # OAuth
  GOOGLE_CLIENT_ID=your-google-client-id
  GOOGLE_CLIENT_SECRET=your-google-client-secret
  MICROSOFT_CLIENT_ID=your-microsoft-client-id
  MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

  # Email
  SMTP_HOST=smtp.office365.com
  SMTP_PORT=587
  SMTP_USER=example@outlook.com
  SMTP_PASS=mail-app-password
  ```

4. Start development database (Using docker compose containerize database):

   If you want to use containerized database, run the script below and the script will create a database,create tables and then seed the tables with a default user with an admin role and a regular user.
   Skip step 6 if you prefer containerized database.

   **Admin**
   email:admin@example.com
   password:admin123

   **Regular user**
   email:user@example.com
   password:user123

```bash
npm run setup:dev
```

6. Run database migrations and seed data (non-containerized or non-virtualized database):

   Create your database from any postgresql server installed on your PC or remotely.
   Fill in the .env file with the credentials and the run the scripts below to create tables and seed database with a default user with an admin role and a regular user.
   You can then login with the seeded users and a successful login will respond with an access token (jwt-token).
   Access token for the admin user will authorize or grant an administrative access to the API.

   **Admin**
   email: admin@example.com
   password: admin123

   **Regular user**
   email: user@example.com
   password: user123

    ```bash
    npm run push
    npm run seed
    ```

7. Start development server:

    ```bash
    npm run dev
    ```

### Manage database with Drizzle Studio:

  Open another terminal (Git Bash or Command Prompt), run the script below and then visit link shown on the terminal to access a database UI to see and manage the tables you created.

   ```bash
   npm run studio

   ```

 ### Testing

   1. Setup test environment:

   ```bash
   npm run setup:test
   ```

   2. Run tests:

   ```bash
   npm run test
   ```

   ```bash
   npm run test:cov // with coverage
   ```

   ```bash
   npm run test:watch
   ```

   ```bash
   npm run test:debug
   ```

  ## Full Virtualization

    If you want to run the project completely using docker compose (ie. containerized version of the project itself along with the database for development), follow the development steps below.

    #### Development

    After step 1, go to step 3 in getting started section to setup .env file and then run the scripts below and everything will be set, along with the seeded users.

    ```bash
    # Start development environment
    docker-compose -f docker-compose.yml up -d

    # Stop development environment
    docker-compose -f docker-compose.yml down
    ```

  #### Production

    Setup .env in a secure way (using scp or rsync to transfer the .env to where the server with be running on production).
    Setup up remote database and run containerized version of the project.

    ```bash
    # Start production environment
    docker-compose -f docker-compose.prod.yml up -d

    # Stop production environment
    docker-compose -f docker-compose.prod.yml down
    ```

## Authentication Setup

### Apple Sign-In
1. Place your Apple private key file in `auth-keys/AuthKey_XXX.p8`
2. Update the key ID, team ID and client ID in `src/config/auth.config.ts`

## Logging Configuration

### Logger Setup

The application uses Winston for structured JSON logging with daily rotation. Logs are stored in the `/logs` directory.

### Log Format

```typescript
interface LogEntry {
  timestamp: string; // ISO datetime
  method: string; // HTTP method
  url: string; // Request URL
  status: number; // HTTP status code
  duration: string; // Request duration (ms)
  userAgent: string; // Client user agent
  ip: string; // Client IP
  query: object; // Query parameters
  body?: object; // Request body (if present)
  level: string; // Log level (info/warn/error)
  message: string; // Log message
}
```

```bash
/logs/
  ├── application-2025-03-11.log     # Current day's logs
  ├── application-2025-03-10.log.gz  # Previous day (compressed)
  └── error-2025-03-11.log          # Error-only logs
```

### Content of log file

Content of --application-2025-03-11.log--

```json
{"duration":"952ms","ip":"::1","level":"info","message":"Request processed","method":"GET","query":{},"status":200,"timestamp":"2025-03-11 08:32:49","url":"/tenants","userAgent":"PostmanRuntime/7.43.0"}

{"duration":"239ms","ip":"::1","level":"info","message":"Request processed","method":"GET","query":{"limit":"2"},"status":200,"timestamp":"2025-03-11 08:33:12","url":"/users?limit=2","userAgent":"PostmanRuntime/7.43.0"}

{"duration":"73ms","ip":"::1","level":"info","message":"Request processed","method":"GET","query":{},"status":200,"timestamp":"2025-03-11 08:33:39","url":"/users","userAgent":"PostmanRuntime/7.43.0"}
```
