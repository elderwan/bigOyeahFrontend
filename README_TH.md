# FitBooking Frontend

## ภาพรวม

โฟลเดอร์นี้เป็นโครงสร้างพื้นฐานของ frontend สำหรับแพลตฟอร์มจองเทรนเนอร์ส่วนตัว FitBooking โดยใช้:

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- lucide-react

หน้าเริ่มต้นเป็น dashboard ภาษาไทยสำหรับผู้ดูแลระบบ โดยข้อมูลตัวอย่างอยู่ใน `lib/mock-data.ts` และยังไม่ได้เชื่อมต่อ API จริง

## การติดตั้งและรัน

เปิด terminal ในโฟลเดอร์ `frontend`:

```bash
npm install
npm run dev
```

เปิดเว็บไซต์ที่:

```text
http://localhost:3000
```

ตรวจสอบ production build:

```bash
npm run build
npm run start
```

## โครงสร้างสำคัญ

```text
frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── booking-status.tsx
│   ├── dashboard-shell.tsx
│   └── stat-card.tsx
├── lib/
│   ├── api-client.ts
│   ├── database.ts
│   └── mock-data.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

คัดลอก `.env.example` เป็น `.env.local` เมื่อต้องการเชื่อมต่อ FastAPI:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## กติกาการใช้ field

ไฟล์ `lib/database.ts` ใช้ชื่อ field แบบ `snake_case` ให้ตรงกับตาราง MySQL โดยตรง เช่น:

- `user_id`
- `coach_id`
- `booking_id`
- `booking_date`
- `start_time`
- `duration_minutes`
- `service_mode`
- `payment_status`
- `remaining_sessions`

ห้ามเปลี่ยนเป็น camelCase ใน type หลัก เพราะจะทำให้ชื่อ field ไม่ตรงกับ backend และ SQL schema

## ตารางที่มี type รองรับ

TypeScript interfaces ใน `lib/database.ts` ครอบคลุมตารางหลักทั้ง 19 ตาราง:

1. `membership_level`
2. `kpi_rule`
3. `users`
4. `member`
5. `coach`
6. `gym`
7. `course`
8. `coach_service`
9. `coach_course`
10. `coach_weekly_template`
11. `schedule_registry`
12. `member_package`
13. `booking`
14. `orders`
15. `review_coach`
16. `review_member`
17. `fitness_profile`
18. `coach_kpi_record`
19. `audit_log`

นอกจากนี้ยังมี `CoachScheduleSlot` สำหรับ dynamic table `coach_schedule_<coach_no>` โดย field ตรงกับ DDL ที่ backend จะสร้าง:

- `slot_start`
- `slot_year`
- `slot_month`
- `slot_day`
- `slot_hour`
- `slot_minute`
- `status`
- `booking_id`
- `remark`
- `created_at`
- `updated_at`

## Enum และ validation ที่ต้องรักษา

Frontend ต้องส่งค่า enum ให้ตรงกับฐานข้อมูล:

- `users.role`: `MEMBER`, `COACH`, `ADMIN`
- `users.status`: `ACTIVE`, `DISABLED`
- `coach.coach_level`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `MASTER`
- `coach.service_mode`: `GYM`, `HOME`, `BOTH`
- `booking.service_mode`: `GYM`, `HOME`
- `booking.status`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- `orders.payment_status`: `UNPAID`, `PAID`, `CANCELLED`, `REFUNDED`
- `member_package.package_type`: `5+1`, `10+3`, `20+7`
- `member_package.status`: `ACTIVE`, `EXHAUSTED`, `EXPIRED`, `CANCELLED`
- dynamic schedule `status`: `AVAILABLE`, `BOOKED`, `BREAK`, `BLOCKED`

ข้อควรระวัง:

- `coach_no` ต้องเป็นตัวเลข 4-8 หลัก
- `start_time` ต้องอยู่บน grid ทุก 10 นาที
- `duration_minutes` ต้องเป็นเลขที่หารด้วย 10 ลงตัว
- `break_minutes` ใช้ได้เฉพาะ `10`, `20`, `30`
- `service_mode = GYM` ต้องมี `gym_id` และไม่มี `service_address`
- `service_mode = HOME` ต้องมี `service_district` และ `service_address` และไม่มี `gym_id`
- ห้ามส่ง `password_hash` กลับมาแสดงใน UI
- ราคาทั้งหมดใช้สกุลเงิน THB และควรแสดงเป็นทศนิยม 2 ตำแหน่ง

## การเชื่อมต่อ backend

เมื่อ backend พร้อม ให้เปลี่ยน `lib/mock-data.ts` เป็น service ที่เรียก FastAPI เช่น:

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings`);

if (!response.ok) {
  throw new Error("ไม่สามารถโหลดข้อมูล booking ได้");
}

const bookings: Booking[] = await response.json();
```

FastAPI ควรคืน JSON ที่ใช้ชื่อ field ตาม SQL โดยตรง ตัวอย่าง:

```json
{
  "booking_id": 2401,
  "member_id": 31,
  "coach_id": 1,
  "course_id": 1,
  "gym_id": 1,
  "package_id": null,
  "booking_date": "2026-10-13",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "duration_minutes": 60,
  "break_minutes": 10,
  "service_mode": "GYM",
  "service_district": null,
  "service_address": null,
  "price": 1200,
  "status": "CONFIRMED"
}
```

## Dynamic schedule table

Frontend ไม่ควรรับหรือสร้างชื่อ dynamic table เอง:

```text
coach_schedule_<coach_no>
```

frontend ส่งเพียง `coach_id` หรือข้อมูลช่วงเวลาที่ต้องการจองให้ FastAPI ส่วน backend จะอ่าน `coach_no` จากฐานข้อมูล ตรวจสอบรูปแบบ และสร้าง/เลือกตารางอย่างปลอดภัย

## แนวทางพัฒนาต่อ

1. เพิ่ม authentication และ role guard สำหรับ `MEMBER`, `COACH`, `ADMIN`
2. เพิ่ม API client กลางสำหรับ FastAPI
3. เพิ่มหน้า booking calendar ที่อ่าน `CoachScheduleSlot`
4. เพิ่มฟอร์มสร้าง booking โดยใช้ validation ตาม `booking` CHECK constraints
5. เพิ่มหน้าสมาชิก แพ็กเกจ ออเดอร์ รีวิว และ KPI
6. เพิ่ม error mapping สำหรับ foreign key, CHECK constraint และ trigger error จาก MySQL
