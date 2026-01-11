# Madlen OpenRouter Monorepo

## Overview

This is a modern full-stack web application designed as a chat interface for OpenRouter. It is built as a monorepo using **Turbo** and **pnpm workspaces**, featuring a **Next.js 16** frontend, an **Express** backend, and shared packages for UI, database, and logic.

## Technical Stack & Choices

-   **Monorepo**: Managed by `pnpm` workspaces and `Turbo` for efficient build caching and task orchestration.
-   **Frontend (`apps/web`)**:
    -   **Next.js 16 (App Router)**: For server-side rendering, routing, and React server components.
    -   **Tailwind CSS v4**: For utility-first styling with the latest features.
    -   **next-intlayer**: For internationalization (English/Turkish), keeping content co-located with components.
    -   **Auth.js (v5)**: For secure authentication using the Credentials provider and Prisma adapter.
    -   **Playwright**: For End-to-End (E2E) testing.
-   **Backend (`apps/api`)**:
    -   **Express.js**: For a robust and flexible API server.
    -   **OpenTelemetry**: For observability and distributed tracing (Jaeger).
-   **Database**:
    -   **PostgreSQL**: Relational database for persistent storage.
    -   **Prisma v7**: Type-safe ORM for database interactions.
-   **Shared Packages**:
    -   `@repo/ui`: Shared UI components (shadcn/ui style).
    -   `@repo/shared`: Shared Zod schemas and TypeScript utilities.
    -   `@repo/database`: Shared Prisma client.
    -   `@repo/testing`: Shared test configurations (Vitest).

## Prerequisites

-   Node.js 22+
-   pnpm 10+
-   Docker & Docker Compose

## Getting Started

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Start Infrastructure (PostgreSQL & Jaeger)**:

    ```bash
    docker-compose up -d
    ```

3.  **Setup Database**:

    ```bash
    # Generate Prisma client
    pnpm turbo db:generate

    # Push schema to the database (dev mode)
    cd packages/database
    npx prisma db push
    ```

4.  **Run Development Server**:

    ```bash
    pnpm dev
    ```

    -   Web: http://localhost:3001
    -   API: http://localhost:3000
    -   Jaeger UI: http://localhost:16686

## Testing

-   **Unit & Integration Tests**:

    ```bash
    pnpm turbo test
    ```

-   **E2E Tests (Playwright)**:

    ```bash
    cd apps/web
    npx playwright test
    ```

## Observability

The application is instrumented with **OpenTelemetry**. Traces are sent to the local **Jaeger** instance.
Access the Jaeger UI at [http://localhost:16686](http://localhost:16686) to view traces from both the frontend (Next.js) and backend (Express).

## Internationalization

This project supports English (default) and Turkish.

-   Content is managed via `intlayer`.
-   Locale detection is handled by middleware.
-   Change URL to `/tr` to see the Turkish version (once content is added).

## License

MIT License. See [LICENSE](LICENSE) for more details.
