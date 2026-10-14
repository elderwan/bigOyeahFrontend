# FitBooking Admin Workspace — Complete CRUD & Button-by-Button API Requirements
> **Target Audience**: Backend Development Team (FastAPI / MySQL)  
> **Date**: October 13, 2026  
> **Scope**: Complete Audit of All 11 Admin Pages, Tables, Modals, Drawers, Context Actions, and Filter Controls  
> **Standard**: RESTful JSON, 10-Minute Grid Temporal Alignment, Status-Based Soft Deletion, Audit Trail Logging

---

## 1. Executive Summary & Contrast with Current Backend

### Current Backend Status (Already Connected & Working)
During the initial integration phase, the following core endpoints were implemented and verified with the frontend:
1. `GET /admin/stats/overview` (or `GET /admin/dashboard?days=30`) — High-level platform statistics.
2. `GET /admin/members` — Member directory listing.
3. `PATCH /admin/members/{user_id}/status` — Account status toggle (`ACTIVE` / `DISABLED`).
4. `GET /admin/coaches` — Coach roster listing.
5. `PATCH /admin/coaches/{coach_id}/status` — Coach status toggle (`ACTIVE` / `ON_LEAVE` / `RESIGNED`).
6. `GET /admin/bookings` — Bookings directory listing.
7. `GET /gyms` (Admin Locations) — Gym facilities directory.
8. `PATCH /admin/locations/{gym_id}/status` — Facility status toggle (`is_active: 1 | 0`).
9. `GET /courses` (Admin Courses) — Course catalogue listing.
10. `PATCH /admin/courses/{course_id}/status` — Course catalogue toggle (`is_active: 1 | 0`).
11. `GET /packages` (Admin Packages) — Package catalogue listing.
12. `PATCH /admin/packages/{package_type}/status` — Package catalogue toggle (`is_active: 1 | 0`).
13. `GET /admin/kpi` — KPI rules and coach monthly performance snapshots.
14. `PUT /admin/kpi/rules/{coach_level}` — Updating monthly KPI thresholds.
15. `GET /admin/audit-log` — Audit events listing.
16. `GET /admin/revenue` — Revenue chart data.

---

### The Critical Gap: Full CRUD & Interactive Controls
While **Read operations (`GET`)** and **Status Toggle switches (`PATCH .../status`)** are operational, **the Admin Workspace currently lacks backend APIs for almost all other interactive controls**:
- ❌ **增 (Create)**: None of the top "+ Add Course", "+ Add Location", "+ Create Booking", "+ Add Trainer", "+ Add Member", "+ Add Package" buttons can persist to the database. They currently only write to temporary React state.
- ❌ **删 (Delete / Archive / Cancellation)**: No API exists to delete, archive, or cancel with refund any booking, course, location, coach, member, or package.
- ❌ **改 (Full Edit / Update / Junction Assignments)**: None of the "Edit" buttons on table rows or detail drawers can persist changes (e.g. changing course duration/equipment, rescheduling bookings, updating coach bios, or assigning coaches to courses via chip selectors).
- ❌ **查 (Search / Filter / Paginate / Detail)**: All search inputs, status dropdowns, and "Filters" drawers operate purely in browser memory. Backend `GET` endpoints do not support query parameters for search terms, dates, districts, or pagination.
- ❌ **算与批处理 (Recalculate & Batch Workflows)**: The KPI "Recalculate" button and "Run workflow" drawers execute client-side dummy math instead of triggering backend analytics jobs.
- ❌ **系统设置 (Settings Persistence)**: The 4 platform switches in the Settings page do not save to a database configuration table.

---

## 2. Universal Architectural Rules & Constraints

### Rule A: Strict 10-Minute Grid Constraint
As established in database triggers and API validation rules:
- **All Durations** (`default_duration`, `duration_minutes`) must be `>= 10` and **strictly multiples of 10** (e.g., 30, 40, 50, 60, 70, 80 minutes).
- **All Break Intervals** (`break_interval`, `break_minutes`) must be `10`, `20`, or `30` minutes.
- **All Start Times** (`start_time`) must align with a **10-minute grid** (`:00`, `:10`, `:20`, `:30`, `:40`, `:50`).
- **All End Times** (`end_time`) are computed as `start_time + duration_minutes`.

### Rule B: Status-Based Soft Deletion (Soft Delete)
In accordance with `schema.sql`:
- **Do not physically execute `DELETE FROM table WHERE id = ...`** on business entities with financial or schedule ties (`booking`, `gym`, `course`, `coach`, `users`).
- Deletions are implemented via status transitions (`CANCELLED`, `is_active = 0`, `DISABLED`, `RESIGNED`), preserving relational history for audit trails and financial reporting.

### Rule C: Relational Junction Synchronization
When assigning coaches to courses, or coaches to locations via UI Chip Selectors:
- Changes must synchronize with junction tables: `coach_course` (with `price_per_session`) and `coach_service` (with `gym_id`, `is_home_service`, and `service_area`).

---

## 3. Detailed Audit by Admin Page & Button Directory

---

### Page 1: Overview (`/admin#adminOverview`)

```
[Overview Screen Structure]
├── Stats Row: Active members | Verified trainers | Total bookings | Package plans
├── Needs Attention Panel:
│   ├── Coach verification -> [Review] button
│   ├── Booking request   -> [Confirm] button
│   └── Member profile    -> [Open] button
├── Recent Activity Feed  -> Real-time event stream
└── Workflow Shortcuts    -> [+ Add trainer] button + 6 Nav buttons
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add trainer"** | Top header & Workflow panel | **增** | Opens Add Trainer drawer | **`POST /admin/coaches`** (See Page 4) |
| **"Review"** | Needs attention (Coach verification) | **查/改** | Opens Coach Detail drawer for `coach-ploy` | **`GET /admin/coaches/{id}/verification-documents`** & **`POST /admin/coaches/{id}/verify`** |
| **"Confirm"** | Needs attention (Booking request) | **改** | Navigates to Bookings tab | **`PATCH /admin/bookings/{id}/status`** with `{"status": "CONFIRMED"}` |
| **"Open"** | Needs attention (Member profile) | **查** | Opens Member Detail drawer | **`GET /admin/members/{id}`** (Returns full fitness profile) |
| **"Recent Activity"** | Activity panel | **查** | Static list | **`GET /admin/activity?limit=10`** (Derived from `audit_log` + `booking`) |

---

### Page 2: Bookings Management (`/admin#adminBookings`)

```
[Bookings Management Screen Structure]
├── Header: "Bookings management" + [+ Create booking] button
├── Filter Toolbar:
│   ├── Search Input: "Search member, trainer, or session"
│   ├── Status Dropdown: [All statuses | Active | Pending | Paused | Needs review]
│   └── [Filters] Button -> Opens Multi-criteria Filter Drawer
└── Table:
    ├── Columns: RECORD | DETAILS | STATUS | ACTIONS
    └── Each Row:
        ├── Record Name + [Open details] link
        ├── [Edit] button (Pencil)
        ├── [Update status / Complete] button
        └── [...] (More actions) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Create booking"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/bookings`** (Spec 2.1 below) |
| **Search Input** | Filter Toolbar | **查** | In-memory string matching | **`GET /admin/bookings?search=...`** |
| **Status Dropdown** | Filter Toolbar | **查** | Client filter | **`GET /admin/bookings?status=...`** |
| **"Filters" Button** | Filter Toolbar | **查** | Opens Drawer; local notice on "Apply filters" | **`GET /admin/bookings?status=&coach_id=&member_id=&date_from=&date_to=&page=&page_size=`** |
| **"Open details"** | Table Record Column | **查** | Opens Booking Detail Drawer | **`GET /admin/bookings/{booking_id}`** |
| **"Edit" Button** | Table Row & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/bookings/{booking_id}`** (Spec 2.2 below) |
| **"Update status" / "Complete"** | Table Row | **改** | Toggles `CONFIRMED -> COMPLETED` locally | **`PATCH /admin/bookings/{booking_id}/status`** (Spec 2.3 below) |
| **"..." (More actions)** | Table Row | **查/删** | Opens detail drawer | Context menu: **`POST /admin/bookings/{id}/cancel`** / View member profile |
| **"Confirm booking"** | Detail Drawer Quick Action | **改** | Local toggle to `CONFIRMED` | **`PATCH /admin/bookings/{booking_id}/status`** (`status: "CONFIRMED"`) |
| **"Mark session completed"** | Detail Drawer Quick Action | **改** | Local toggle to `COMPLETED` | **`PATCH /admin/bookings/{booking_id}/status`** (`status: "COMPLETED"`) |
| **"Cancel booking with refund"** | Detail Drawer (Recommended) | **删/改** | Not implemented | **`POST /admin/bookings/{booking_id}/cancel`** (Spec 2.4 below) |

#### API Specification 2.1: `POST /admin/bookings` (Admin Create Booking)
- **Method**: `POST`
- **Path**: `/admin/bookings`
- **Request Body**:
  ```json
  {
    "member_id": 1,
    "coach_id": 1,
    "course_id": 1,
    "booking_date": "2026-04-22",
    "start_time": "08:00",
    "duration_minutes": 60,
    "break_minutes": 10,
    "service_mode": "GYM",
    "gym_id": 1,
    "service_district": null,
    "service_address": null,
    "price": 800.0,
    "status": "CONFIRMED",
    "package_id": null,
    "payment_method": "PROMPTPAY"
  }
  ```
- **Validation**:
  - `start_time` minute must be `:00`, `:10`, `:20`, `:30`, `:40`, or `:50`.
  - `duration_minutes` must be `>= 10` and `duration_minutes % 10 == 0`.
  - `break_minutes` must be `10`, `20`, or `30`.
  - Validates that the coach has no schedule slot collision during `[start_time, start_time + duration + break]`.
- **Database Action**:
  - Inserts into table `booking`.
  - Creates corresponding `orders` record if paid directly.
  - Decrements `member_package.remaining_sessions` if `package_id` is supplied.
  - Writes event to `audit_log`.

#### API Specification 2.2: `PUT /admin/bookings/{booking_id}` (Admin Reschedule / Edit Booking)
- **Method**: `PUT`
- **Path**: `/admin/bookings/{booking_id}`
- **Request Body**: Same schema as creation; allows rescheduling date, time, coach, gym, or adjusting price.

#### API Specification 2.3: `PATCH /admin/bookings/{booking_id}/status` (Status Transition)
- **Method**: `PATCH`
- **Path**: `/admin/bookings/{booking_id}/status`
- **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "cancel_reason": null,
    "cancelled_by": null
  }
  ```
- **Allowed Transitions**: `PENDING -> CONFIRMED`, `CONFIRMED -> COMPLETED`, `* -> CANCELLED`, `CONFIRMED -> NO_SHOW`.

#### API Specification 2.4: `POST /admin/bookings/{booking_id}/cancel` (Admin Cancellation & Refund)
- **Method**: `POST`
- **Path**: `/admin/bookings/{booking_id}/cancel`
- **Request Body**:
  ```json
  {
    "cancel_reason": "Member injury / Admin override",
    "refund_issued": true
  }
  ```
- **Database Action**:
  - Sets `booking.status = 'CANCELLED'`, `booking.cancelled_by = 'ADMIN'`, `cancelled_at = NOW()`.
  - If `refund_issued == true`, sets `orders.payment_status = 'REFUNDED'` and restores package session balance if applicable.

---

### Page 3: Courses Management (`/admin#adminCourses`)

```
[Courses Management Screen Structure]
├── Header: "Courses management" + [+ Add course] button
├── Filter Toolbar:
│   ├── Search Input: "Search course, difficulty, or equipment"
│   ├── Status Dropdown: [All statuses | Active | Pending | Paused | Needs review]
│   └── [Filters] Button -> Opens Filter Drawer
└── Table:
    ├── Columns: RECORD | DETAILS | STATUS | ACTIONS
    └── Each Row:
        ├── Course Name + [Open details] link
        ├── [Edit] button (Pencil)
        ├── [Toggle] button
        └── [...] (More actions) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add course"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/courses`** (Spec 3.1 below) |
| **Search Input** | Filter Toolbar | **查** | In-memory string matching | **`GET /courses?search=...&difficulty=...`** |
| **Status Dropdown** | Filter Toolbar | **查** | Static select | **`GET /courses?is_active=1\|0`** |
| **"Filters" Button** | Filter Toolbar | **查** | Opens Drawer; local notice on "Apply filters" | **`GET /courses?search=&difficulty=&is_active=&page=&page_size=`** |
| **"Open details"** | Table Record Column | **查** | Opens Course Detail Drawer | **`GET /courses/{course_id}`** |
| **"Edit" Button** | Table Row & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/courses/{course_id}`** (Spec 3.2 below) |
| **"Toggle" Button** | Table Row | **改** | Calls `apiUpdateCourseStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/courses/{id}/status`) |
| **"Deactivate / Publish"**| Detail Drawer Action | **改** | Calls `apiUpdateCourseStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/courses/{id}/status`) |
| **"..." (More actions)** | Table Row | **删/查** | Opens detail drawer | Context menu: **`DELETE /admin/courses/{id}`** / View roster |
| **"Select all" / "Clear"** | Course Drawer Chip Selector | **改** | Toggles coach assignment chips in UI | Synchronized in `POST /admin/courses` and `PUT /admin/courses/{id}` |

#### API Specification 3.1: `POST /admin/courses` (Create Course)
- **Method**: `POST`
- **Path**: `/admin/courses`
- **Request Body**:
  ```json
  {
    "course_name": "Advance Power Training",
    "description": "Barbell power development and athletic conditioning.",
    "difficulty": "ADVANCED",
    "default_duration": 70,
    "equipment": "Power racks, barbells, bumper plates",
    "is_active": 1,
    "assigned_coach_ids": [1, 3]
  }
  ```
- **Validation**:
  - `default_duration` must be `>= 10` and **a multiple of 10** (`default_duration % 10 == 0`).
  - `difficulty` must be `"BEGINNER"`, `"INTERMEDIATE"`, or `"ADVANCED"`.
- **Database Action**:
  - Inserts into table `course`.
  - For each `coach_id` in `assigned_coach_ids`, inserts into junction table `coach_course` (`is_active = 1`).
  - Logs event to `audit_log`.

#### API Specification 3.2: `PUT /admin/courses/{course_id}` (Update Course)
- **Method**: `PUT`
- **Path**: `/admin/courses/{course_id}`
- **Request Body**: Same schema as creation; updates `course` table and updates `coach_course` junction records.

#### API Specification 3.3: `DELETE /admin/courses/{course_id}` (Archive / Soft Delete Course)
- **Method**: `DELETE`
- **Path**: `/admin/courses/{course_id}`
- **Database Action**:
  - Sets `course.is_active = 0`.
  - Sets `coach_course.is_active = 0` for all links.
  - Checks whether active future bookings exist; returns `409 Conflict` if uncompleted bookings rely on this course.

---

### Page 4: Locations Management (`/admin#adminLocations`)

```
[Locations Management Screen Structure]
├── Header: "Locations management" + [+ Add location] button
├── Filter Toolbar:
│   ├── Search Input: "Search location, district, or facility"
│   ├── Status Dropdown: [All statuses | Active | Pending | Paused | Needs review]
│   └── [Filters] Button -> Opens Filter Drawer
└── Table:
    ├── Columns: RECORD | DETAILS | STATUS | ACTIONS
    └── Each Row:
        ├── Gym Name + [Open details] link
        ├── [Edit] button (Pencil)
        ├── [Toggle] button
        └── [...] (More actions) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add location"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/locations`** (Spec 4.1 below) |
| **Search Input** | Filter Toolbar | **查** | In-memory string matching | **`GET /gyms?search=...&district=...`** |
| **Status Dropdown** | Filter Toolbar | **查** | Static select | **`GET /gyms?is_active=1\|0`** |
| **"Filters" Button** | Filter Toolbar | **查** | Opens Drawer; local notice on "Apply filters" | **`GET /gyms?search=&district=&is_active=&page=&page_size=`** |
| **"Open details"** | Table Record Column | **查** | Opens Location Detail Drawer | **`GET /gyms/{gym_id}`** |
| **"Edit" Button** | Table Row & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/locations/{gym_id}`** (Spec 4.2 below) |
| **"Toggle" Button** | Table Row | **改** | Calls `apiUpdateLocationStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/locations/{id}/status`) |
| **"Pause / Activate"** | Detail Drawer Action | **改** | Calls `apiUpdateLocationStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/locations/{id}/status`) |
| **"..." (More actions)** | Table Row | **删/查** | Opens detail drawer | Context menu: **`DELETE /admin/locations/{id}`** / View assigned coaches |

#### API Specification 4.1: `POST /admin/locations` (Create Location)
- **Method**: `POST`
- **Path**: `/admin/locations`
- **Request Body**:
  ```json
  {
    "gym_name": "Nimman Elite Fitness",
    "address": "Nimman Soi 11, Suthep, Chiang Mai",
    "district": "NIMMAN",
    "phone": "+6653001005",
    "facilities": "Power racks, Saunas, Ice bath, Lockers",
    "opening_time": "06:00:00",
    "closing_time": "22:00:00",
    "latitude": 18.7965,
    "longitude": 98.9680,
    "is_active": 1
  }
  ```
- **Validation**:
  - `district` must be `"NIMMAN"`, `"OLD_CITY"`, `"CENTRAL"`, `"MAE_RIM"`, or `"HANG_DONG"`.
  - `opening_time` and `closing_time` align with 10-minute grid (`:00`, `:10`, etc.).
- **Database Action**: Inserts into table `gym`; logs to `audit_log`.

#### API Specification 4.2: `PUT /admin/locations/{gym_id}` (Update Location)
- **Method**: `PUT`
- **Path**: `/admin/locations/{gym_id}`
- **Request Body**: Same schema as creation; updates table `gym`.

#### API Specification 4.3: `DELETE /admin/locations/{gym_id}` (Archive / Soft Delete Location)
- **Method**: `DELETE`
- **Path**: `/admin/locations/{gym_id}`
- **Database Action**: Sets `gym.is_active = 0`. Checks for active bookings at this facility.

---

### Page 5: Trainers Management (`/admin#adminTrainers`)

```
[Trainers Management Screen Structure]
├── Header: "Trainers management" + [+ Add trainer] button
├── Filter Toolbar:
│   ├── Search Input: "Search trainer, coach number, or specialty"
│   ├── Status Dropdown: [All statuses | Active | Pending | Paused | Needs review]
│   └── [Filters] Button -> Opens Filter Drawer
└── Table:
    ├── Columns: RECORD | DETAILS | STATUS | ACTIONS
    └── Each Row:
        ├── Coach Name + [Open details] link
        ├── [Edit] button (Pencil)
        ├── [Change status] button
        └── [...] (More actions) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add trainer"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/coaches`** (Spec 5.1 below) |
| **Search Input** | Filter Toolbar | **查** | In-memory string matching | **`GET /admin/coaches?search=...&coach_level=...`** |
| **Status Dropdown** | Filter Toolbar | **查** | Static select | **`GET /admin/coaches?status=ACTIVE\|ON_LEAVE\|RESIGNED`** |
| **"Filters" Button** | Filter Toolbar | **查** | Opens Drawer; local notice on "Apply filters" | **`GET /admin/coaches?search=&status=&coach_level=&page=&page_size=`** |
| **"Open details"** | Table Record Column | **查** | Opens Coach Detail Drawer | **`GET /admin/coaches/{coach_id}`** |
| **"Edit" Button** | Table Row & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/coaches/{coach_id}`** (Spec 5.2 below) |
| **"Change status" Button**| Table Row | **改** | Calls `apiUpdateCoachStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/coaches/{id}/status`) |
| **"Set On leave / Active"**| Detail Drawer Action | **改** | Calls `apiUpdateCoachStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/coaches/{id}/status`) |
| **"..." (More actions)** | Table Row | **删/查** | Opens detail drawer | Context menu: **`DELETE /admin/coaches/{id}`** / View schedule / View reviews |
| **"Select all" / "Clear"** | Locations Chip Selector | **改** | Toggles location assignment chips in UI | Synchronized in `POST /admin/coaches` and `PUT /admin/coaches/{id}` |
| **"Select all" / "Clear"** | Courses Chip Selector | **改** | Toggles course assignment chips in UI | Synchronized in `POST /admin/coaches` and `PUT /admin/coaches/{id}` |

#### API Specification 5.1: `POST /admin/coaches` (Onboard New Coach)
- **Method**: `POST`
- **Path**: `/admin/coaches`
- **Request Body**:
  ```json
  {
    "username": "coach.somchai",
    "password": "InitialTempPass123!",
    "display_name": "Somchai Jaidee",
    "email": "somchai@fitbooking.local",
    "phone": "+66891234567",
    "coach_level": "ADVANCED",
    "service_mode": "BOTH",
    "break_interval": 10,
    "years_experience": 5,
    "certifications": "CSCS, ACE-CPT",
    "bio": "Specializes in Olympic weightlifting.",
    "status": "ACTIVE",
    "assigned_location_ids": [1, 2],
    "assigned_course_ids": [1, 2]
  }
  ```
- **Validation**:
  - `break_interval` must be `10`, `20`, or `30`.
- **Database Action**:
  - Inserts into `users` (`role = 'COACH'`).
  - Inserts into `coach` (foreign key `user_id`).
  - Inserts records into junction tables `coach_service` (for locations) and `coach_course` (for courses).
  - Creates default weekly schedule templates in `coach_weekly_template`.
  - Logs to `audit_log`.

#### API Specification 5.2: `PUT /admin/coaches/{coach_id}` (Update Coach)
- **Method**: `PUT`
- **Path**: `/admin/coaches/{coach_id}`
- **Request Body**: Updates profile, certifications, level, bio, break_interval, and updates relational junction tables `coach_service` and `coach_course`.

#### API Specification 5.3: `DELETE /admin/coaches/{coach_id}` (Archive / Resign Coach)
- **Method**: `DELETE`
- **Path**: `/admin/coaches/{coach_id}`
- **Database Action**: Sets `coach.status = 'RESIGNED'`, `users.status = 'DISABLED'`, prevents future schedule generation.

---

### Page 6: Members Management (`/admin#adminMembers`)

```
[Members Management Screen Structure]
├── Header: "Members management" + [+ Add member] button
├── Filter Toolbar:
│   ├── Search Input: "Search name, email, or membership"
│   ├── Status Dropdown: [All statuses | Active | Pending | Paused | Needs review]
│   └── [Filters] Button -> Opens Filter Drawer
└── Table:
    ├── Columns: RECORD | DETAILS | STATUS | ACTIONS
    └── Each Row:
        ├── Member Name + [Open details] link
        ├── [Edit] button (Pencil)
        ├── [Toggle status] button
        └── [...] (More actions) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add member"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/members`** (Spec 6.1 below) |
| **Search Input** | Filter Toolbar | **查** | In-memory string matching | **`GET /admin/members?search=...&level_code=...`** |
| **Status Dropdown** | Filter Toolbar | **查** | Static select | **`GET /admin/members?status=ACTIVE\|DISABLED`** |
| **"Filters" Button** | Filter Toolbar | **查** | Opens Drawer; local notice on "Apply filters" | **`GET /admin/members?search=&status=&level_code=&page=&page_size=`** |
| **"Open details"** | Table Record Column | **查** | Opens Member Detail Drawer | **`GET /admin/members/{user_id}`** |
| **"Edit" Button** | Table Row & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/members/{user_id}`** (Spec 6.2 below) |
| **"Toggle status" Button**| Table Row | **改** | Calls `apiUpdateMemberStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/members/{id}/status`) |
| **"Disable / Activate"** | Detail Drawer Action | **改** | Calls `apiUpdateMemberStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/members/{id}/status`) |
| **"..." (More actions)** | Table Row | **查/删** | Opens detail drawer | Context menu: **`DELETE /admin/members/{id}`** / View order history |

#### API Specification 6.1: `POST /admin/members` (Admin Create Member Account)
- **Method**: `POST`
- **Path**: `/admin/members`
- **Request Body**:
  ```json
  {
    "username": "nattakarn.demo",
    "password": "DemoPass123!",
    "display_name": "Nattakarn S.",
    "email": "nattakarn@example.com",
    "phone": "+66819876543",
    "level_code": "SILVER",
    "gender": "FEMALE",
    "birth_date": "1997-03-22",
    "height_cm": 165.0,
    "weight_kg": 56.0,
    "fitness_goal": "Improve core strength and mobility"
  }
  ```
- **Database Action**: Inserts into `users` (`role = 'MEMBER'`) and `member`; logs to `audit_log`.

#### API Specification 6.2: `PUT /admin/members/{user_id}` (Admin Update Member Profile)
- **Method**: `PUT`
- **Path**: `/admin/members/{user_id}`
- **Request Body**: Updates contact info, membership level, total spend, body metrics, and fitness goals.

---

### Page 7: Packages Management (`/admin#adminPackages`)

```
[Packages Management Screen Structure]
├── Header: "Member packages" + [+ Add package] button
└── Card List (5+1, 10+3, 20+7):
    ├── Package Card Body: Total sessions | Pricing | Validity
    └── Actions:
        ├── [Details] button
        ├── [Edit] button (Pencil)
        └── [...] (Toggle availability button)
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Add package"** | Page Header | **增** | Opens Drawer; saves to local React state | **`POST /admin/packages`** (Spec 7.1 below) |
| **"Details" Button** | Package Card | **查** | Opens Package Detail Drawer | **`GET /packages/{package_type}`** |
| **"Edit" Button** | Package Card & Detail Drawer | **改** | Opens Edit Drawer; local state update | **`PUT /admin/packages/{package_type}`** (Spec 7.2 below) |
| **"..." Button** | Package Card | **改** | Calls `apiUpdatePackageStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/packages/{type}/status`) |
| **"Pause / Make available"**| Detail Drawer Action | **改** | Calls `apiUpdatePackageStatus` | ✅ **ALREADY CONNECTED** (`PATCH /admin/packages/{type}/status`) |
| **"Delete package"** | Context (Recommended) | **删** | Not implemented | **`DELETE /admin/packages/{package_type}`** (Spec 7.3 below) |

#### API Specification 7.1: `POST /admin/packages` (Create Package Tier)
- **Method**: `POST`
- **Path**: `/admin/packages`
- **Request Body**:
  ```json
  {
    "package_type": "15+5",
    "package_name": "15+5 Summer Special",
    "paid_sessions": 15,
    "bonus_sessions": 5,
    "total_sessions": 20,
    "price": 12500.0,
    "validity_days": 180,
    "description": "20 sessions total package with 180 days validity.",
    "terms": "Valid for all verified coaches. Non-refundable.",
    "is_active": 1
  }
  ```

#### API Specification 7.2: `PUT /admin/packages/{package_type}` (Update Package Plan)
- **Method**: `PUT`
- **Path**: `/admin/packages/{package_type}`
- **Request Body**: Updates price, validity days, description, terms, and session allocations.

---

### Page 8: KPI Management (`/admin#adminKpi`)

```
[KPI Management Screen Structure]
├── Toolbar:
│   ├── Month Dropdown: [April 2026 | March 2026 | February 2026]
│   └── [Recalculate] Button (RefreshCw)
├── Mini Stats: Achieved | Average hours | Average rating | At risk
├── KPI Rules Panel:
│   └── Rows (BEGINNER, INTERMEDIATE, ADVANCED, MASTER):
│       ├── View Mode: Values + [Edit] (Pencil) button
│       └── Edit Mode: Inputs for hours, rating, retention + [Save] text link
└── Coach Snapshot Panel:
    ├── Header: "Coach snapshot" + [View all] link
    └── Coach Cards:
        ├── Coach Details + Status Pill + Arrow button
        └── [Edit] (Pencil) button
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"Recalculate" Button** | KPI Toolbar | **算/增** | Runs local JavaScript loop | **`POST /admin/kpi/recalculate?year=2026&month=4`** (Spec 8.1 below) |
| **Month Dropdown** | KPI Toolbar | **查** | React state only | Triggers **`GET /admin/kpi?year=...&month=...`** |
| **"Edit" (Pencil)** | KPI Rule Row | **改** | Switches to inline input fields | Client UI switch |
| **"Save" Link** | KPI Rule Row | **改** | Calls `apiUpdateKpiRule` | ✅ **ALREADY CONNECTED** (`PUT /admin/kpi/rules/{coach_level}`) |
| **"View all" Link** | Coach Snapshot Header | **查** | Toast notice only | **`GET /admin/kpi/records?year=2026&month=4`** |
| **"Edit" (Pencil)** | Coach Snapshot Row | **改** | Opens KPI Drawer; local state update | **`PUT /admin/kpi/records/{kpi_record_id}`** (Spec 8.2 below) |

#### API Specification 8.1: `POST /admin/kpi/recalculate` (Batch KPI Recalculation Engine)
- **Method**: `POST`
- **Path**: `/admin/kpi/recalculate`
- **Query Parameters**: `year=2026&month=4`
- **Backend Action**:
  1. Queries all completed bookings in the target month grouped by coach to compute `total_hours` and `completed_sessions`.
  2. Queries all reviews in the target month from `review_coach` to calculate `avg_rating`.
  3. Calculates retention rate (% of members rebooking within 30 days).
  4. Compares actuals against thresholds in `kpi_rule`.
  5. Inserts or updates records in `coach_kpi_record` (`is_achieved = 1 | 0`).
  6. Returns summary: `{ "success": true, "recalculated_coaches": 4 }`.

#### API Specification 8.2: `PUT /admin/kpi/records/{record_id}` (Manual KPI Override)
- **Method**: `PUT`
- **Path**: `/admin/kpi/records/{record_id}`
- **Request Body**:
  ```json
  {
    "total_hours": 85.0,
    "avg_rating": 4.9,
    "retention_rate": 65.0,
    "is_achieved": 1
  }
  ```

---

### Page 9: Reports (`/admin#adminReports`)

```
[Reports Screen Structure]
├── Header: "Reports" + [+ Build report] button
├── Report Controls:
│   ├── Date Range Select: [Last 7 days | Last 30 days | This quarter]
│   └── [Configure report] button (SlidersHorizontal)
└── Charts & Platform Health Metrics
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"+ Build report"** | Page Header | **增/查** | Opens Report Builder Drawer | **`POST /admin/reports/generate`** (Spec 9.1 below) |
| **"Configure report"** | Report Toolbar | **查** | Opens Report Builder Drawer | **`POST /admin/reports/generate`** |
| **Date Range Selector** | Report Toolbar | **查** | Client state only | Connects to **`GET /admin/revenue?days=...`** |
| **"Generate preview"** | Report Drawer Footer | **查** | Local toast notice | Returns dynamic aggregations |
| **"Export CSV"** | Report Drawer (Recommended)| **查** | Not implemented | **`GET /admin/reports/export?format=csv`** |

#### API Specification 9.1: `POST /admin/reports/generate` (Report Aggregation Engine)
- **Method**: `POST`
- **Path**: `/admin/reports/generate`
- **Request Body**:
  ```json
  {
    "report_name": "Trainer Performance & Utilization",
    "date_from": "2026-04-01",
    "date_to": "2026-04-30",
    "group_by": "coach",
    "measures": ["bookings", "revenue", "retention", "rating"]
  }
  ```

---

### Page 10: Audit Log (`/admin#adminAudit`)

```
[Audit Log Screen Structure]
├── Header: "Audit log" + [+ Add audit filter] button
├── Toolbar: [Filter events] button (Filter icon)
└── Audit Log Event Rows:
    ├── Event Icon + Action + Entity + Actor + Time
    └── [...] (MoreHorizontal button on demo rows)
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **"Filter events"** | Toolbar | **查** | Opens Audit Filter Drawer | **`GET /admin/audit-log?...`** (Spec 10.1 below) |
| **"+ Add audit filter"**| Header | **查** | Opens Audit Filter Drawer | **`GET /admin/audit-log?...`** |
| **"Apply filters"** | Drawer Footer | **查** | Local toast notice | Triggers filtered query |
| **"..." (Event details)**| Row | **查** | Opens event detail | **`GET /admin/audit-log/{log_id}`** |

#### API Specification 10.1: Enhanced `GET /admin/audit-log` (Multi-Criteria Query)
- **Method**: `GET`
- **Path**: `/admin/audit-log`
- **Query Parameters**:
  - `entity_type`: Filter by table (`booking`, `gym`, `course`, `coach`, `users`, `kpi_rule`)
  - `entity_id`: Specific record ID
  - `action`: Filter by action (`CREATE`, `UPDATE`, `STATUS_CHANGE`, `CANCEL`)
  - `user_id`: Filter by actor
  - `date_from` & `date_to`: ISO date strings
  - `page`: Page index (default: `1`)
  - `page_size`: Page limit (default: `50`)

---

### Page 11: Settings (`/admin#adminSettings`)

```
[Settings Screen Structure]
├── Platform Settings Panel:
│   ├── Trainer verification review -> [Toggle Switch]
│   ├── Member booking reminders    -> [Toggle Switch]
│   ├── Package catalogue           -> [Toggle Switch]
│   └── Audit logging               -> [Toggle Switch]
└── Data Handling Notes
```

| UI Element / Button | Location | CRUD Type | Current Frontend Behavior | Required Backend API Endpoint & Spec |
| :--- | :--- | :---: | :--- | :--- |
| **Toggle Switches (4x)**| Platform Settings Panel | **改** | Toggles local state with toast | **`PATCH /admin/settings`** (Spec 11.1 below) |
| **Initial Load** | Platform Settings Panel | **查** | Hardcoded initial values | **`GET /admin/settings`** |

#### API Specification 11.1: `GET /admin/settings` & `PATCH /admin/settings`
- **Method**: `GET` / `PATCH`
- **Path**: `/admin/settings`
- **Request Body (for PATCH)**:
  ```json
  {
    "require_coach_verification": true,
    "booking_reminder_hours": 24,
    "package_catalogue_enabled": true,
    "audit_logging_enabled": true
  }
  ```

---

## 4. Comprehensive CRUD Matrix by Entity

| Entity | 增 (Create) | 删 (Delete / Archive) | 改 (Full Update) | 改 (Status Toggle) | 查 (List / Search / Filter) | 查 (Detail) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bookings** | `POST /admin/bookings` | `POST /admin/bookings/{id}/cancel` | `PUT /admin/bookings/{id}` | `PATCH /admin/bookings/{id}/status` | `GET /admin/bookings?search=&status=&coach_id=&date_from=&date_to=` | `GET /admin/bookings/{id}` |
| **Courses** | `POST /admin/courses` | `DELETE /admin/courses/{id}` | `PUT /admin/courses/{id}` | `PATCH /admin/courses/{id}/status` *(Done)* | `GET /courses?search=&difficulty=&is_active=` | `GET /courses/{id}` |
| **Locations**| `POST /admin/locations` | `DELETE /admin/locations/{id}` | `PUT /admin/locations/{id}` | `PATCH /admin/locations/{id}/status` *(Done)* | `GET /gyms?search=&district=&is_active=` | `GET /gyms/{id}` |
| **Coaches** | `POST /admin/coaches` | `DELETE /admin/coaches/{id}` | `PUT /admin/coaches/{id}` | `PATCH /admin/coaches/{id}/status` *(Done)* | `GET /admin/coaches?search=&coach_level=&status=` | `GET /admin/coaches/{id}` |
| **Members** | `POST /admin/members` | `DELETE /admin/members/{id}` | `PUT /admin/members/{id}` | `PATCH /admin/members/{id}/status` *(Done)* | `GET /admin/members?search=&level_code=&status=` | `GET /admin/members/{id}` |
| **Packages**| `POST /admin/packages` | `DELETE /admin/packages/{type}` | `PUT /admin/packages/{type}` | `PATCH /admin/packages/{type}/status` *(Done)*| `GET /packages?is_active=` | `GET /packages/{type}` |
| **KPI** | `POST /admin/kpi/recalculate` | N/A | `PUT /admin/kpi/records/{id}` | `PUT /admin/kpi/rules/{level}` *(Done)* | `GET /admin/kpi?year=&month=` | `GET /admin/kpi/records` |
| **Audit** | N/A (Auto-generated) | N/A (Immutable) | N/A (Immutable) | N/A | `GET /admin/audit-log?entity=&action=&from=&to=` | `GET /admin/audit-log/{id}` |
| **Settings**| N/A | N/A | `PATCH /admin/settings` | `PATCH /admin/settings` | `GET /admin/settings` | N/A |

---

## 5. Backend Implementation Roadmap

### Phase 1: High Priority (P0 — Core CRUD Operations)
1. **`POST /admin/bookings`** & **`PUT /admin/bookings/{id}`** (Creation & Rescheduling with 10-minute grid).
2. **`PATCH /admin/bookings/{id}/status`** & **`POST /admin/bookings/{id}/cancel`** (Status updates & cancellation).
3. **`POST /admin/courses`** & **`PUT /admin/courses/{id}`** (Course creation & edit with 10-minute duration rule and `coach_course` junction table sync).
4. **`GET /admin/*` Query Parameter Support** (`?search=`, `?status=`, `?page=`, `?page_size=`).

### Phase 2: Medium Priority (P1 — Entity Management & Operations)
1. **`POST /admin/locations`** & **`PUT /admin/locations/{id}`** (Gym facility creation & edit).
2. **`POST /admin/coaches`** & **`PUT /admin/coaches/{id}`** (Coach onboarding & profile edit with `coach_service` sync).
3. **`POST /admin/kpi/recalculate`** (Batch KPI engine recalculating monthly snapshots).
4. **`POST /admin/members`** & **`PUT /admin/members/{id}`** (Admin member management).

### Phase 3: Lower Priority (P2 — Supplementary Tools)
1. **`POST /admin/packages`** & **`PUT /admin/packages/{type}`** (Package plan creation & edit).
2. **`GET /admin/settings`** & **`PATCH /admin/settings`** (System preferences persistence).
3. **`POST /admin/reports/generate`** & CSV export.
4. Enhanced multi-criteria query parameters on `GET /admin/audit-log`.
