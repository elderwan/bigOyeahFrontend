# FitBooking Admin Page — Backend API Gap Analysis & Requirements
> **Target Audience**: Backend Engineering Team  
> **Date**: October 13, 2026  
> **Context**: Frontend Admin Workspace Audit & API_REFERENCE.md Contrast

---

## 1. Overview & Contrast with Existing API

In the previous integration phase, the following Admin endpoints were successfully connected and verified against the live backend:
- `GET /admin/dashboard?days=30` (or `GET /admin/stats/overview`, `GET /admin/revenue`) — Dashboard statistics.
- `GET /admin/members` — Member directory.
- `PATCH /admin/members/{user_id}/status` — Account status toggle (`ACTIVE` / `DISABLED`).
- `GET /admin/coaches` — Coach directory.
- `PATCH /admin/coaches/{coach_id}/status` — Coach status toggle (`ACTIVE` / `ON_LEAVE` / `RESIGNED`).
- `GET /admin/bookings` — Booking directory list.
- `GET /gyms` (Admin Locations) — Location directory.
- `PATCH /admin/locations/{gym_id}/status` — Location toggle (`is_active: 1 | 0`).
- `GET /courses` (Admin Courses) — Course catalogue list.
- `PATCH /admin/courses/{course_id}/status` — Course catalogue toggle (`is_active: 1 | 0`).
- `GET /packages` (Admin Packages) — Package catalogue list.
- `PATCH /admin/packages/{package_type}/status` — Package catalogue toggle (`is_active: 1 | 0`).
- `GET /admin/kpi` — KPI rules and coach monthly performance snapshots.
- `PUT /admin/kpi/rules/{coach_level}` — Updating threshold targets.
- `GET /admin/audit-log` — Audit events listing.

### The Remaining Gap
While **Status Toggles (`PATCH .../status`)** and **Read Operations (`GET ...`)** are fully working, the Admin Workspace currently **lacks full Creation and Edit/Update CRUD endpoints** for core business entities:
1. **Bookings**: Cannot create or reschedule bookings; cannot update booking status via API.
2. **Courses**: Cannot create new courses or edit duration/difficulty via API.
3. **Locations**: Cannot create new gym locations or edit facility details via API.
4. **Coaches**: Cannot onboard new trainers or update credentials/break intervals via API.
5. **Members**: Cannot create accounts via admin or edit fitness profiles/tiers via API.
6. **Packages**: Cannot create custom package plans or update prices via API.
7. **KPI & Workflows**: Recalculate button runs locally instead of triggering backend snapshot generation.
8. **Settings**: Platform switches are local toggles without backend persistence.

> [!IMPORTANT]
> **Strict Business Rule: 10-Minute Grid Constraint**  
> All minute-based parameters (`default_duration`, `duration_minutes`, `break_interval`, `break_minutes`) and time parameters (`start_time`, `end_time`) must be enforced as **multiples of 10** or align with the **10-minute grid** (`:00`, `:10`, `:20`, `:30`, `:40`, `:50`).

---

## 2. Module-by-Module Button & API Inventory

### Module 1: Overview (`/admin#adminOverview`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"Add trainer"** (Header & Shortcut) | Opens Add Trainer drawer | ⚠️ **MISSING** | See Module 4 (`POST /admin/coaches`) |
| **"Review"** (Coach verification) | Opens Coach Detail Drawer for `coach-ploy` | ⚠️ **MISSING** | `POST /admin/coaches/{coach_id}/verify` |
| **"Confirm"** (Booking request) | Navigates to Bookings management tab | ⚠️ **MISSING** | `PATCH /admin/bookings/{booking_id}/status` |
| **"Open"** (Member profile) | Opens Member Detail Drawer for `member-krit` | ✅ Implemented | UI Navigation (`openDetail`) |
| **Workflow Shortcuts** (6 buttons) | Switches tabs to Bookings/Members/etc. | ✅ Implemented | UI Navigation (`setActive`) |

---

### Module 2: Bookings Management (`/admin#adminBookings`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Create booking"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/bookings`** (Detailed below) |
| **"Edit"** (Table Row & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/bookings/{booking_id}`** (Detailed below) |
| **"Update status" / "Complete"** (Table Row) | Toggles `CONFIRMED -> COMPLETED` in local state | ❌ **MISSING** | **`PATCH /admin/bookings/{booking_id}/status`** (Detailed below) |
| **"Mark session completed" / "Confirm booking"** (Drawer) | Toggles booking status in local state | ❌ **MISSING** | Same as above (`PATCH .../status`) |
| **"Search" & "Filters"** | Filters records in browser memory | ⚠️ Partial | Backend `GET /admin/bookings` needs query parameters |

#### Required API Specifications for Bookings:
1. **`POST /admin/bookings`** (Admin Create Booking)
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
       "package_id": null
     }
     ```
   - **Validation**:
     - `start_time` minutes must be a multiple of 10 (`:00`, `:10`, `:20`, etc.).
     - `duration_minutes` must be `>= 10` and `duration_minutes % 10 == 0`.
     - `break_minutes` must be `10`, `20`, or `30`.

2. **`PUT /admin/bookings/{booking_id}`** (Admin Edit Booking)
   - **Request Body**: Same fields as creation; allows rescheduling date/time, changing coach/course/location, or adjusting price.

3. **`PATCH /admin/bookings/{booking_id}/status`** (Admin Update Booking Status)
   - **Request Body**:
     ```json
     {
       "status": "COMPLETED",
       "cancel_reason": null,
       "cancelled_by": null
     }
     ```
   - **Status Options**: `"PENDING"`, `"CONFIRMED"`, `"COMPLETED"`, `"CANCELLED"`, `"NO_SHOW"`.

---

### Module 3: Courses Management (`/admin#adminCourses`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Add course"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/courses`** (Detailed below) |
| **"Edit"** (Table Row & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/courses/{course_id}`** (Detailed below) |
| **"Toggle"** (Table Row) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/courses/{course_id}/status` |
| **"Deactivate / Publish"** (Drawer) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/courses/{course_id}/status` |

#### Required API Specifications for Courses:
1. **`POST /admin/courses`** (Create New Course)
   - **Request Body**:
     ```json
     {
       "course_name": "Advance Power Training",
       "description": "Explosive barbell power and conditioning.",
       "difficulty": "INTERMEDIATE",
       "default_duration": 70,
       "equipment": "Racks, barbells, bumper plates",
       "is_active": 1,
       "assigned_coach_ids": [1, 2]
     }
     ```
   - **Validation**:
     - `default_duration` must be a multiple of 10 (`>= 10`).

2. **`PUT /admin/courses/{course_id}`** (Update Course)
   - **Request Body**: Same fields as creation; updates table `course`.

---

### Module 4: Locations Management (`/admin#adminLocations`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Add location"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/locations`** (Detailed below) |
| **"Edit"** (Table Row & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/locations/{gym_id}`** (Detailed below) |
| **"Toggle"** (Table Row) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/locations/{gym_id}/status` |
| **"Pause / Activate"** (Drawer) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/locations/{gym_id}/status` |

#### Required API Specifications for Locations:
1. **`POST /admin/locations`** (Create Gym Location)
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
     - `opening_time` and `closing_time` align with 10-minute grid.

2. **`PUT /admin/locations/{gym_id}`** (Update Gym Location)
   - **Request Body**: Same fields as creation; updates table `gym`.

---

### Module 5: Trainers Management (`/admin#adminTrainers`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Add trainer"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/coaches`** (Detailed below) |
| **"Edit"** (Table Row & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/coaches/{coach_id}`** (Detailed below) |
| **"Change status"** (Table Row) | Toggles status via API | ✅ **DONE** | `PATCH /admin/coaches/{coach_id}/status` |
| **"Set On leave / Active"** (Drawer) | Toggles status via API | ✅ **DONE** | `PATCH /admin/coaches/{coach_id}/status` |

#### Required API Specifications for Trainers:
1. **`POST /admin/coaches`** (Onboard New Coach)
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
       "assigned_course_ids": [1]
     }
     ```
   - **Validation**:
     - `break_interval` must be `10`, `20`, or `30`.

2. **`PUT /admin/coaches/{coach_id}`** (Update Coach Profile)
   - **Request Body**: Updates coach level, certifications, bio, break_interval, service_mode, assigned locations.

---

### Module 6: Members Management (`/admin#adminMembers`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Add member"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/members`** (Detailed below) |
| **"Edit"** (Table Row & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/members/{user_id}`** (Detailed below) |
| **"Toggle status"** (Table Row) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/members/{user_id}/status` |
| **"Disable / Activate"** (Drawer) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/members/{user_id}/status` |

#### Required API Specifications for Members:
1. **`POST /admin/members`** (Admin Create Member Account)
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

2. **`PUT /admin/members/{user_id}`** (Admin Update Member Profile)
   - **Request Body**: Allows admin to update contact info, membership tier, and fitness attributes.

---

### Module 7: Packages Management (`/admin#adminPackages`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"+ Add package"** (Header) | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/packages`** |
| **"Edit"** (Card & Detail Drawer) | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/packages/{package_type}`** |
| **"..." (Toggle availability)** (Card) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/packages/{package_type}/status` |
| **"Pause / Make available"** (Drawer) | Toggles active status via API | ✅ **DONE** | `PATCH /admin/packages/{package_type}/status` |

#### Required API Specifications for Packages:
1. **`POST /admin/packages`** (Create Package Catalogue Item)
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

2. **`PUT /admin/packages/{package_type}`** (Update Package Catalogue Item)
   - **Request Body**: Updates price, validity days, description, terms, and sessions.

---

### Module 8: KPI Management (`/admin#adminKpi`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"Recalculate"** (Toolbar) | Runs local in-memory math | ❌ **MISSING** | **`POST /admin/kpi/recalculate`** (Detailed below) |
| **"Save" (Inline on KPI rule)** | Updates threshold via API | ✅ **DONE** | `PUT /admin/kpi/rules/{coach_level}` |
| **"Edit" (Pencil on Coach Snapshot)** | Opens form drawer; submits to local state | ❌ **MISSING** | **`PUT /admin/kpi/records/{record_id}`** |
| **"View all"** | Shows local toast notice | ⚠️ Low | Query expansion `GET /admin/kpi` |

#### Required API Specifications for KPI:
1. **`POST /admin/kpi/recalculate`** (Trigger Snapshot Recalculation)
   - **Query / Body**: `?year=2026&month=4`
   - **Action**: Backend computes completed coaching hours, average review ratings, and retention rate from table `booking` & `review_coach`, compares them against `kpi_rule`, and updates table `coach_kpi_record`.
   - **Response**: `{ "success": true, "recalculated_count": 4 }`.

2. **`PUT /admin/kpi/records/{record_id}`** (Manual KPI Override)
   - **Request Body**: `{ "total_hours": 85.0, "avg_rating": 4.9, "retention_rate": 65.0, "is_achieved": 1 }`.

---

### Module 9: Reports (`/admin#adminReports`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"Configure report"** / **"+ Build report"** | Opens form drawer; submits to local state | ❌ **MISSING** | **`POST /admin/reports/generate`** |
| **Date Range Selector** ("Last 7 days"...) | Visual preview only | ⚠️ Partial | Connected to `GET /admin/revenue?days=...` |

#### Required API Specifications for Reports:
1. **`POST /admin/reports/generate`** (Generate Custom Report)
   - **Request Body**:
     ```json
     {
       "report_name": "Q2 Trainer Utilization",
       "date_from": "2026-04-01",
       "date_to": "2026-04-30",
       "group_by": "coach",
       "metrics": ["bookings", "revenue", "retention"]
     }
     ```

---

### Module 10: Audit Log (`/admin#adminAudit`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **"Filter events"** / **"+ Add audit filter"** | Opens filter drawer; sets local state | ⚠️ Needs Params | Add filter params to `GET /admin/audit-log` |

#### Recommended Query Enhancement for Audit Log:
- **`GET /admin/audit-log?entity_type=&entity_id=&action=&user_id=&date_from=&date_to=&page=1&page_size=50`**
  - Allows the admin UI to filter live audit trail entries by table name (`booking`, `gym`, `course`), user ID, or date.

---

### Module 11: Settings (`/admin#adminSettings`)

| UI Button / Control | Current Frontend Behavior | API Status | Required Backend Endpoint / Action |
| :--- | :--- | :--- | :--- |
| **4 Toggle Switches** (Verification, Reminders, Catalogue, Audit) | Local React state toggle | ❌ **MISSING** | **`GET /admin/settings`** & **`PATCH /admin/settings`** |

#### Required API Specifications for Settings:
1. **`GET /admin/settings`**: Returns current platform configuration key-values.
2. **`PATCH /admin/settings`**:
   ```json
   {
     "require_coach_verification": true,
     "booking_reminder_hours": 24,
     "enable_audit_logging": true
   }
   ```

---

## 3. Summary Priority Matrix for Backend Implementation

| Priority | Category | Endpoint | Complexity | Purpose |
| :---: | :--- | :--- | :---: | :--- |
| **P0** | **Booking** | `POST /admin/bookings` | Medium | Create bookings directly from Admin workspace |
| **P0** | **Booking** | `PUT /admin/bookings/{id}` | Medium | Reschedule or adjust booking details |
| **P0** | **Booking** | `PATCH /admin/bookings/{id}/status` | Low | Confirm or complete sessions (`CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| **P0** | **Course** | `POST /admin/courses` | Low | Create new courses (with 10-minute duration rule) |
| **P0** | **Course** | `PUT /admin/courses/{id}` | Low | Update course details, difficulty, equipment |
| **P1** | **Location** | `POST /admin/locations` | Low | Add new gym facilities |
| **P1** | **Location** | `PUT /admin/locations/{id}` | Low | Update gym hours, address, phone |
| **P1** | **Coach** | `POST /admin/coaches` | High | Onboard new coaches (creates `user`, `coach`, initial relations) |
| **P1** | **Coach** | `PUT /admin/coaches/{id}` | Medium | Update coach credentials, certifications, bio |
| **P1** | **KPI** | `POST /admin/kpi/recalculate` | Medium | Recompute monthly coach snapshots from bookings & reviews |
| **P2** | **Member** | `POST /admin/members` | Medium | Admin creation of member accounts |
| **P2** | **Member** | `PUT /admin/members/{id}` | Low | Update member tier, fitness goals |
| **P2** | **Package** | `POST /admin/packages` | Low | Add new package catalogue tier |
| **P2** | **Package** | `PUT /admin/packages/{type}` | Low | Edit package pricing and validity |
| **P3** | **Settings** | `GET /admin/settings` & `PATCH` | Low | Persist platform configuration flags |
| **P3** | **Reports** | `POST /admin/reports/generate` | High | Aggregated reporting engine |
