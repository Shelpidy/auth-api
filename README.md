

# Authentication & User Management API Documentation

## Features

- Complete role-based access control (RBAC)
- Multi-tenant support
- OAuth2 integration (Google)
- Email verification
- Password reset flow
- User management
- Location management
- Tenant management

## Project Setup

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v17 or higher) for non-virtualized database and production database
- Docker & Docker Compose
- Git

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
npm run generate     # Generate database migrations
npm run push         # Apply migrations to development database
npm run push:test    # Apply migrations to test database
npm run migrate      # Run pending migrations
npm run studio      # Open Drizzle Studio for database management

# Environment Setup
npm run setup:dev    # Initialize development environment
npm run setup:test   # Initialize test environment
npm run seed         # Seed database with initial data

# Testing
npm test            # Run tests with open handle detection
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd tm-auth
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

```env
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

8. Manage database with Drizzle Studio:
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

# REST API DOCS

## Base URL

```
http://localhost:5000/api

```

## API Request Authentication

If Auth is required, request header must include:

```
  Authorization: Bearer {jwt-token}
```

## Authentication

#### Sign Up

```http
POST /auth/signup
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "username": "string",     // required, min length 3
  "email": "string",       // required, valid email
  "password": "string",    // required, min length 6
  "photo": "string",       // optional, base64
  "profile": {
    "fullName": "string",  // required, min length 1
    "firstName": "string", // required, min length 1
    "middleName": "string", // optional
    "lastName": "string",  // required, min length 1
    "gender": "string",    // optional
    "dateOfBirth": "string", // optional
    "phone": "string"     // optional
  },
  "location": {           // optional
    "addressLine1": "string", // required if location provided
    "addressLine2": "string", // optional
    "city": "string",     // required if location provided
    "state": "string",    // optional
    "province": "string", // optional
    "postalCode": "string", // optional
    "country": "string",  // required if location provided
    "latitude": "number", // optional
    "longitude": "number" // optional
  }
}
```

**Success Response:** (201 CREATED)
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "photo": "string",
    "isVerified": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Username must be at least 3 characters long",
      "Username can only contain letters, numbers, underscores and hyphens",
      "Please provide a valid email address",
      "Password must be at least 6 characters long",
      "Password must contain at least one letter and one number"
    ],
    "error": "Bad Request"
  }
  ```

- **409 Conflict**
  ```json
  {
    "statusCode": 409,
    "message": "Email already exists",
    "error": "Conflict"
  }
  ```

#### Verify Email

```http
POST /auth/verify-email
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "string",    // required, valid email
  "otp": "string"      // required, 6 digits
}
```

**Success Response:** (200 OK)
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Please provide a valid email address",
      "OTP must be exactly 6 digits"
    ],
    "error": "Bad Request"
  }
  ```

- **401 Unauthorized**
  ```json
  {
    "statusCode": 401,
    "message": "Invalid or expired verification code",
    "error": "Unauthorized"
  }
  ```

#### Resend OTP

```http
POST /auth/resend-otp
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "string"    // required, valid email
}
```

**Success Response:** (200 OK)
```json
{
  "message": "New verification code sent successfully"
}
```
#### Sign In

```http
POST /auth/signin
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "string",    // required, valid email
  "password": "string"  // required, min length 1
}
```

**Success Response:** (200 OK)
```json
{
  "message": "Sign in successful",
  "token": "jwt_token",
  "user": {
    "userId": "uuid",
    "username": "string",
    "photo": "string",
    "email": "string",
    "isVerified": true,
    "createdAt": "string",
    "updatedAt": "string",
    "auth": {
      "lastLoginAt": "string",
      "lastLoginIp": "string"
    },
    "userRoles": [
      {
        "role": {
          "roleId": "uuid",
          "name": "string"
        }
      }
    ]
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Please provide a valid email address",
      "Password is required"
    ],
    "error": "Bad Request"
  }
  ```

- **401 Unauthorized**
  ```json
  {
    "statusCode": 401,
    "message": "Invalid credentials",
    "error": "Unauthorized"
  }
  ```

#### Forgot Password

```http
POST /auth/forget-password
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "string"    // required, valid email
}
```

**Success Response:** (200 OK)
```json
{
  "message": "OTP sent successfully to your email"
}
```

#### Reset Password

```http
PATCH /auth/reset-password
```

**Auth Required:** No  
**Role Required:** None

**Request Body:**
```json
{
  "email": "string",     // required, valid email
  "otp": "string",      // required, 6 digits
  "newPassword": "string" // required, min length 6
}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "Password reset successful"
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Please provide a valid email address",
      "OTP must be exactly 6 digits",
      "Password must be at least 6 characters long",
      "Password must contain at least one letter and one number"
    ],
    "error": "Bad Request"
  }
  ```

- **404 Not Found**
  ```json
  {
    "statusCode": 404,
    "message": "User not found",
    "error": "Not Found"
  }
  ```

### OAuth Authentication

#### Google Authentication

```http
GET /auth/google
```

**Auth Required:** No  
**Role Required:** None  
**Redirects To:** Google login page

```http
GET /auth/google/callback
```

**Redirects To:** `http://localhost:3000/signin?token={token}`

**Error Responses:**

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Microsoft Authentication

```http
GET /auth/microsoft
```

**Auth Required:** No  
**Role Required:** None  
**Redirects To:** Microsoft login page

```http
GET /auth/microsoft/callback
```

**Redirects To:** example `http://localhost:3000/signin?token={token}`

**Error Responses:**

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

### OAuth Callback Handler

**Frontend Page URL:** example `http://localhost:3000/signin?token={token}`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get token from URL parameters
    const token = searchParams.get('token')

    if (token) {
      // Store token
      localStorage.setItem('token', token)

      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // Handle authentication error
      router.push('/login?error=auth_failed')
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing authentication...</h2>
        <p className="text-gray-500">Please wait while we redirect you</p>
      </div>
    </div>
  )
}
```


## Tenant Management

#### Create Tenant 

```http
POST /tenants
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "name": "string",           // required
  "legalName": "string",     // optional
  "description": "string",   // optional
  "registrationNumber": "string", // optional
  "industry": "string",      // optional
  "contact": {
    "email": "string",       // optional, valid email
    "phone": "string",       // optional
    "website": "string"      // optional
  },
  "settings": {
    "logo": "string",        // optional
    "primaryColor": "string", // optional
    "secondaryColor": "string", // optional
    "timezone": "string",    // optional
    "locale": "string",      // optional
    "currency": "string"     // optional
  }
}
```

**Success Response:** (201 CREATED)

```json
 {
  "message": "Tenant created successfully",
  "tenant": {
    "tenantId": "uuid",
    "name": "string",
    "legalName": "string",
    "description": "string",
    "registrationNumber": "string",
    "industry": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "contact": {
      "contactId": "uuid",
      "email": "string",
      "phone": "string",
      "website": "string",
      "createdAt": "string",
      "updatedAt": "string"
    },
    "settings": {
      "settingId": "uuid",
      "logo": "string",
      "primaryColor": "string",
      "secondaryColor": "string",
      "timezone": "string",
      "locale": "string",
      "currency": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```


**Error Responses:**

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Tenant name is required",
      "Invalid email format in contact details",
      "Invalid timezone format",
      "Invalid currency code"
    ],
    "error": "Bad Request"
  }
  ```

- **409 Conflict**
  ```json
  {
    "statusCode": 409,
    "message": "Tenant with this name or registration number already exists",
    "error": "Conflict"
  }
  ```

#### Get All Tenants

```http
GET /tenants
```

**Auth Required:** No  
**Required Role:** None

**Success Response:** (200 OK)

```json
{
  "data": [
   {
  "message": "Tenant updated successfully",
  "tenant":  {
  "tenantId": "uuid",
  "name": "string",
  "legalName": "string",
  "description": "string",
  "registrationNumber": "string",
  "industry": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt":"string",
  "deletedAt":"string",
  "isDeleted": "boolean",
  "contact": {
    "contactId": "uuid",
    "email": "string",
    "phone": "string",
    "website": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "settings": {
    "settingId": "uuid",
    "logo": "string",
    "primaryColor": "string",
    "secondaryColor": "string",
    "timezone": "string",
    "locale": "string",
    "currency": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "locations": [
    {
      "locationId": "uuid",
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "province": "string",
      "postalCode": "string",
      "country": "string",
      "latitude": 10.0,
      "longitude": 10.0,
      "createdAt":"string",
      "updatedAt":"string"
    }
  ]
}
}
  ],
  "metadata": {
    "currentPage": 1,
    "limit": 1,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

**Error Responses:**

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Get Tenant by ID

```http
GET /tenants/:tenantId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)

```json
 {
  "message": "Tenant updated successfully",
  "tenant":  {
  "tenantId": "uuid",
  "name": "string",
  "legalName": "string",
  "description": "string",
  "registrationNumber": "string",
  "industry": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt":"string",
  "deletedAt":"string",
  "isDeleted": "boolean",
  "contact": {
    "contactId": "uuid",
    "email": "string",
    "phone": "string",
    "website": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "settings": {
    "settingId": "uuid",
    "logo": "string",
    "primaryColor": "string",
    "secondaryColor": "string",
    "timezone": "string",
    "locale": "string",
    "currency": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "locations": [
    {
      "locationId": "uuid",
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "province": "string",
      "postalCode": "string",
      "country": "string",
      "latitude": 10.0,
      "longitude": 10.0,
      "createdAt":"string",
      "updatedAt":"string"
    }
  ]
}
}
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "Tenant not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```


#### Update Tenant Settings

```http
PUT /tenants/:tenantId/settings
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "logo": "string",          // optional
  "primaryColor": "string",  // optional
  "secondaryColor": "string", // optional
  "timezone": "string",      // optional
  "locale": "string",        // optional
  "currency": "string",       // optional

}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "settingId": "uuid",
    "logo": "string",
    "primaryColor": "string",
    "secondaryColor": "string",
    "timezone": "string",
    "locale": "string",
    "currency": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Invalid color format for primaryColor",
      "Invalid locale format",
      "Unsupported currency code"
    ],
    "error": "Bad Request"
  }
  ```

#### Add Tenant Location

```http
POST /tenants/:tenantId/locations
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "addressLine1": "string",  // required
  "addressLine2": "string",  // optional
  "city": "string",          // required
  "state": "string",         // optional
  "province": "string",      // optional
  "postalCode": "string",    // optional
  "country": "string",       // required
  "latitude": "number",      // optional
  "longitude": "number"      // optional
}
```

**Success Response:** (201 CREATED)
```json
{
  "message": "Location added successfully",
  "location":  {
    "locationId": "uuid",
    "tenantId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "AddressLine1 is required",
      "City is required",
      "Country is required",
      "Invalid latitude value",
      "Invalid longitude value"
    ],
    "error": "Bad Request"
  }
  ```

- **409 Conflict**
  ```json
  {
    "statusCode": 409,
    "message": "Location with these coordinates already exists",
    "error": "Conflict"
  }
  ```

#### Get Tenant Locations

```http
GET /tenants/:tenantId/locations
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)
```json
[
  {
    "locationId": "uuid",
    "tenantId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### Update Tenant Location

```http
PUT /tenants/:tenantId/locations/:locationId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "addressLine1": "string",  // required
  "addressLine2": "string",  // optional
  "city": "string",          // required
  "state": "string",         // optional
  "province": "string",      // optional
  "postalCode": "string",    // optional
  "country": "string",       // required
  "latitude": "number",      // optional
  "longitude": "number"      // optional
}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "Location updated successfully",
  "location":{
    "locationId": "uuid",
    "tenantId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **404 Not Found**
  ```json
  {
    "message": "Location not found"
  }
  ```

OR

  ```json
  {
    "message": "Tenant not found"
  }
  ```



#### Update Tenant

```http
PUT /tenants/:tenantId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**

```json
{

  "name": "Acme Corp Updated",
  "legalName": "Acme Corporation",
  "description": "A leading company in innovation",
  "registrationNumber": "123456789",
  "industry": "Technology",
  "status": "active",
  "contact":{
    "email":"string",
    "phone":"string",
    "website":"string"
  }
}
```

**Success Response:** (202 ACCEPTED)

```json
{
  "message": "Tenant updated successfully",
  "tenant":  {
  "tenantId": "uuid",
  "name": "string",
  "legalName": "string",
  "description": "string",
  "registrationNumber": "string",
  "industry": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt":"string",
  "deletedAt":"string",
  "isDeleted": "boolean",
  "contact": {
    "contactId": "uuid",
    "email": "string",
    "phone": "string",
    "website": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "settings": {
    "settingId": "uuid",
    "logo": "string",
    "primaryColor": "string",
    "secondaryColor": "string",
    "timezone": "string",
    "locale": "string",
    "currency": "string",
    "createdAt":"string",
    "updatedAt":"string"
  },
  "locations": [
    {
      "locationId": "uuid",
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "province": "string",
      "postalCode": "string",
      "country": "string",
      "latitude": 10.0,
      "longitude": 10.0,
      "createdAt":"string",
      "updatedAt":"string"
    }
  ]
}
}
```

**Error Responses:**

- **400 Bad Request**

  ```json
  {
    "errors": [
      {
        "code": "invalid_string",
        "path": ["name"],
        "message": "Tenant name is required"
      }
    ]
  }
  ```

- **404 Not Found**

  ```json
  {
    "message": "Tenant not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Delete Tenant

```http
DELETE /tenants/:tenantId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (203 DELETED)

```json
{
  "message": "Tenant deleted successfully"
}
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "Tenant not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```


## Roles Management

#### Create Role

```http
POST /roles
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "name": "string"  // enum: ["super-admin", "admin", "manager", "user"]
}
```

**Success Response:** (201 CREATED)
```json
{
  "message": "Role created successfully",
  "role": {
    "roleId": "uuid",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "errors": [
      {
        "code": "invalid_enum_value",
        "path": ["name"],
        "message": "Invalid enum value. Expected 'super-admin' | 'admin' | 'manager' | 'user'"
      }
    ]
  }
  ```

- **404 Not Found**
  ```json
  {
    "message": "Role not found"
  }
  ```

- **409 Conflict**
  ```json
  {
    "message": "Role name already exists"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Get All Roles

```http
GET /roles
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)
```json
[
  {
    "roleId": "uuid",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### Get Role by ID

```http
GET /roles/:roleId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)
```json
{
  "roleId": "uuid",
  "name": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "userCount": "number"
}
```

#### Update Role

```http
PATCH /roles/:roleId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**
```json
{
  "name": "string"  // enum: ["super-admin", "admin", "manager", "user"]
}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "Role updated successfully",
  "role": {
    "roleId": "uuid",
    "name": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### Delete Role

```http
DELETE /roles/:roleId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (203 DELETED)
```json
{
  "message": "Role deleted successfully"
}
```

## Users Management

#### Get All Users

```http
GET /users
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)
```json
{
  "data": [
    {
      "userId": "uuid",
      "username": "string",
      "email": "string", 
      "photo": "string",
      "isVerified": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "profile": {
        "fullName": "string",
        "firstName": "string",
        "middleName": "string",
        "lastName": "string",
        "gender": "string",
        "dateOfBirth": "string",
        "phone": "string",
        "createdAt":"string",
        "updatedAt":"string"
      },
      "auth": {
        "lastLoginAt": "string",
        "lastLoginIp": "string"
      },
      "tenant": {
         "tenantId": "uuid",
        "name": "string",
        "legalName": "string",
        "description": "string",
        "registrationNumber": "string",
        "industry": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt":"string",
        "deletedAt":"string",
        "isDeleted": "boolean",
      },
      "userRoles": [
        {
          "userId":"string",
          "roleId":"string",
          "role": {
            "roleId": "uuid",
            "name": "string"
          }
        }
      ],
      "locations": [
        {
      "locationId": "uuid",
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "province": "string",
      "postalCode": "string",
      "country": "string",
      "latitude": 10.0,
      "longitude": 10.0,
      "createdAt":"string",
      "updatedAt":"string"
    }
      ]
    }
  ],
  "metadata": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error Responses:**

- **403 Forbidden**
  ```json
  {
    "statusCode": 403,
    "message": "Insufficient permissions to access user list",
    "error": "Forbidden"
  }
  ```

#### Get User Profile

```http
GET /users/:userId
```

**Auth Required:** Yes  
**Required Role:** Admin or Self

**Response:** (200 OK)

```json
 {
      "userId": "uuid",
      "username": "string",
      "email": "string", 
      "photo": "string",
      "isVerified": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "profile": {
        "fullName": "string",
        "firstName": "string",
        "middleName": "string",
        "lastName": "string",
        "gender": "string",
        "dateOfBirth": "string",
        "phone": "string",
        "createdAt":"string",
        "updatedAt":"string"
      },
      "auth": {
        "lastLoginAt": "string",
        "lastLoginIp": "string"
      },
      "tenant": {
         "tenantId": "uuid",
        "name": "string",
        "legalName": "string",
        "description": "string",
        "registrationNumber": "string",
        "industry": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt":"string",
        "deletedAt":"string",
        "isDeleted": "boolean",
      },
      "userRoles": [
        {
          "userId":"string",
          "roleId":"string",
          "role": {
            "roleId": "uuid",
            "name": "string"
          }
        }
      ],
      "locations": [
        {
      "locationId": "uuid",
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "province": "string",
      "postalCode": "string",
      "country": "string",
      "latitude": 10.0,
      "longitude": 10.0,
      "createdAt":"string",
      "updatedAt":"string"
    }
      ]
    }
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "User not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

**Frontend Example:**

```javascript
fetch("http://localhost:5000/api/users/:userId", {
  headers: {
    Authorization: `Bearer ${jwt - token}`,
    "Content-Type": "application/json",
  },
});
```

#### Update User Profile

```http
PUT /users/:userId
```

**Auth Required:** Yes
**Required Role:** Admin or Self

**Request Body:**
```json
{
  "user": {
    "username": "string",     // optional, min length 3
    "email": "string",       // optional, valid email
    "photo": "string"        // optional
  },
  "profile": {
    "fullName": "string",    // required if profile updated
    "firstName": "string",   // required if profile updated  
    "middleName": "string",  // optional
    "lastName": "string",    // required if profile updated
    "gender": "string",      // optional
    "dateOfBirth": "string", // optional
    "phone": "string"        // optional
  }
}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "User updated successfully",
  "data": {
    "user": {
      "userId": "uuid",
      "username": "string",
      "email": "string",
      "photo": "string",
      "updatedAt": "string",
      "isVerfied":"boolean",
      "createdAt":"string"
    },
    "profile": {
        "fullName": "string",
        "firstName": "string",
        "middleName": "string",
        "lastName": "string",
        "gender": "string",
        "dateOfBirth": "string",
        "phone": "string",
        "createdAt":"string",
        "updatedAt":"string"
      }
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": [
      "Username must be at least 3 characters",
      "Invalid email format",
      "First name is required",
      "Last name is required",
      "Invalid date format for dateOfBirth"
    ],
    "error": "Bad Request"
  }
  ```

- **409 Conflict**
  ```json
  {
    "statusCode": 409,
    "message": "Email or username already exists",
    "error": "Conflict"
  }
  ```

#### Get User Locations 

```http
GET /users/:userId/locations
```

**Auth Required:** Yes  
**Required Role:** Self or Admin

**Success Response:** (200 OK)
```json

  {
    "locationId": "uuid",
    "userId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }

```

**Error Responses:**

- **404 Not Found**
  ```json
  {
    "message": "User not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Add User Location 

```http
POST /users/:userId/locations
```

**Auth Required:** Yes  
**Required Role:** Self or Admin

**Request Body:**
```json
{
  "addressLine1": "string",  // required
  "addressLine2": "string",  // optional
  "city": "string",          // required
  "state": "string",         // optional
  "province": "string",      // optional
  "postalCode": "string",    // optional
  "country": "string",       // required
  "latitude": "number",      // optional
  "longitude": "number"      // optional
}
```

**Success Response:** (201 CREATED)
```json
{
  "message": "Location added successfully",
  "location": {
    "locationId": "uuid",
    "userId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **400 Bad Request**
  ```json
  {
    "errors": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["addressLine1"],
        "message": "Required"
      }
    ]
  }
  ```

#### Update User Location

```http
PUT /users/:userId/locations/:locationId
```

**Auth Required:** Yes
**Required Role:** Self or Admin

**Request Body:**
```json
{
  "addressLine1": "string",  // required
  "addressLine2": "string",  // optional
  "city": "string",          // required
  "state": "string",         // optional
  "province": "string",      // optional
  "postalCode": "string",    // optional
  "country": "string",       // required
  "latitude": "number",      // optional
  "longitude": "number"      // optional
}
```

**Success Response:** (202 ACCEPTED)
```json
{
  "message": "Location updated successfully",
  "location": {
    "locationId": "uuid",
    "userId": "uuid",
    "addressLine1": "string",
    "addressLine2": "string",
    "city": "string",
    "state": "string",
    "province": "string",
    "postalCode": "string",
    "country": "string",
    "latitude": "number",
    "longitude": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses:**

- **404 Not Found**
  ```json
  {
    "message": "Location not found"
  }
  ```

OR

  ```json
  {
    "message": "User not found"
  }
  ```

- **400 Bad Request**
  ```json
  {
    "errors": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "undefined",
        "path": ["addressLine1"],
        "message": "Required"
      }
    ]
  }
  ```


#### Delete User

```http
DELETE /users/:userId
```

**Auth Required:** Yes  
**Required Role:** Admin or Self

**Success Response:** (203 DELETED)

```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "User not found"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Internal Server Error"
  }
  ```

#### Assign Tenant to User

```http
POST /users/:userId/tenants
```

**Auth Required:** Yes
**Required Role:** Admin

**Request Body:**
```json
{
  "tenantId": "uuid"    // required, valid UUID
}
```

**Success Response:** (202 ACCEPTED) 
```json
{
  "message": "Tenant assigned successfully",
  "user": {
    "userId": "uuid",
    "username": "string", 
    "email": "string",
    "tenantId": "uuid",
    "tenant": {
         "tenantId": "uuid",
        "name": "string",
        "legalName": "string",
        "description": "string",
        "registrationNumber": "string",
        "industry": "string",
        "status": "string",
        "createdAt": "string",
        "updatedAt":"string",
        "deletedAt":"string",
        "isDeleted": "boolean",
      }
  }
}
```


#### Get Users by Role

```http
GET /roles/:roleId/users
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (200 OK)

```json
{
  "data": [
    {
      "userId": "uuid",
      "username": "uuid",
      "email": "string",
      "photo": "string",
    }
  ],
  "metadata": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Remove Role from User

```http
DELETE /users/:userId/roles/:roleId
```

**Auth Required:** Yes  
**Required Role:** Admin

**Success Response:** (203 DELETED)

```json
{
  "message": "Role removed successfully"
}
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "Role assignment not found"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "statusCode": 403,
    "message": "Cannot remove the last admin role",
    "error": "Forbidden"
  }
  ```

#### Assign Role to User

```http
POST /users/:userId/roles
```

**Auth Required:** Yes  
**Required Role:** Admin

**Request Body:**

```json
{
  "roleId": "uuid"
}
```

**Success Response:** (201 CREATED)

```json
{
  "message": "Role assigned successfully"
}
```

**Error Responses:**

- **404 Not Found**

  ```json
  {
    "message": "User not found"
  }
  ```

OR

  ```json
  {
    "message": "Role not found"
  }
  ```

- **400 Bad Request**
  ```json
  {
    "statusCode": 400,
    "message": "Invalid role ID format",
    "error": "Bad Request"
  }
  ```

- **403 Forbidden**
  ```json
  {
    "statusCode": 403,
    "message": "Cannot assign admin role without super-admin privileges",
    "error": "Forbidden"
  }
  ```


### Status Codes

| Code | Status       | Description              |
| ---- | ------------ | ------------------------ |
| 200  | OK           | Request succeeded        |
| 201  | Created      | Resource created         |
| 202  | Accepted     | Update accepted          |
| 203  | DELETED   | Resource deleted         |
| 400  | Bad Request  | Invalid data             |
| 401  | Unauthorized | Authentication required  |
| 403  | Forbidden    | Insufficient permissions |
| 404  | Not Found    | Resource not found       |
| 409  | Conflict     | Resource conflict        |
| 500  | Server Error | Internal error           |

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
