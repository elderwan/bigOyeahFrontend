import {
  BookingStatus, CoachLevel, CourseDifficulty, District, PackageType,
  PaymentMethod, PaymentStatus, ServiceMode, SlotStatus, TrainingArea
} from "@/lib/database";

export const labels = {
  booking_status: {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    NO_SHOW: "No-show"
  } satisfies Record<BookingStatus, string>,
  payment_status: {
    UNPAID: "Unpaid",
    PAID: "Paid",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded"
  } satisfies Record<PaymentStatus, string>,
  payment_method: {
    PROMPTPAY: "PromptPay",
    CARD: "Card",
    CASH: "Cash",
    PACKAGE_CREDIT: "Package credit"
  } satisfies Record<PaymentMethod, string>,
  service_mode: {
    GYM: "At the gym",
    HOME: "At home",
    BOTH: "Gym or home"
  } satisfies Record<ServiceMode | "BOTH", string>,
  district: {
    NIMMAN: "Nimman",
    OLD_CITY: "Old City",
    CENTRAL: "Central",
    MAE_RIM: "Mae Rim",
    HANG_DONG: "Hang Dong"
  } satisfies Record<District, string>,
  coach_level: {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
    MASTER: "Master"
  } satisfies Record<CoachLevel, string>,
  difficulty: {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced"
  } satisfies Record<CourseDifficulty, string>,
  package_type: {
    "5+1": "5 sessions + 1 bonus (6 total)",
    "10+3": "10 sessions + 3 bonus (13 total)",
    "20+7": "20 sessions + 7 bonus (27 total)"
  } satisfies Record<PackageType, string>,
  training_area: {
    UPPER_BODY: "Upper body",
    CORE: "Core",
    LOWER_BODY: "Lower body",
    BACK: "Back",
    SHOULDER: "Shoulders",
    FULL_BODY: "Full body"
  } satisfies Record<TrainingArea, string>,
  slot_status: {
    AVAILABLE: "Available",
    BOOKED: "Booked",
    BREAK: "Break",
    BLOCKED: "Unavailable"
  } satisfies Record<SlotStatus, string>
} as const;

export const bookingStatusClasses: Record<BookingStatus, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no-show"
};
