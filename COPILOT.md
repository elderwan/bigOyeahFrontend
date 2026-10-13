# FitBooking Frontend Guide

Use this file as the project-specific guide when changing the FitBooking frontend. Prefer the existing stack and patterns; keep business rules aligned with the database and backend contract.

## Project at a glance

- Product: Thai-language personal-training booking platform for Chiang Mai.
- Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, and `lucide-react`.
- The current app is a frontend-only FitBooking prototype. No backend/API implementation is in scope for the current UI work.
- Install and run with `npm install` and `npm run dev`. Use `npm run build` and `npm run lint` for checks.
- Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the FastAPI base URL; `.env.example` defaults to `http://localhost:8000`.

## Source of truth

1. `schema.sql` is authoritative for the fixed MySQL schema, column names, nullability, enums, and database constraints.
2. `FitBooking_MySQL_Database_Doc_TH.docx` explains the business workflows and intended schedule/payment behavior. Some rules are explicitly marked as provisional; don't silently turn them into fixed frontend rules.
3. `README_TH.md` documents the current frontend scaffold, types, and setup.
4. The actual FastAPI API contract is authoritative for endpoint payloads, permissions, and server-side validation. This repository currently has no endpoint specification.

The SQL defines 19 fixed tables. Coach availability uses a backend-managed dynamic table per coach; dynamic-table DDL and business transactions do not belong in this frontend. The SQL comments refer to a separate `triggers.sql`, which is not present in this repository, so do not assume those triggers are installed.

## Repository map

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, root layout, global CSS |
| `components/` | Shared UI such as the dashboard shell, status badge, and stat card |
| `lib/database.ts` | Database-shaped TypeScript types and enum unions |
| `lib/api-client.ts` | Shared API request helper |
| `lib/mock-data.ts` | Demo-only records; not production data |
| `schema.sql` | Fixed MySQL schema and configuration seed data |

Keep pages in `app/`, reusable presentation in `components/`, and shared data/API utilities in `lib/`. Use the existing `@/` import alias. In the App Router, prefer server components; add `"use client"` only for browser state, event handlers, or browser-only APIs.

## Data and database rules

- Keep every database-facing column name exactly as it appears in `schema.sql`—same spelling, underscores, and casing. Do not rename SQL fields to camelCase, aliases, or UI-friendly names in database/API types or request/response payloads. Use the exported types in `lib/database.ts`; match enum values exactly and translate them to Thai only in the presentation layer. If the UI needs a different label or shape, map it in a separate presentation model without changing the database/API field names.
- Preserve SQL nullability in TypeScript and handle `null` explicitly in the UI. If an API response differs from a database type, define a deliberate API/view model rather than weakening types.
- `User` includes `password_hash` because it mirrors the table. Never send it to or render it in a browser-facing view; use a safe user projection instead.
- Currency is Thai baht (THB). Database amounts use `DECIMAL`, not floating-point money. Treat the API's exact amount representation as part of its contract and format for display with Thai locale/THB.
- Business dates and times use Chiang Mai time (`+07:00`, `Asia/Bangkok`). Treat `YYYY-MM-DD` values as calendar dates; avoid UTC conversions that shift a date. Format timestamps for the business timezone.
- Business records are retained using statuses or `is_active`; don't implement physical deletion of bookings, orders, reviews, users, coaches, gyms, or courses.
- The backend owns authorization and validation. Frontend role checks may hide or disable controls for UX but are not security boundaries.

## Booking invariants

Use these rules to shape forms, labels, and schedule displays, while leaving final validation and concurrency decisions to FastAPI:

- Schedule slots are 10-minute intervals. Booking start times and durations must align to 10 minutes; coach breaks are 10, 20, or 30 minutes.
- Slot states are `AVAILABLE`, `BOOKED`, `BREAK`, and `BLOCKED`. Only `AVAILABLE` slots are selectable. Both `PENDING` and `CONFIRMED` bookings occupy their `BOOKED` slots; break slots are unavailable too.
- `GYM` bookings require a `gym_id` and no home address/district. `HOME` bookings require a district and address and no `gym_id`.
- A booking must use a course the coach offers. Prices, duration, and break duration are snapshots on the booking; do not recompute existing booking history from current coach/course settings.
- Send business identifiers and requested booking details (such as `coach_id`, course, service mode/location, date/time, and optional package ID) to the API. Never send a dynamic schedule table name, SQL, or a client-constructed database identifier.
- Treat availability shown in the UI as provisional until the API accepts the booking. Handle slot conflicts and other API errors explicitly; never show a successful booking on a failed response.
- Preserve the booking lifecycle: `PENDING` can become `CONFIRMED` or `CANCELLED`; `CONFIRMED` can become `COMPLETED`, `CANCELLED`, or `NO_SHOW`. Render all enum states, including terminal states, distinctly.

The database design document marks several workflow values as needing confirmation, including the minimum booking lead time, booking horizon, pending-payment timeout, cancellation/refund window, package expiry, and upgrade policy. Read these from the API/business contract or configuration; don't hardcode them as settled policy.

## API and security

- Use `apiRequest` in `lib/api-client.ts` for HTTP calls; it throws when the response is not successful. Keep failures visible and map known API errors to clear user-facing messages.
- The backend is FastAPI. Do not connect the browser directly to MySQL or put database credentials, private keys, or other secrets in `NEXT_PUBLIC_*` variables.
- Keep mock data clearly separated from live API state. Do not silently fall back to mock records when a live request fails.
- Booking, payment, package-credit, cancellation, refund, review, and KPI changes are multi-step backend transactions. Submit the user action to the API and display the returned result; do not simulate a committed transaction in the client.
- The backend derives dynamic schedule table names from its stored, validated `coach_no`. A client must never choose or provide that table name.
- Current sign-in, registration, role routing, profile edits, messages, and staff workflow interactions are browser-local previews only. They use `localStorage` and demo data; they do not call FastAPI, create database records, or provide production authentication/authorization.
- Never describe a client-side role guard, demo ID, or browser-stored password hash as access control. The admin and trainer demo identities are for UI review only. Production account creation, credential verification, role authorization, password recovery, messaging, and all workflow changes must be implemented and enforced by the backend after an API contract is approved.
- Member self-registration in this prototype collects `username`, `display_name`, `email`, `phone`, and optional member profile fields (`gender`, `birth_date`, `height_cm`, `weight_kg`, `fitness_goal`). New self-registered profiles are `MEMBER` only. Staff roles are limited to explicitly labeled demo profiles; never add a client-side staff privilege-creation path.
- The demo sign-in stores only a browser-local profile/session projection and a local password hash, never the plaintext password in the session. This remains insecure demo behavior: the browser and its storage are user-controlled, and the preview hash is not a substitute for the server's password handling.

## UI and accessibility

- User-facing copy is Thai, consistent with the existing dashboard and `<html lang="th">`. Keep database enum values in English internally and localize their labels in the UI.
- Preserve the existing visual tokens in `tailwind.config.ts`: ink `#17221f`, moss `#315c4d`, sage `#e8f0e8`, sand `#f6f3ec`, terracotta `#d9785b`, and gold `#d8a84e`. The current canvas is a warm off-white with white cards and moss-green navigation.
- Build responsive layouts for phone and desktop. Booking and calendar tasks should remain usable on narrow screens; don't rely on hover-only actions.
- Use semantic headings, buttons, labels, visible keyboard focus, accessible names for icon-only controls, and sufficient contrast. Include loading, empty, error, and success states for data-driven screens.
- Reuse existing components and Tailwind utilities before adding dependencies or creating one-off design systems. Use `lucide-react` for icons.
- Use design references as inspiration for layout and interaction patterns, not as permission to copy a site's branding, copy, images, or source code.

### External product references

- [Barry's studio finder](https://www.barrys.com/studios): clearest reference for a prominent first-class CTA, location-finder entry point, responsive studio cards, and expandable mobile directory sections. Adapt the discovery-to-booking flow; keep FitBooking's own visual identity.
- [Orangetheory locations](https://www.orangetheory.com/en-us/locations): useful example of connecting nearby-location discovery directly to a first-class offer. The detailed finder controls were not verifiable from the page extraction.
- [ClassPass fitness search](https://classpass.com/search/fitness-classes): a marketplace-style discovery reference. The route was verified, but its results and filter interactions were not visible in the page extraction; inspect them in a browser before using specific patterns.

## Existing implementation notes

- `app/page.tsx` renders the public landing page and `components/fitbooking-prototype.tsx` coordinates the UI-only sign-in/sign-up flow and role workspaces. Dedicated browser routes are `/signin`, `/signup`, `/member`, `/trainer`, and `/admin`; the router checks the selected demo profile's role for UX only.
- Sign-up is member-only. Seeded demo sign-ins are `alex` / `FitBooking123!` (member), `coach.tan` / `Coach@123` (trainer), and `FB-ADMIN-001` / `Admin@123` (admin). These public preview credentials are not real accounts and must not be reused in production.
- `lib/demo-auth.ts` owns only the browser-local demo profile/session storage; `components/fitbooking-workspaces.tsx` contains sign-in/sign-up forms, trainer schedule/messages/client views, admin workflow views, and package details. The official mark is served from `public/fitbooking-kettlebell.png`.
- The member area retains discovery, booking, membership, reviews, progress, and profile UI. Package cards open a detail view before selection. Trainer screens include schedule/availability interactions and a browser-local chat thread; admin screens include member/trainer/booking/package workflow previews.
- All displayed metrics, schedules, packages, messages, booking/payment confirmations, admin controls, and role checks are demo content/interactions. They do not create API or database records; persisted demo profiles, the active demo session, and preview messages stay in the current browser's local storage.
- Keep booking/payment/workflow interactions clearly labeled as demonstrations until confirmed FastAPI endpoints exist. Do not represent mock success, metrics, availability, profile state, or staff changes as live server data.
- The legacy `components/dashboard-shell.tsx` remains in the repository, but the prototype uses its own member-facing navigation and mobile bottom bar.
- `lib/database.ts` mirrors the fixed schema, but database-shaped types are not automatically safe API or UI models.
- `lib/api-client.ts` currently uses a local API URL fallback. Add real features only against confirmed backend endpoints and response shapes.

### Member booking UI preview

- `components/member-booking-picker.tsx` renders the member date/month/time selector. `lib/member-preview-data.ts` is its clearly labeled local-only adapter: it generates `CoachScheduleSlot` records from `CoachWeeklyTemplate` fixtures and returns exact SQL fields such as `booking_date`, `start_time`, and `end_time`. It does not read a live trainer schedule or call an API.
- The picker previews only dates within 60 days, enforces a two-hour lead time, uses the coach's break interval and course duration to require all covered 10-minute slots to be `AVAILABLE`, and excludes overlapping local `PENDING`/`CONFIRMED` bookings. These values and fixture schedules are for UI review; never treat them as server-authoritative availability or validated business policy.
- `components/fitbooking-prototype.tsx` contains the member Explore filters, My Bookings list/detail/review UI, and Progress timetable/30-day plan. Its booking, cancellation, payment, package-credit, and review interactions only update local preview state. No booking, payment, refund, or review is submitted or persisted to a backend.
- Review inputs use `rating_professional`, `rating_communication`, `rating_punctuality`, `rating_effectiveness`, and `comment`; `avg_rating` is a read-only local preview calculation. Booking and review records use the interfaces from `lib/database.ts`; preserve their SQL column names and enum values.
- Keep the existing Gym/Home place-selection controls and interaction unchanged until the trainer page is finished. The current booking section carries the follow-up TODO; do not redesign it as part of member picker work.
- The current preview supplies sample membership levels and `discount_rate` values in `lib/member-preview-data.ts`; these are demo content, not authoritative membership policy.
