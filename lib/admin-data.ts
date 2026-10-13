import type {
  BookingStatus,
  CancelledBy,
  CoachLevel,
  CoachServiceMode,
  CourseDifficulty,
  District,
  PackageType
} from "@/lib/database";

export interface AdminBookingItem {
  id: string;
  booking_id: number;
  member_name: string;
  coach_name: string;
  course_name: string;
  service_mode: "GYM" | "HOME";
  gym_name: string | null;
  service_district: District | null;
  service_address: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  break_minutes: number;
  price: number;
  status: BookingStatus;
  cancelled_by?: CancelledBy | null;
  cancel_reason?: string | null;
  package_name?: string | null;
}

export interface AdminMemberItem {
  id: string;
  user_id: number;
  member_id: number;
  display_name: string;
  username: string;
  email: string;
  phone: string;
  level_code: "BRONZE" | "SILVER" | "GOLD";
  total_spend: number;
  status: "ACTIVE" | "DISABLED";
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
  remaining_sessions: number;
}

export interface AdminCoachItem {
  id: string;
  coach_id: number;
  coach_no: string;
  user_id: number;
  display_name: string;
  username: string;
  email: string;
  phone: string;
  coach_level: CoachLevel;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  service_mode: CoachServiceMode;
  break_interval: 10 | 20 | 30;
  years_experience: number;
  certifications: string;
  bio: string;
  assigned_locations: string;
  courses_taught: string;
  hired_at: string;
  rating: number;
}

export interface AdminLocationItem {
  id: string;
  gym_id: number;
  gym_name: string;
  address: string;
  district: District;
  phone: string;
  facilities: string;
  opening_time: string;
  closing_time: string;
  latitude: number;
  longitude: number;
  is_active: 1 | 0;
  features: string;
}

export interface AdminCourseItem {
  id: string;
  course_id: number;
  course_name: string;
  description: string;
  difficulty: CourseDifficulty;
  default_duration: number;
  equipment: string;
  is_active: 1 | 0;
  assigned_coaches: string;
}

export interface AdminPackageItem {
  id: string;
  package_type: PackageType;
  name: string;
  paid_sessions: number;
  bonus_sessions: number;
  total_sessions: number;
  price: number;
  validity_days: number;
  description: string;
  terms: string;
  status: "Available" | "Paused";
}

export interface AdminKpiRecordItem {
  id: string;
  coach_id: number;
  coach: string;
  level: CoachLevel;
  hours: number;
  sessions: number;
  rating: number;
  retention: number;
  target_hours: number;
  target_rating: number;
  target_retention: number;
  achieved: boolean;
}

export interface AdminKpiRuleItem {
  level: CoachLevel;
  hours: number;
  rating: number;
  retention: number;
}

export const initialAdminBookings: AdminBookingItem[] = [
  {
    id: "booking-24016",
    booking_id: 24016,
    member_name: "Nattakarn S.",
    coach_name: "Tan Chaiyaporn",
    course_name: "Strength & Conditioning",
    service_mode: "GYM",
    gym_name: "Nimman Fitness Club",
    service_district: null,
    service_address: null,
    booking_date: "2026-04-16",
    start_time: "09:10",
    end_time: "10:10",
    duration_minutes: 60,
    break_minutes: 10,
    price: 800,
    status: "CONFIRMED",
    package_name: "10+3 Sessions"
  },
  {
    id: "booking-24018",
    booking_id: 24018,
    member_name: "Mali P.",
    coach_name: "May Suthida",
    course_name: "Mobility & Flexibility",
    service_mode: "GYM",
    gym_name: "Old City Studio",
    service_district: null,
    service_address: null,
    booking_date: "2026-04-18",
    start_time: "17:00",
    end_time: "18:00",
    duration_minutes: 60,
    break_minutes: 10,
    price: 750,
    status: "PENDING"
  },
  {
    id: "booking-24020",
    booking_id: 24020,
    member_name: "Krit S.",
    coach_name: "Jeff Nopparat",
    course_name: "HIIT",
    service_mode: "GYM",
    gym_name: "Central Fitness",
    service_district: null,
    service_address: null,
    booking_date: "2026-04-20",
    start_time: "10:30",
    end_time: "11:15",
    duration_minutes: 45,
    break_minutes: 10,
    price: 750,
    status: "CONFIRMED"
  },
  {
    id: "booking-24021",
    booking_id: 24021,
    member_name: "Alex Morgan",
    coach_name: "Tan Chaiyaporn",
    course_name: "Strength & Conditioning",
    service_mode: "HOME",
    gym_name: null,
    service_district: "NIMMAN",
    service_address: "18/4 Nimman Soi 9, Chiang Mai",
    booking_date: "2026-04-22",
    start_time: "08:00",
    end_time: "09:00",
    duration_minutes: 60,
    break_minutes: 10,
    price: 800,
    status: "COMPLETED"
  }
];

export const initialAdminMembers: AdminMemberItem[] = [
  {
    id: "member-alex",
    user_id: 1,
    member_id: 1,
    display_name: "Alex Morgan",
    username: "alex",
    email: "alex.morgan@example.com",
    phone: "+66 82 345 6789",
    level_code: "GOLD",
    total_spend: 22150,
    status: "ACTIVE",
    gender: "MALE",
    birth_date: "1994-06-15",
    height_cm: 178,
    weight_kg: 74,
    fitness_goal: "Strength training & muscle hyperthrophy",
    remaining_sessions: 7
  },
  {
    id: "member-nattakarn",
    user_id: 2,
    member_id: 2,
    display_name: "Nattakarn S.",
    username: "nattakarn.s",
    email: "nattakarn@example.com",
    phone: "+66 81 987 6543",
    level_code: "SILVER",
    total_spend: 8500,
    status: "ACTIVE",
    gender: "FEMALE",
    birth_date: "1997-03-22",
    height_cm: 165,
    weight_kg: 56,
    fitness_goal: "Improve deadlift and core strength",
    remaining_sessions: 8
  },
  {
    id: "member-mali",
    user_id: 3,
    member_id: 3,
    display_name: "Mali P.",
    username: "mali.p",
    email: "mali@example.com",
    phone: "+66 89 123 4567",
    level_code: "BRONZE",
    total_spend: 3200,
    status: "ACTIVE",
    gender: "FEMALE",
    birth_date: "1999-11-08",
    height_cm: 160,
    weight_kg: 52,
    fitness_goal: "Mobility & flexibility for desk posture",
    remaining_sessions: 3
  },
  {
    id: "member-krit",
    user_id: 4,
    member_id: 4,
    display_name: "Krit S.",
    username: "krit.s",
    email: "krit@example.com",
    phone: "+66 85 456 7890",
    level_code: "BRONZE",
    total_spend: 1500,
    status: "ACTIVE",
    gender: "MALE",
    birth_date: "1992-08-30",
    height_cm: 172,
    weight_kg: 68,
    fitness_goal: "Cardiovascular endurance and fat loss",
    remaining_sessions: 2
  }
];

export const initialAdminCoaches: AdminCoachItem[] = [
  {
    id: "coach-tan",
    coach_id: 1,
    coach_no: "1001",
    user_id: 11,
    display_name: "Tan Chaiyaporn",
    username: "coach.tan",
    email: "tan@fitbooking.local",
    phone: "+66 81 234 5678",
    coach_level: "ADVANCED",
    status: "ACTIVE",
    service_mode: "BOTH",
    break_interval: 10,
    years_experience: 6,
    certifications: "ACE CPT, CSCS, First Aid & CPR",
    bio: "Specializing in progressive strength training, barbell technique, and athletic power development.",
    assigned_locations: "Nimman Fitness Club, Central Fitness",
    courses_taught: "Strength & Conditioning, HIIT, Mobility",
    hired_at: "2023-02-01",
    rating: 4.9
  },
  {
    id: "coach-may",
    coach_id: 2,
    coach_no: "1002",
    user_id: 12,
    display_name: "May Suthida",
    username: "coach.may",
    email: "may@fitbooking.local",
    phone: "+66 83 456 7890",
    coach_level: "INTERMEDIATE",
    status: "ACTIVE",
    service_mode: "BOTH",
    break_interval: 10,
    years_experience: 4,
    certifications: "NASM CPT, Yoga Alliance RYT 200",
    bio: "Focuses on mobility, joint longevity, functional wellness, and mindful movement.",
    assigned_locations: "Old City Studio, Nimman Fitness Club",
    courses_taught: "Mobility & Flexibility, Functional Wellness",
    hired_at: "2024-01-15",
    rating: 4.8
  },
  {
    id: "coach-jeff",
    coach_id: 3,
    coach_no: "1003",
    user_id: 13,
    display_name: "Jeff Nopparat",
    username: "coach.jeff",
    email: "jeff@fitbooking.local",
    phone: "+66 86 789 0123",
    coach_level: "MASTER",
    status: "ACTIVE",
    service_mode: "GYM",
    break_interval: 20,
    years_experience: 9,
    certifications: "EXOS XPS, NSCA CSCS, Precision Nutrition L1",
    bio: "Veteran athletic performance coach specializing in functional conditioning and elite physical preparation.",
    assigned_locations: "Central Fitness",
    courses_taught: "HIIT, Power Foundations, Strength & Conditioning",
    hired_at: "2021-08-01",
    rating: 4.9
  },
  {
    id: "coach-ploy",
    coach_id: 4,
    coach_no: "1004",
    user_id: 14,
    display_name: "Ploy Rattanakorn",
    username: "coach.ploy",
    email: "ploy@fitbooking.local",
    phone: "+66 89 234 5671",
    coach_level: "ADVANCED",
    status: "ON_LEAVE",
    service_mode: "BOTH",
    break_interval: 10,
    years_experience: 5,
    certifications: "ACE CPT, Mat Pilates Certified",
    bio: "Pilates, core stability, and athletic mobility for injury recovery and posture correction.",
    assigned_locations: "Old City Studio",
    courses_taught: "Mobility & Flexibility, Pilates Foundations",
    hired_at: "2023-09-10",
    rating: 4.7
  }
];

export const initialAdminLocations: AdminLocationItem[] = [
  {
    id: "gym-nimman",
    gym_id: 1,
    gym_name: "Nimman Fitness Club",
    address: "12/2 Nimmanhaemin Road, Suthep, Chiang Mai",
    district: "NIMMAN",
    phone: "053-000-001",
    facilities: "Free weights floor, Power racks, Olympic platforms, Sauna, Air-conditioned studios",
    opening_time: "06:00",
    closing_time: "22:00",
    latitude: 18.7961,
    longitude: 98.9675,
    is_active: 1,
    features: "8 coaches · Strength, HIIT, Mobility"
  },
  {
    id: "gym-old-city",
    gym_id: 2,
    gym_name: "Old City Studio",
    address: "88 Ratchadamnoen Road, Sri Phum, Chiang Mai",
    district: "OLD_CITY",
    phone: "053-000-002",
    facilities: "Hardwood studio, Resistance bands, Yoga blocks, Functional turf, Kettlebells",
    opening_time: "07:00",
    closing_time: "21:00",
    latitude: 18.7883,
    longitude: 98.9853,
    is_active: 1,
    features: "5 coaches · Mobility, Yoga, Pilates"
  },
  {
    id: "gym-central",
    gym_id: 3,
    gym_name: "Central Fitness",
    address: "999/9 Superhighway, Fa Ham, Chiang Mai",
    district: "CENTRAL",
    phone: "053-000-003",
    facilities: "Olympic weightlifting racks, Dumbbells up to 50kg, Cardio zone, Recovery lounge",
    opening_time: "06:00",
    closing_time: "23:00",
    latitude: 18.8072,
    longitude: 99.0182,
    is_active: 1,
    features: "11 coaches · Full equipment floor"
  },
  {
    id: "gym-hang-dong",
    gym_id: 4,
    gym_name: "Hang Dong Training Room",
    address: "45 Moo 3 Chiang Mai-Hot Road, Hang Dong, Chiang Mai",
    district: "HANG_DONG",
    phone: "053-000-004",
    facilities: "Small group workout space, Kettlebells, TRX straps, Cardio rowers",
    opening_time: "08:00",
    closing_time: "20:00",
    latitude: 18.6892,
    longitude: 98.9213,
    is_active: 0,
    features: "2 coaches · Small group setup"
  }
];

export const initialAdminCourses: AdminCourseItem[] = [
  {
    id: "course-strength",
    course_id: 1,
    course_name: "Strength & Conditioning",
    description: "Compound barbell lifts, hypertrophy accessory work, and core stabilization for functional power.",
    difficulty: "INTERMEDIATE",
    default_duration: 60,
    equipment: "Power racks, barbells, bumper plates, dumbbells, benches",
    is_active: 1,
    assigned_coaches: "Coach Tan, Coach Jeff"
  },
  {
    id: "course-hiit",
    course_id: 2,
    course_name: "HIIT",
    description: "High-intensity interval training focusing on metabolic conditioning and functional agility.",
    difficulty: "BEGINNER",
    default_duration: 45,
    equipment: "Kettlebells, medicine balls, battle ropes, agility ladders",
    is_active: 1,
    assigned_coaches: "Coach Tan, Coach Jeff, Coach May"
  },
  {
    id: "course-mobility",
    course_id: 3,
    course_name: "Mobility & Flexibility",
    description: "Active joint mobility, dynamic stretching, posture rehabilitation, and deep tissue release.",
    difficulty: "BEGINNER",
    default_duration: 60,
    equipment: "Foam rollers, resistance bands, yoga mats, blocks",
    is_active: 1,
    assigned_coaches: "Coach May, Coach Ploy"
  },
  {
    id: "course-power",
    course_id: 4,
    course_name: "Power Foundations",
    description: "Explosive movement mechanics, plyometrics, and Olympic lift transitions.",
    difficulty: "ADVANCED",
    default_duration: 50,
    equipment: "Olympic platforms, chalk, specialty bars",
    is_active: 0,
    assigned_coaches: "Coach Jeff"
  }
];

export const initialAdminPackages: AdminPackageItem[] = [
  {
    id: "package-5-1",
    package_type: "5+1",
    name: "5+1 Sessions",
    paid_sessions: 5,
    bonus_sessions: 1,
    total_sessions: 6,
    price: 3400,
    validity_days: 180,
    description: "5 paid sessions + 1 bonus session. Great introduction for building a routine.",
    terms: "Valid for 180 days from date of purchase. Non-transferable. 24h cancellation applies.",
    status: "Available"
  },
  {
    id: "package-10-3",
    package_type: "10+3",
    name: "10+3 Sessions",
    paid_sessions: 10,
    bonus_sessions: 3,
    total_sessions: 13,
    price: 8970,
    validity_days: 180,
    description: "10 paid sessions + 3 bonus sessions. Our most popular plan for consistent progress.",
    terms: "Valid for 180 days from date of purchase. Non-transferable. 24h cancellation applies.",
    status: "Available"
  },
  {
    id: "package-20-7",
    package_type: "20+7",
    name: "20+7 Sessions",
    paid_sessions: 20,
    bonus_sessions: 7,
    total_sessions: 27,
    price: 17550,
    validity_days: 180,
    description: "20 paid sessions + 7 bonus sessions. Maximum value and long-term athletic development.",
    terms: "Valid for 180 days from date of purchase. Non-transferable. 24h cancellation applies.",
    status: "Available"
  }
];

export const initialAdminKpiRules: AdminKpiRuleItem[] = [
  { level: "BEGINNER", hours: 40, rating: 4.0, retention: 30 },
  { level: "INTERMEDIATE", hours: 60, rating: 4.2, retention: 40 },
  { level: "ADVANCED", hours: 80, rating: 4.4, retention: 50 },
  { level: "MASTER", hours: 100, rating: 4.6, retention: 60 }
];

export const initialAdminKpiRecords: AdminKpiRecordItem[] = [
  {
    id: "coach-tan",
    coach_id: 1,
    coach: "Tan Chaiyaporn",
    level: "ADVANCED",
    hours: 92.5,
    sessions: 74,
    rating: 4.9,
    retention: 68,
    target_hours: 80,
    target_rating: 4.4,
    target_retention: 50,
    achieved: true
  },
  {
    id: "coach-may",
    coach_id: 2,
    coach: "May Suthida",
    level: "INTERMEDIATE",
    hours: 58.5,
    sessions: 47,
    rating: 4.8,
    retention: 45,
    target_hours: 60,
    target_rating: 4.2,
    target_retention: 40,
    achieved: false
  },
  {
    id: "coach-jeff",
    coach_id: 3,
    coach: "Jeff Nopparat",
    level: "MASTER",
    hours: 108.0,
    sessions: 81,
    rating: 4.9,
    retention: 72,
    target_hours: 100,
    target_rating: 4.6,
    target_retention: 60,
    achieved: true
  },
  {
    id: "coach-ploy",
    coach_id: 4,
    coach: "Ploy Rattanakorn",
    level: "ADVANCED",
    hours: 76.0,
    sessions: 61,
    rating: 4.3,
    retention: 41,
    target_hours: 80,
    target_rating: 4.4,
    target_retention: 50,
    achieved: false
  }
];
