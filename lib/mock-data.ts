import type { Booking, Coach, Course, Gym, MemberPackage } from "@/lib/database";

export const demoCoach: Coach = {
  coach_id: 1,
  coach_no: "1001",
  user_id: 12,
  coach_level: "ADVANCED",
  bio: "A personal trainer specializing in strength building and functional movement.",
  service_mode: "BOTH",
  break_interval: 10,
  years_experience: 6,
  certifications: "ACE, CPR",
  avatar_url: null,
  status: "ACTIVE",
  hired_at: "2023-02-01",
  created_at: "2023-02-01T09:00:00+07:00",
  updated_at: "2026-10-12T08:00:00+07:00"
};

export const demoCourses: Course[] = [
  {
    course_id: 1,
    course_name: "Strength Training",
    description: "Build muscle and increase overall strength.",
    equipment: "Dumbbells, Barbell",
    difficulty: "INTERMEDIATE",
    default_duration: 60,
    is_active: 1,
    created_at: "2024-01-01T08:00:00+07:00",
    updated_at: "2026-10-01T08:00:00+07:00"
  },
  {
    course_id: 2,
    course_name: "Functional Movement",
    description: "Improve the movements you use in everyday life.",
    equipment: "Mat, Kettlebell",
    difficulty: "BEGINNER",
    default_duration: 60,
    is_active: 1,
    created_at: "2024-01-01T08:00:00+07:00",
    updated_at: "2026-10-01T08:00:00+07:00"
  }
];

export const demoGyms: Gym[] = [
  {
    gym_id: 1,
    gym_name: "Nimman Fitness Club",
    address: "Nimmanhaemin Road, Chiang Mai",
    district: "NIMMAN",
    phone: "053-000-001",
    facilities: "Free weights, Cardio, Sauna",
    opening_time: "06:00:00",
    closing_time: "22:00:00",
    latitude: 18.7961,
    longitude: 98.9675,
    is_active: 1,
    created_at: "2024-01-01T08:00:00+07:00",
    updated_at: "2026-10-01T08:00:00+07:00"
  },
  {
    gym_id: 2,
    gym_name: "Old City Training Lab",
    address: "Ratchadamnoen Road, Chiang Mai",
    district: "OLD_CITY",
    phone: "053-000-002",
    facilities: "Functional area, Yoga studio",
    opening_time: "07:00:00",
    closing_time: "21:00:00",
    latitude: 18.7883,
    longitude: 98.9853,
    is_active: 1,
    created_at: "2024-01-01T08:00:00+07:00",
    updated_at: "2026-10-01T08:00:00+07:00"
  }
];

export const demoBookings: Booking[] = [
  {
    booking_id: 2401,
    member_id: 31,
    coach_id: 1,
    course_id: 1,
    gym_id: 1,
    package_id: null,
    booking_date: "2026-10-13",
    start_time: "09:00:00",
    end_time: "10:00:00",
    duration_minutes: 60,
    break_minutes: 10,
    service_mode: "GYM",
    service_district: null,
    service_address: null,
    price: 1200,
    status: "CONFIRMED",
    expires_at: null,
    cancelled_by: null,
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    created_at: "2026-10-12T09:00:00+07:00",
    updated_at: "2026-10-12T09:00:00+07:00"
  },
  {
    booking_id: 2402,
    member_id: 32,
    coach_id: 1,
    course_id: 2,
    gym_id: null,
    package_id: 18,
    booking_date: "2026-10-13",
    start_time: "11:00:00",
    end_time: "12:00:00",
    duration_minutes: 60,
    break_minutes: 10,
    service_mode: "HOME",
    service_district: "NIMMAN",
    service_address: "Huay Kaew Road, Chiang Mai",
    price: 1100,
    status: "PENDING",
    expires_at: "2026-10-12T18:35:00+07:00",
    cancelled_by: null,
    cancel_reason: null,
    cancelled_at: null,
    completed_at: null,
    created_at: "2026-10-12T18:20:00+07:00",
    updated_at: "2026-10-12T18:20:00+07:00"
  }
];

export const demoPackages: MemberPackage[] = [
  {
    package_id: 18,
    member_id: 32,
    package_type: "10+3",
    total_sessions: 13,
    remaining_sessions: 7,
    price: 10500,
    purchase_date: "2026-08-20",
    expire_date: "2027-02-16",
    status: "ACTIVE",
    created_at: "2026-08-20T10:00:00+07:00",
    updated_at: "2026-10-12T18:20:00+07:00"
  }
];
