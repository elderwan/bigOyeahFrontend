# FitBooking — Master Prompt for Copilot (Member Frontend)

> Paste this whole file as your first message, or save it as `.github/copilot-instructions.md` / `docs/MASTER_PROMPT.md` and tell Copilot: "Read docs/MASTER_PROMPT.md fully before doing anything."

---

## 0. Role

You are a senior frontend engineer working on **FitBooking**, a personal-trainer booking platform in Chiang Mai. The design already exists in this project and is the **fixed version**. Your job is to finish and refine the **member-side frontend** only, using the database document as the source of truth for structure and naming.

## 1. HARD CONSTRAINTS (never break these)

1. **Frontend only.** Do NOT create, edit or "improve" any API, backend, FastAPI route, SQL, migration or schema. If a needed endpoint does not exist, use the project's existing API client if there is one. Otherwise, create a clearly marked frontend mock adapter (`// MOCK: replace with real endpoint`) that returns data shaped exactly like the SQL columns below. Never invent new backend behavior.
2. **Member pages only.** Do NOT touch trainer pages, admin pages, or their shared logic. If a shared component must change, add an optional prop with a backward-compatible default instead of changing existing behavior, and list it in your summary.
3. **Exact SQL column names.** All field names in types, props, state, form fields and mock data must be the exact column names from the database document (snake_case, e.g. `booking_date`, `start_time`, `duration_minutes`, `final_amount`). Do not rename to camelCase, do not invent synonyms. Only UI-only helper values (loading flags, selected tab) may use other names, and they must be clearly separate from data fields.
4. **Keep the existing design language.** The current VS Code project's look (colors, spacing, typography, component patterns) is the baseline. You may restyle or introduce small new styles only where it clearly improves comfort or usability, and only if it stays consistent with the existing look. Reuse existing components before creating new ones.
5. **Do not touch the trainer place/gym selection logic in booking yet.** Leave it as is with a `// TODO(after trainer page done): redesign place selection` comment.
6. **Work in small steps.** Explore the repo first, show a short plan, then implement one page at a time. Do not refactor unrelated files. Do not add new dependencies without asking.

## 2. Inputs you must use

- **Database doc:** `FitBooking_MySQL_Database_Doc_TH.docx` (summarized in section 4).
- **Mockup / design reference:** `{{MOCKUP_URL}}` — if this is a Figma link, read it with the Figma MCP server and follow its layout for the date/time picker.
- **Picker style example:** `{{PICKER_EXAMPLE}}` — follow this interaction style.
- If either placeholder above is still `{{...}}`, STOP and ask me for it before building the booking picker.

## 3. Scope: member pages

| Page | What to do |
|---|---|
| Explore | Replace the row of buttons under the search bar with one **Filters** button (section 5.1) |
| Booking | New month → day → time picker based on trainer schedule (section 5.2) |
| Progress | Weekly timetable grid + 1-month schedule, remove "Log a workout" (section 5.3) |
| My Bookings | Upcoming / Past tabs, review section at the bottom, new booking detail view (section 5.4 and 5.5) |

Everything else: do not touch.

## 4. Data reference (exact names)

DB: MySQL, money is `DECIMAL(10,2)` in THB, times are local (+07:00), no timezone conversion. DB stores English enum values; the UI maps them to Thai/English labels (section 6). Soft delete only; never show a delete action for bookings/orders/reviews.

**users** `user_id, username, display_name, email, phone, role, status`
**member** `member_id, user_id, level_id, total_spend, gender, birth_date, height_cm, weight_kg, fitness_goal, registered_at`
**membership_level** `level_id, level_code, level_name, min_total_spend, discount_rate, sort_order`
**coach** `coach_id, coach_no, user_id, coach_level, bio, service_mode, break_interval, years_experience, certifications, avatar_url, status` (coach name = `users.display_name` via `coach.user_id`)
**gym** `gym_id, gym_name, address, district, phone, facilities, opening_time, closing_time, latitude, longitude, is_active`
**course** `course_id, course_name, description, equipment, difficulty, default_duration, is_active`
**coach_service** `coach_service_id, coach_id, gym_id, is_home_service, service_area, is_active`
**coach_course** `coach_id, course_id, price_per_session, is_active`
**coach_weekly_template** `template_id, coach_id, weekday (1=Mon..7=Sun), start_time, end_time`
**coach_schedule_<coach_no>** (one table per coach, 1 row = 10 minutes) `slot_start, slot_year, slot_month, slot_day, slot_hour, slot_minute, status (AVAILABLE|BOOKED|BREAK|BLOCKED), booking_id, remark`
**member_package** `package_id, member_id, package_type ('5+1'|'10+3'|'20+7'), total_sessions, remaining_sessions, price, purchase_date, expire_date, status`
**booking** `booking_id, member_id, coach_id, course_id, gym_id, package_id, booking_date, start_time, end_time, duration_minutes, break_minutes, service_mode, service_district, service_address, price, status, expires_at, cancelled_by, cancel_reason, cancelled_at, completed_at, created_at`
**orders** `order_id, order_type, booking_id, package_id, total_amount, discount, final_amount, payment_method, payment_status, payment_time, refunded_at`
**review_coach** `review_coach_id, booking_id, reviewer_id, rating_professional, rating_communication, rating_punctuality, rating_effectiveness, avg_rating (generated, read-only), comment, created_at`
**review_member** (written by trainer, member read-only) `completion_score, proficiency_score, training_area, training_type, coach_note`
**fitness_profile** `member_id, strongest_area, weakest_area, strongest_score, weakest_score, review_count, updated_at`

Create one TypeScript (or the project's language) types file, e.g. `src/types/db.ts`, with these exact names, and import it everywhere.

## 5. Page requirements

### 5.1 Explore — filters

- Keep the search bar. **Remove the row of category buttons under it** and replace it with one **Filters** button next to/under the search bar (show a count badge when filters are active).
- Clicking **Filters** opens a panel (popover on desktop, bottom sheet on mobile). Inside, **each category is its own dropdown select** listing only that category's own values, never mixed together:
  - `district` — NIMMAN, OLD_CITY, CENTRAL, MAE_RIM, HANG_DONG (matches `gym.district` / `coach_service.service_area`)
  - `course_id` — active courses (`course_name`)
  - `difficulty` — BEGINNER, INTERMEDIATE, ADVANCED
  - `service_mode` — GYM, HOME, BOTH
  - `coach_level` — BEGINNER, INTERMEDIATE, ADVANCED, MASTER
  - `gym_id` — active gyms (`gym_name`)
  - optional if the existing design has it: available this week
- Each dropdown has an "All" option. Buttons: **Apply** and **Clear all**. Active filters show as removable chips under the search bar.
- Filtering logic must treat each category independently (AND between categories, exact match inside a category). Do not match a value from one category against another category's field.
- Hide coaches with `coach.status <> 'ACTIVE'` and inactive gyms/courses.

### 5.2 Booking — date and time picker

Build a comfortable picker following `{{PICKER_EXAMPLE}}` and `{{MOCKUP_URL}}`:

1. **Month** selector (only months that contain bookable days; max 60 days ahead).
2. **Day** selector/calendar: enabled only if that day has at least one valid start time. Disabled days are greyed out.
3. **Time** chips grouped by morning / afternoon / evening. Show `start_time – end_time` of the chosen course.

All availability comes **only from the trainer's schedule** (the trainer's published weekly template and generated slots), never hard-coded:

- A start time is valid only if all `need = (duration_minutes + break_minutes) / 10` consecutive 10-minute slots from `slot_start` have `status = 'AVAILABLE'`. `duration_minutes` = `course.default_duration`, `break_minutes` = `coach.break_interval`.
- Start minutes are on the 10-minute grid (0/10/20/30/40/50).
- Start time must be more than 2 hours from now, within 60 days, no cross-midnight.
- Member cannot choose a time overlapping their own PENDING/CONFIRMED booking that day (show an inline error).
- If a race happens and the backend answers `SLOT_UNAVAILABLE`, show a toast and refresh the picker.
- Selected summary shows: course, coach `display_name`, `booking_date`, `start_time`, `end_time`, `duration_minutes`, `price` (`coach_course.price_per_session`), `discount` (`price × membership_level.discount_rate`), `final_amount`.
- **Place (gym / home) selection: leave exactly as is** (see hard constraint 5).
- The picker state must output exactly the fields the booking needs: `coach_id, course_id, booking_date, start_time` (plus existing place fields and optional `package_id`).

### 5.3 Progress page

- **Overview → "Weekly activity":** replace the current chart with a **timetable grid**: columns = weekdays (Mon–Sun), rows = time of day (hourly rows). Each cell shows the member's past sessions (`status = 'COMPLETED'`) in that week: time (`start_time`–`end_time`), `course_name`, coach `display_name`. Include a week switcher (previous / next week).
- **Remove the "Log a workout" button.** In its place show **"My plan" schedule**: all upcoming bookings (`status` PENDING or CONFIRMED) in a **1-month window** (today → +30 days), as a month calendar with a list/agenda below. Each item contains all class info: `course_name`, `booking_date`, `start_time`–`end_time`, `duration_minutes`, coach `display_name`, place (`gym_name` + `district`, or `service_address` for HOME), `service_mode`, `status`, `price`/`final_amount`, `package_id` if used.
- Clicking an item in the plan opens the **booking detail view** (5.5), never the booking/checkout flow.
- Keep the other existing Progress content (membership level progress, fitness profile) unchanged unless it conflicts.

### 5.4 My Bookings — tabs and reviews

- Tabs stay: **Upcoming** and **Past** (plus the existing others, if any).
- **Upcoming:** clicking a booking card opens the **booking detail view** (5.5). It must NOT jump to the finish-booking / payment page. Only a clearly labeled "Pay now" button on a `PENDING` booking may go to payment.
- **Past:** shows COMPLETED, CANCELLED, NO_SHOW bookings. For each `COMPLETED` booking without a review, show a **Leave review** button that opens the review form in place (modal or inline).
- **Reviews section at the bottom of the My Bookings page** (smaller, below the main list): shows COMPLETED bookings from each trainer session that are waiting for a review, plus reviews already written (read-only, with `avg_rating` and `comment`). A member can review in either place (Past tab or this section); both write the same `review_coach` record.
- Review form fields (exact names): `rating_professional`, `rating_communication`, `rating_punctuality`, `rating_effectiveness` (each 1–5 star input, required), `comment` (optional, max 1000). Show the computed average (`avg_rating` = mean of the four) as read-only preview. One review per booking; after submit, disable editing. `reviewer_id` = the member's `member_id`.

### 5.5 Booking detail view (new)

- Layout should look like the **Explore trainer information page** (same header style, avatar, cards) but with a **lighter structure containing only member-and-booking-related data** that the member chose and confirmed. No trainer marketing content (full bio, other courses, other reviews).
- Sections:
  1. **Header:** coach avatar (`avatar_url`), `display_name`, `coach_level` badge, booking `status` badge.
  2. **Session:** `course_name`, `booking_date`, `start_time`–`end_time`, `duration_minutes`, `break_minutes`, `service_mode`.
  3. **Place:** GYM → `gym_name`, `address`, `district`; HOME → `service_district`, `service_address`.
  4. **Payment:** `price`, `discount`, `final_amount`, `payment_method`, `payment_status`, `payment_time`, and the package used (`package_type`, `remaining_sessions`) if `package_id` is set.
  5. **Status info:** `expires_at` countdown while PENDING; `cancelled_by`, `cancel_reason`, `cancelled_at` if CANCELLED; `completed_at` if COMPLETED.
  6. **Review:** if COMPLETED, the review form or the written review.
  7. **Actions by status:** PENDING → Pay now, Cancel · CONFIRMED → Cancel · COMPLETED → Leave review · CANCELLED/NO_SHOW → none.
- **Cancel dialog** must show the outcome first: member cancels ≥ 24 h before start → free cancel with refund (package session returned); < 24 h → cancel allowed but no refund.

## 6. Enum labels (UI only; DB values stay English)

Create one shared `labels` map and use it everywhere. Use clear English labels throughout the UI; database enum values must remain unchanged.

| Enum | Values |
|---|---|
| `booking.status` | PENDING · CONFIRMED · CANCELLED · COMPLETED · NO_SHOW |
| `orders.payment_status` | UNPAID · PAID · CANCELLED · REFUNDED |
| `orders.payment_method` | PROMPTPAY · CARD · CASH · PACKAGE_CREDIT |
| `service_mode` | GYM · HOME · BOTH |
| `district` | NIMMAN · OLD_CITY · CENTRAL · MAE_RIM · HANG_DONG |
| `coach_level` | BEGINNER · INTERMEDIATE · ADVANCED · MASTER |
| `course.difficulty` | BEGINNER · INTERMEDIATE · ADVANCED |
| `package_type` | 5+1 · 10+3 · 20+7 |
| `training_area` | UPPER_BODY · CORE · LOWER_BODY · BACK · SHOULDER · FULL_BODY |

Status badge colors: PENDING = warning, CONFIRMED = success, COMPLETED = info, CANCELLED = danger, NO_SHOW = neutral. Use the project's existing color tokens.

## 7. Business rules to reflect in the UI (do not implement in backend)

- Booking status transitions: PENDING → CONFIRMED / CANCELLED; CONFIRMED → COMPLETED / CANCELLED / NO_SHOW. CANCELLED, COMPLETED, NO_SHOW are final (read-only).
- PENDING cash/online bookings expire in 15 minutes (`expires_at`); package-credit bookings are CONFIRMED immediately.
- Member level only goes up. Packages do not get the level discount.
- Reviews only for COMPLETED bookings, one per booking.
- Disabled coaches/gyms/courses are hidden.

## 8. Working method

1. **Explore first:** list the member routes/pages, existing components, API client, state management, styling approach. Report briefly what you found and which files you plan to touch. Wait for my "go".
2. Implement in this order: types + labels → Explore filters → booking picker → My Bookings (tabs, review, detail) → Progress.
3. After each step: run the project's lint/type-check/build and the existing tests; fix only what you broke.
4. Keep a running list of mock adapters you added and any TODOs.
5. Do not edit files under trainer/admin directories. If you think you must, stop and ask.

## 9. Acceptance checklist

- [ ] No backend/API/SQL files changed; no trainer/admin pages changed
- [ ] Every data field uses the exact SQL column name
- [ ] Explore: single Filters button, one dropdown per category, chips, Apply/Clear, independent filtering
- [ ] Booking: month → day → time picker driven by trainer schedule slots; place selection untouched
- [ ] Progress: weekly timetable grid (time × weekday) of past sessions; "Log a workout" removed; 1-month plan with full class info
- [ ] My Bookings: upcoming click opens detail (not checkout); Past has Leave review; review section at bottom of page
- [ ] Booking detail view: lighter trainer-page style with member/booking data only
- [ ] Mobile layout checked; loading, empty and error states exist for every list
- [ ] Final summary: files changed, mock adapters added, TODOs, anything needing my decision

## 10. Open items for me to provide

- `{{MOCKUP_URL}}` — mockup for the date/time picker
- `{{PICKER_EXAMPLE}}` — the "basic example" for picker style
- Final gym/home place redesign: waiting for trainer page to be finished
