# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Beyond Records is a centralized digital platform for comprehensive student activity record management in Higher Education Institutions (HEIs). Built for Smart India Hackathon 2025, it provides web and mobile-based Smart Student Hub with real-time analytics, verified portfolios, and NAAC/NIRF/AICTE compliance reporting.

## Common Development Commands

### Development Server
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Linting
```bash
# Run Next.js linter
pnpm lint
```

### Database Seeding
```bash
# Seed all data (institutes + sample data)
pnpm seed:all

# Seed only institutes
pnpm seed:institutes

# Seed only sample data (students, courses, etc.)
pnpm seed
```

### Running Scripts
```bash
# Execute TypeScript scripts directly using tsx
tsx scripts/<script-name>.ts

# Examples:
tsx scripts/testDatabase.ts
tsx scripts/createInstitutions.ts
```

## Environment Setup

### Required Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/beyond_records
DB_CONNECTION_TIMEOUT=30000
DB_MAX_CONNECTIONS=10

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development
```

### First-Time Setup
1. Install dependencies: `pnpm install`
2. Configure `.env` file with MongoDB URI and JWT secret
3. Seed database: `pnpm seed:all`
4. Start dev server: `pnpm dev`

## Code Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router with TypeScript)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcryptjs for password hashing
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS 4.x with custom theme
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks + localStorage for client state

### Directory Structure

```
app/                          # Next.js App Router pages and API routes
├── api/                      # API route handlers
│   ├── auth/                 # Authentication endpoints (login, register)
│   ├── institutes/           # Institution management
│   ├── institutions/         # Institution queries
│   ├── naac-report/          # NAAC report generation
│   ├── notifications/        # User notifications
│   └── sync/                 # Data synchronization
├── auth/                     # Authentication pages (login, register, onboarding)
├── dashboard/                # Role-based dashboards
│   ├── student/              # Student dashboard
│   ├── faculty/              # Faculty dashboard
│   ├── admin/                # Admin dashboard
│   └── institution/          # Institution dashboard
├── portfolio/                # Portfolio generation and viewing
└── naac-report/              # NAAC report generation UI

components/                   # Reusable React components
├── ui/                       # shadcn/ui components (auto-generated)
├── auth-guard.tsx            # Authentication protection HOC
└── theme-provider.tsx        # Dark/light theme management

lib/                          # Core business logic and utilities
├── auth.ts                   # Authentication service (client-side)
├── jwt.ts                    # JWT token generation and verification
├── models.ts                 # Mongoose schemas and models
├── mongodb.ts                # Database connection management
├── notifications.ts          # Notification utilities
├── offline-storage.ts        # IndexedDB for offline support
├── rate-limit.ts             # API rate limiting
└── utils.ts                  # Shared utility functions

scripts/                      # Database seeding and maintenance scripts
├── seedData.ts               # Seed sample data
├── seedInstitutes.ts         # Seed institutions
├── createInstitutions.ts     # Create institutions programmatically
└── testDatabase.ts           # Database connection testing

hooks/                        # Custom React hooks
public/                       # Static assets (images, icons, etc.)
styles/                       # Global CSS styles
```

### Database Models

The application uses Mongoose with the following core models (defined in `lib/models.ts`):

- **User**: Base user model with role-based access (student, faculty, admin, institution)
- **StudentProfile**: Extended student information (GPA, major, achievements, skills)
- **Course**: Course information with assignments and enrolled students
- **Enrollment**: Junction table linking students to courses
- **Assignment**: Course assignments with submissions and grading
- **Portfolio**: Auto-generated student portfolios with multiple templates
- **PendingAchievement**: Achievement verification workflow (pending, verified, rejected)
- **Institution**: Institution/university metadata and settings
- **Notification**: User notification system
- **ActivityLog**: Audit trail for user actions
- **NAACReport**: NAAC compliance reporting data

### Authentication Flow

1. **Registration** (`/auth/register`): User registers with email/password, receives JWT token
2. **Login** (`/auth/login`): Credentials validated, JWT stored in localStorage
3. **Token Storage**: JWT token in localStorage, user data cached
4. **Protected Routes**: `AuthGuard` component checks authentication status
5. **API Authorization**: Bearer token sent in Authorization header for API requests
6. **Token Expiry**: Automatic logout when token expires (with 5-minute buffer)

### Role-Based Access Control

Four user roles with distinct permissions:
- **Student**: View courses, submit assignments, manage portfolio, track achievements
- **Faculty**: Grade assignments, verify student achievements, view course analytics
- **Admin**: Full system access, user management, institution settings
- **Institution**: Multi-institution support, institution-level analytics

### Key Architectural Patterns

#### Database Connection Management
- Singleton pattern with connection pooling in `lib/mongodb.ts`
- Exponential backoff retry logic (up to 5 attempts)
- Graceful shutdown handlers for SIGINT/SIGTERM
- Connection health checks and status monitoring
- Global connection caching to prevent multiple connections in development

#### API Route Structure
- RESTful API routes in `app/api/`
- JWT middleware for authentication
- Rate limiting on sensitive endpoints
- Consistent error response format
- Request/response validation with Zod schemas

#### Frontend State Management
- Server components for initial data fetching
- Client components for interactive UI
- localStorage for authentication state
- React hooks for local component state
- No global state management library (intentionally simple)

#### Portfolio Generation
- Three template options: modern, creative, academic
- Auto-population from student profile and achievements
- Shareable URL generation with QR codes
- PDF export functionality (jsPDF + html2canvas)
- Public/private toggle for sharing

#### Achievement Verification Workflow
1. Student submits achievement with evidence files
2. Achievement stored in PendingAchievement collection (status: pending)
3. Faculty reviews and verifies/rejects with comments
4. Verified achievements added to StudentProfile
5. Notifications sent to student on status change

## Development Guidelines

### Path Aliases
TypeScript path aliases configured in `tsconfig.json`:
```typescript
@/*           # Root directory
@/components/* # components/
@/lib/*       # lib/
@/app/*       # app/
@/hooks/*     # hooks/
@/utils/*     # lib/utils/
```

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- No implicit any, unused locals/parameters flagged as errors
- Exact optional property types enforced
- Path aliases for clean imports

### Styling Conventions
- Tailwind CSS utility-first approach
- shadcn/ui components for consistency
- Dark/light theme support via next-themes
- Geist Sans and Geist Mono fonts

### API Response Format
Consistent JSON response structure:
```typescript
// Success
{ success: true, data: {...}, message?: string }

// Error
{ error: string, details?: any }
```

### Error Handling
- Try-catch blocks in all async functions
- Graceful error messages for users
- Detailed error logging in development
- MongoDB connection errors with retry logic

## Testing Database Connection

Run the database connection test before development:
```bash
tsx scripts/testDatabase.ts
```

This validates:
- MongoDB URI configuration
- Database connectivity
- Basic CRUD operations
- Connection pooling

## Service Worker and PWA

The application includes a service worker (`service-worker.js`) and manifest (`manifest.json`) for Progressive Web App functionality:
- Offline support with IndexedDB fallback
- App installation capability
- Background sync for data persistence

## Common Issues and Solutions

### MongoDB Connection Issues
- Verify `MONGO_URI` in `.env` file
- Check MongoDB server is running
- Ensure network connectivity to database
- Check connection pool settings if seeing timeout errors

### Authentication Issues
- Clear localStorage and re-login if seeing token errors
- Verify `JWT_SECRET` is set in environment
- Check token expiry buffer (5 minutes) in `lib/auth.ts`

### Build Errors
- Run `pnpm install` to ensure dependencies are up to date
- Check TypeScript errors: issues flagged as errors by default (not warnings)
- Verify all environment variables are set

### Seeding Issues
- Ensure MongoDB connection is established before seeding
- Run `tsx scripts/testDatabase.ts` to verify connectivity
- Check for duplicate key errors (unique constraints on models)

## Important Notes

- **Do not make unnecessary changes**: Follow the user's rule to avoid breaking the codebase
- **Database models**: All Mongoose models check `mongoose.models` before creating to prevent duplicate model errors in development
- **Strict TypeScript**: The project uses strict TypeScript settings - maintain type safety
- **Connection pooling**: MongoDB uses connection pooling (max 10 connections) - do not create additional connections
- **JWT expiry**: Tokens have 5-minute grace period before forced logout
- **Next.js App Router**: Use Server Components by default, Client Components only when needed