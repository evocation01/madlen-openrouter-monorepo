Nexus Monorepo Blueprint (Next.js + Express)

1. Tech Stack Overview

Monorepo Tooling: pnpm workspaces + Turborepo.

Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, next-intlayer (i18n).

Backend: Node.js, Express, TypeScript, Prisma (ORM).

Authentication: Auth.js (NextAuth).

Validation: Zod (Shared schemas).

Testing (Target 90%+ Coverage): - Vitest: Unit & Integration tests.

Playwright: End-to-End testing.

Supertest: API testing for Express.

2. Monorepo Structure (nexus-monorepo)

.
├── apps/
│ ├── web/ # Next.js Frontend
│ └── api/ # Express Backend
├── packages/
│ ├── shared/ # Zod schemas, shared logic, TS interfaces
│ ├── ui/ # Shared React components (shadcn/ui style)
│ ├── database/ # Prisma client & migrations
│ ├── testing/ # Global test mocks and configs
│ ├── config-eslint/  
│ └── config-typescript/  
├── pnpm-workspace.yaml
├── turbo.json
└── package.json

3. Core Features & Decision Log

Authentication: Auth.js Strategy

Why: Auth.js handles the heavy lifting of security (OWASP standards).

Implementation: Next.js manages the session. The Express API will verify the session via a shared secret or by checking the database (Prisma) directly using the session token.

Internationalization: next-intlayer

Declarative content management.

Content files live next to components (e.g., Button.content.ts), ensuring that when you test a component, you're testing the i18n logic too.

Quality Assurance (90% Coverage)

Unit Tests: Every utility and shared logic in packages/shared must have 100% coverage using Vitest.

Component Tests: React Testing Library for UI components.

Integration Tests: Testing Express routes using supertest against a test database.

CI/CD: Github Actions running turbo lint, turbo test, and turbo build on every PR.

4. Database Schema (Prisma)

The Auth.js adapter requires specific tables to manage users and sessions automatically.

model User {
id String @id @default(cuid())
name String?
email String? @unique
password String? // Hashed
role Role @default(USER)
accounts Account[]
sessions Session[]
createdAt DateTime @default(now())
}

enum Role {
USER
ADMIN
}

5. Implementation Roadmap (4h Timeline)

Phase 1: The Core Foundation (45m)

Initialize pnpm workspace in nexus-monorepo.

Setup packages/database with Prisma.

Setup packages/shared with Zod schemas for User/Auth.

Configure Vitest root config.

Phase 2: Identity & Backend (1h 15m)

API: Express setup with Inversify or simple functional middleware for error handling.

Auth: Setup Auth.js in apps/web with Credentials provider.

Tests: Write first suite of API tests using supertest.

Phase 3: Frontend & i18n (1h)

Next.js App Router setup.

Configure next-intlayer.

Build the Dashboard and Login pages using shared types.

Setup middleware.ts for route protection.

Phase 4: Testing & Coverage (1h)

Implement missing unit tests to hit the 90% threshold.

Run turbo test --coverage.

Setup one "Happy Path" Playwright E2E test (Login -> Dashboard).

6. Communication Interface (API)

Auth: Managed by Auth.js (/api/auth/\* in Next.js).

API Endpoints:

GET /v1/profile: Fetches user data (Backend validates session).

PATCH /v1/settings: Update user preferences.
