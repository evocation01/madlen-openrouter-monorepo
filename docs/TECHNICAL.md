# Technical Documentation

## Architecture Overview

The system follows a microservices-in-monorepo pattern, decoupling the frontend presentation from the backend business logic while sharing core types and utilities.

### Diagram
```mermaid
graph TD
    User[User Browser] -->|Next.js (Port 3001)| Web[Web App]
    Web -->|API Calls (Port 3000)| API[Express API]
    API -->|Prisma| DB[(PostgreSQL)]
    API -->|REST| OpenRouter[OpenRouter API]
    Web -.->|Telemetry| Jaeger[Jaeger Tracing]
    API -.->|Telemetry| Jaeger
```

## Directory Structure

```
.
├── apps/
│   ├── web/                 # Next.js 16 Frontend
│   │   ├── src/components/  # UI Components (Chat, Header, etc.)
│   │   ├── src/content/     # Intlayer i18n dictionaries
│   │   └── src/auth.ts      # Auth.js configuration
│   └── api/                 # Express Backend
│       ├── src/services/    # OpenRouter logic
│       └── src/middleware/  # Authentication middleware
├── packages/
│   ├── database/            # Prisma Schema & Client
│   ├── ui/                  # Shared React/Shadcn Components
│   ├── shared/              # Shared Zod schemas & types
│   └── testing/             # Shared Vitest config
└── docker-compose.yml       # Infrastructure (PG, Jaeger)
```

## Key Decisions

### 1. Authentication Strategy
We use **Auth.js v5** (NextAuth) with the **Credentials Provider**.
-   **Challenge**: Credentials provider in v5 defaults to JWT-only and doesn't natively support database sessions.
-   **Solution**: We use a **stateless JWT strategy**. The Web App generates a JWE (encrypted JWT) using a shared `AUTH_SECRET`. The Express API verifies and decodes this token using `@auth/core/jwt` without needing to query the database for every request, ensuring high performance.

### 2. Smart Model Fallback
OpenRouter free models can be rate-limited.
-   **Implementation**: `OpenRouterService` maintains a map of models to categories (Reasoning, Coding, etc.).
-   **Logic**: If a request fails with 429/503, the service automatically retries with another model from the **same category**. This ensures the user gets a relevant answer (e.g., a code snippet) rather than a generic chat response.

### 3. Internationalization (i18n)
We chose **next-intlayer** for its type-safe, declaration-based approach.
-   **Why**: It colocates content with components (or in a `content` folder), making it easier to maintain than massive JSON files. It supports static generation and client-side updates.

### 4. Database Schema
We use **Prisma v7** with the `pg` driver adapter.
-   **Schema**:
    -   `User`: Standard auth user.
    -   `Conversation`: Holds chat metadata and `isPinned` status.
    -   `Message`: Stores content. `content` is a `Json` type to support multi-modal data (text + image URLs) flexibly.

## Observability
We use **OpenTelemetry (OTel)** for tracing.
-   **Frontend**: Uses `@vercel/otel` to hook into Next.js internals.
-   **Backend**: Uses `@opentelemetry/sdk-node` with auto-instrumentations (Http, Express).
-   **Visualizer**: Jaeger (All-in-one).

## Development Workflows

-   **New Component**: Create in `packages/ui`, export in `package.json`, consume in app.
-   **Database Change**: Modify `packages/database/prisma/schema.prisma`, run `pnpm turbo db:generate`, then `npx prisma db push`.
