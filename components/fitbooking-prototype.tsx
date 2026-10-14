"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  House,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Star,
  UserRound,
  Wallet,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  clearDemoSession,
  PublicDemoAccount,
  readDemoSession,
  registerDemoMember,
  saveDemoSession,
  signInDemoUser,
  updateDemoMember
} from "@/lib/demo-auth";
import {
  apiGetMemberProfile,
  apiGetMemberBookings,
  apiGetMemberPackages,
  apiGetPackagesCatalog,
  apiCancelBooking,
  apiCreateReview,
  getAccessToken,
  formatApiTime,
  ApiError
} from "@/lib/api-client";
import { RoleWorkspace } from "@/components/fitbooking-workspaces";
import {
  MemberPreviewBooking,
  preview_coach_listings,
  preview_courses,
  preview_member_bookings,
  toBusinessDateTime,
  preview_membership_levels
} from "@/lib/member-preview-data";
import {
  MemberPackage,
  PackageCatalogEntry,
  PackageType,
  ReviewCoach
} from "@/lib/database";

// Modularized components
import { Brand } from "@/components/common/Brand";
import { SignInScreen, SignUpScreen } from "@/components/common/AuthScreens";
import { Conversation } from "@/components/common/Conversation";
import { HomeScreen } from "@/components/member/HomeScreen";
import { ExploreScreen } from "@/components/member/ExploreScreen";
import { CoachProfile } from "@/components/member/CoachProfile";
import { CoursesScreen } from "@/components/member/CoursesScreen";
import { BookingScreen } from "@/components/member/BookingScreen";
import { CheckoutScreen } from "@/components/member/CheckoutScreen";
import { SuccessScreen } from "@/components/member/SuccessScreen";
import { BookingsScreen } from "@/components/member/BookingsScreen";
import { BookingDetailScreen } from "@/components/member/BookingDetailScreen";
import { PackagesScreen } from "@/components/member/PackagesScreen";
import { PackageDetailScreen } from "@/components/member/PackageDetailScreen";
import { ReviewsScreen } from "@/components/member/ReviewsScreen";
import { ProgressScreen } from "@/components/member/ProgressScreen";
import { ProfileScreen } from "@/components/member/ProfileScreen";

export type Screen =
  | "welcome"
  | "home"
  | "explore"
  | "coach"
  | "courses"
  | "booking"
  | "checkout"
  | "success"
  | "bookings"
  | "packages"
  | "reviews"
  | "packageDetail"
  | "progress"
  | "profile"
  | "signin"
  | "signup"
  | "trainerHome"
  | "trainerSchedule"
  | "trainerMessages"
  | "messages"
  | "trainerClients"
  | "bookingDetail"
  | "trainerProgress"
  | "admin"
  | "adminBookings"
  | "adminMembers"
  | "adminTrainers"
  | "adminLocations"
  | "adminCourses"
  | "adminPackages"
  | "adminKpi"
  | "adminReports"
  | "adminAudit"
  | "adminSettings";

const screenNames: Record<Screen, string> = {
  welcome: "Welcome",
  home: "Home",
  explore: "Explore coaches",
  coach: "Coach profile",
  courses: "Courses",
  booking: "Booking",
  checkout: "Checkout",
  success: "Booking confirmation",
  bookings: "My bookings",
  packages: "Packages",
  packageDetail: "Package details",
  bookingDetail: "Booking details",
  reviews: "Reviews",
  progress: "Progress",
  profile: "Profile",
  signin: "Sign in",
  signup: "Create an account",
  trainerHome: "Trainer overview",
  trainerSchedule: "Trainer schedule",
  trainerMessages: "Trainer messages",
  messages: "Messages",
  trainerClients: "Trainer clients",
  trainerProgress: "Trainer progress",
  admin: "Admin workspace",
  adminBookings: "Booking management",
  adminMembers: "Member management",
  adminTrainers: "Trainer management",
  adminLocations: "Location management",
  adminCourses: "Course management",
  adminPackages: "Package management",
  adminKpi: "KPI management",
  adminReports: "Reports",
  adminAudit: "Audit log",
  adminSettings: "Settings"
};

const screens = Object.keys(screenNames) as Screen[];
const memberScreens: Screen[] = [
  "home",
  "explore",
  "coach",
  "courses",
  "booking",
  "checkout",
  "success",
  "bookings",
  "packages",
  "packageDetail",
  "bookingDetail",
  "reviews",
  "progress",
  "profile",
  "messages"
];
const trainerScreens: Screen[] = [
  "trainerHome",
  "trainerSchedule",
  "trainerMessages",
  "trainerClients",
  "trainerProgress"
];
const adminScreens: Screen[] = [
  "admin",
  "adminBookings",
  "adminMembers",
  "adminTrainers",
  "adminLocations",
  "adminCourses",
  "adminPackages",
  "adminKpi",
  "adminReports",
  "adminAudit",
  "adminSettings"
];

function routeScreen(): Screen {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const hash = (typeof window !== "undefined" ? window.location.hash.slice(1) : "") as Screen;
  if (path === "/signin") return "signin";
  if (path === "/signup") return "signup";
  if (path === "/trainer") return trainerScreens.includes(hash) ? hash : "trainerHome";
  if (path === "/admin") return adminScreens.includes(hash) ? hash : "admin";
  if (path === "/member") return memberScreens.includes(hash) ? hash : "home";
  if (screens.includes(hash)) return hash;
  return "welcome";
}

function routePath(screen: Screen): string {
  if (screen === "welcome") return "/";
  if (screen === "signin") return "/signin";
  if (screen === "signup") return "/signup";
  if (trainerScreens.includes(screen))
    return `/trainer${screen === "trainerHome" ? "" : `#${screen}`}`;
  if (adminScreens.includes(screen))
    return `/admin${screen === "admin" ? "" : `#${screen}`}`;
  return `/member${screen === "home" ? "" : `#${screen}`}`;
}

function memberPackageFromBooking(row: any): MemberPackage | null {
  if (
    row.member_package_id == null ||
    row.member_package_type == null ||
    row.member_package_total_sessions == null ||
    row.member_package_remaining_sessions == null ||
    row.member_package_price == null
  ) {
    return null;
  }

  return {
    package_id: Number(row.member_package_id),
    member_id: Number(row.member_id),
    package_type: row.member_package_type,
    total_sessions: Number(row.member_package_total_sessions),
    remaining_sessions: Number(row.member_package_remaining_sessions),
    price: Number(row.member_package_price),
    purchase_date: String(row.member_package_purchase_date),
    expire_date: String(row.member_package_expire_date),
    status: row.member_package_status,
    created_at: String(row.member_package_created_at),
    updated_at: String(row.member_package_updated_at)
  };
}

function requiredRole(screen: Screen): PublicDemoAccount["role"] | null {
  if (trainerScreens.includes(screen)) return "COACH";
  if (adminScreens.includes(screen)) return "ADMIN";
  if (memberScreens.includes(screen)) return "MEMBER";
  return null;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button className={`button button-primary ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function FitBookingPrototype() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [toast, setToast] = useState("");
  const [account, setAccount] = useState<PublicDemoAccount | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>("10+3");
  const [search, setSearch] = useState("");
  const [bookingTab, setBookingTab] = useState("Upcoming");
  const [coach_id, setCoachId] = useState(1);
  const [course_id, setCourseId] = useState(1);
  const [booking_date, setBookingDate] = useState("");
  const [start_time, setStartTime] = useState("");
  const [bookingSelectionValid, setBookingSelectionValid] = useState(false);
  const [service_mode, setServiceMode] = useState<"GYM" | "HOME">("GYM");
  const [district, setDistrict] = useState("NIMMAN");
  const [service_address, setServiceAddress] = useState("");
  const [package_type, setPackageChoice] = useState<PackageType | null>(null);
  const [level_id, setLevelId] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(["Tan Chaiyaporn"]);
  const [rating, setRating] = useState(5);
  const [reviewTags, setReviewTags] = useState<string[]>(["Motivating", "Professional", "On time"]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [metricTab, setMetricTab] = useState("Overview");
  const [profileTab, setProfileTab] = useState("Personal information");
  const [selectedBooking, setSelectedBooking] = useState<MemberPreviewBooking | null>(null);
  const [bookingDetailReturn, setBookingDetailReturn] = useState<Screen>("bookings");
  const [checkoutBooking, setCheckoutBooking] = useState<MemberPreviewBooking | null>(null);
  const [lastPaymentSummary, setLastPaymentSummary] = useState("");

  // Initialize preview bookings: if logged into a live account, default to empty []
  const [previewBookings, setPreviewBookings] = useState<MemberPreviewBooking[]>(() => {
    if (typeof window !== "undefined" && getAccessToken()) return [];
    return preview_member_bookings;
  });
  const [memberPackages, setMemberPackages] = useState<MemberPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesError, setPackagesError] = useState("");
  const [packageCatalog, setPackageCatalog] = useState<PackageCatalogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const refreshMemberPackages = useCallback(async () => {
    const sessionToken = getAccessToken();
    if (!sessionToken) {
      setMemberPackages([]);
      setPackagesLoading(false);
      setPackagesError("");
      return;
    }

    setPackagesLoading(true);
    setPackagesError("");
    try {
      const rows = await apiGetMemberPackages();
      if (getAccessToken() === sessionToken) {
        setMemberPackages(rows);
        setPreviewBookings((current) =>
          current.map((booking) => {
            const linkedPackage = booking.booking.package_id
              ? rows.find((item) => item.package_id === booking.booking.package_id)
              : undefined;
            return linkedPackage ? { ...booking, member_package: linkedPackage } : booking;
          })
        );
        setSelectedBooking((current) => {
          if (!current?.booking.package_id) return current;
          const linkedPackage = rows.find(
            (item) => item.package_id === current.booking.package_id
          );
          return linkedPackage ? { ...current, member_package: linkedPackage } : current;
        });
      }
    } catch (issue) {
      if (getAccessToken() === sessionToken) {
        const message =
          issue instanceof Error ? issue.message : "Your package balances could not be loaded.";
        setPackagesError(message);
      }
      throw issue;
    } finally {
      if (getAccessToken() === sessionToken) setPackagesLoading(false);
    }
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useCallback(
    (nextScreen: Screen | string) => {
      const target = nextScreen as Screen;
      const role = requiredRole(target);
      if (role && account?.role !== role) {
        setScreen("signin");
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", "/signin");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        notify(
          account
            ? "That workspace is not available for this account type."
            : "Sign in to open your FitBooking workspace."
        );
        return;
      }
      setScreen(target);
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", routePath(target));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [account, notify]
  );

  const go = useCallback((target: Screen) => () => navigate(target), [navigate]);

  useEffect(() => {
    apiGetPackagesCatalog()
      .then((catalog) => {
        setPackageCatalog(catalog.filter((entry) => Number(entry.is_active) === 1));
        setCatalogError("");
      })
      .catch((issue) => {
        setCatalogError(
          issue instanceof Error ? issue.message : "Package offers could not be loaded."
        );
      })
      .finally(() => setCatalogLoading(false));

    const safetyTimer = setTimeout(() => setAuthReady(true), 1500);
    try {
      const activeAccount = readDemoSession();
      setAccount(activeAccount);

      const sessionToken = getAccessToken();
      if (sessionToken) {
        refreshMemberPackages().catch((issue) => {
          if (getAccessToken() === sessionToken) {
            setToast(
              issue instanceof Error
                ? `Your account is ready, but package balances could not be loaded: ${issue.message}`
                : "Your account is ready, but package balances could not be loaded."
            );
          }
        });

        apiGetMemberProfile()
          .then((profile) => {
            if (getAccessToken() !== sessionToken) return;
            if (profile.level_id) {
              setLevelId(profile.level_id);
            }
            setAccount((current) => {
              if (!current) return current;
              const merged: PublicDemoAccount = {
                ...current,
                display_name: profile.display_name || current.display_name,
                email: profile.email || current.email,
                phone: profile.phone || current.phone,
                gender: profile.gender,
                birth_date: profile.birth_date,
                height_cm: profile.height_cm,
                weight_kg: profile.weight_kg,
                fitness_goal: profile.fitness_goal,
                member_id: profile.member_id,
                level_id: profile.level_id,
                level_code: profile.level_code,
                level_name: profile.level_name,
                discount_rate: profile.discount_rate,
                total_spend: profile.total_spend,
                is_live_backend: true
              };
              saveDemoSession(merged);
              return merged;
            });
          })
          .catch((err) => {
            if (getAccessToken() !== sessionToken) return;
            if (err instanceof ApiError && err.status === 401) {
              clearDemoSession();
              setAccount(null);
              setScreen("signin");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/signin");
              setToast("Your session has expired. Please sign in again.");
            }
          });

        apiGetMemberBookings()
          .then((bookingsList) => {
            if (getAccessToken() !== sessionToken) return;
            if (Array.isArray(bookingsList)) {
              setPreviewBookings(
                bookingsList.map((b: any, index: number) => {
                  const bookingDate = String(b.booking_date);
                  const startTime = formatApiTime(b.start_time);
                  const endTime = formatApiTime(b.end_time);
                  return {
                    booking: {
                      booking_id: b.booking_id,
                      member_id: b.member_id ?? 1,
                      coach_id: b.coach_id ?? 1,
                      course_id: b.course_id ?? 1,
                      gym_id: b.gym_id ?? null,
                      package_id: b.package_id ?? null,
                      booking_date: bookingDate,
                      start_time: startTime,
                      end_time: endTime,
                      duration_minutes: b.duration_minutes ?? 60,
                      break_minutes: b.break_minutes ?? 10,
                      service_mode: b.service_mode || "GYM",
                      service_district: b.service_district || null,
                      service_address: b.service_address || null,
                      price: Number(b.price ?? 800),
                      status: b.status || "CONFIRMED",
                      expires_at: b.expires_at || null,
                      cancelled_by: b.cancelled_by ?? null,
                      cancel_reason: b.cancel_reason ?? null,
                      cancelled_at: b.cancelled_at ?? null,
                      completed_at: b.completed_at ?? null,
                      created_at: b.created_at || new Date().toISOString(),
                      updated_at: b.updated_at || new Date().toISOString()
                    },
                    course: {
                      course_id: b.course_id ?? 1,
                      course_name: b.course_name || "Strength & Conditioning",
                      description: b.course_description || "Custom session with coach",
                      difficulty: b.course_difficulty || "INTERMEDIATE",
                      default_duration: b.course_default_duration ?? b.duration_minutes ?? 60,
                      equipment: b.course_equipment || "Standard weights",
                      is_active: 1,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    },
                    coach: {
                      coach_id: b.coach_id ?? 1,
                      coach_no: "1001",
                      user_id: 3,
                      avatar_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
                      coach_level: b.coach_level || "ADVANCED",
                      bio: "Dedicated strength and conditioning coach",
                      service_mode: b.coach_service_mode || "BOTH",
                      years_experience: 6,
                      certifications: "NASM-CPT",
                      break_interval: b.break_interval ?? 10,
                      status: "ACTIVE",
                      hired_at: "2020-04-01",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    },
                    display_name: b.coach_name || "Tan Chaiyaporn",
                    gym: b.service_mode === "GYM" && b.gym_id != null ? {
                      gym_id: b.gym_id,
                      gym_name: b.gym_name || "Nimman Fitness Club",
                      address: b.gym_address || "Nimman Soi 9, Suthep, Mueang Chiang Mai",
                      district: b.gym_district || "NIMMAN",
                      phone: "+6653001001",
                      facilities: "Full weights, lockers, showers",
                      opening_time: "06:00:00",
                      closing_time: "22:00:00",
                      latitude: 18.7961,
                      longitude: 98.9673,
                      is_active: 1,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    } : null,
                    orders: [
                      {
                        order_id: b.order_id ?? 1000 + index,
                        order_no: `ORD-${b.order_id ?? b.booking_id}`,
                        booking_id: b.booking_id,
                        package_id: b.order_package_id ?? null,
                        order_type: "BOOKING",
                        total_amount: Number(b.order_total_amount ?? b.price ?? 0),
                        discount: Number(b.order_discount ?? 0),
                        final_amount: Number(b.order_final_amount ?? b.price ?? 0),
                        payment_method: b.payment_method ?? null,
                        payment_status:
                          b.payment_status ??
                          (b.status === "CONFIRMED" || b.status === "COMPLETED" ? "PAID" : "UNPAID"),
                        payment_time: b.payment_time ?? null,
                        refunded_at: b.refunded_at ?? null,
                        created_at: b.order_created_at || b.created_at || new Date().toISOString(),
                        updated_at: b.order_updated_at || b.updated_at || b.created_at || new Date().toISOString()
                      }
                    ],
                    member_package: memberPackageFromBooking(b),
                    review_coach: null,
                    ui: {
                      coach_image: "photo-1583454110551-21f2fa2afe61"
                    }
                  };
                })
              );
            }
          })
          .catch((issue) => {
            if (getAccessToken() !== sessionToken) return;
            setToast(
              issue instanceof Error
                ? `Your account is ready, but bookings could not be loaded: ${issue.message}`
                : "Your account is ready, but bookings could not be loaded."
            );
          });
      }
    } catch (issue) {
      setToast(issue instanceof Error ? issue.message : "The saved profile could not be read.");
      setScreen("signin");
    } finally {
      setAuthReady(true);
    }
    return () => clearTimeout(safetyTimer);
  }, [refreshMemberPackages]);

  useEffect(() => {
    if (!authReady) return;
    const readRoute = () => {
      const requested = routeScreen();
      const next =
        requested === "bookingDetail" && !selectedBooking ? "bookings" : requested;
      const role = requiredRole(next);
      if (role && account?.role !== role) {
        setScreen("signin");
        window.history.replaceState(null, "", "/signin");
        setToast(
          account
            ? "That workspace is not available for this account type."
            : "Sign in to open your FitBooking workspace."
        );
        return;
      }
      setScreen(next);
      if (next !== requested) {
        window.history.replaceState(null, "", routePath(next));
      }
    };
    readRoute();
    window.addEventListener("hashchange", readRoute);
    window.addEventListener("popstate", readRoute);
    return () => {
      window.removeEventListener("hashchange", readRoute);
      window.removeEventListener("popstate", readRoute);
    };
  }, [authReady, account, selectedBooking]);

  const enterWorkspace = (nextAccount: PublicDemoAccount) => {
    setAccount(nextAccount);
    // API rule: Navigate to /member#profile after member login
    const target: Screen =
      nextAccount.role === "ADMIN"
        ? "admin"
        : nextAccount.role === "COACH"
        ? "trainerHome"
        : "profile";
    setScreen(target);
    window.history.pushState(null, "", routePath(target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signOut = () => {
    try {
      clearDemoSession();
      setAccount(null);
      setPreviewBookings(preview_member_bookings);
      setMemberPackages([]);
      setPackagesError("");
      setScreen("signin");
      window.history.pushState(null, "", "/signin");
      setToast("You’re signed out.");
    } catch (issue) {
      setToast(issue instanceof Error ? issue.message : "We couldn’t sign you out.");
    }
  };

  const handleSignIn = async (
    identifier: string,
    password: string,
    role: PublicDemoAccount["role"]
  ) => {
    const nextAccount = await signInDemoUser(identifier, password, role);
    setToast("");
    saveDemoSession(nextAccount);
    if (nextAccount.role === "MEMBER") {
      setPreviewBookings([]);
      if (getAccessToken()) {
        try {
          const bookingsList = await apiGetMemberBookings();
          if (Array.isArray(bookingsList)) {
            setPreviewBookings(
              bookingsList.map((b: any, index: number) => {
              const bookingDate = String(b.booking_date);
              const startTime = formatApiTime(b.start_time);
              const endTime = formatApiTime(b.end_time);
              return {
                booking: {
                  booking_id: b.booking_id,
                  member_id: b.member_id ?? nextAccount.member_id ?? 1,
                  coach_id: b.coach_id ?? 1,
                  course_id: b.course_id ?? 1,
                  gym_id: b.gym_id ?? null,
                  package_id: b.package_id ?? null,
                  booking_date: bookingDate,
                  start_time: startTime,
                  end_time: endTime,
                  duration_minutes: b.duration_minutes ?? 60,
                  break_minutes: b.break_minutes ?? 10,
                  service_mode: b.service_mode || "GYM",
                  service_district: b.service_district || null,
                  service_address: b.service_address || null,
                  price: Number(b.price ?? 800),
                  status: b.status || "CONFIRMED",
                  expires_at: b.expires_at || null,
                  cancelled_by: b.cancelled_by ?? null,
                  cancel_reason: b.cancel_reason ?? null,
                  cancelled_at: b.cancelled_at ?? null,
                  completed_at: b.completed_at ?? null,
                  created_at: b.created_at || new Date().toISOString(),
                  updated_at: b.updated_at || new Date().toISOString()
                },
                course: {
                  course_id: b.course_id ?? 1,
                  course_name: b.course_name || "Strength & Conditioning",
                  description: b.course_description || "Custom session with coach",
                  difficulty: b.course_difficulty || "INTERMEDIATE",
                  default_duration: b.course_default_duration ?? b.duration_minutes ?? 60,
                  equipment: b.course_equipment || "Standard weights",
                  is_active: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                coach: {
                  coach_id: b.coach_id ?? 1,
                  coach_no: "1001",
                  user_id: 3,
                  avatar_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
                  coach_level: b.coach_level || "ADVANCED",
                  bio: "Dedicated strength and conditioning coach",
                  service_mode: b.coach_service_mode || "BOTH",
                  years_experience: 6,
                  certifications: "NASM-CPT",
                  break_interval: b.break_interval ?? 10,
                  status: "ACTIVE",
                  hired_at: "2020-04-01",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                display_name: b.coach_name || "Tan Chaiyaporn",
                gym: b.service_mode === "GYM" && b.gym_id != null ? {
                  gym_id: b.gym_id,
                  gym_name: b.gym_name || "Nimman Fitness Club",
                  address: b.gym_address || "Nimman Soi 9, Suthep, Mueang Chiang Mai",
                  district: b.gym_district || "NIMMAN",
                  phone: "+6653001001",
                  facilities: "Full weights, lockers, showers",
                  opening_time: "06:00:00",
                  closing_time: "22:00:00",
                  latitude: 18.7961,
                  longitude: 98.9673,
                  is_active: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } : null,
                orders: [
                  {
                    order_id: b.order_id ?? 1000 + index,
                    order_no: `ORD-${b.order_id ?? b.booking_id}`,
                    booking_id: b.booking_id,
                    package_id: b.order_package_id ?? null,
                    order_type: "BOOKING",
                    total_amount: Number(b.order_total_amount ?? b.price ?? 0),
                    discount: Number(b.order_discount ?? 0),
                    final_amount: Number(b.order_final_amount ?? b.price ?? 0),
                    payment_method: b.payment_method ?? null,
                    payment_status:
                      b.payment_status ??
                      (b.status === "CONFIRMED" || b.status === "COMPLETED" ? "PAID" : "UNPAID"),
                    payment_time: b.payment_time ?? null,
                    refunded_at: b.refunded_at ?? null,
                    created_at: b.order_created_at || b.created_at || new Date().toISOString(),
                    updated_at: b.order_updated_at || b.updated_at || b.created_at || new Date().toISOString()
                  }
                ],
                member_package: memberPackageFromBooking(b),
                review_coach: null,
                ui: {
                  coach_image: "photo-1583454110551-21f2fa2afe61"
                }
                };
              })
            );
          }
        } catch (issue) {
          notify(
            issue instanceof Error
              ? `Signed in, but bookings could not be loaded: ${issue.message}`
              : "Signed in, but bookings could not be loaded."
          );
        }
        await refreshMemberPackages().catch((issue) => {
          notify(
            issue instanceof Error
              ? `Signed in, but package balances could not be loaded: ${issue.message}`
              : "Signed in, but package balances could not be loaded."
          );
        });
      } else {
        setMemberPackages([]);
      }
    }
    enterWorkspace(nextAccount);
  };

  const handleRegister = async (details: Parameters<typeof registerDemoMember>[0]) => {
    const nextAccount = await registerDemoMember(details);
    saveDemoSession(nextAccount);
    setPreviewBookings([]);
    if (getAccessToken()) {
      await refreshMemberPackages().catch((issue) => {
        notify(
          issue instanceof Error
            ? `Account created, but package balances could not be loaded: ${issue.message}`
            : "Account created, but package balances could not be loaded."
        );
      });
    }
    enterWorkspace(nextAccount);
    setToast("Account created successfully! Welcome to FitBooking.");
  };

  const updateProfile = async (
    changes: Partial<
      Pick<
        PublicDemoAccount,
        | "display_name"
        | "email"
        | "phone"
        | "birth_date"
        | "gender"
        | "height_cm"
        | "weight_kg"
        | "fitness_goal"
      >
    >
  ) => {
    if (!account) return;
    try {
      const updated = await updateDemoMember(account.user_id, changes);
      saveDemoSession(updated);
      setAccount(updated);
      notify("Your profile details have been saved.");
    } catch (issue) {
      notify(issue instanceof Error ? issue.message : "Your profile could not be saved.");
    }
  };

  const toggleFavorite = (name: string) =>
    setFavorites((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );

  const openBookingDetail = (item: MemberPreviewBooking, returnTo: Screen) => {
    setSelectedBooking(item);
    setBookingDetailReturn(returnTo);
    navigate("bookingDetail");
  };

  const submitBookingReview = (
    item: MemberPreviewBooking,
    reviewFields: Pick<
      ReviewCoach,
      | "rating_professional"
      | "rating_communication"
      | "rating_punctuality"
      | "rating_effectiveness"
      | "comment"
    >
  ) => {
    const review_coach: ReviewCoach = {
      ...reviewFields,
      review_coach_id:
        Math.max(0, ...previewBookings.map((entry) => entry.review_coach?.review_coach_id || 0)) + 1,
      booking_id: item.booking.booking_id,
      reviewer_id: item.booking.member_id,
      avg_rating:
        (reviewFields.rating_professional +
          reviewFields.rating_communication +
          reviewFields.rating_punctuality +
          reviewFields.rating_effectiveness) /
        4,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " ")
    };
    setPreviewBookings((current) =>
      current.map((entry) =>
        entry.booking.booking_id === item.booking.booking_id ? { ...entry, review_coach } : entry
      )
    );
    setSelectedBooking((current) =>
      current?.booking.booking_id === item.booking.booking_id ? { ...current, review_coach } : current
    );
    if (getAccessToken()) {
      apiCreateReview({
        booking_id: item.booking.booking_id,
        rating_professional: reviewFields.rating_professional,
        rating_communication: reviewFields.rating_communication,
        rating_punctuality: reviewFields.rating_punctuality,
        rating_effectiveness: reviewFields.rating_effectiveness,
        comment: reviewFields.comment || undefined
      })
        .then(() => {
          notify("Your review has been saved to the database.");
        })
        .catch((err) => {
          notify(`Review notice: ${err.message}`);
        });
    } else {
      notify("Your review is saved in this preview.");
    }
  };

  const cancelMemberBooking = (item: MemberPreviewBooking, cancel_reason: string) => {
    const now = new Date();
    const startDateTime = toBusinessDateTime(item.booking.booking_date, item.booking.start_time);
    const freeCancel = startDateTime.getTime() - now.getTime() >= 24 * 60 * 60 * 1000;
    const updatedBooking = {
      ...item.booking,
      status: "CANCELLED" as const,
      cancelled_by: "MEMBER" as const,
      cancel_reason,
      cancelled_at: now.toISOString().slice(0, 19).replace("T", " "),
      updated_at: now.toISOString().slice(0, 19).replace("T", " ")
    };
    const updatedItem = {
      ...item,
      booking: updatedBooking,
      orders: item.orders.map((order) =>
        freeCancel && order.payment_status === "PAID"
          ? { ...order, payment_status: "REFUNDED" as const, refunded_at: updatedBooking.cancelled_at }
          : freeCancel && order.payment_status === "UNPAID"
          ? { ...order, payment_status: "CANCELLED" as const }
          : order
      ),
      member_package:
        freeCancel && item.member_package
          ? {
              ...item.member_package,
              remaining_sessions: Math.min(
                item.member_package.total_sessions,
                item.member_package.remaining_sessions + 1
              )
            }
          : item.member_package
    };
    setPreviewBookings((current) =>
      current.map((entry) =>
        entry.booking.booking_id === item.booking.booking_id ? updatedItem : entry
      )
    );
    setSelectedBooking(updatedItem);
    if (getAccessToken()) {
      apiCancelBooking(item.booking.booking_id, cancel_reason)
        .then(() => {
          notify(
            freeCancel
              ? "Session cancelled and updated on the backend. Full refund processed."
              : "Session cancelled and updated on the backend."
          );
        })
        .catch((err) => {
          notify(`Cancellation: ${err.message}`);
        });
    } else {
      notify(
        freeCancel
          ? "Session cancelled. The preview reflects a full refund."
          : "Session cancelled. This preview reflects the no-refund window."
      );
    }
  };

  const selectCoachListing = (selected_coach_id: number, selected_course_id: number) => {
    const listing = preview_coach_listings.find((item) => item.coach.coach_id === selected_coach_id);
    setCoachId(selected_coach_id);
    setCourseId(selected_course_id);
    setBookingDate("");
    setStartTime("");
    setBookingSelectionValid(false);
    setServiceMode(listing?.coach.service_mode === "HOME" ? "HOME" : "GYM");
    setDistrict(listing?.coach_service.service_area || listing?.gym.district || "NIMMAN");
    setServiceAddress("");
  };

  const selectCourse = (selected_course_id: number) => {
    setCourseId(selected_course_id);
    setBookingDate("");
    setStartTime("");
    setBookingSelectionValid(false);
  };

  const currentListing =
    preview_coach_listings.find((item) => item.coach.coach_id === coach_id) ||
    preview_coach_listings[0];
  const currentCourse =
    preview_courses.find((item) => item.course_id === course_id) || preview_courses[0];
  const membership_level =
    preview_membership_levels.find((item) => item.level_id === level_id) ||
    preview_membership_levels[0];

  const toggleTag = (tag: string) =>
    setReviewTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );

  if (!authReady) {
    return (
      <main className="auth-loading">
        <Brand />
        <p>Opening your FitBooking preview…</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "10px", justifyContent: "center" }}>
          <a
            href="/signin"
            className="button button-glass"
            style={{
              fontSize: "12px",
              padding: "6px 14px",
              textDecoration: "none",
              borderRadius: "999px"
            }}
          >
            Sign in &rarr;
          </a>
          <button
            type="button"
            className="button button-glass"
            style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "999px" }}
            onClick={() => setAuthReady(true)}
          >
            Enter now
          </button>
        </div>
      </main>
    );
  }

  if (screen === "signin")
    return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  if (screen === "signup")
    return <SignUpScreen onRegister={handleRegister} onNavigate={(target) => navigate(target as Screen)} />;
  if (
    screen === "trainerHome" ||
    screen === "trainerSchedule" ||
    screen === "trainerMessages" ||
    screen === "trainerClients" ||
    screen === "trainerProgress"
  ) {
    if (account?.role === "COACH")
      return (
        <RoleWorkspace
          role="COACH"
          screen={screen}
          account={account}
          navigate={(target) => navigate(target as Screen)}
          onSignOut={signOut}
        />
      );
    return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  }
  if (screen === "admin" || adminScreens.includes(screen)) {
    if (account?.role === "ADMIN")
      return (
        <RoleWorkspace
          role="ADMIN"
          screen={screen}
          account={account}
          navigate={(target) => navigate(target as Screen)}
          onSignOut={signOut}
        />
      );
    return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  }

  if (screen === "welcome") {
    return (
      <main className="welcome-layout">
        <aside className="welcome-brand-panel">
          <Brand />
          <div className="welcome-brand-note">
            <p>Personal training that fits your life.</p>
            <span>Made for Chiang Mai.</span>
          </div>
          <div className="welcome-line-art">
            <span>CHIANG MAI</span>
            <small>18° 47′ N · 98° 59′ E</small>
          </div>
          <div className="welcome-values">
            <Leaf size={16} />
            <span>Better trainers. Healthier you.</span>
          </div>
        </aside>
        <section className="welcome-main">
          <div
            className="welcome-photo"
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(8,35,27,.04) 18%,rgba(5,31,23,.81) 100%),url("https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=85")`
            }}
          >
            <div className="welcome-top">
              <Brand light />
              <span>CHIANG MAI · THAILAND</span>
            </div>
            <div className="welcome-copy">
              <Pill className="pill-glass">
                <MapPin size={13} /> Your city, your pace
              </Pill>
              <h1>
                Train your way.
                <br />
                Live your best.
              </h1>
              <p>Find your person. Make a plan. Feel the difference.</p>
              <div className="welcome-actions">
                <PrimaryButton
                  onClick={go(
                    account
                      ? account.role === "ADMIN"
                        ? "admin"
                        : account.role === "COACH"
                        ? "trainerHome"
                        : "home"
                      : "signin"
                  )}
                >
                  {account ? "Continue to your workspace" : "Sign in"} <ArrowRight size={17} />
                </PrimaryButton>
                <button className="button button-glass" onClick={() => navigate("signup")}>
                  Create a member account
                </button>
              </div>
              <button className="welcome-existing-link" onClick={go("signin")}>
                <LogIn size={14} /> Sign in with a demo profile
              </button>
            </div>
            <div className="welcome-caption">
              <span>01 / 04</span>
              <span>Chiang Mai moves differently.</span>
              <span className="welcome-dots">
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const primaryNav: { key: Screen; label: string; icon: typeof House }[] = [
    { key: "home", label: "Home", icon: House },
    { key: "explore", label: "Explore", icon: Search },
    { key: "bookings", label: "Bookings", icon: CalendarDays },
    { key: "progress", label: "Progress", icon: BarChart3 },
    { key: "profile", label: "Profile", icon: UserRound }
  ];
  const displayedMemberPackages = getAccessToken()
    ? memberPackages
    : Array.from(
        new Map(
          previewBookings
            .flatMap((item) => (item.member_package ? [item.member_package] : []))
            .map((item) => [item.package_id, item])
        ).values()
      );

  return (
    <div className="app-frame">
      <aside className={`side-rail ${mobileMenu ? "side-rail-open" : ""}`}>
        <div className="side-rail-top">
          <button className="brand-button" onClick={go("home")}>
            <Brand />
          </button>
          <button
            className="icon-button rail-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="side-label">Your training</p>
        <nav className="side-nav">
          {primaryNav.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`side-link ${screen === key ? "active" : ""}`}
              onClick={go(key)}
            >
              <Icon size={18} />
              {label}
              {key === "bookings" && previewBookings.length > 0 && (
                <span className="nav-count">{previewBookings.length}</span>
              )}
            </button>
          ))}
        </nav>
        <p className="side-label side-label-space">More to explore</p>
        <nav className="side-nav">
          <button
            className={`side-link ${screen === "packages" ? "active" : ""}`}
            onClick={go("packages")}
          >
            <Wallet size={18} />
            Packages
          </button>
          <button
            className={`side-link ${screen === "reviews" ? "active" : ""}`}
            onClick={go("reviews")}
          >
            <Star size={18} />
            Reviews
          </button>
          <button
            className={`side-link ${screen === "messages" ? "active" : ""}`}
            onClick={go("messages")}
          >
            <MessageCircle size={18} />
            Messages
          </button>
        </nav>
        <div className="side-member-card">
          <div className="member-avatar">
            {account?.display_name.slice(0, 1).toUpperCase() || "M"}
          </div>
          <div>
            <b>{account?.display_name || "FitBooking member"}</b>
            <span>Member account</span>
          </div>
          <ChevronDown size={15} />
        </div>
      </aside>

      {mobileMenu && (
        <button
          aria-label="Close menu"
          className="mobile-scrim"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="main-column">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>
          <div className="topbar-location">
            <MapPin size={15} />
            <span>Chiang Mai, Thailand</span>
            <ChevronDown size={13} />
          </div>
          <div className="topbar-spacer" />
          <button
            className="icon-button notification-button"
            onClick={() => notify("You're all caught up.")}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <i />
          </button>
          <button
            className="topbar-avatar"
            onClick={go("profile")}
            aria-label="Open profile"
          >
            {account?.display_name.slice(0, 1).toUpperCase() || "M"}
          </button>
          <button className="button button-outline topbar-signout" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
        </header>

        <main className="screen-content">
          {screen === "home" && account && (
            <HomeScreen
              navigate={navigate}
              notify={notify}
              account={account}
              previewBookings={previewBookings}
            />
          )}
          {screen === "explore" && (
            <ExploreScreen
              search={search}
              setSearch={setSearch}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              navigate={navigate}
              onSelectCoach={selectCoachListing}
            />
          )}
          {screen === "coach" && (
            <CoachProfile
              navigate={navigate}
              notify={notify}
              coach={currentListing}
              course_id={course_id}
              favorite={favorites.includes(currentListing.display_name)}
              toggleFavorite={() => toggleFavorite(currentListing.display_name)}
              onChooseCourse={(selected_course_id) => {
                selectCourse(selected_course_id);
                navigate("booking");
              }}
            />
          )}
          {screen === "courses" && (
            <CoursesScreen
              navigate={navigate}
              coach_id={coach_id}
              course_id={course_id}
              onSelectCourse={(selected_course_id) => {
                selectCourse(selected_course_id);
                navigate("booking");
              }}
            />
          )}
          {screen === "booking" && (
            <BookingScreen
              coach_id={coach_id}
              course_id={course_id}
              booking_date={booking_date}
              setBookingDate={setBookingDate}
              start_time={start_time}
              setStartTime={setStartTime}
              bookingSelectionValid={bookingSelectionValid}
              setBookingSelectionValid={setBookingSelectionValid}
              service_mode={service_mode}
              setMode={setServiceMode}
              district={district}
              setDistrict={setDistrict}
              service_address={service_address}
              setServiceAddress={setServiceAddress}
              navigate={(target) => {
                if (target === "checkout") setCheckoutBooking(null);
                navigate(target);
              }}
              coach={currentListing}
              course={currentCourse}
              membership_level={membership_level}
            />
          )}
          {screen === "checkout" && (
            <CheckoutScreen
              booking_date={booking_date}
              start_time={start_time}
              service_mode={service_mode}
              package_type={package_type}
              packageCatalog={packageCatalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              setPackageChoice={setPackageChoice}
              membership_level={membership_level}
              setLevelId={setLevelId}
              member_id={account?.member_id || account?.user_id || 1}
              existingBooking={checkoutBooking}
              district={district}
              service_address={service_address}
              navigate={navigate}
              course={currentCourse}
              coach={currentListing}
              onBookingSuccess={(booking, paymentSummary) => {
                setPreviewBookings((current) => [
                  booking,
                  ...current.filter((item) => item.booking.booking_id !== booking.booking.booking_id)
                ]);
                setLastPaymentSummary(paymentSummary);
                setCheckoutBooking(null);
                if (getAccessToken()) {
                  refreshMemberPackages().catch((issue) =>
                    notify(
                      issue instanceof Error
                        ? `Booking confirmed, but package balances could not be refreshed: ${issue.message}`
                        : "Booking confirmed, but package balances could not be refreshed."
                    )
                  );
                }
              }}
            />
          )}
          {screen === "success" && (
            <SuccessScreen
              booking_date={booking_date}
              start_time={start_time}
              service_mode={service_mode}
              district={district}
              service_address={service_address}
              navigate={navigate}
              course={currentCourse}
              coach={currentListing}
              paymentSummary={lastPaymentSummary}
            />
          )}
          {screen === "bookings" && (
            <BookingsScreen
              tab={bookingTab}
              setTab={setBookingTab}
              navigate={navigate}
              account={account}
              previewBookings={previewBookings}
              onOpenBooking={(item) => openBookingDetail(item, "bookings")}
              onSubmitReview={submitBookingReview}
            />
          )}
          {screen === "bookingDetail" && selectedBooking && (
            <BookingDetailScreen
              item={selectedBooking}
              onBack={() => navigate(bookingDetailReturn)}
              onPayNow={() => {
                setCourseId(selectedBooking.booking.course_id);
                setCoachId(selectedBooking.booking.coach_id);
                setBookingDate(selectedBooking.booking.booking_date);
                setStartTime(selectedBooking.booking.start_time);
                setServiceMode(selectedBooking.booking.service_mode);
                setDistrict(selectedBooking.booking.service_district || "NIMMAN");
                setServiceAddress(selectedBooking.booking.service_address || "");
                setCheckoutBooking(selectedBooking);
                navigate("checkout");
              }}
              onSubmitReview={submitBookingReview}
              onCancel={cancelMemberBooking}
            />
          )}
          {screen === "packages" && (
            <PackagesScreen
              account={account}
              catalog={packageCatalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              memberPackages={displayedMemberPackages}
              packagesLoading={getAccessToken() ? packagesLoading : false}
              packagesError={getAccessToken() ? packagesError : ""}
              onChoose={(name) => {
                setSelectedPackage(name);
                navigate("packageDetail");
              }}
            />
          )}
          {screen === "packageDetail" && (
            <PackageDetailScreen
              selected={selectedPackage}
              catalog={packageCatalog}
              onBack={() => navigate("packages")}
              onChoose={(name) => {
                setPackageChoice(name as PackageType);
                setCoachId(1);
                setCourseId(1);
                setBookingDate("");
                setStartTime("");
                setBookingSelectionValid(false);
                setServiceMode("GYM");
                setDistrict("NIMMAN");
                setServiceAddress("");
                navigate("booking");
              }}
              onSelectPackage={setSelectedPackage}
              onPurchaseComplete={() => {
                if (getAccessToken()) {
                  refreshMemberPackages().catch((issue) =>
                    notify(
                      issue instanceof Error
                        ? `Package purchased, but the balance could not be refreshed: ${issue.message}`
                        : "Package purchased, but the balance could not be refreshed."
                    )
                  );
                }
              }}
            />
          )}
          {screen === "reviews" && (
            <ReviewsScreen
              rating={rating}
              setRating={setRating}
              tags={reviewTags}
              toggleTag={toggleTag}
              notify={notify}
            />
          )}
          {screen === "progress" && account && (
            <ProgressScreen
              tab={metricTab}
              setTab={setMetricTab}
              navigate={navigate}
              account={account}
              previewBookings={previewBookings}
              onOpenBooking={(item) => openBookingDetail(item, "progress")}
            />
          )}
          {screen === "profile" && account && (
            <ProfileScreen
              tab={profileTab}
              setTab={setProfileTab}
              notify={notify}
              account={account}
              onSignOut={signOut}
              onSave={updateProfile}
              navigate={navigate}
              previewBookings={previewBookings}
              memberPackages={displayedMemberPackages}
              memberPackagesLoading={getAccessToken() ? packagesLoading : false}
              memberPackagesError={getAccessToken() ? packagesError : ""}
            />
          )}
          {screen === "messages" && account && <Conversation account={account} />}
        </main>

        <nav className="bottom-nav" aria-label="Main navigation">
          {primaryNav.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={screen === key ? "active" : ""}
              onClick={go(key)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default FitBookingPrototype;
