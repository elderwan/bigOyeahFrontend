import {
  Booking, BookingStatus, Coach, CoachCourse, CoachScheduleSlot, CoachService, MembershipLevel,
  CoachWeeklyTemplate, Course, Gym, MemberPackage, Order, ReviewCoach
} from "@/lib/database";

export interface MemberPreviewBooking {
  booking: Booking;
  course: Course;
  coach: Coach;
  display_name: string;
  gym: Gym | null;
  orders: Order[];
  member_package: MemberPackage | null;
  review_coach: ReviewCoach | null;
  ui: {
    coach_image: string;
  };
}

export interface BookableStart {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price_per_session: number;
}

export interface MemberPreviewCoachListing {
  coach: Coach;
  display_name: string;
  coach_service: CoachService;
  coach_course: CoachCourse;
  course: Course;
  gym: Gym;
  ui: {
    avg_rating: number;
    review_count: number;
    location_label: string;
    image: string;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MOCK_NOW = () => new Date();

export function toBusinessDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function businessDateAtOffset(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toBusinessDate(date);
}

function businessDateOffset(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day + days, 12);
  return toBusinessDate(next);
}

function businessWeekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(year, month - 1, day, 12).getDay();
  return weekday === 0 ? 7 : weekday;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatSqlTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;
}

function dateTimeFromBusinessFields(booking_date: string, start_time: string): Date {
  const [year, month, day] = booking_date.split("-").map(Number);
  const [hour, minute] = start_time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

export const preview_coach: Coach = {
  coach_id: 1,
  coach_no: "1001",
  user_id: 2,
  coach_level: "ADVANCED",
  bio: "Strength and conditioning coaching.",
  service_mode: "BOTH",
  break_interval: 10,
  years_experience: 6,
  certifications: "Certified strength coach",
  avatar_url: null,
  status: "ACTIVE",
  hired_at: null,
  created_at: "2026-01-01 00:00:00",
  updated_at: "2026-01-01 00:00:00"
};

export const preview_coach_display_name = "Tan Chaiyaporn";
export const preview_coach_image = "photo-1583454110551-21f2fa2afe61";
export const preview_coach_rating = 4.9;

export const preview_courses: Course[] = [
  {
    course_id: 1,
    course_name: "Strength & Conditioning",
    description: "Build strength and improve performance.",
    equipment: "Weights",
    difficulty: "INTERMEDIATE",
    default_duration: 60,
    is_active: 1,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00"
  },
  {
    course_id: 2,
    course_name: "HIIT",
    description: "High-intensity interval training.",
    equipment: null,
    difficulty: "BEGINNER",
    default_duration: 45,
    is_active: 1,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00"
  },
  {
    course_id: 3,
    course_name: "Mobility & Flexibility",
    description: "Build range of motion and move freely.",
    equipment: "Mat",
    difficulty: "BEGINNER",
    default_duration: 60,
    is_active: 1,
    created_at: "2026-01-01 00:00:00",
    updated_at: "2026-01-01 00:00:00"
  }
];

export const preview_membership_levels: MembershipLevel[] = [
  { level_id: 1, level_code: "BRONZE", level_name: "Bronze Member", min_total_spend: 0, discount_rate: 0, sort_order: 1 },
  { level_id: 2, level_code: "SILVER", level_name: "Silver Member", min_total_spend: 10000, discount_rate: 0.05, sort_order: 2 },
  { level_id: 3, level_code: "GOLD", level_name: "Gold Member", min_total_spend: 30000, discount_rate: 0.1, sort_order: 3 }
];

export const preview_coach_courses: CoachCourse[] = [
  { coach_id: 1, course_id: 1, price_per_session: 800, is_active: 1, created_at: "2026-01-01 00:00:00", updated_at: "2026-01-01 00:00:00" },
  { coach_id: 1, course_id: 2, price_per_session: 750, is_active: 1, created_at: "2026-01-01 00:00:00", updated_at: "2026-01-01 00:00:00" },
  { coach_id: 1, course_id: 3, price_per_session: 650, is_active: 1, created_at: "2026-01-01 00:00:00", updated_at: "2026-01-01 00:00:00" }
];

export const preview_weekly_template: CoachWeeklyTemplate[] = [1, 2, 3, 4, 5, 6].map((weekday) => ({
  template_id: weekday,
  coach_id: preview_coach.coach_id,
  weekday,
  start_time: "07:00:00",
  end_time: "19:00:00",
  created_at: "2026-01-01 00:00:00"
}));
export const preview_gym: Gym = {
  gym_id: 1,
  gym_name: "Nimman Fitness Club",
  address: "Nimman Road, Chiang Mai",
  district: "NIMMAN",
  phone: null,
  facilities: "Strength equipment",
  opening_time: "06:00:00",
  closing_time: "22:00:00",
  latitude: null,
  longitude: null,
  is_active: 1,
  created_at: "2026-01-01 00:00:00",
  updated_at: "2026-01-01 00:00:00"
};

export const preview_gyms: Gym[] = [
  preview_gym,
  {
    ...preview_gym,
    gym_id: 2,
    gym_name: "Old City Studio",
    district: "OLD_CITY",
    address: "Old City, Chiang Mai"
  },
  {
    ...preview_gym,
    gym_id: 3,
    gym_name: "Central Fitness",
    district: "CENTRAL",
    address: "Central Chiang Mai"
  },
  {
    ...preview_gym,
    gym_id: 4,
    gym_name: "Hang Dong Training",
    district: "HANG_DONG",
    address: "Hang Dong, Chiang Mai"
  }
];

export const preview_coach_listings: MemberPreviewCoachListing[] = [
  {
    coach: preview_coach,
    display_name: preview_coach_display_name,
    coach_service: { coach_service_id: 1, coach_id: 1, gym_id: 1, is_home_service: 1, service_area: "NIMMAN", is_active: 1, created_at: "2026-01-01 00:00:00" },
    coach_course: preview_coach_courses[0],
    course: preview_courses[0],
    gym: preview_gyms[0],
    ui: { avg_rating: 4.9, review_count: 128, location_label: "Nimman", image: preview_coach_image }
  },
  {
    coach: { ...preview_coach, coach_id: 2, coach_no: "1002", coach_level: "INTERMEDIATE", service_mode: "BOTH", status: "ACTIVE" },
    display_name: "May Suthida",
    coach_service: { coach_service_id: 2, coach_id: 2, gym_id: 2, is_home_service: 1, service_area: "OLD_CITY", is_active: 1, created_at: "2026-01-01 00:00:00" },
    coach_course: { ...preview_coach_courses[2], coach_id: 2 },
    course: preview_courses[2],
    gym: preview_gyms[1],
    ui: { avg_rating: 4.8, review_count: 96, location_label: "Old City", image: "photo-1544367567-0f2fcb009e0b" }
  },
  {
    coach: { ...preview_coach, coach_id: 3, coach_no: "1003", coach_level: "MASTER", service_mode: "GYM", status: "ACTIVE" },
    display_name: "Jeff Nopparat",
    coach_service: { coach_service_id: 3, coach_id: 3, gym_id: 3, is_home_service: 0, service_area: null, is_active: 1, created_at: "2026-01-01 00:00:00" },
    coach_course: { ...preview_coach_courses[1], coach_id: 3, price_per_session: 900 },
    course: preview_courses[1],
    gym: preview_gyms[2],
    ui: { avg_rating: 4.9, review_count: 84, location_label: "Central", image: "photo-1500648767791-00dcc994a43e" }
  },
  {
    coach: { ...preview_coach, coach_id: 4, coach_no: "1004", coach_level: "ADVANCED", service_mode: "HOME", status: "ACTIVE" },
    display_name: "Ploy Rattanakorn",
    coach_service: { coach_service_id: 4, coach_id: 4, gym_id: 4, is_home_service: 1, service_area: "HANG_DONG", is_active: 1, created_at: "2026-01-01 00:00:00" },
    coach_course: { ...preview_coach_courses[2], coach_id: 4, price_per_session: 850 },
    course: preview_courses[2],
    gym: preview_gyms[3],
    ui: { avg_rating: 4.9, review_count: 72, location_label: "Hang Dong", image: "photo-1534528741775-53994a69daeb" }
  }
];

export const preview_coach_weekly_templates: CoachWeeklyTemplate[] =
  preview_coach_listings.flatMap(({ coach }) => [1, 2, 3, 4, 5, 6].map((weekday) => ({
    template_id: coach.coach_id * 10 + weekday,
    coach_id: coach.coach_id,
    weekday,
    start_time: coach.coach_id === 3 ? "08:00:00" : "07:00:00",
    end_time: coach.coach_id === 2 ? "18:00:00" : "19:00:00",
    created_at: "2026-01-01 00:00:00"
  })));

const ownMemberId = 1;
const otherMemberId = 2;

function makePreviewBooking(
  booking_id: number,
  offset: number,
  start_time: string,
  status: BookingStatus,
  course_id: number,
  member_id = ownMemberId,
  package_id: number | null = null
): MemberPreviewBooking {
  const course = preview_courses.find((item) => item.course_id === course_id) || preview_courses[0];
  const break_minutes = preview_coach.break_interval;
  const startMinutes = timeToMinutes(start_time);
  const booking_date = businessDateAtOffset(offset);
  const booking: Booking = {
    booking_id,
    member_id,
    coach_id: preview_coach.coach_id,
    course_id,
    gym_id: 1,
    package_id,
    booking_date,
    start_time: `${start_time}:00`,
    end_time: formatSqlTime(startMinutes + course.default_duration),
    duration_minutes: course.default_duration,
    break_minutes,
    service_mode: "GYM",
    service_district: null,
    service_address: null,
    price: preview_coach_courses.find((item) => item.course_id === course_id)?.price_per_session || 800,
    status,
    expires_at: status === "PENDING" ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
    cancelled_by: status === "CANCELLED" ? "MEMBER" : null,
    cancel_reason: status === "CANCELLED" ? "Schedule changed" : null,
    cancelled_at: status === "CANCELLED" ? "2026-10-01 09:00:00" : null,
    completed_at: status === "COMPLETED" ? "2026-10-01 10:10:00" : null,
    created_at: "2026-10-01 08:00:00",
    updated_at: "2026-10-01 08:00:00"
  };
  const order: Order = {
    order_id: booking_id + 1000,
    order_type: "BOOKING",
    booking_id,
    package_id,
    total_amount: booking.price,
    discount: 0,
    final_amount: booking.price,
    payment_method: status === "COMPLETED" ? "PROMPTPAY" : package_id ? "PACKAGE_CREDIT" : "CASH",
    payment_status: status === "COMPLETED" ? "PAID" : status === "PENDING" ? "UNPAID" : status === "CANCELLED" ? "CANCELLED" : "PAID",
    payment_time: status === "COMPLETED" ? "2026-10-01 08:30:00" : null,
    refunded_at: null,
    created_at: booking.created_at,
    updated_at: booking.updated_at
  };
  const member_package: MemberPackage | null = package_id === null ? null : {
    package_id,
    member_id,
    package_type: "5+1",
    total_sessions: 6,
    remaining_sessions: 4,
    price: 3400,
    purchase_date: "2026-09-01",
    expire_date: "2027-02-28",
    status: "ACTIVE",
    created_at: "2026-09-01 08:00:00",
    updated_at: "2026-09-01 08:00:00"
  };
  return {
    booking,
    course,
    coach: preview_coach,
    display_name: preview_coach_display_name,
    gym: preview_gym,
    orders: [order],
    member_package,
    review_coach: booking_id === 9004 ? {
      review_coach_id: 1,
      booking_id,
      reviewer_id: member_id,
      rating_professional: 5,
      rating_communication: 5,
      rating_punctuality: 4,
      rating_effectiveness: 5,
      avg_rating: 4.75,
      comment: "A thoughtful session with clear coaching throughout.",
      created_at: "2026-10-01 11:00:00"
    } : null,
    ui: { coach_image: preview_coach_image }
  };
}

// MOCK: replace with a confirmed API response; these records exist only for member UI review.
export const preview_member_bookings: MemberPreviewBooking[] = [
  makePreviewBooking(9001, 2, "09:00", "CONFIRMED", 1),
  makePreviewBooking(9002, 4, "17:00", "PENDING", 2),
  makePreviewBooking(9003, 7, "11:00", "CONFIRMED", 3, otherMemberId),
  makePreviewBooking(9004, -2, "09:00", "COMPLETED", 1),
  makePreviewBooking(9005, -8, "14:00", "CANCELLED", 2),
  makePreviewBooking(9006, -14, "16:00", "NO_SHOW", 3),
  makePreviewBooking(9007, -20, "08:00", "COMPLETED", 2)
];

function makeSlot(date: string, minutes: number, status: CoachScheduleSlot["status"]): CoachScheduleSlot {
  const [slot_year, slot_month, slot_day] = date.split("-").map(Number);
  const slot_hour = Math.floor(minutes / 60);
  const slot_minute = minutes % 60;
  return {
    slot_start: `${date} ${formatSqlTime(minutes)}`,
    slot_year,
    slot_month,
    slot_day,
    slot_hour,
    slot_minute,
    status,
    booking_id: null,
    remark: null,
    created_at: `${date} 00:00:00`,
    updated_at: `${date} 00:00:00`
  };
}

// MOCK: generated from the demo coach_weekly_template in local Chiang Mai time.
export function getPreviewScheduleSlots(from: string, days = 60, coach_id = preview_coach.coach_id): CoachScheduleSlot[] {
  const slots: CoachScheduleSlot[] = [];
  const templates = preview_coach_weekly_templates.filter((item) => item.coach_id === coach_id);
  for (let offset = 0; offset < days; offset += 1) {
    const booking_date = businessDateOffset(from, offset);
    const weekday = businessWeekday(booking_date);
    const template = templates.find((item) => item.weekday === weekday);
    if (!template) continue;
    const templateStart = timeToMinutes(template.start_time);
    const templateEnd = timeToMinutes(template.end_time);
    for (let minutes = templateStart; minutes + 10 <= templateEnd; minutes += 10) {
      const dateOffset = Math.floor(Date.parse(`${booking_date}T12:00:00`) / DAY_MS);
      const slotIndex = Math.floor(minutes / 10);
      let status: CoachScheduleSlot["status"] = "AVAILABLE";
      if (minutes >= 12 * 60 && minutes < 13 * 60) status = "BREAK";
      else if ((dateOffset + slotIndex) % 17 === 0) status = "BOOKED";
      else if ((dateOffset + slotIndex) % 29 === 0) status = "BLOCKED";
      slots.push({ ...makeSlot(booking_date, minutes, status), booking_id: status === "BOOKED" ? 8000 + slotIndex : null, remark: null });
    }
  }
  return slots;
}

export function getBookableStarts(
  booking_date: string,
  course_id: number,
  slots: CoachScheduleSlot[],
  now = MOCK_NOW(),
  coach_id = preview_coach.coach_id
): BookableStart[] {
  const course = preview_courses.find((item) => item.course_id === course_id);
  const listing = preview_coach_listings.find((item) => item.coach.coach_id === coach_id);
  const coach_course = listing?.coach_course.coach_id === coach_id && listing.coach_course.course_id === course_id
    ? listing.coach_course
    : preview_coach_courses.find((item) => item.coach_id === coach_id && item.course_id === course_id);
  const coach = listing?.coach || preview_coach;
  if (!course || !coach_course || course.is_active !== 1 || !coach_course.is_active) return [];
  const need = Math.ceil((course.default_duration + coach.break_interval) / 10);
  const daySlots = slots.filter((slot) =>
    `${slot.slot_year}-${String(slot.slot_month).padStart(2, "0")}-${String(slot.slot_day).padStart(2, "0")}` === booking_date
  );
  const byStart = new Map(daySlots.map((slot) => [slot.slot_start, slot]));
  const starts: BookableStart[] = [];
  for (const slot of daySlots) {
    if (slot.status !== "AVAILABLE" || slot.slot_minute % 10 !== 0) continue;
    const startMinutes = slot.slot_hour * 60 + slot.slot_minute;
    const endWithBreak = startMinutes + course.default_duration + coach.break_interval;
    if (endWithBreak > 24 * 60) continue;
    const startDateTime = dateTimeFromBusinessFields(booking_date, slot.slot_start.slice(11, 19));
    if (startDateTime.getTime() <= now.getTime() + 2 * 60 * 60 * 1000) continue;
    const consecutive = Array.from({ length: need }, (_, index) => {
      const nextMinutes = startMinutes + index * 10;
      return byStart.get(`${booking_date} ${formatSqlTime(nextMinutes)}`);
    });
    if (consecutive.length !== need || consecutive.some((next) => next?.status !== "AVAILABLE")) continue;
    const bookingEnd = startMinutes + course.default_duration;
    const overlapsOwnBooking = preview_member_bookings.some(({ booking }) =>
      booking.member_id === ownMemberId && booking.coach_id === coach_id &&
      ["PENDING", "CONFIRMED"].includes(booking.status) &&
      booking.booking_date === booking_date &&
      startMinutes < timeToMinutes(booking.end_time) &&
      bookingEnd > timeToMinutes(booking.start_time)
    );
    if (overlapsOwnBooking) continue;
    starts.push({
      start_time: formatSqlTime(startMinutes),
      end_time: formatSqlTime(bookingEnd),
      duration_minutes: course.default_duration,
      price_per_session: coach_course.price_per_session
    });
  }
  return starts.sort((left, right) => left.start_time.localeCompare(right.start_time));
}

export function getPreviewMonthlyBookings(from: string, days: number): MemberPreviewBooking[] {
  const until = businessDateOffset(from, days);
  return preview_member_bookings
    .filter(({ booking }) =>
      booking.member_id === ownMemberId &&
      ["PENDING", "CONFIRMED"].includes(booking.status) &&
      booking.booking_date >= from &&
      booking.booking_date <= until
    )
    .sort((left, right) =>
      `${left.booking.booking_date} ${left.booking.start_time}`.localeCompare(`${right.booking.booking_date} ${right.booking.start_time}`)
    );
}

export function formatBookingDate(booking_date: string): string {
  const [year, month, day] = booking_date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric"
  }).format(new Date(year, month - 1, day, 12));
}

export function getPreviewMonthAvailability(course_id: number, from = toBusinessDate(new Date()), coach_id = preview_coach.coach_id) {
  const slots = getPreviewScheduleSlots(from, 60, coach_id);
  const byMonth = new Map<string, Map<string, BookableStart[]>>();
  for (let offset = 0; offset < 60; offset += 1) {
    const booking_date = businessDateOffset(from, offset);
    const starts = getBookableStarts(booking_date, course_id, slots, MOCK_NOW(), coach_id);
    if (!starts.length) continue;
    const monthKey = booking_date.slice(0, 7);
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, new Map());
    byMonth.get(monthKey)?.set(booking_date, starts);
  }
  return byMonth;
}

export function monthDate(monthKey: string): Date {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1, 12);
}

export function addCalendarMonths(monthKey: string, count: number): string {
  const date = monthDate(monthKey);
  date.setMonth(date.getMonth() + count);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyForDate(booking_date: string): string {
  return booking_date.slice(0, 7);
}

export function dateLabelForMonth(monthKey: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthDate(monthKey));
}

export function weekdayForDate(booking_date: string): number {
  return businessWeekday(booking_date);
}

export function dateOffset(booking_date: string, days: number): string {
  return businessDateOffset(booking_date, days);
}

export function dateNow(): string {
  return toBusinessDate(new Date());
}
