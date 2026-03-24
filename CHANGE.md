# CHANGE.md — CourseShelf

## 2026-03-24 — Phase 1 & 2: Project Setup + Core Models & Lib Helpers

### Project Initialization
- Initialized Next.js 16 project with TypeScript, Tailwind CSS 4, App Router, src directory
- Installed Vitest + React Testing Library for TDD
- Configured vitest.config.ts with jsdom, `@/` alias, setup file
- Added test scripts to package.json (`test`, `test:run`, `test:coverage`)
- Excluded `vitest.config.ts` from tsconfig to fix Vite/Next.js type conflict

### Dependencies Installed
- **Core**: `@supabase/supabase-js`, `@clerk/nextjs`, `stripe`, `@aws-sdk/client-s3`, `resend`, `framer-motion`, `lucide-react`
- **Testing**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`
- **UI**: shadcn/ui (16 components: card, badge, accordion, table, tabs, progress, skeleton, sonner, dropdown-menu, input, textarea, select, separator, avatar, sheet, dialog, button)

### Types (TDD)
- `src/types/models.ts` — Course, Lesson, Purchase interfaces
- `src/types/models.test.ts` — 5 tests

### Lib Helpers (TDD — all Red → Green → Refactor)
- `src/lib/config.ts` — Environment variable config with validation (2 tests)
- `src/lib/utils.ts` — formatPrice, formatDate, slugify + shadcn cn() (8 tests)
- `src/lib/supabase.ts` — Browser + Server Supabase clients (4 tests)
- `src/lib/cloudflare-r2.ts` — R2 S3-compatible client, upload key builder (4 tests)
- `src/lib/cloudflare-stream.ts` — Stream API: direct upload, video details (5 tests)
- `src/lib/stripe.ts` — Stripe client, amount formatters (4 tests)
- `src/lib/email.ts` — Resend client, purchase confirmation, welcome emails (4 tests)

### Database
- `supabase/migrations/001_initial_schema.sql` — courses, lessons, purchases tables with indexes, triggers, RLS policies

### Auth
- `src/middleware.ts` — Clerk middleware protecting /dashboard and /admin routes
- `src/app/sign-in/[[...sign-in]]/page.tsx` — Clerk sign-in page
- `src/app/sign-up/[[...sign-up]]/page.tsx` — Clerk sign-up page

### UI Components (TDD)
- `src/components/landing/hero-section.tsx` — Hero with headline + CTA buttons (2 tests)
- `src/components/landing/course-card.tsx` — Course card with thumbnail, title, price badge (5 tests)

### App Layout
- `src/app/layout.tsx` — ClerkProvider, Inter font, dark mode, Sonner toaster
- `src/app/page.tsx` — Landing page with HeroSection + CourseCard grid (placeholder data)
- `src/app/globals.css` — shadcn/ui theme with dark mode support

### Config
- `.env.example` — Template with all required environment variables
- `vitest.config.ts` — Test runner config with jsdom, path aliases, coverage

### Test Results
- **43 tests passing** across 9 test files
- **Next.js build compiles successfully** (4 routes)

## 2026-03-24 — Phases 3–7: Full MVP Build

### Data Access Layer
- `src/lib/queries.ts` — Full CRUD for courses, lessons, purchases with Supabase. Includes `getPublishedCourses`, `getCourseById`, `getAllCourses`, `createCourse`, `updateCourse`, `deleteCourse`, `getLessonsByCourseId`, `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `getUserPurchases`, `getUserPurchaseForCourse`, `createPurchase`, `getAllPurchases`, `getPurchaseStats`

### Shared Components
- `src/components/shared/navbar.tsx` — Sticky navbar with auth-aware navigation (uses `useAuth()` hook for Clerk v7 compat)
- `src/components/shared/link-button.tsx` — Client-side `LinkButton` wrapper for `buttonVariants()` — safe to use from server components

### Phase 3: Public Pages
- `src/app/courses/[courseId]/page.tsx` — Course detail server component (fetches course + lessons + purchase status)
- `src/app/courses/[courseId]/course-detail-client.tsx` — Course detail UI with hero banner, thumbnail, curriculum accordion, preview badges, locked lesson indicators, and conditional Enroll/Continue CTA
- `src/app/page.tsx` — Updated landing page to fetch real courses from Supabase with graceful fallback

### Phase 4: Payments
- `src/app/api/checkout/route.ts` — Stripe checkout session creator (validates course, checks existing purchase, redirects to Stripe hosted checkout)
- `src/app/api/webhooks/stripe/route.ts` — Stripe webhook handler (verifies signature, creates purchase record, sends confirmation email)
- `src/app/checkout/success/page.tsx` — Server component that retrieves Stripe session
- `src/app/checkout/success/success-content.tsx` — Client component showing payment confirmation with Start Learning / Dashboard links
- `src/middleware.ts` — Updated to skip auth on `/api/webhooks` routes

### Phase 5: Student Dashboard & Video Player
- `src/app/dashboard/page.tsx` — Student dashboard showing purchased courses with thumbnails, purchase dates, and amounts
- `src/app/courses/[courseId]/learn/page.tsx` — Learn page server component (enforces purchase access, selects active lesson)
- `src/app/courses/[courseId]/learn/video-player-client.tsx` — Full video player with Cloudflare Stream iframe, collapsible lesson sidebar, auto-advance to next lesson, preview/locked indicators, mobile toggle

### Phase 6: Admin Dashboard
- `src/app/admin/layout.tsx` — Admin layout with sidebar nav + `ADMIN_USER_IDS` env var guard
- `src/app/admin/page.tsx` — Overview with revenue stats cards (total, month, week, course count)
- `src/app/admin/courses/page.tsx` — Courses table with status badges, lesson counts, edit links
- `src/app/admin/courses/new/page.tsx` — New course form (title, description, price)
- `src/app/admin/courses/[courseId]/page.tsx` — Course editor with inline lesson management, video upload via Cloudflare Stream direct creator upload, thumbnail upload to R2, preview toggle, delete
- `src/app/admin/revenue/page.tsx` — Revenue stats + full purchase history table
- `src/app/api/admin/courses/route.ts` — GET (list all) + POST (create) courses
- `src/app/api/admin/courses/[courseId]/route.ts` — GET + PATCH + DELETE single course
- `src/app/api/admin/courses/[courseId]/lessons/route.ts` — GET + POST + PUT (reorder) lessons
- `src/app/api/admin/courses/[courseId]/lessons/[lessonId]/route.ts` — PATCH + DELETE single lesson
- `src/app/api/admin/upload/video/route.ts` — Cloudflare Stream direct creator upload URL endpoint
- `src/app/api/admin/upload/thumbnail/route.ts` — R2 thumbnail upload via PutObjectCommand

### Phase 7: Polish
- `src/app/loading.tsx` — Home page skeleton (hero + course grid)
- `src/app/courses/[courseId]/loading.tsx` — Course detail skeleton
- `src/app/dashboard/loading.tsx` — Dashboard skeleton with course cards
- `src/app/admin/loading.tsx` — Admin overview skeleton with stat cards
- `src/app/error.tsx` — Global error page with retry + home link
- `src/app/not-found.tsx` — 404 page with home + browse links
- Added `export const dynamic = "force-dynamic"` to all pages querying Supabase/Stripe
- Updated `.env.example` with `ADMIN_USER_IDS`, `CLOUDFLARE_R2_PUBLIC_URL`, `NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE`

### Bug Fixes During Build
- Replaced `SignedIn`/`SignedOut` (removed in Clerk v7) with `useAuth()` hook
- Removed `afterSignOutUrl` prop from `UserButton` (removed in Clerk v7)
- Fixed `buttonVariants()` server/client boundary errors by creating `LinkButton` wrapper
- Added `force-dynamic` to prevent static prerendering crashes without env vars
- Added `Course[]` type annotation to fix implicit `any[]` TypeScript error
- Excluded `/api/webhooks` from Clerk middleware for raw body access

### Build Results
- **Next.js build compiles successfully** (21 routes: 9 static, 12 dynamic)
- All TypeScript types pass strict checking
- All API routes have admin auth guards
