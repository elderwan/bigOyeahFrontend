export type UserRole = "MEMBER" | "COACH" | "ADMIN";
export type UserStatus = "ACTIVE" | "DISABLED";
export type CoachLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MASTER";
export type CoachServiceMode = "GYM" | "HOME" | "BOTH";
export type ServiceMode = "GYM" | "HOME";
export type District =
  | "NIMMAN"
  | "OLD_CITY"
  | "CENTRAL"
  | "MAE_RIM"
  | "HANG_DONG";
export type CourseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type PackageType = "5+1" | "10+3" | "20+7";
export type PackageStatus = "ACTIVE" | "EXHAUSTED" | "EXPIRED" | "CANCELLED";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";
export type PaymentStatus = "UNPAID" | "PAID" | "CANCELLED" | "REFUNDED";
export type PaymentMethod =
  | "PROMPTPAY"
  | "CARD"
  | "CASH"
  | "PACKAGE_CREDIT";
export type CancelledBy = "MEMBER" | "COACH" | "ADMIN" | "SYSTEM";
export type ScheduleStatus = "ACTIVE" | "ARCHIVED";
export type SlotStatus = "AVAILABLE" | "BOOKED" | "BREAK" | "BLOCKED";
export type TrainingArea =
  | "UPPER_BODY"
  | "CORE"
  | "LOWER_BODY"
  | "BACK"
  | "SHOULDER"
  | "FULL_BODY";
export type TrainingType =
  | "STRENGTH"
  | "CARDIO"
  | "FLEXIBILITY"
  | "BALANCE"
  | "POWER";

export interface MembershipLevel {
  level_id: number;
  level_code: string;
  level_name: string;
  min_total_spend: number;
  discount_rate: number;
  sort_order: number;
}

export interface KpiRule {
  coach_level: CoachLevel;
  min_monthly_hours: number;
  min_avg_rating: number;
  min_retention_rate: number;
  updated_at: string;
}

export interface User {
  user_id: number;
  username: string;
  password_hash: string;
  display_name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member {
  member_id: number;
  user_id: number;
  level_id: number;
  total_spend: number;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goal: string | null;
  registered_at: string;
  updated_at: string;
}

export interface Coach {
  coach_id: number;
  coach_no: string;
  user_id: number;
  coach_level: CoachLevel;
  bio: string | null;
  service_mode: CoachServiceMode;
  break_interval: 10 | 20 | 30;
  years_experience: number | null;
  certifications: string | null;
  avatar_url: string | null;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  gym_id: number;
  gym_name: string;
  address: string;
  district: District;
  phone: string | null;
  facilities: string | null;
  opening_time: string;
  closing_time: string;
  latitude: number | null;
  longitude: number | null;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface Course {
  course_id: number;
  course_name: string;
  description: string | null;
  equipment: string | null;
  difficulty: CourseDifficulty;
  default_duration: number;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface CoachService {
  coach_service_id: number;
  coach_id: number;
  gym_id: number;
  is_home_service: 0 | 1;
  service_area: District | null;
  is_active: 0 | 1;
  created_at: string;
}

export interface CoachCourse {
  coach_id: number;
  course_id: number;
  price_per_session: number;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface CoachWeeklyTemplate {
  template_id: number;
  coach_id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface ScheduleRegistry {
  schedule_id: number;
  coach_id: number;
  table_name: string;
  generated_until: string | null;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface MemberPackage {
  package_id: number;
  member_id: number;
  package_type: PackageType;
  total_sessions: number;
  remaining_sessions: number;
  price: number;
  purchase_date: string;
  expire_date: string;
  status: PackageStatus;
  created_at: string;
  updated_at: string;
}

export interface PackageCatalogEntry {
  package_type: PackageType;
  paid_sessions: number;
  bonus_sessions: number;
  price: number;
  validity_days: number;
  is_active: number;
}

export interface MemberPackageWithPayment extends MemberPackage {
  order_id: number | null;
  payment_status: PaymentStatus | null;
  payment_time: string | null;
}

export interface Booking {
  booking_id: number;
  member_id: number;
  coach_id: number;
  course_id: number;
  gym_id: number | null;
  package_id: number | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  break_minutes: number;
  service_mode: ServiceMode;
  service_district: District | null;
  service_address: string | null;
  price: number;
  status: BookingStatus;
  expires_at: string | null;
  cancelled_by: CancelledBy | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  order_id: number;
  order_type: "BOOKING" | "PACKAGE";
  booking_id: number | null;
  package_id: number | null;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_time: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewCoach {
  review_coach_id: number;
  booking_id: number;
  reviewer_id: number;
  rating_professional: number;
  rating_communication: number;
  rating_punctuality: number;
  rating_effectiveness: number;
  avg_rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewMember {
  review_member_id: number;
  booking_id: number;
  coach_id: number;
  member_id: number;
  completion_score: number;
  proficiency_score: number;
  training_area: TrainingArea;
  training_type: TrainingType;
  coach_note: string | null;
  created_at: string;
}

export interface FitnessProfile {
  profile_id: number;
  member_id: number;
  strongest_area: TrainingArea | null;
  weakest_area: TrainingArea | null;
  strongest_score: number | null;
  weakest_score: number | null;
  review_count: number;
  updated_at: string;
}

export interface CoachKpiRecord {
  kpi_record_id: number;
  coach_id: number;
  kpi_year: number;
  kpi_month: number;
  total_hours: number;
  completed_sessions: number;
  avg_rating: number | null;
  retention_rate: number | null;
  target_hours: number;
  target_avg_rating: number;
  target_retention_rate: number;
  is_achieved: 0 | 1;
  calculated_at: string;
}

export interface AuditLog {
  log_id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  detail: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface CoachScheduleSlot {
  slot_start: string;
  slot_year: number;
  slot_month: number;
  slot_day: number;
  slot_hour: number;
  slot_minute: number;
  status: SlotStatus;
  booking_id: number | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
}
