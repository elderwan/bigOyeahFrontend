# MASTER PROMPT — FitBooking Frontend UI/UX Fix & Time Picker Redesign

## 0. PROJECT CONFIGURATION — SET THIS BEFORE RUNNING

**Current UI preview URL:**  
`time picker design.jpg`

**Requirements document:**  
`FitBooking_MySQL_Database_Doc_TH.docx`

**Reference workflow:**  
`{PUT YOUR TIME PICKER REFERENCE URL HERE}`

**Primary instruction: FRONTEND ONLY. DO NOT DEVELOP, MODIFY, REBUILD, OR REFACTOR ANY API OR BACKEND SERVICE.**

You are a senior frontend engineer and UI/UX designer working on my existing FitBooking personal trainer booking application in Chiang Mai, Thailand.

My application already exists and has a UI preview. Your task is to **inspect, fix, and improve the existing frontend**, not build a new application from scratch.

Use the existing codebase as the source of truth for the current implementation. Follow the database document for business rules, entities, relationships, permissions, and booking constraints.

Do not assume that the preview URL gives you access to the source code. Inspect the current repository and existing frontend implementation directly. If the preview is inaccessible, continue using the local codebase and report any limitations.

---

## 1. NON-NEGOTIABLE RULES

1. Frontend only. Do not create, modify, or refactor backend endpoints, API routes, FastAPI services, SQL queries, MySQL schemas, database migrations, triggers, or scheduled backend jobs.
2. Do not change existing API request or response contracts.
3. Do not replace the existing application with a new starter project.
4. Preserve the existing framework, routing, authentication integration, state management, component architecture, design system, and dependencies wherever possible.
5. Do not remove existing working features to make the UI easier to implement.
6. Do not introduce mock data into production screens when real application data is already available.
7. Do not hardcode trainer availability, course duration, booking status, prices, membership discounts, or permissions when these values are available from existing application data.
8. Reuse existing API integrations. If an API does not provide required data, implement a graceful frontend fallback and document the limitation. Do not invent an API.
9. Inspect the entire existing booking flow before changing it. Avoid fixing the time picker in isolation if its parent components, validation, or state management cause the problem.
10. Make the smallest safe changes that fully solve the issue. Preserve unrelated pages and functionality.
11. Do not silently invent business rules when the document does not specify them.
12. Follow the existing FitBooking visual identity: clean, flat, youthful, friendly, accessible, and inspired by Chiang Mai, Thailand.

## 2. REQUIRED FIRST STEPS

Before editing any code:

- Inspect the project structure, package configuration, routing, UI components, styles, and existing frontend data-fetching logic.
- Locate the Choose Session page and its current time-selection implementation.
- Trace how a selected coach, course, location, date, duration, and price flow through the booking process.
- Identify the existing types or interfaces representing coaches, courses, schedules, bookings, packages, orders, and user roles.
- Read the supplied database requirements document. If it is not available in the current workspace, report that fact rather than pretending to have read it.
- Identify the current source of trainer availability and course duration.
- Check whether the existing application uses local time or UTC when displaying and submitting booking times.
- Inspect the current design system before introducing new styles or dependencies.

Create a concise implementation plan, then proceed with the changes. Do not stop after producing a plan unless a genuine blocker prevents implementation.

## 3. MAIN TASK — REDESIGN THE CHOOSE SESSION TIME PICKER

The most important task is fixing the time-selection feature on the Choose Session page.

### 3.1 Desired interaction

Redesign the existing time picker to feel like the native iOS timer wheel: smooth vertical scrolling, clear selected values, subtle faded values above and below the selection, and a highlighted center row.

The design should be adapted to FitBooking rather than copied from iOS exactly.

The time-selection component must have two adjacent wheels:

**Wheel A — Start Time**

- Select the session start time.
- Display valid time options in 12-hour format with AM/PM or an equivalent clear localized format.
- Support 10-minute increments only.
- Only show or enable start times that satisfy the selected trainer's actual availability and all booking constraints.
- Provide clear disabled states for unavailable times.
- Prevent the user from selecting a start time that cannot accommodate the entire session and its required buffer.

**Wheel B — End Time**

- Display the corresponding session end time.
- Preferably derive the end time automatically from the selected start time and course duration.
- Do not let the user select an invalid end time independently.
- If the product design allows manual end-time selection, constrain it to valid choices that produce exactly the required course duration.
- Never allow an end time that crosses midnight or conflicts with trainer availability.

The selected start and end times must always represent a valid session.

### 3.2 Optional time-of-day filter

Above the wheels, add a compact dropdown or segmented control for filtering by time of day:

- All available times
- Morning
- Afternoon
- Evening

These categories are UI filters, not independent sources of availability. They must be derived from the trainer's actual working schedule and available time slots.

Selecting a period must update the available start-time options without changing the course duration or bypassing availability validation.

If a period has no valid slots, display a friendly empty state rather than allowing an invalid selection.

### 3.3 Exact course duration

Read the duration from the selected course's existing data, corresponding to `course.default_duration` in the requirements document.

Do not assume every session lasts one hour.

Examples:

- A 60-minute course must end exactly 60 minutes after its start.
- A 45-minute course must end exactly 45 minutes after its start, provided that the existing scheduling rules and slot configuration support that duration.
- A 90-minute course must end exactly 90 minutes after its start.

The end time is:

`end_time = start_time + course.default_duration`

The course duration is separate from the trainer's required break interval.

Display both values clearly:

- Session duration: actual course duration.
- Trainer buffer: required break interval, when applicable.
- Total reserved time: course duration plus the required break interval.

The displayed session end time must not include the break interval. The buffer is reserved time after the session, not additional training time.

### 3.4 Availability and 10-minute slot rules

Follow the scheduling model in the requirements document:

- Each trainer has an individual schedule table registered through `schedule_registry`.
- Each row represents one 10-minute slot.
- Valid slot statuses are `AVAILABLE`, `BOOKED`, `BREAK`, and `BLOCKED`.
- Only `AVAILABLE` slots may be selected for a new booking.
- `BOOKED`, `BREAK`, and `BLOCKED` slots must not be offered as available start times or session slots.
- A session lasting 60 minutes requires six consecutive 10-minute training slots.
- If the required trainer break is 10 minutes, an additional consecutive slot must also be available.
- Every required training slot and buffer slot must be valid.
- Do not permit a session to overlap another booking or the trainer's required break.
- Do not permit a session to cross into the next day.
- Respect the trainer's actual working hours and weekly schedule template.
- Respect the course's availability at the selected gym or service area.
- Respect whether the trainer supports gym training, home training, or both.

The frontend should use existing availability data or existing availability API integrations. It must not query dynamic database tables directly or create its own availability rules that contradict the backend.

### 3.5 Booking constraints

Apply the existing rules from the requirements document:

- The default booking window is up to 60 days in advance.
- The default minimum advance-booking period is two hours, subject to the existing backend validation.
- Do not offer times in the past.
- Use the selected trainer, course, location, date, and service mode when evaluating available times.
- When a member selects a package, use only their own eligible package and display its available session balance.
- Show the correct course price, membership discount, and applicable package information using existing application data.
- Respect the existing booking status workflow: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, and `NO_SHOW`.
- A booking paid through the existing payment flow or confirmed using eligible package credit must follow the current application's rules.
- An unpaid booking expires after 15 minutes under the documented default behavior. Display the existing expiry information if the application already exposes it.
- Do not treat a pending booking as a confirmed booking.
- Respect the documented cancellation policy and show the appropriate information before the user confirms.

Do not implement payment processing, booking transactions, locking, slot reservation, or server-side validation in the frontend. These remain backend responsibilities.

### 3.6 Race conditions and stale availability

The frontend cannot guarantee that a slot remains available after it has been displayed.

If an existing API reports that a slot is no longer available:

- Show a friendly message.
- Refresh availability using the existing API integration.
- Clear or update the invalid selection.
- Ask the user to select another time.
- Preserve the selected course, trainer, date, and other valid booking information where possible.

Do not fake a successful booking when the backend rejects it.

### 3.7 Confirmation button

The Confirm button must be enabled only when all required frontend conditions are satisfied:

- A valid trainer is selected.
- A valid course is selected.
- A valid date is selected.
- A valid start time is selected.
- The computed end time exactly matches the course duration.
- All required training slots are available according to the latest available data.
- The required buffer can be accommodated.
- The selected location and service mode are valid for that trainer and course.
- All other existing required fields are valid.

If any condition fails, disable the button and show a short, specific explanation.

On confirmation, submit the existing booking payload using the existing integration and preserve the current request contract. Let the backend make the final authoritative booking decision.

### 3.8 Suggested layout

Build the time-selection section in this order:

1. Selected trainer and course summary.
2. Selected date.
3. Time-of-day dropdown or segmented filter.
4. Start Time and End Time wheels displayed side by side.
5. Session duration, trainer break, and total reserved time.
6. Availability status and validation messages.
7. Location and service mode summary, if not already selected.
8. Price, membership discount, or package-credit summary.
9. A prominent Confirm Session button.

On mobile, adapt the two wheels to fit the viewport without horizontal overflow. Keep both wheels visible when possible; use a stacked layout only when necessary for readability.

On desktop, use a balanced two-column layout where appropriate.

---

## 4. DATABASE DOCUMENT — BUSINESS RULES AND RELATIONSHIPS

The database document defines the backend's data model. The frontend must respect these rules without changing the schema or backend.

### 4.1 User roles and permissions

Use the existing authenticated user role:

- `MEMBER`
- `COACH`
- `ADMIN`

Respect the current authentication and authorization integration.

**MEMBER** can browse available trainers, book and pay for sessions, cancel their own bookings, purchase packages, review trainers, and view their own fitness profile and membership progress.

**COACH** can manage their weekly schedule, block unavailable periods, view their own bookings, mark eligible sessions as completed or no-show, review members, and view their own ratings and KPIs.

**ADMIN** can manage users, trainers, gyms, courses, membership rules, KPI rules, bookings, reports, and audit logs. Admins can cancel bookings on behalf of others according to the existing rules.

Do not expose unauthorized actions merely by hiding buttons. Continue relying on existing backend authorization.

### 4.2 Relationships to preserve in the UI

Respect these relationships when rendering forms, selectors, tables, details, and navigation:

- `users` → `member`: one-to-one.
- `users` → `coach`: one-to-one.
- `member` → `membership_level`: many members can share one membership level.
- `member` → `fitness_profile`: one-to-one.
- `member` → `member_package`: one member can own multiple packages.
- `coach` ↔ `gym`: many-to-many through `coach_service`.
- `coach` ↔ `course`: many-to-many through `coach_course`.
- `coach` → `coach_weekly_template`: one trainer can have multiple weekly schedule templates.
- `coach` → `schedule_registry`: one registered schedule per trainer.
- `member` → `booking`: one member can have multiple bookings.
- `booking` must reference a course that the selected coach actually teaches through `coach_course`.
- `booking` must reference a gym that the coach actually serves through `coach_service`, where gym-based service is used.
- `booking` can reference a package owned by the same member.
- `booking` can have a related order.
- Reviews must reference the appropriate booking and the correct member or coach.
- `coach_kpi_record` stores monthly KPI results for a coach.
- `audit_log` records important system actions.

Do not create UI relationships based only on matching display names. Use existing identifiers and application data.

### 4.3 Data integrity

- Do not physically delete business records through new UI behavior.
- Preserve booking, order, payment, and review history.
- Use the existing status fields to represent disabled, cancelled, archived, or completed records.
- Keep UI status labels consistent with backend enum values.
- Avoid allowing invalid combinations of member, coach, course, gym, package, and booking.
- Never expose dynamic schedule table names or SQL controls to the frontend.

---

## 5. OTHER FRONTEND FIXES

While working on the time picker, inspect and fix directly related problems in the existing booking flow.

Check:

- Date selection and navigation.
- Trainer availability loading and empty states.
- Course selection and duration display.
- Location and service-mode selection.
- Package-credit selection and remaining-session display.
- Membership discount and final-price display.
- Booking summary consistency.
- Confirmation, loading, error, and success states.
- Responsive behavior on desktop, tablet, and mobile.
- Keyboard accessibility and screen-reader labels.
- Scroll behavior and focus management.
- Time-zone and date-format consistency for Chiang Mai, Thailand.

Do not expand the task into a full redesign of unrelated pages. Preserve the existing design system and fix only what is necessary for a coherent, reliable booking experience.

## 6. DESIGN DIRECTION

Use the current FitBooking design language:

- Clean, flat, modern, and youthful.
- Warm ivory or white backgrounds.
- Forest green or deep teal as the primary color.
- Soft mint for selected and available states.
- Restrained gold or terracotta accents.
- Rounded cards and subtle borders.
- Clear typography and strong visual hierarchy.
- Simple, consistent icons.
- Generous spacing and readable labels.
- Chiang Mai-inspired details used sparingly.
- Smooth wheel transitions without excessive animations.

For the wheel component:

- Make the selected row visually prominent.
- Fade adjacent options gently.
- Provide clear selected and disabled states.
- Support mouse-wheel scrolling, touch gestures, and keyboard navigation where practical.
- Ensure the wheel does not trap page scrolling unexpectedly.
- Respect reduced-motion preferences.
- Do not rely on color alone to communicate availability.

Avoid unnecessary gradients, excessive shadows, decorative clutter, and oversized elements that make booking slower.

## 7. IMPLEMENTATION REQUIREMENTS

- Reuse existing components where possible.
- Keep time calculations in a dedicated, testable frontend utility or hook if appropriate.
- Avoid duplicating availability and duration logic across components.
- Use the project's existing date/time library if one is already installed.
- Do not add a dependency solely for a cosmetic wheel effect unless the current implementation cannot reasonably support it.
- Keep display formatting separate from the underlying time values.
- Avoid parsing ambiguous date strings.
- Do not convert local booking times to UTC incorrectly or introduce off-by-one-day errors.
- Use the existing application's Chiang Mai time-zone conventions.
- Keep the selected start time and computed end time synchronized.
- Prevent invalid intermediate selections from being submitted.
- Ensure availability changes invalidate dependent selections.
- Preserve existing routes and deep links.

If the current project has tests, add or update relevant tests. Do not remove tests to make the changes pass.

## 8. ACCEPTANCE TESTS

Verify the following scenarios using the existing project and available test tools.

**Test A — Exact duration**

A 60-minute course starting at 09:00 displays an end time of 10:00. If a 10-minute trainer break is required, the reserved interval ends at 10:10.

**Test B — Different course duration**

A 90-minute course starting at 09:00 displays an end time of 10:30, with the required break reserved separately.

**Test C — Unavailable slot**

If any required training slot is `BOOKED`, `BREAK`, or `BLOCKED`, the corresponding start time cannot be confirmed.

**Test D — Insufficient remaining working time**

If the trainer's working period ends at 10:00, a 60-minute course starting at 09:30 must not be offered.

**Test E — Buffer conflict**

If the training interval is available but the required break interval is not, the start time must not be offered.

**Test F — Day boundary**

A session that would cross midnight must not be selectable.

**Test G — Time-of-day filter**

Switching between Morning, Afternoon, Evening, and All Available Times filters the available choices without changing the course duration.

**Test H — Advance-booking rules**

Times that violate the documented two-hour advance-booking rule or 60-day booking window must not be offered as valid choices, subject to the existing backend's authoritative validation.

**Test I — No available slots**

Display a useful empty state and prevent confirmation.

**Test J — Stale availability**

If the backend rejects a previously displayed slot, refresh availability and allow the member to choose another time.

**Test K — Existing integration**

The existing booking request payload, API routes, authentication, and backend integration remain unchanged.

**Test L — Responsive layout**

The time picker works without horizontal overflow on mobile, tablet, and desktop.

**Test M — Booking status**

A pending booking must not be presented as confirmed. Confirmation and payment states must match the existing application data.

**Test N — Package ownership**

The UI must not allow a member to select another member's package.

**Test O — Regression**

Existing unrelated pages, routes, and functionality continue to work.

## 9. FINAL EXECUTION INSTRUCTIONS

Proceed in this order:

1. Inspect the existing frontend and requirements document.
2. Identify the actual root cause of the time-selection problem.
3. Summarize the files that need to change and why.
4. Implement the fixes in the existing codebase.
5. Run the relevant lint, type-check, build, and test commands supported by the project.
6. Fix regressions caused by your changes.
7. Review the final diff to ensure no backend, API contract, database, or unrelated application changes were introduced.
8. Report any acceptance tests that could not be verified.

At the end, provide:

- A concise summary of the UI fixes.
- The list of modified files.
- A description of the final time-picker behavior.
- Test commands executed and their results.
- Any remaining limitations or missing API data.
- Explicit confirmation that no API or backend code was modified.

**Success means the existing FitBooking frontend works more reliably, the time picker behaves like a polished iOS-style wheel, and every selectable time respects the documented scheduling and booking rules without changing the backend.**