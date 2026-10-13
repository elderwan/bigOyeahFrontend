# FitBooking Backend Development TODO & Gap Analysis

> Generated on: 2026-10-13  
> Environment: Local Python/FastAPI Backend (`http://localhost:8000/api/v1`) & Next.js 14 Frontend (`http://localhost:3000`)

---

## 1. Executive Summary

The frontend integration with the official FitBooking Online API (`API_REFERENCE.md`) is complete and verified end-to-end. Authentication, token handling, navigation redirection, and live data synchronization were tested across all three roles:

- **Admin Account**: `admin.demo` / `DemoPass123!` -> Navigates to `/admin`
- **Member Account**: `alex.demo` / `DemoPass123!` -> Navigates to `/member#profile`
- **Coach Account**: `tan.coach` / `DemoPass123!` -> Navigates to `/trainer`

Live data synchronization from MySQL was verified for members, trainers, bookings, courses, locations, packages, KPI rules, and audit logs.

Below is the detailed list of remaining backend tasks, database migrations, and recommended enhancements needed to reach full production readiness.

---

## 2. Priority 1: Critical Database Migrations & Missing Tables

### 2.1 Execute `migrations/001_member_application.sql`
- **Current Issue**: Calling `GET /members/me/progress` returns `HTTP 500 Internal Server Error`.
  - Backend trace: `Table 'fitbooking.member_body_measurement' doesn't exist`.
- **Root Cause**: The migration file `migrations/001_member_application.sql` has not been executed on the local MySQL database instance.
- **Required Action**: Run `migrations/001_member_application.sql` on the MySQL server. This creates:
  1. `member_body_measurement` (stores historical weights and body fat percentages).
  2. `member_payment_method` (tokenized cards for recurring / stored payments).
  3. `member_coach_message` (persistent member-to-coach direct messaging).
  4. Persistent package catalog table and default seeds.

---

## 3. Priority 2: Core Booking & Schedule Architecture

### 3.1 Automatic Dynamic Schedule Slot Generation
- **Current Issue**: When a member calls `POST /bookings`, the backend returns `HTTP 400: "Requested schedule slots are not generated"`.
- **Root Cause**: In `app/services/booking_service.py`, booking creation requires that the coach's dynamic table (`coach_schedule_<coach_id>`) exists and already contains 10-minute slot records with `status = 'AVAILABLE'` covering the selected time interval + break interval.
- **Required Action**:
  1. **Automated Slot Seeding**: Implement a service/cron task that populates available slots for all active coaches 14 to 30 days in advance based on their working hours or template availability.
  2. **Fallback Logic**: If dynamic slots are not pre-generated, consider allowing `BookingService` to validate against the coach's general availability rather than immediately rejecting with 400.
  3. **Break Interval Validation**: Ensure `start_time` alignment (must be on a 10-minute grid) and `break_minutes` (10, 20, or 30 minutes) are documented clearly in client-facing error responses.

### 3.2 Automated Booking Completion Cron / Worker
- **Current Issue**: Submitting a coach review via `POST /members/me/reviews` requires `booking.status == 'COMPLETED'`. If a past session is still in `CONFIRMED` status, review submission fails with `HTTP 409 Conflict: "The booking is not reviewable or already has a review"`.
- **Required Action**:
  - Implement a background cron job (e.g. running every 15-30 minutes) that queries all bookings where `booking_date` and `end_time` are in the past and status is `CONFIRMED`, automatically updating them to `COMPLETED`.

---

## 4. Priority 3: API Endpoint Enhancements

### 4.1 Add `GET /coaches/me`
- **Current State**: `PATCH /coaches/me` is implemented in `app/api/routes/coaches.py`, but `GET /coaches/me` is missing.
- **Issue**: A logged-in coach (`tan.coach`, `user_id = 3`) cannot easily read their own coach profile without querying `GET /coaches/{coach_id}/profile`, which requires knowing their internal `coach_id` (`1`).
- **Required Action**:
  - Add `GET /coaches/me` endpoint in `app/api/routes/coaches.py` using `Depends(get_current_user)` to look up the coach record by `user_id` and return `CoachProfileResponse`.

### 4.2 Admin Member & Trainer Creation Endpoints
- **Current State**: The frontend Admin workspace includes "Add member" and "Add trainer" modal forms. The backend currently only has self-service `POST /auth/register` (which registers general members).
- **Required Action**:
  - Add `POST /admin/members` (allowing administrators to manually provision member accounts and set initial membership levels).
  - Add `POST /admin/coaches` (allowing administrators to provision trainers with initial levels, hourly rates, bio, and assigned courses).

### 4.3 Coach-Course Assignments for All Coaches
- **Current State**: In the database, Coach 1 (`Tan Chaiyaporn`) is linked to courses (`Functional Fitness`, `HIIT`, `Strength & Conditioning`), but Coach 2 (`May Suthida`) has no assigned courses in `coach_course`.
- **Required Action**:
  - Add seed records in `coach_course` for `coach_id = 2` (e.g. linking to `Mobility & Flexibility` and `HIIT`).
  - Add admin endpoint `POST /admin/coaches/{coach_id}/courses` to assign courses to coaches.

---

## 5. Priority 4: Audit Logging & Security

### 5.1 Audit Log IP Address & Actor Details
- **Current State**: Status updates for members, coaches, locations, courses, and packages are logged to `audit_log`, but `ip_address` is currently `null`.
- **Required Action**:
  - Extract the client IP from `request.client.host` (or `X-Forwarded-For`) and persist it in `audit_log.ip_address`.

---

## 6. Matrix of Implemented vs. Remaining Endpoints

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `/auth/login` | `POST` | Verified | Supports username or email; returns JWT & user info |
| `/auth/register` | `POST` | Verified | Member registration with profile fields |
| `/auth/me` | `GET` | Verified | Authenticated user verification |
| `/members/me` | `GET` | Verified | Member profile & membership tier |
| `/members/me` | `PATCH` | Verified | Update display name, email, phone, metrics |
| `/members/me/dashboard` | `GET` | Verified | Weekly summary, upcoming bookings, packages |
| `/members/me/bookings` | `GET` | Verified | List member reservations |
| `/members/me/bookings/{id}` | `GET` | Verified | Reservation details |
| `/members/me/bookings/{id}/cancel` | `POST` | Verified | Cancel booking with reason |
| `/members/me/packages` | `GET` | Verified | Member active package balances |
| `/members/me/packages/purchase` | `POST` | Verified | Purchase 5+1, 10+3, 20+7 packages |
| `/members/me/progress` | `GET` | **Needs Migration** | Fails with 500 until `001_member_application.sql` is run |
| `/members/me/progress` | `PUT` | **Needs Migration** | Updates weight & body fat history |
| `/members/me/payment-history` | `GET` | Verified | Member order transaction history |
| `/members/me/payment-methods` | `GET` | Verified | Tokenized payment cards |
| `/members/me/messages` | `GET` | Verified | Direct messages between member and coach |
| `/members/me/messages` | `POST` | Verified | Send new message |
| `/members/me/reviews` | `POST` | Verified | Requires booking status `COMPLETED` |
| `/gyms` | `GET` | Verified | Gym locations catalogue |
| `/courses` | `GET` | Verified | Course directory |
| `/packages` | `GET` | Verified | Active package offers |
| `/coaches` | `GET` | Verified | Search coaches with filter params |
| `/coaches/{id}/profile` | `GET` | Verified | Full coach details, courses, and gyms |
| `/coaches/me` | `GET` | **Missing** | Should be added for authenticated coach |
| `/coaches/me` | `PATCH` | Verified | Update coach bio, availability settings |
| `/coaches/{id}/schedule` | `POST` | Verified | Creates dynamic `coach_schedule_<id>` table |
| `/coaches/{id}/schedule/slots` | `GET` | Verified | Returns time slots |
| `/bookings` | `POST` | Verified | Requires pre-generated slots in dynamic table |
| `/admin/dashboard` | `GET` | Verified | Aggregate stats & booking trends |
| `/admin/audit-log` | `GET` | Verified | Audit trails for all mutations |
| `/admin/members` | `GET` | Verified | Paginated member directory |
| `/admin/members/{id}/status` | `PATCH` | Verified | Soft toggle `ACTIVE` / `DISABLED` |
| `/admin/coaches` | `GET` | Verified | Paginated coach directory |
| `/admin/coaches/{id}/status` | `PATCH` | Verified | Toggle `ACTIVE` / `ON_LEAVE` / `RESIGNED` |
| `/admin/bookings` | `GET` | Verified | Cross-platform bookings |
| `/admin/kpi` | `GET` | Verified | KPI rules & monthly snapshots |
| `/admin/kpi/rules/{level}` | `PUT` | Verified | Update hours, rating, retention thresholds |
| `/admin/revenue` | `GET` | Verified | Total revenue & monthly trend |
| `/admin/locations/{id}/status` | `PATCH` | Verified | Toggle gym active status |
| `/admin/courses/{id}/status` | `PATCH` | Verified | Toggle course active status |
| `/admin/packages/{type}/status` | `PATCH` | Verified | Toggle package catalog active status |
