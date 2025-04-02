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


## API Endpoints

All endpoints are prefixed with `/api` as configured in `main.ts`.

### Authentication Endpoints (Base route: `/auth`)

- **POST /auth/signup**  
  Registers a new user and sends a verification code via email.
  
  *Request Body:*  
  ```json
  {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "secret123",
    "photo": "https://example.com/photo.jpg",
    "tenant_nano_id": "tenant123",
    "user_profile": {
      "full_name": "John Doe",
      "first_name": "John",
      "middle_name": "A.",            // optional field
      "last_name": "Doe",
      "name_prefix": "Mr.",           // optional field
      "name_suffix": "Jr.",           // optional field
      "primary_phone": "1234567890",  // optional field
      "secondary_phone": "0987654321",// optional field
      "secondary_email": "j.doe@alt.com",  // optional field
      "gender": "male",               // optional field
      "marital_status": "single",     // optional field
      "date_of_birth": "1990-01-01",    // optional field (ISO string)
      "country_of_birth": "USA",      // optional field
      "nationality": "American"       // optional field
    },
    "user_location": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",       // optional field
      "city": "Metropolis",
      "state": "NY",                 // optional field
      "postal_code": "10001",        // optional field
      "country": "USA",
      "latitude": 40.7128,           // optional field
      "longitude": -74.0060          // optional field
    }
  }
  ```  

  *Success Response (201):*  
  ```json
  {
    "message": "User registered successfully. A verification code has been sent to your email.",
    "user": {
      "user_nano_id": "generated_id",
      "user_id": 1,
      "tenant_nano_id": "tenant123",
      "language_code": "en",
      "timezone": "UTC",
      "display_name": "John Doe",
      "nick_name": "JD",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "password_status": "active",
      "status": "active",
      "photo": "https://example.com/photo.jpg",
      "is_verified": false,
      "user_payment_nano_id": null,
      "paid_for_application": false,
      "paid_acceptance_fees": false,
      "portal_access": true,
      "deleted": false,
      "spam": false,
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "user_profile": {
        "user_profile_nano_id": "generated_profile_id",
        "user_profile_id": 1,
        "name_prefix": "Mr.",
        "full_name": "John Doe",
        "first_name": "John",
        "middle_name": "A.",
        "last_name": "Doe",
        "name_suffix": "Jr.",
        "primary_phone": "1234567890",
        "secondary_phone": "0987654321",
        "secondary_email": "j.doe@alt.com",
        "gender": "male",
        "marital_status": "single",
        "date_of_birth": "1990-01-01",
        "country_of_birth": "USA",
        "nationality": "American"
      },
      "user_location": {
        "user_location_nano_id": "generated_location_id",
        "user_location_id": 1,
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",
        "city": "Metropolis",
        "state": "NY",
        "province": null,
        "postal_code": "10001",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    }
  }
  ```  

  *Error Responses:*  
  - **400 Bad Request:**  
    ```json
    {
      "statusCode": 400,
      "message": ["Missing required fields"],
      "error": "bad request"
    }
    ```  
  - **409 Conflict:**  
    ```json
    {
      "statusCode": 409,
      "message": ["Email or username already exists"],
      "error": "conflict"
    }
    ```

- **POST /auth/signin**  
  Authenticates a user and returns a JWT token.
  
  *Request Body:*  
  ```json
  {
    "email": "john.doe@example.com",
    "password": "secret123"
  }
  ```  

  *Success Response (200):*  
  ```json
  {
    "message": "Sign in successful",
    "user": {
      "user_nano_id": "generated_id",
      "user_id": 1,
      "tenant_nano_id": "tenant123",
      "language_code": "en",
      "timezone": "UTC",
      "display_name": "John Doe",
      "nick_name": "JD",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "password_status": "active",
      "status": "active",
      "photo": "https://example.com/photo.jpg",
      "is_verified": true,
      "user_payment_nano_id": "payment_id_or_null",
      "paid_for_application": false,
      "paid_acceptance_fees": false,
      "portal_access": true,
      "deleted": false,
      "spam": false,
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "user_profile": {
        "user_profile_nano_id": "generated_profile_id",
        "user_profile_id": 1,
        "name_prefix": "Mr.",
        "full_name": "John Doe",
        "first_name": "John",
        "middle_name": "A.",
        "last_name": "Doe",
        "name_suffix": "Jr.",
        "primary_phone": "1234567890",
        "secondary_phone": "0987654321",
        "secondary_email": "j.doe@alt.com",
        "gender": "male",
        "marital_status": "single",
        "date_of_birth": "1990-01-01",
        "country_of_birth": "USA",
        "nationality": "American"
      },
      "user_location": {
        "user_location_nano_id": "generated_location_id",
        "user_location_id": 1,
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",
        "city": "Metropolis",
        "state": "NY",
        "province": null,
        "postal_code": "10001",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "auth": {
        "last_login_at": "2023-10-10T10:30:00.000Z",
        "last_login_ip": "192.168.0.1"
      },
      "tenant":{
        "tenant_nano_id": "generated_id",
        "tenant_id": 1,
        "account_type": "school",
        "short_name": "ABC High",
        "long_name": "ABC High School",
        "legal_name": "ABC High Incorporated",
        "government_registration_id": "REG-001",
        "government_alternate_registration_id": "ALT-01",
        "education_category": "secondary",
        "education_classification": "public",
        "education_affiliation": "District",
        "education_association": "State Association",
        "education_lowest_grade_level": "9",
        "education_highest_grade_level": "12",
        "date_founded": "2000-08-15",
        "description": "A prestigious secondary school",
        "account_owner_name": "John Doe",
        "account_owner_email": "owner@abcschool.com",
        "account_owner_phone": "1234567890",
        "subscription_name": "standard",
        "status": "active",
        "created_by": "John Doe",
        "created_on": "2023-10-10T10:00:00.000Z",
      }
    },
    "token": "jwt_token_here"
  }
  ```  

  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["Email doesn't exist"],
      "error": "not_found"
    }
    ```  
  - **401 Unauthorized:**  
    ```json
    {
      "statusCode": 401,
      "message": ["Invalid password"],
      "error": "unauthorized"
    }
    ```

- **POST /auth/verify-email**  
  Verifies a user's email using an OTP.
  
  *Request Body:*  
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Email verified successfully"
  }
  ```  

  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["User not found"],
      "error": "not_found"
    }
    ```  
  - **401 Unauthorized:**  
    ```json
    {
      "statusCode": 401,
      "message": ["Invalid or expired verification code", "Email is already verified"],
      "error": "unauthorized"
    }
    ```

- **POST /auth/resend-otp**  
  Resends the verification OTP to the user.
  
  *Request Body:*  
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "New verification code sent successfully"
  }
  ```  

  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["User not found"],
      "error": "not_found"
    }
    ```  
  - **401 Unauthorized:**  
    ```json
    {
      "statusCode": 401,
      "message": ["Email is already verified"],
      "error": "unauthorized"
    }
    ```

- **POST /auth/forget-password**  
  Sends password reset instructions via OTP.
  
  *Request Body:*  
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Password reset instructions sent to your email"
  }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["User not found"],
    "error": "not_found"
  }
  ```

- **PATCH /auth/reset-password**  
  Resets the user's password using a valid OTP.
  
  *Request Body:*  
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456",
    "new_password": "newsecret123"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Password reset successful"
  }
  ```  

  *Error Responses:*  
  - **401 Unauthorized:**  
    ```json
    {
      "statusCode": 401,
      "message": ["Invalid or expired OTP"],
      "error": "unauthorized"
    }
    ```  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["User not found"],
      "error": "not_found"
    }
    ```

### OAuth Authentication

- **GET /auth/google**  
  Initiates Google OAuth authentication.
  
  *Request:*  
  No request payload (handled by Passport).  
  
  <!-- *Success Response (302):*  
  Redirects to the front-end:  
  `http://localhost:3000/signin?token={token}`   -->
  
  *Error Response (401 Unauthorized):*  
  ```json
  {
    "statusCode": 401,
    "message": ["No user from authentication provider"],
    "error": "unauthorized"
  }
  ```

- **GET /auth/google/callback**  
  Handles Google OAuth callback and returns a JWT token with user details.
  
  *Success Response (302):*  
  Redirects to the front-end:  
  `http://localhost:3000/signin?token={token}`  
  
  *Error Response (401 Unauthorized):*  
  ```json
  {
    "statusCode": 401,
    "message": ["OAuth authentication failed"],
    "error": "unauthorized"
  }
  ```

- **GET /auth/microsoft**  
  Initiates Microsoft OAuth authentication.
  
  *Request:*  
  No request payload (handled by Passport).  
  
  <!-- *Success Response (302):*  
  Redirects to the front-end:  
  `http://localhost:3000/signin?token={token}`   -->
  
  *Error Response (401 Unauthorized):*  
  ```json
  {
    "statusCode": 401,
    "message": ["No user from authentication provider"],
    "error": "unauthorized"
  }
  ```

- **GET /auth/microsoft/callback**  
  Handles Microsoft OAuth callback and returns a JWT token with user details.
  
  *Success Response (302):*  
  Redirects to the front-end:  
  `http://localhost:3000/signin?token={token}`  
  
  *Error Response (401 Unauthorized):*  
  ```json
  {
    "statusCode": 401,
    "message": ["OAuth authentication failed"],
    "error": "unauthorized"
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

---

### Tenant Endpoints (Base route: `/tenants` - Protected by JWT & AdminGuards)

- **POST /tenants**  
  Creates a new tenant.
  
  *Request Body:*  
  ```json
  {
    "account_type": "school",
    "short_name": "ABC High",
    "long_name": "ABC High School",
    "legal_name": "ABC High Incorporated",
    "government_registration_id": "REG-001",          // optional
    "government_alternate_registration_id": "ALT-01",   // optional
    "education_category": "secondary",
    "education_classification": "public",             // optional
    "education_affiliation": "District",              // optional
    "education_association": "State Association",     // optional
    "education_lowest_grade_level": "9",
    "education_highest_grade_level": "12",
    "date_founded": "2000-08-15",                       // optional
    "description": "A prestigious secondary school",  // optional
    "account_owner_name": "John Doe",
    "account_owner_email": "owner@abcschool.com",
    "account_owner_phone": "1234567890",
    "subscription_name": "standard",
    "tenant_contact": {
      "tenant_email": "contact@abcschool.com",
      "registrar_email": "registrar@abcschool.com",   // optional
      "finance_email": "finance@abcschool.com",         // optional
      "chancellor_email": "chancellor@abcschool.com",   // optional
      "vcp_email": "vcp@abcschool.com",                 // optional
      "dvcp_email": "dvcp@abcschool.com",               // optional
      "ictd_email": "ictd@abcschool.com",               // optional
      "tenant_phone": "0987654321",
      "registrar_phone": "1112223333",                  // optional
      "finance_phone": "4445556666",                    // optional
      "chancellor_phone": "7778889999",                 // optional
      "ictd_phone": "0001112222",                       // optional
      "website": "https://abcschool.com",               // optional
      "facebook": "abcfacebook",                        // optional
      "linkedin": "abclinkedin",                        // optional
      "youtube": "abcyoutube",                          // optional
      "twitter": "abctwitter",                          // optional
      "instagram": "abcinstagram",                      // optional
      "tiktok": "abctiktok"                             // optional
    },
    "tenant_settings": {
      "logo": "https://example.com/logo.png",
      "neutral_color_background": "#EFF4FB",            // optional default provided by schema
      "neutral_color_sections": "#E2E8F0",              // optional default provided by schema
      "neutral_color_text": "#212B36",                  // optional default provided by schema
      "primary_color": "#3C50E0",
      "secondary_color": "#DC3545",                     // optional
      "accent_color": "#10B981",                        // optional
      "semantic_color_success": "#E1F9F0",              // optional
      "semantic_color_warning": "#FEF5DE",              // optional
      "semantic_color_error": "#FEEAEA",                // optional
      "semantic_color_info": "#3C50E0",                 // optional
      "timezone": "UTC",
      "language_code": "en",
      "currency": "USD"
    }
  }
  ```

  *Success Response (201):*  
  ```json

  {
    "message": "Tenant created successfully",
    "tenant": {
      "tenant_nano_id": "generated_id",
      "tenant_id": 1,
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",
      "government_alternate_registration_id": "ALT-01",
      "education_category": "secondary",
      "education_classification": "public",
      "education_affiliation": "District",
      "education_association": "State Association",
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",
      "description": "A prestigious secondary school",
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
       "status": "active",
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "tenant_contacts": {
        "tenant_email": "contact@abcschool.com",
        "registrar_email": "registrar@abcschool.com",
        "finance_email": "finance@abcschool.com",
        "chancellor_email": "chancellor@abcschool.com",
        "vcp_email": "vcp@abcschool.com",
        "dvcp_email": "dvcp@abcschool.com",
        "ictd_email": "ictd@abcschool.com",
        "tenant_phone": "0987654321",
        "registrar_phone": "1112223333",
        "finance_phone": "4445556666",
        "chancellor_phone": "7778889999",
        "ictd_phone": "0001112222",
        "website": "https://abcschool.com",
        "facebook": "abcfacebook",
        "linkedin": "abclinkedin",
        "youtube": "abcyoutube",
        "twitter": "abctwitter",
        "instagram": "abcinstagram",
        "tiktok": "abctiktok",
        "created_on": "2023-10-10T10:00:00.000Z"
      },
      "tenant_settings": {
        "logo": "https://example.com/logo.png",
        "neutral_color_background": "#EFF4FB",
        "neutral_color_sections": "#E2E8F0",
        "neutral_color_text": "#212B36",
        "primary_color": "#3C50E0",
        "secondary_color": "#DC3545",
        "accent_color": "#10B981",
        "semantic_color_success": "#E1F9F0",
        "semantic_color_warning": "#FEF5DE",
        "semantic_color_error": "#FEEAEA",
        "semantic_color_info": "#3C50E0",
        "timezone": "UTC",
        "language_code": "en",
        "currency": "USD"
      },
     "tenant_locations": [
        {
          "tenant_location_nano_id": "loc_generated_id",
          "tenant_location_id": 1,
          "name": "Main Campus",
          "location_type": "campus",
          "address_line1": "123 Main St",
          "address_line2": "Apt 4B",
          "city": "Metropolis",
          "state": "NY",
          "province": null,
          "postal_code": "10001",
          "country": "USA",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_on": "2023-10-10T10:30:00.000Z"
        }
      ],
   
    }
  }
  ```  

  *Error Responses:*  
  - **400 Bad Request:**  
    ```json
    {
      "statusCode": 400,
      "message": ["Missing required fields"],
      "error": "bad request"
    }
    ```  
  - **409 Conflict:**  
    ```json
    {
      "statusCode": 409,
      "message": ["Tenant name or registration number already exists"],
      "error": "conflict"
    }
    ```

- **GET /tenants**  
  Retrieves tenants with pagination.
  
  *Query Params:*  
  `page`, `limit`
  
  *Success Response (200):*  
  ```json
  {
    "data": [
    {
      "tenant_nano_id": "generated_id",
      "tenant_id": 1,
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",
      "government_alternate_registration_id": "ALT-01",
      "education_category": "secondary",
      "education_classification": "public",
      "education_affiliation": "District",
      "education_association": "State Association",
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",
      "description": "A prestigious secondary school",
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
       "status": "active",
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "tenant_contacts": {
        "tenant_email": "contact@abcschool.com",
        "registrar_email": "registrar@abcschool.com",
        "finance_email": "finance@abcschool.com",
        "chancellor_email": "chancellor@abcschool.com",
        "vcp_email": "vcp@abcschool.com",
        "dvcp_email": "dvcp@abcschool.com",
        "ictd_email": "ictd@abcschool.com",
        "tenant_phone": "0987654321",
        "registrar_phone": "1112223333",
        "finance_phone": "4445556666",
        "chancellor_phone": "7778889999",
        "ictd_phone": "0001112222",
        "website": "https://abcschool.com",
        "facebook": "abcfacebook",
        "linkedin": "abclinkedin",
        "youtube": "abcyoutube",
        "twitter": "abctwitter",
        "instagram": "abcinstagram",
        "tiktok": "abctiktok",
        "created_on": "2023-10-10T10:00:00.000Z"
      },
      "tenant_settings": {
        "logo": "https://example.com/logo.png",
        "neutral_color_background": "#EFF4FB",
        "neutral_color_sections": "#E2E8F0",
        "neutral_color_text": "#212B36",
        "primary_color": "#3C50E0",
        "secondary_color": "#DC3545",
        "accent_color": "#10B981",
        "semantic_color_success": "#E1F9F0",
        "semantic_color_warning": "#FEF5DE",
        "semantic_color_error": "#FEEAEA",
        "semantic_color_info": "#3C50E0",
        "timezone": "UTC",
        "language_code": "en",
        "currency": "USD"
      },
     "tenant_locations": [
        {
          "tenant_location_nano_id": "loc_generated_id",
          "tenant_location_id": 1,
          "name": "Main Campus",
          "location_type": "campus",
          "address_line1": "123 Main St",
          "address_line2": "Apt 4B",
          "city": "Metropolis",
          "state": "NY",
          "province": null,
          "postal_code": "10001",
          "country": "USA",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_on": "2023-10-10T10:30:00.000Z"
        }
      ],
   
    }
    ],
    "metadata": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```  

  *Error Response:*  
  - **400 Bad Request:**  
    ```json
    {
      "statusCode": 400,
      "message": ["Invalid pagination parameters"],
      "error": "bad request"
    }
    ```

- **GET /tenants/:tenant_nano_id**  
  Retrieves a single tenant’s details.
  
  *Success Response (200):*  
  ```json
   {
      "tenant_nano_id": "generated_id",
      "tenant_id": 1,
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",
      "government_alternate_registration_id": "ALT-01",
      "education_category": "secondary",
      "education_classification": "public",
      "education_affiliation": "District",
      "education_association": "State Association",
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",
      "description": "A prestigious secondary school",
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
       "status": "active",
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "tenant_contacts": {
        "tenant_email": "contact@abcschool.com",
        "registrar_email": "registrar@abcschool.com",
        "finance_email": "finance@abcschool.com",
        "chancellor_email": "chancellor@abcschool.com",
        "vcp_email": "vcp@abcschool.com",
        "dvcp_email": "dvcp@abcschool.com",
        "ictd_email": "ictd@abcschool.com",
        "tenant_phone": "0987654321",
        "registrar_phone": "1112223333",
        "finance_phone": "4445556666",
        "chancellor_phone": "7778889999",
        "ictd_phone": "0001112222",
        "website": "https://abcschool.com",
        "facebook": "abcfacebook",
        "linkedin": "abclinkedin",
        "youtube": "abcyoutube",
        "twitter": "abctwitter",
        "instagram": "abcinstagram",
        "tiktok": "abctiktok",
        "created_on": "2023-10-10T10:00:00.000Z"
      },
      "tenant_settings": {
        "logo": "https://example.com/logo.png",
        "neutral_color_background": "#EFF4FB",
        "neutral_color_sections": "#E2E8F0",
        "neutral_color_text": "#212B36",
        "primary_color": "#3C50E0",
        "secondary_color": "#DC3545",
        "accent_color": "#10B981",
        "semantic_color_success": "#E1F9F0",
        "semantic_color_warning": "#FEF5DE",
        "semantic_color_error": "#FEEAEA",
        "semantic_color_info": "#3C50E0",
        "timezone": "UTC",
        "language_code": "en",
        "currency": "USD"
      },
     "tenant_locations": [
        {
          "tenant_location_nano_id": "loc_generated_id",
          "tenant_location_id": 1,
          "name": "Main Campus",
          "location_type": "campus",
          "address_line1": "123 Main St",
          "address_line2": "Apt 4B",
          "city": "Metropolis",
          "state": "NY",
          "province": null,
          "postal_code": "10001",
          "country": "USA",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_on": "2023-10-10T10:30:00.000Z"
        }
      ],
   
    }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Tenant not found"],
    "error": "not_found"
  }
  ```

- **PUT /tenants/:tenant_nano_id**  
  Updates tenant information.
  
  *Request Body:*  
  ```json
  {
    "account_type": "university",
    "short_name": "ABC Univ",
    "long_name": "ABC University",
    "legal_name": "ABC University Incorporated",
    "description": "Updated description",
    "contact": {
      "tenant_email": "newcontact@abcuniv.com"
    }
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Tenant updated successfully",
    "tenant": {
      "tenant_nano_id": "generated_id",
      "tenant_id": 1,
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",
      "government_alternate_registration_id": "ALT-01",
      "education_category": "secondary",
      "education_classification": "public",
      "education_affiliation": "District",
      "education_association": "State Association",
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",
      "description": "A prestigious secondary school",
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
       "status": "active",
      "created_by": "John Doe",
      "created_on": "2023-10-10T10:00:00.000Z",
      "tenant_contacts": {
        "tenant_email": "contact@abcschool.com",
        "registrar_email": "registrar@abcschool.com",
        "finance_email": "finance@abcschool.com",
        "chancellor_email": "chancellor@abcschool.com",
        "vcp_email": "vcp@abcschool.com",
        "dvcp_email": "dvcp@abcschool.com",
        "ictd_email": "ictd@abcschool.com",
        "tenant_phone": "0987654321",
        "registrar_phone": "1112223333",
        "finance_phone": "4445556666",
        "chancellor_phone": "7778889999",
        "ictd_phone": "0001112222",
        "website": "https://abcschool.com",
        "facebook": "abcfacebook",
        "linkedin": "abclinkedin",
        "youtube": "abcyoutube",
        "twitter": "abctwitter",
        "instagram": "abcinstagram",
        "tiktok": "abctiktok",
        "created_on": "2023-10-10T10:00:00.000Z"
      },
      "tenant_settings": {
        "logo": "https://example.com/logo.png",
        "neutral_color_background": "#EFF4FB",
        "neutral_color_sections": "#E2E8F0",
        "neutral_color_text": "#212B36",
        "primary_color": "#3C50E0",
        "secondary_color": "#DC3545",
        "accent_color": "#10B981",
        "semantic_color_success": "#E1F9F0",
        "semantic_color_warning": "#FEF5DE",
        "semantic_color_error": "#FEEAEA",
        "semantic_color_info": "#3C50E0",
        "timezone": "UTC",
        "language_code": "en",
        "currency": "USD"
      },
     "tenant_locations": [
        {
          "tenant_location_nano_id": "loc_generated_id",
          "tenant_location_id": 1,
          "name": "Main Campus",
          "location_type": "campus",
          "address_line1": "123 Main St",
          "address_line2": "Apt 4B",
          "city": "Metropolis",
          "state": "NY",
          "province": null,
          "postal_code": "10001",
          "country": "USA",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_on": "2023-10-10T10:30:00.000Z"
        }
      ],
   
    }
  }
  ```  

  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["Tenant not found"],
      "error": "not_found"
    }
    ```  
  - **409 Conflict:**  
    ```json
    {
      "statusCode": 409,
      "message": ["Tenant update failed due to conflicting data"],
      "error": "conflict"
    }
    ```

- **DELETE /tenants/:tenant_nano_id**  
  Deletes the specified tenant.
  
  *Success Response (203):*  
  ```json
  {
    "message": "Tenant deleted successfully"
  }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Tenant not found"],
    "error": "not_found"
  }
  ```

- **PUT /tenants/:tenant_nano_id/settings**  
  Updates tenant settings.
  
  *Request Body:*  
  ```json
  {
    "logo": "https://example.com/newlogo.png",
    "primary_color": "#FF5733",
    "language_code": "en"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Settings updated successfully",
    "settings": {
        "logo": "https://example.com/logo.png",
        "neutral_color_background": "#EFF4FB",
        "neutral_color_sections": "#E2E8F0",
        "neutral_color_text": "#212B36",
        "primary_color": "#3C50E0",
        "secondary_color": "#DC3545",
        "accent_color": "#10B981",
        "semantic_color_success": "#E1F9F0",
        "semantic_color_warning": "#FEF5DE",
        "semantic_color_error": "#FEEAEA",
        "semantic_color_info": "#3C50E0",
        "timezone": "UTC",
        "language_code": "en",
        "currency": "USD"
      }
  }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Tenant settings not found"],
    "error": "not_found"
  }
  ```

- **POST /tenants/:tenantId/locations**  
  Adds a new location to a tenant.
  
  *Request Body:*  
  ```json
    {
      "name": "Main Campus",
      "location_type": "campus",
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Metropolis",
      "state": "NY",
      "province": null,
      "postal_code": "10001",
      "country": "USA",
      "latitude": 40.7128,
      "longitude": -74.0060,
    }
```  


*Success Response (201):*

```json

   {
    "message": "Location added successfully",
    "location":{
          "tenant_location_nano_id": "location_generated_id",
          "tenant_location_id": 1,
          "name": "Main Campus",
          "location_type": "campus",
          "address_line1": "123 Main St",
          "address_line2": "Apt 4B",
          "city": "Metropolis",
          "state": "NY",
          "province": null,
          "postal_code": "10001",
          "country": "USA",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_on": "2023-10-10T10:30:00.000Z"
          }
  }

  ```  

  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Missing required location fields"],
    "error": "bad request"
  }
  ```

- **GET /tenants/:tenantId/locations**  
  Retrieves all locations for a tenant.
  
  *Success Response (200):*  
  ```json
  [
   {
    "tenant_location_nano_id": "loc_generated_id",
    "tenant_location_id": 1,
    "name": "Main Campus",
    "location_type": "campus",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Metropolis",
    "state": "NY",
    "province": null,
    "postal_code": "10001",
    "country": "USA",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "created_on": "2023-10-10T10:30:00.000Z"
  }
  ]
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Locations not found"],
    "error": "not_found"
  }
  ```

- **PUT /tenants/:tenantId/locations/:locationId**  
  Updates a tenant location.
  
  *Request Body:*  
  ```json
  {
    "name": "Main Campus Updated",
    "address_line1": "456 New St",
    "city": "Updated City"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "Location updated successfully",
    "location": {
        "tenant_location_nano_id": "loc_generated_id",
        "tenant_location_id": 1,
        "name": "Main Campus",
        "location_type": "campus",
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",
        "city": "Metropolis",
        "state": "NY",
        "province": null,
        "postal_code": "10001",
        "country": "USA",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "created_on": "2023-10-10T10:30:00.000Z"
      }
  }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Location not found"],
    "error": "not_found"
  }
  ```

<!-- Subscription endpoints placed under Tenant Endpoints -->
- **POST /tenants/:tenant_nano_id/subscriptions**  
  Creates a new tenant subscription.
  
  *Request Body:*  
  ```json
  {
    "subscription_name": "premium"
  }
  ```  

  *Success Response (201):*  
  ```json
  {
    "message": "subscription created successfully",
    "subscription": {
      "tenant_subscription_nano_id": "sub_generated_id",
      "tenant_subscription_id": 1,
      "tenant_nano_id": "tenant_generated_id",
      "subscription_name": "premium",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:00:00.000Z"
    }
  }
  ```  

  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Missing subscription_name"],
    "error": "bad request"
  }
  ```

- **GET /tenants/:tenant_nano_id/subscriptions**  
  Retrieves tenant subscriptions.
  
  *Success Response (200):*  
  ```json
  [
    {
      "tenant_subscription_nano_id": "sub_generated_id",
      "tenant_subscription_id": 1,
      "tenant_nano_id": "tenant_generated_id",
      "subscription_name": "premium",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:00:00.000Z"
    }
  ]
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["No subscriptions found"],
    "error": "not_found"
  }
  ```

- **PUT /tenants/:tenant_nano_id/subscriptions/:subscription_nano_id**  
  Updates a tenant subscription.
  
  *Request Body:*  
  ```json
  {
    "subscription_name": "enterprise"
  }
  ```  

  *Success Response (202):*  
  ```json
  {
    "message": "subscription updated successfully",
    "subscription": {
      "tenant_subscription_nano_id": "sub_generated_id",
      "tenant_subscription_id": 1,
      "tenant_nano_id": "tenant_generated_id",
      "subscription_name": "enterprise",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:00:00.000Z"
    }
  }
  ```  

  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Subscription not found"],
    "error": "not_found"
  }
  ```

---

### Role Endpoints (Base route: `/roles` - Protected by JWT & AdminGuards)

- **GET /roles**  
  Retrieves all roles.  
  *Success Response (200):*  
  ```json
  [
    { "role_nano_id": "role_nano_1", "name": "super-admin" },
    { "role_nano_id": "role_nano_2", "name": "admin" }
  ]
  ```
  
- **GET /roles/:role_nano_id**  
  Retrieves role details.  
  *Success Response (200):*  
  ```json
  {
    "role_nano_id": "role_nano_2",
    "name": "admin"
  }
  ```
  
- **POST /roles**  
  Creates a new role.  
  *Request Body:*  
  ```json
  {
    "name": "manager"
  }
  ```  
  *Success Response (201):*  
  ```json
  {
    "message": "Role created successfully",
    "role": {
      "role_nano_id": "generated_role_id",
      "name": "manager"
    }
  }
  ```  
  *Error Response (409 Conflict):*  
  ```json
  {
    "statusCode": 409,
    "message": ["Role name already exists"],
    "error": "conflict"
  }
  ```
  
- **PATCH /roles/:role_nano_id**  
  Updates an existing role.  
  *Request Body:*  
  ```json
  {
    "name": "updated_role_name"
  }
  ```  
  *Success Response (202):*  
  ```json
  {
    "message": "Role updated successfully",
    "role": {
      "role_nano_id": "generated_role_id",
      "name": "updated_role_name"
    }
  }
  ```  
  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["Role not found"],
      "error": "not_found"
    }
    ```  
  - **409 Conflict:**  
    ```json
    {
      "statusCode": 409,
      "message": ["Role name already exists"],
      "error": "conflict"
    }
    ```
  
- **DELETE /roles/:role_nano_id**  
  Deletes a role.  
  *Success Response (203):*  
  ```json
  {
    "message": "Role deleted successfully"
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Role not found"],
    "error": "not_found"
  }
  ```

---

### User Endpoints (Base route: `/users` - Protected by JWT; some endpoints further restricted by AdminGuard)

- **GET /users**  
  Retrieves a paginated list of users.
  
  *Query Params:*  
  ```json
  {
    "page": 1,
    "limit": 10
  }
  ```  
  *Success Response (200):*  
  ```json
  {
    "data": [
     {
    "user_id": 2,
    "user_nano_id": "generated_id",
    "tenant_nano_id": "generated_id",
    "photo": "https://example.com/photo.jpg",
    "display_name": "John Doe",
    "nick_name": "Johnny",                     // optional field
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password_status": "active",              // optional
    "status": "active",
    "is_verified": true,
    "portal_access": true,                    // optional
    "created_on": "2023-10-10T10:00:00.000Z",
    "language_code": "en",                    // optional
    "timezone": "UTC",                        // optional
    "user_profile": {
      "user_profile_id": 2,
      "user_profile-nano_id": "user_profile_nano_id",
      "full_name": "John Doe",
      "first_name": "John",
      "middle_name": "A.",                     // optional
      "last_name": "Doe",
      "name_prefix": "Mr.",                    // optional
      "name_suffix": "Jr.",                    // optional
      "primary_phone": "1234567890",
      "secondary_phone": "0987654321",         // optional
      "secondary_email": "j.doe@alt.com",      // optional
      "gender": "male",                        // optional
      "marital_status": "single",              // optional
      "date_of_birth": "1990-01-01",
      "country_of_birth": "USA",               // optional
      "nationality": "American",                // optional
      "user_nano_id": "user_nano_id",
      "national_id_number": "national_id_number",
      "other_government_id_numer": "other_government_id_numer",
      "uploaded_id":"uploaded_id",
      "is_disabled": false,
      "disability_status": "normal",
      "created_by": "created_by",
      "created_on": "created_on",
    },
    "user_auth": {
      "last_login_at": "2023-10-10T10:30:00.000Z",
      "last_login_ip": "192.168.0.1"
    },
    "user_location": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",               // optional
      "city": "Metropolis",
      "state": "NY",                         // optional
      "province": "New York",                // optional
      "postal_code": "10001",                // optional
      "country": "USA",
      "latitude": 40.7128,                   // optional
      "longitude": -74.0060,                 // optional
      "user_location_id": 2,
      "user_location_nano_id": "nano_id",
      "user_nano_id": "user_nano_id",
      "location_type": "location_type",
      "created_by": "created_by",
      "created_on":"created_on",
    },
    "tenant": {
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",          // optional
      "government_alternate_registration_id": "ALT-01",   // optional
      "education_category": "secondary",
      "education_classification": "public",             // optional
      "education_affiliation": "District",              // optional
      "education_association": "State Association",     // optional
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",                       // optional
      "description": "A prestigious secondary school",  // optional
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
    },
    "user_roles": [
      {
        "role_nano_id": "role_generated_id",
        "name": "admin"
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
  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Invalid pagination parameters"],
    "error": "bad request"
  }
  ```

- **GET /users/search**  
  Searches for users by username or email.
  
  *Query Params:*  
  ```json
  {
    "query": "john",
    "page": 1,
    "limit": 10
  }
  ```  
  *Success Response (200):*  
  ```json
  {
    "data": [
      {
        "user_nano_id": "generated_id",
        "display_name": "John Doe",
        "username": "johndoe",
        "email": "john.doe@example.com",
        "photo": "https://example.com/photo.jpg"
      }
    ],
    "metadata": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```  
  *Error Response (400):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Invalid search query"],
    "error": "bad request"
  }
  ```

- **GET /users/:user_nano_id**  
  Retrieves a single user profile.
  
  *Success Response (200):*  
  ```json
  {
    "user_id": 2,
    "user_nano_id": "generated_id",
    "tenant_nano_id": "generated_id",
    "photo": "https://example.com/photo.jpg",
    "display_name": "John Doe",
    "nick_name": "Johnny",                     // optional field
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password_status": "active",              // optional
    "status": "active",
    "is_verified": true,
    "portal_access": true,                    // optional
    "created_on": "2023-10-10T10:00:00.000Z",
    "language_code": "en",                    // optional
    "timezone": "UTC",                        // optional
    "user_profile": {
      "user_profile_id": 2,
      "user_profile-nano_id": "user_profile_nano_id",
      "full_name": "John Doe",
      "first_name": "John",
      "middle_name": "A.",                     // optional
      "last_name": "Doe",
      "name_prefix": "Mr.",                    // optional
      "name_suffix": "Jr.",                    // optional
      "primary_phone": "1234567890",
      "secondary_phone": "0987654321",         // optional
      "secondary_email": "j.doe@alt.com",      // optional
      "gender": "male",                        // optional
      "marital_status": "single",              // optional
      "date_of_birth": "1990-01-01",
      "country_of_birth": "USA",               // optional
      "nationality": "American",                // optional
      "user_nano_id": "user_nano_id",
      "national_id_number": "national_id_number",
      "other_government_id_numer": "other_government_id_numer",
      "uploaded_id":"uploaded_id",
      "is_disabled": false,
      "disability_status": "normal",
      "created_by": "created_by",
      "created_on": "created_on",
    },
    "user_auth": {
      "last_login_at": "2023-10-10T10:30:00.000Z",
      "last_login_ip": "192.168.0.1"
    },
    "user_location": {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",               // optional
      "city": "Metropolis",
      "state": "NY",                         // optional
      "province": "New York",                // optional
      "postal_code": "10001",                // optional
      "country": "USA",
      "latitude": 40.7128,                   // optional
      "longitude": -74.0060,                 // optional
      "user_location_id": 2,
      "user_location_nano_id": "nano_id",
      "user_nano_id": "user_nano_id",
      "location_type": "location_type",
      "created_by": "created_by",
      "created_on":"created_on",
    },
    "tenant": {
      "account_type": "school",
      "short_name": "ABC High",
      "long_name": "ABC High School",
      "legal_name": "ABC High Incorporated",
      "government_registration_id": "REG-001",          // optional
      "government_alternate_registration_id": "ALT-01",   // optional
      "education_category": "secondary",
      "education_classification": "public",             // optional
      "education_affiliation": "District",              // optional
      "education_association": "State Association",     // optional
      "education_lowest_grade_level": "9",
      "education_highest_grade_level": "12",
      "date_founded": "2000-08-15",                       // optional
      "description": "A prestigious secondary school",  // optional
      "account_owner_name": "John Doe",
      "account_owner_email": "owner@abcschool.com",
      "account_owner_phone": "1234567890",
      "subscription_name": "standard",
    },
    "user_roles": [
      {
        "role_nano_id": "role_generated_id",
        "name": "admin"
      }
    ]
  }
  
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["User not found"],
    "error": "not_found"
  }
  ```

- **PUT /users/:user_nano_id**  
  Updates a user's details and profile information.
  
  *Request Body:*  
  ```json
  {
    "user": {
        "photo": "https://example.com/photo.jpg",
        "display_name": "John Doe",
        "nick_name": "Johnny",                     
        "username": "johndoe",
        "email": "john.doe@example.com",
        "password_status": "active",             
        "status": "active",
        "is_verified": true,
        "portal_access": true,                   
        "language_code": "en", 
         "timezone": "UTC",                        
      },

     "profile": {
       "full_name": "John Doe",
        "first_name": "John",
        "middle_name": "A.",                     // optional
        "last_name": "Doe",
        "name_prefix": "Mr.",                    // optional
        "name_suffix": "Jr.",                    // optional
        "primary_phone": "1234567890",
        "secondary_phone": "0987654321",         // optional
        "secondary_email": "j.doe@alt.com",      // optional
        "gender": "male",                        // optional
        "marital_status": "single",              // optional
        "date_of_birth": "1990-01-01",
        "country_of_birth": "USA",               // optional
        "nationality": "American",                // optional
        "user_nano_id": "user_nano_id",
        "national_id_number": "national_id_number",
        "other_government_id_numer": "other_government_id_numer",
        "uploaded_id":"uploaded_id",
        "is_disabled": false,
        "disability_status": "normal",         
    },
  }
  ```  
  *Success Response (202):*  
  ```json
  {
    "message": "User updated successfully",
    "data": {
      "user": {
        "user_nano_id": "generated_id",
        "user_id": 2,
        "tenant_nano_id": "generated_id",
        "photo": "https://example.com/photo.jpg",
        "display_name": "John Doe",
        "nick_name": "Johnny",                     // optional field
        "username": "johndoe",
        "email": "john.doe@example.com",
        "password_status": "active",              // optional
        "status": "active",
        "is_verified": true,
        "portal_access": true,                    // optional
        "created_on": "2023-10-10T10:00:00.000Z",
        "language_code": "en", 
        "timezone": "UTC",                        // optional
      },
      
     "profile": {
        "user_profile_id": 2,
        "user_profile-nano_id": "user_profile_nano_id",
        "full_name": "John Doe",
        "first_name": "John",
        "middle_name": "A.",                     // optional
        "last_name": "Doe",
        "name_prefix": "Mr.",                    // optional
        "name_suffix": "Jr.",                    // optional
        "primary_phone": "1234567890",
        "secondary_phone": "0987654321",         // optional
        "secondary_email": "j.doe@alt.com",      // optional
        "gender": "male",                        // optional
        "marital_status": "single",              // optional
        "date_of_birth": "1990-01-01",
        "country_of_birth": "USA",               // optional
        "nationality": "American",                // optional
        "user_nano_id": "user_nano_id",
        "national_id_number": "national_id_number",
        "other_government_id_numer": "other_government_id_numer",
        "uploaded_id":"uploaded_id",
        "is_disabled": false,
        "disability_status": "normal",
        "created_by": "created_by",
        "created_on": "created_on",
      },
    }
  }
  ```  
  *Error Responses:*  
  - **404 Not Found:**  
    ```json
    {
      "statusCode": 404,
      "message": ["User not found"],
      "error": "not_found"
    }
    ```  
  - **409 Conflict:**  
    ```json
    {
      "statusCode": 409,
      "message": ["Phone number already exists"],
      "error": "conflict"
    }
    ```

- **DELETE /users/:user_nano_id**  
  Deletes a user.
  
  *Success Response (203):*  
  ```json
  {
    "message": "User deleted successfully"
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["User not found"],
    "error": "not_found"
  }
  ```

#### Role Management (within Users)

- **GET /users/roles/:role_nano_id/users**  
  Retrieves users by a given role.
  
  *Query Params:*  
  ```json
  {
    "page": 1,
    "limit": 10
  }
  ```  
  *Success Response (200):*  
  ```json
  {
    "data": [
      {
        "user_nano_id": "generated_id",
        "user_id": 2,
        "tenant_nano_id": "generated_id",
        "photo": "https://example.com/photo.jpg",
        "display_name": "John Doe",
        "nick_name": "Johnny",                     // optional field
        "username": "johndoe",
        "email": "john.doe@example.com",
        "password_status": "active",              // optional
        "status": "active",
        "is_verified": true,
        "portal_access": true,                    // optional
        "created_on": "2023-10-10T10:00:00.000Z",
        "language_code": "en", 
        "timezone": "UTC",       
      }
    ],
    "metadata": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 3,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["No users found for the role"],
    "error": "not_found"
  }
  ```

- **GET /users/:user_nano_id/roles**  
  Retrieves the roles assigned to a user.
  
  *Success Response (200):*  
  ```json
  [
    { "role_nano_id": "role_generated_id", "name": "admin" },
    { "role_nano_id": "role_generated_id_2", "name": "user" }
  ]
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Roles not found for the user"],
    "error": "not_found"
  }
  ```

- **POST /users/:user_nano_id/roles**  
  Assigns a role to a user.
  
  *Request Body:*  
  ```json
  {
    "role_nano_id": "role_generated_id"
  }
  ```  
  *Success Response (201):*  
  ```json
  {
    "message": "Role assigned successfully"
  }
  ```  
  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["role_nano_id is required"],
    "error": "bad request"
  }
  ```

- **DELETE /users/:user_nano_id/roles/:role_nano_id**  
  Removes a role from a user.
  
  *Success Response (203):*  
  ```json
  {
    "message": "Role removed successfully"
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Role assignment not found"],
    "error": "not_found"
  }
  ```

#### Location Management

- **POST /users/:user_nano_id/locations**  
  Adds a new location for a user.
  
  *Request Body:*  
  ```json
  {
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",               // optional
      "city": "Metropolis",
      "state": "NY",                         // optional
      "province": "New York",                // optional
      "postal_code": "10001",                // optional
      "country": "USA",
      "latitude": 40.7128,                   // optional
      "longitude": -74.0060,                 // optional
      "user_nano_id": "user_nano_id",
      "location_type": "location_type",
  }
  ```  
  *Success Response (201):*  
  ```json
  {
    "message": "Location added successfully",
    "location": {
        "user_location_id": 2,
        "user_location_nano_id": "nano_id",
        "user_nano_id": "user_nano_id",
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",               // optional
        "city": "Metropolis",
        "state": "NY",                         // optional
        "province": "New York",                // optional
        "postal_code": "10001",                // optional
        "country": "USA",
        "latitude": 40.7128,                   // optional
        "longitude": -74.0060,                 // optional
        "location_type": "location_type",
        "created_by": "created_by",
        "created_on":"created_on",
    }
  }
  ```  
  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Missing required location fields"],
    "error": "bad request"
  }
  ```

- **GET /users/:user_nano_id/locations**  
  Retrieves all locations for a user.
  
  *Success Response (200):*  
  ```json
  [
    {
      "user_location_id": 2,
        "user_location_nano_id": "nano_id",
        "user_nano_id": "user_nano_id",
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",               // optional
        "city": "Metropolis",
        "state": "NY",                         // optional
        "province": "New York",                // optional
        "postal_code": "10001",                // optional
        "country": "USA",
        "latitude": 40.7128,                   // optional
        "longitude": -74.0060,                 // optional
        "location_type": "location_type",
        "created_by": "created_by",
        "created_on":"created_on",
    }
  ]
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Locations not found"],
    "error": "not_found"
  }
  ```

- **PUT /users/:user_nano_id/locations/:location_nano_id**  
  Updates a user's location.
  
  *Request Body:*  
  ```json
  {
     "address_line1": "123 Main St",
      "address_line2": "Apt 4B",               // optional
      "city": "Metropolis",
      "state": "NY",                         // optional
      "province": "New York",                // optional
      "postal_code": "10001",                // optional
      "country": "USA",
      "latitude": 40.7128,                   // optional
      "longitude": -74.0060,                 // optional
      "user_nano_id": "user_nano_id",
      "location_type": "location_type", 
  }
  ```  
  *Success Response (202):*  
  ```json
  {
    "message": "Location updated successfully",
    "location": {
        "user_location_id": 2,
        "user_location_nano_id": "nano_id",
        "user_nano_id": "user_nano_id",
        "address_line1": "123 Main St",
        "address_line2": "Apt 4B",               // optional
        "city": "Metropolis",
        "state": "NY",                         // optional
        "province": "New York",                // optional
        "postal_code": "10001",                // optional
        "country": "USA",
        "latitude": 40.7128,                   // optional
        "longitude": -74.0060,                 // optional
        "location_type": "location_type",
        "created_by": "created_by",
        "created_on":"created_on",
    }
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Location not found"],
    "error": "not_found"
  }
  ```

- **DELETE /users/:user_nano_id/locations/:location_nano_id**  
  Removes a user's location.
  
  *Success Response (203):*  
  ```json
  {
    "message": "Location removed successfully"
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Location not found"],
    "error": "not_found"
  }
  ```

#### Tenant Assignment (within Users)

- **POST /users/:user_nano_id/tenants**  
  Assigns a tenant to a user.
  
  *Request Body:*  
  ```json
  {
    "tenant_nano_id": "tenant_generated_id"
  }
  ```  
  *Success Response (202):*  
  ```json
  {
    "message": "Tenant assigned successfully",
    "user": {
        "user_nano_id": "generated_id",
        "user_id": 2,
        "tenant_nano_id": "generated_id",
        "photo": "https://example.com/photo.jpg",
        "display_name": "John Doe",
        "nick_name": "Johnny",                     // optional field
        "username": "johndoe",
        "email": "john.doe@example.com",
        "password_status": "active",              // optional
        "status": "active",
        "is_verified": true,
        "portal_access": true,                    // optional
        "created_on": "2023-10-10T10:00:00.000Z",
        "language_code": "en", 
        "timezone": "UTC", 
    }
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["User not found"],
    "error": "not_found"
  }
  ```

#### Payment Endpoints

- **POST /users/:user_nano_id/payments**  
  Creates a new user payment.
  
  *Request Body:*  
  ```json
  {
    "payment_type": "credit_card",
    "payment_method": "visa",
    "payment_details": "**** **** **** 1234"
  }
  ```  
  *Success Response (201):*  
  ```json
  {
    "message": "Payment created successfully",
    "payment": {
      "user_payment_id": 1,
      "user_payment_nano_id": "payment_generated_id",
      "payment_type": "credit_card",
      "payment_method": "visa",
      "payment_details": "**** **** **** 1234",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:40:00.000Z"
    }
  }
  ```  
  *Error Response (400 Bad Request):*  
  ```json
  {
    "statusCode": 400,
    "message": ["Missing payment details"],
    "error": "bad request"
  }
  ```

- **GET /users/:user_nano_id/payments**  
  Retrieves user payment records.
  
  *Success Response (200):*  
  ```json
  [
   {
      "user_payment_id": 1,
      "user_payment_nano_id": "payment_generated_id",
      "payment_type": "credit_card",
      "payment_method": "visa",
      "payment_details": "**** **** **** 1234",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:40:00.000Z"
    }
  ]
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["No payments found"],
    "error": "not_found"
  }
  ```

- **PUT /users/:user_nano_id/payments/:payment_nano_id**  
  Updates a user payment record.
  
  *Request Body:*  
  ```json
  {
      "payment_type": "credit_card",
      "payment_method": "visa",
      "payment_details": "**** **** **** 1234",
  }
  ```  
  *Success Response (202):*  
  ```json
  {
    "message": "Payment updated successfully",
    "payment": {
      {
      "user_payment_id": 1,
      "user_payment_nano_id": "payment_generated_id",
      "payment_type": "credit_card",
      "payment_method": "visa",
      "payment_details": "**** **** **** 1234",
      "created_by": "Admin User",
      "created_on": "2023-10-10T10:40:00.000Z"
    }
    }
  }
  ```  
  *Error Response (404 Not Found):*  
  ```json
  {
    "statusCode": 404,
    "message": ["Payment not found"],
    "error": "not_found"
  }
  ```

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
