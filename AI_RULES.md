# AI Development Rules for Explicaê

This document provides guidelines for the AI developer to follow when working on this project. Adhering to these rules ensures consistency, maintainability, and adherence to the existing architecture.

## Tech Stack Overview

The application is built with a modern, server-centric web stack. Here are the key technologies:

-   **Framework**: **Next.js 14+** using the App Router for routing and server-side rendering.
-   **Language**: **TypeScript** for type safety and improved developer experience.
-   **Backend & Auth**: **Supabase** is used for the PostgreSQL database, user authentication, and storage.
-   **Styling**: **Tailwind CSS** for all utility-first styling.
-   **UI Components**: **shadcn/ui** provides the component library, which is built on top of Radix UI for accessibility.
-   **Icons**: **Lucide React** is the exclusive icon library.
-   **AI Integration**: **OpenRouter** serves as the gateway to various Large Language Models (LLMs).
-   **Forms**: **React Hook Form** is used for managing form state and validation.
-   **Deployment**: The application is hosted on **Vercel**.

## Library Usage Rules

To maintain consistency, please follow these rules for using specific libraries and tools.

### 1. UI and Components

-   **Primary Rule**: **Always use `shadcn/ui` components.** For any UI element (buttons, cards, dialogs, inputs, etc.), first look for a component in `@/components/ui`.
-   **Custom Components**: If a required component does not exist in `shadcn/ui`, build it using Tailwind CSS and Radix UI primitives, following the same style and structure as existing `shadcn/ui` components.
-   **Styling**: Use **Tailwind CSS utility classes** directly in your JSX. Avoid creating separate CSS files or using the `style` attribute.

### 2. Icons

-   **Primary Rule**: Use icons exclusively from the **`lucide-react`** library. This ensures a consistent visual style for all icons.

### 3. Database and Authentication

-   **Primary Rule**: All database queries and authentication logic must go through the **Supabase client**.
-   **Server-Side**: In Server Components, Route Handlers, and Server Actions, use the server client from `@/lib/supabase/server`.
-   **Client-Side**: In Client Components, use the browser client from `@/lib/supabase/client`.

### 4. AI and Language Models

-   **Primary Rule**: All interactions with LLMs must be routed through the helper functions in **`lib/openrouter.ts`**.
-   **Rationale**: This file centralizes API key management, model selection logic (including fallbacks), and standardized error handling. Do not make direct `axios` or `fetch` calls to LLM providers from anywhere else.

### 5. Forms

-   **Primary Rule**: For all forms that require validation or manage complex state, use **React Hook Form**.
-   **Simple Forms**: For very simple forms (e.g., a single search input), standard React state (`useState`) is acceptable.

### 6. API Requests

-   **Internal APIs**: Use the standard `fetch` API to call internal Next.js Route Handlers (in the `app/api` directory).
-   **External APIs**: The `axios` library is used for external API calls within `lib/openrouter.ts`. Continue using it there for consistency.