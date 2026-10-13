"use client";

import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Award, BarChart3,
  Bell, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, CreditCard, Dumbbell, Flame, Heart, House, Leaf, LogIn, LogOut,
  MapPin, Menu, MessageCircle, Minus, MoreHorizontal, Plus, QrCode, Search,
  Settings, ShieldCheck, SlidersHorizontal, Sparkles, Star, Target, TrendingUp, Trophy, UserRound,
  UsersRound, Wallet, X
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  clearDemoSession, PublicDemoAccount,
  readDemoSession, registerDemoMember, saveDemoSession, signInDemoUser,
  updateDemoMember
} from "@/lib/demo-auth";
import {
  apiGetMemberProfile,
  apiGetMemberBookings,
  apiCancelBooking,
  apiCreateReview,
  getAccessToken,
  formatApiTime,
  ApiError
} from "@/lib/api-client";
import {
  MemberMessages, PackageDetailScreen, RoleWorkspace, SignInScreen, SignUpScreen
} from "@/components/fitbooking-workspaces";
import { MemberBookingPicker } from "@/components/member-booking-picker";
import {
  MemberPreviewBooking, preview_coach_courses, preview_coach_listings, preview_courses, preview_member_bookings,
  dateNow, formatBookingDate, dateOffset, toBusinessDateTime, weekdayForDate, preview_membership_levels
} from "@/lib/member-preview-data";
import { MembershipLevel, PackageType, PaymentMethod, ReviewCoach } from "@/lib/database";
import { bookingStatusClasses, labels } from "@/lib/labels";

export type Screen =
  | "welcome" | "home" | "explore" | "coach" | "courses" | "booking"
  | "checkout" | "success" | "bookings" | "packages" | "reviews"
  | "packageDetail" | "progress" | "profile" | "signin" | "signup"
  | "trainerHome" | "trainerSchedule" | "trainerMessages" | "messages" | "trainerClients"
  | "bookingDetail" | "trainerProgress" | "admin" | "adminBookings" | "adminMembers"
  | "adminTrainers" | "adminLocations" | "adminCourses" | "adminPackages"
  | "adminKpi" | "adminReports" | "adminAudit" | "adminSettings";

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
  "home", "explore", "coach", "courses", "booking", "checkout", "success",
  "bookings", "packages", "packageDetail", "bookingDetail", "reviews", "progress", "profile", "messages"
];
const trainerScreens: Screen[] = ["trainerHome", "trainerSchedule", "trainerMessages", "trainerClients", "trainerProgress"];
const adminScreens: Screen[] = [
  "admin", "adminBookings", "adminMembers", "adminTrainers", "adminLocations",
  "adminCourses", "adminPackages", "adminKpi", "adminReports", "adminAudit", "adminSettings"
];

function routeScreen(): Screen {
  const path = window.location.pathname;
  const hash = window.location.hash.slice(1) as Screen;
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
  if (trainerScreens.includes(screen)) return `/trainer${screen === "trainerHome" ? "" : `#${screen}`}`;
  if (adminScreens.includes(screen)) return `/admin${screen === "admin" ? "" : `#${screen}`}`;
  return `/member${screen === "home" ? "" : `#${screen}`}`;
}

function requiredRole(screen: Screen): PublicDemoAccount["role"] | null {
  if (trainerScreens.includes(screen)) return "COACH";
  if (adminScreens.includes(screen)) return "ADMIN";
  if (memberScreens.includes(screen)) return "MEMBER";
  return null;
}

const coaches = [
  { name: "Tan Chaiyaporn", short: "Coach Tan", title: "Strength & Conditioning", rating: "4.9", reviews: 128, area: "Nimman", price: 800, level: "ADVANCED", years: 6, tags: ["Strength", "HIIT", "Weight loss"], image: "photo-1583454110551-21f2fa2afe61" },
  { name: "May Suthida", short: "Coach May", title: "Mobility & Wellness", rating: "4.8", reviews: 96, area: "Old City", price: 750, level: "INTERMEDIATE", years: 4, tags: ["Mobility", "Yoga", "Wellness"], image: "photo-1544367567-0f2fcb009e0b" },
  { name: "Jeff Nopparat", short: "Coach Jeff", title: "Functional Fitness", rating: "4.9", reviews: 84, area: "Central", price: 900, level: "MASTER", years: 9, tags: ["Functional", "Strength", "Cardio"], image: "photo-1500648767791-00dcc994a43e" },
  { name: "Ploy Rattanakorn", short: "Coach Ploy", title: "Yoga & Mobility", rating: "4.9", reviews: 72, area: "Hang Dong", price: 850, level: "ADVANCED", years: 7, tags: ["Yoga", "Mobility", "Balance"], image: "photo-1534528741775-53994a69daeb" }
];

const courses = [
  { name: "Strength & Conditioning", description: "Build strength. Improve performance.", duration: 60, price: 800, level: "Intermediate", image: "photo-1583454110551-21f2fa2afe61", kind: "Strength" },
  { name: "HIIT", description: "High intensity. Fast burn.", duration: 45, price: 750, level: "Beginner", image: "photo-1517836357463-d25dfeac3438", kind: "Cardio" },
  { name: "Mobility & Flexibility", description: "Move freely. Feel stronger.", duration: 60, price: 650, level: "All levels", image: "photo-1544367567-0f2fcb009e0b", kind: "Mobility" }
];

function imageUrl(id: string, width = 720) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}

function formatSqlTime(start_time: string): string {
  const [hour, minute] = start_time.split(":").map(Number);
  return `${String(hour % 12 || 12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function addMinutesToSqlTime(start_time: string, minutesToAdd: number): string {
  const [hour, minute] = start_time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + minutesToAdd;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(totalMinutes % 60).padStart(2, "0")}:00`;
}

function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? "brand-light" : ""}`}>
    <Image className="brand-logo" src="/fitbooking-kettlebell.png" width={34} height={30} alt="" priority />
    <span>FitBooking<span className="brand-period">.</span></span>
  </div>;
}

function PageHeading({
  eyebrow, title, detail, action
}: { eyebrow?: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="page-heading">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{detail && <p className="page-detail">{detail}</p>}</div>
    {action}
  </div>;
}

function Pill({
  children, className = ""
}: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

function Photo({
  id, alt, className = ""
}: { id: string; alt: string; className?: string }) {
  return <span
    aria-hidden={alt ? undefined : true}
    aria-label={alt || undefined}
    className={`photo ${className}`}
    role={alt ? "img" : undefined}
    style={{ backgroundImage: `url("${imageUrl(id)}")` }}
  />;
}

function PrimaryButton({
  children, onClick, className = "", disabled = false
}: { children: React.ReactNode; onClick: () => void; className?: string; disabled?: boolean }) {
  return <button className={`button button-primary ${className}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function CoachCard({
  coach, onClick, favorite, onFavorite
}: {
  coach: typeof coaches[number];
  onClick: () => void;
  favorite: boolean;
  onFavorite: () => void;
}) {
  return <article className="coach-card">
    <button className="coach-card-photo" onClick={onClick} aria-label={`View ${coach.short}'s profile`}>
      <Photo id={coach.image} alt={coach.short} />
      <span className="verified"><ShieldCheck size={13} /> Verified</span>
    </button>
    <button className="icon-button favorite-button" onClick={onFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"}>
      <Heart size={17} fill={favorite ? "currentColor" : "none"} />
    </button>
    <button className="coach-card-copy" onClick={onClick}>
      <span className="coach-card-title">{coach.short}</span>
      <span className="coach-card-rating"><Star size={13} fill="currentColor" /> {coach.rating} <span>({coach.reviews})</span></span>
      <span className="coach-card-meta">{coach.area} · Gym / Home</span>
      <span className="coach-card-price">฿{coach.price.toLocaleString()} <small>/ session</small></span>
    </button>
  </article>;
}

function CourseCard({ course, onClick }: { course: typeof courses[number]; onClick: () => void }) {
  return <button className="course-card" onClick={onClick}>
    <Photo id={course.image} alt="" />
    <span className="course-card-copy"><strong>{course.name}</strong><small>{course.description}</small><span className="course-meta"><Pill>{course.level}</Pill><span><Clock3 size={13} /> {course.duration} min</span><b>฿{course.price}</b></span></span>
    <ChevronRight size={17} />
  </button>;
}

export function FitBookingPrototype() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [toast, setToast] = useState("");
  const [account, setAccount] = useState<PublicDemoAccount | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("10+3");
  const [search, setSearch] = useState("");
  const [bookingTab, setBookingTab] = useState("Upcoming");
  const [coach_id, setCoachId] = useState(1);
  const [course_id, setCourseId] = useState(1);
  const [booking_date, setBookingDate] = useState("");
  const [start_time, setStartTime] = useState("");
  const [bookingSelectionValid, setBookingSelectionValid] = useState(false);
  const [service_mode, setServiceMode] = useState<"GYM" | "HOME">("GYM");
  const [district, setDistrict] = useState("NIMMAN");
  const [payment_method, setPaymentMethod] = useState<PaymentMethod>("PROMPTPAY");
  const [package_type, setPackageChoice] = useState<PackageType | null>(null);
  const [level_id, setLevelId] = useState(3);
  const [rating, setRating] = useState(5);
  const [reviewTags, setReviewTags] = useState<string[]>(["Motivating", "Professional"]);
  const [metricTab, setMetricTab] = useState("Overview");
  const [profileTab, setProfileTab] = useState("Personal information");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<MemberPreviewBooking | null>(null);
  const [bookingDetailReturn, setBookingDetailReturn] = useState<Screen>("bookings");
  const [previewBookings, setPreviewBookings] = useState(preview_member_bookings);

  const navigate = useCallback((target: Screen) => {
    const role = requiredRole(target);
    setMobileMenu(false);
    if (role && (!account || account.role !== role)) {
      setScreen("signin");
      if (typeof window !== "undefined") window.history.pushState(null, "", "/signin");
      if (authReady && account && account.role !== role) setToast(`This page is for ${role === "COACH" ? "trainers" : role === "ADMIN" ? "administrators" : "members"} only. Sign in with the matching account.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setScreen(target);
    if (typeof window !== "undefined") window.history.pushState(null, "", routePath(target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [account, authReady]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setAuthReady(true);
    }, 600);
    try {
      const saved = readDemoSession();
      setAccount(saved);
      if (saved && saved.role === "MEMBER" && getAccessToken()) {
        apiGetMemberProfile()
          .then((profile) => {
            setAccount((prev) => {
              if (!prev) return prev;
              const merged: PublicDemoAccount = {
                ...prev,
                display_name: profile.display_name,
                email: profile.email,
                phone: profile.phone,
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
            if (err instanceof ApiError && err.status === 401) {
              clearDemoSession();
              setAccount(null);
              setScreen("signin");
              if (typeof window !== "undefined") window.history.replaceState(null, "", "/signin");
              setToast("Your session has expired. Please sign in again.");
            }
          });

        apiGetMemberBookings().then((bookingsList) => {
          if (Array.isArray(bookingsList) && bookingsList.length > 0) {
            setPreviewBookings(bookingsList.map((b: any, index: number) => {
              const bookingDate = String(b.booking_date);
              const startTime = formatApiTime(b.start_time);
              const endTime = formatApiTime(b.end_time);
              return {
                booking: {
                  booking_id: b.booking_id,
                  member_id: b.member_id || 1,
                  coach_id: b.coach_id || 1,
                  course_id: b.course_id || 1,
                  gym_id: b.gym_id || 1,
                  package_id: b.package_id || null,
                  booking_date: bookingDate,
                  start_time: startTime,
                  end_time: endTime,
                  duration_minutes: b.duration_minutes || 60,
                  break_minutes: b.break_minutes || 10,
                  service_mode: b.service_mode || "GYM",
                  service_district: b.service_district || null,
                  service_address: b.service_address || null,
                  price: Number(b.price || 800),
                  status: b.status || "CONFIRMED",
                  expires_at: b.expires_at || null,
                  cancelled_by: b.cancelled_by || null,
                  cancel_reason: b.cancel_reason || null,
                  cancelled_at: b.cancelled_at || null,
                  completed_at: b.completed_at || null,
                  created_at: b.created_at || new Date().toISOString(),
                  updated_at: b.updated_at || new Date().toISOString()
                },
                course: {
                  course_id: b.course_id || 1,
                  course_name: b.course_name || "Strength & Conditioning",
                  description: "Custom session with coach",
                  difficulty: "INTERMEDIATE",
                  default_duration: b.duration_minutes || 60,
                  equipment: "Standard weights",
                  is_active: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                coach: {
                  coach_id: b.coach_id || 1,
                  coach_no: "1001",
                  user_id: 3,
                  avatar_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
                  coach_level: "ADVANCED",
                  bio: "Dedicated strength and conditioning coach",
                  service_mode: b.service_mode || "BOTH",
                  years_experience: 6,
                  certifications: "NASM-CPT",
                  break_interval: 10,
                  status: "ACTIVE",
                  hired_at: "2020-04-01",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                display_name: b.coach_name || "Tan Chaiyaporn",
                gym: {
                  gym_id: b.gym_id || 1,
                  gym_name: b.gym_name || "Nimman Fitness Club",
                  address: "Nimman Soi 9, Suthep, Mueang Chiang Mai",
                  district: "NIMMAN",
                  phone: "+6653001001",
                  facilities: "Full weights, lockers, showers",
                  opening_time: "06:00:00",
                  closing_time: "22:00:00",
                  latitude: 18.7961,
                  longitude: 98.9673,
                  is_active: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                orders: [
                  {
                    order_id: 1000 + index,
                    order_no: `ORD-${b.booking_id}`,
                    booking_id: b.booking_id,
                    package_id: null,
                    order_type: "BOOKING",
                    total_amount: Number(b.price || 800),
                    discount: 0,
                    final_amount: Number(b.price || 800),
                    payment_method: "PROMPTPAY",
                    payment_status: b.status === "CONFIRMED" || b.status === "COMPLETED" ? "PAID" : "UNPAID",
                    payment_time: b.created_at || new Date().toISOString(),
                    refunded_at: b.cancelled_at || null,
                    created_at: b.created_at || new Date().toISOString(),
                    updated_at: b.updated_at || new Date().toISOString()
                  }
                ],
                member_package: null,
                review_coach: null,
                ui: {
                  coach_image: "photo-1583454110551-21f2fa2afe61"
                }
              };
            }));
          }
        }).catch(() => {});
      }
    } catch (issue) {
      setToast(issue instanceof Error ? issue.message : "The saved browser profile could not be read.");
      setScreen("signin");
    } finally {
      setAuthReady(true);
    }
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const readRoute = () => {
      const next = routeScreen();
      const role = requiredRole(next);
      if (role && account?.role !== role) {
        setScreen("signin");
        window.history.replaceState(null, "", "/signin");
        setToast(account ? "That workspace is not available for this account type." : "Sign in to open your FitBooking workspace.");
        return;
      }
      setScreen(next);
    };
    readRoute();
    window.addEventListener("hashchange", readRoute);
    window.addEventListener("popstate", readRoute);
    return () => {
      window.removeEventListener("hashchange", readRoute);
      window.removeEventListener("popstate", readRoute);
    };
  }, [authReady, account]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const go = (target: Screen) => () => navigate(target);
  const notify = (message: string) => setToast(message);
  const enterWorkspace = (nextAccount: PublicDemoAccount) => {
    setAccount(nextAccount);
    // API Documentation rule: Navigate to /member#profile after member login
    const target: Screen = nextAccount.role === "ADMIN" ? "admin" : nextAccount.role === "COACH" ? "trainerHome" : "profile";
    setScreen(target);
    window.history.pushState(null, "", routePath(target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const signOut = () => {
    try {
      clearDemoSession();
      setAccount(null);
      setScreen("signin");
      window.history.pushState(null, "", "/signin");
      setToast("You’re signed out. Your local profile is still saved on this device.");
    } catch (issue) {
      setToast(issue instanceof Error ? issue.message : "We couldn’t sign you out.");
    }
  };
  const handleSignIn = async (identifier: string, password: string, role: PublicDemoAccount["role"]) => {
    const nextAccount = await signInDemoUser(identifier, password, role);
    saveDemoSession(nextAccount);
    enterWorkspace(nextAccount);
  };
  const handleRegister = async (details: Parameters<typeof registerDemoMember>[0]) => {
    const nextAccount = await registerDemoMember(details);
    saveDemoSession(nextAccount);
    enterWorkspace(nextAccount);
    setToast("Account created successfully! Welcome to FitBooking.");
  };
  const updateProfile = async (changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date" | "gender" | "height_cm" | "weight_kg" | "fitness_goal">>) => {
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
  const toggleFavorite = (name: string) => setFavorites((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  const openBookingDetail = (item: MemberPreviewBooking, returnTo: Screen) => {
    setSelectedBooking(item);
    setBookingDetailReturn(returnTo);
    navigate("bookingDetail");
  };
  const submitBookingReview = (item: MemberPreviewBooking, reviewFields: Pick<ReviewCoach, "rating_professional" | "rating_communication" | "rating_punctuality" | "rating_effectiveness" | "comment">) => {
    const review_coach: ReviewCoach = {
      ...reviewFields,
      review_coach_id: Math.max(0, ...previewBookings.map((entry) => entry.review_coach?.review_coach_id || 0)) + 1,
      booking_id: item.booking.booking_id,
      reviewer_id: item.booking.member_id,
      avg_rating: (reviewFields.rating_professional + reviewFields.rating_communication + reviewFields.rating_punctuality + reviewFields.rating_effectiveness) / 4,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " ")
    };
    setPreviewBookings((current) => current.map((entry) => entry.booking.booking_id === item.booking.booking_id ? { ...entry, review_coach } : entry));
    setSelectedBooking((current) => current?.booking.booking_id === item.booking.booking_id ? { ...current, review_coach } : current);
    if (getAccessToken()) {
      apiCreateReview({
        booking_id: item.booking.booking_id,
        rating_professional: reviewFields.rating_professional,
        rating_communication: reviewFields.rating_communication,
        rating_punctuality: reviewFields.rating_punctuality,
        rating_effectiveness: reviewFields.rating_effectiveness,
        comment: reviewFields.comment || undefined
      }).then(() => {
        notify("Your review has been saved to the database.");
      }).catch((err) => {
        notify(`Review notice: ${err.message}`);
      });
    } else {
      notify("Your review is saved in this local preview.");
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
      orders: item.orders.map((order) => freeCancel && order.payment_status === "PAID"
        ? { ...order, payment_status: "REFUNDED" as const, refunded_at: updatedBooking.cancelled_at }
        : freeCancel && order.payment_status === "UNPAID"
          ? { ...order, payment_status: "CANCELLED" as const }
          : order),
      member_package: freeCancel && item.member_package
        ? { ...item.member_package, remaining_sessions: Math.min(item.member_package.total_sessions, item.member_package.remaining_sessions + 1) }
        : item.member_package
    };
    setPreviewBookings((current) => current.map((entry) => entry.booking.booking_id === item.booking.booking_id ? updatedItem : entry));
    setSelectedBooking(updatedItem);
    if (getAccessToken()) {
      apiCancelBooking(item.booking.booking_id, cancel_reason)
        .then(() => {
          notify(freeCancel ? "Session cancelled and updated on the backend. Full refund processed." : "Session cancelled and updated on the backend.");
        })
        .catch((err) => {
          notify(`Cancellation: ${err.message}`);
        });
    } else {
      notify(freeCancel ? "Session cancelled. The preview reflects a full refund." : "Session cancelled. This preview reflects the no-refund window.");
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
  };
  const selectCourse = (selected_course_id: number) => {
    setCourseId(selected_course_id);
    setBookingDate("");
    setStartTime("");
    setBookingSelectionValid(false);
  };
  const currentListing = preview_coach_listings.find((item) => item.coach.coach_id === coach_id) || preview_coach_listings[0];
  const currentCourse = preview_courses.find((item) => item.course_id === course_id) || preview_courses[0];
  const membership_level = preview_membership_levels.find((item) => item.level_id === level_id) || preview_membership_levels[0];

  const toggleTag = (tag: string) => setReviewTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);

  if (!authReady) {
    return (
      <main className="auth-loading">
        <Brand />
        <p>Opening your FitBooking preview…</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "10px", justifyContent: "center" }}>
          <a href="/signin" className="button button-glass" style={{ fontSize: "12px", padding: "6px 14px", textDecoration: "none", borderRadius: "999px" }}>
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
  if (screen === "signin") return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  if (screen === "signup") return <SignUpScreen onRegister={handleRegister} onNavigate={(target) => navigate(target as Screen)} />;
  if (screen === "trainerHome" || screen === "trainerSchedule" || screen === "trainerMessages" || screen === "trainerClients" || screen === "trainerProgress") {
    if (account?.role === "COACH") return <RoleWorkspace role="COACH" screen={screen} account={account} navigate={(target) => navigate(target as Screen)} onSignOut={signOut} />;
    return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  }
  if (screen === "admin" || adminScreens.includes(screen)) {
    if (account?.role === "ADMIN") return <RoleWorkspace role="ADMIN" screen={screen} account={account} navigate={(target) => navigate(target as Screen)} onSignOut={signOut} />;
    return <SignInScreen onSignIn={handleSignIn} onNavigate={(target) => navigate(target as Screen)} />;
  }

  if (screen === "welcome") {
    return <main className="welcome-layout">
      <aside className="welcome-brand-panel">
        <Brand />
        <div className="welcome-brand-note"><p>Personal training that fits your life.</p><span>Made for Chiang Mai.</span></div>
        <div className="welcome-line-art"><span>CHIANG MAI</span><small>18° 47′ N · 98° 59′ E</small></div>
        <div className="welcome-values"><Leaf size={16} /><span>Better trainers. Healthier you.</span></div>
      </aside>
      <section className="welcome-main">
        <div className="welcome-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(8,35,27,.04) 18%,rgba(5,31,23,.81) 100%),url("${imageUrl("photo-1517836357463-d25dfeac3438", 1400)}")` }}>
          <div className="welcome-top"><Brand light /><span>CHIANG MAI · THAILAND</span></div>
          <div className="welcome-copy"><Pill className="pill-glass"><MapPin size={13} /> Your city, your pace</Pill><h1>Train your way.<br />Live your best.</h1><p>Find your person. Make a plan. Feel the difference.</p><div className="welcome-actions"><PrimaryButton onClick={go(account ? account.role === "ADMIN" ? "admin" : account.role === "COACH" ? "trainerHome" : "home" : "signin")}>{account ? "Continue to your workspace" : "Sign in"} <ArrowRight size={17} /></PrimaryButton><button className="button button-glass" onClick={() => navigate("signup")}>Create a member account</button></div><button className="welcome-existing-link" onClick={go("signin")}><LogIn size={14} /> Sign in with a demo profile</button></div>
          <div className="welcome-caption"><span>01 / 04</span><span>Chiang Mai moves differently.</span><span className="welcome-dots"><i /><i /><i /><i /></span></div>
        </div>
      </section>
    </main>;
  }

  const primaryNav: { key: Screen; label: string; icon: typeof House }[] = [
    { key: "home", label: "Home", icon: House },
    { key: "explore", label: "Explore", icon: Search },
    { key: "bookings", label: "Bookings", icon: CalendarDays },
    { key: "progress", label: "Progress", icon: BarChart3 },
    { key: "profile", label: "Profile", icon: UserRound }
  ];

  return <div className="app-frame">
    <aside className={`side-rail ${mobileMenu ? "side-rail-open" : ""}`}>
      <div className="side-rail-top"><button className="brand-button" onClick={go("home")}><Brand /></button><button className="icon-button rail-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={20} /></button></div>
      <p className="side-label">Your training</p>
      <nav className="side-nav">
        {primaryNav.map(({ key, label, icon: Icon }) => <button key={key} className={`side-link ${screen === key ? "active" : ""}`} onClick={go(key)}><Icon size={18} />{label}{key === "bookings" && <span className="nav-count">2</span>}</button>)}
      </nav>
      <p className="side-label side-label-space">More to explore</p>
      <nav className="side-nav">
        <button className={`side-link ${screen === "packages" ? "active" : ""}`} onClick={go("packages")}><Wallet size={18} />Packages</button>
        <button className={`side-link ${screen === "reviews" ? "active" : ""}`} onClick={go("reviews")}><Star size={18} />Reviews</button>
        <button className={`side-link ${screen === "messages" ? "active" : ""}`} onClick={go("messages")}><MessageCircle size={18} />Messages</button>
      </nav>
      <div className="side-member-card"><div className="member-avatar">{account?.display_name.slice(0, 1).toUpperCase() || "M"}</div><div><b>{account?.display_name || "FitBooking member"}</b><span>Member account</span></div><ChevronDown size={15} /></div>
    </aside>

    {mobileMenu && <button aria-label="Close menu" className="mobile-scrim" onClick={() => setMobileMenu(false)} />}
    <div className="main-column">
      <header className="topbar">
        <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Menu size={21} /></button>
        <div className="topbar-location"><MapPin size={15} /><span>Chiang Mai, Thailand</span><ChevronDown size={13} /></div>
        <div className="topbar-spacer" />
        <button className="icon-button notification-button" onClick={() => notify("You're all caught up.")} aria-label="Notifications"><Bell size={18} /><i /></button>
        <button className="topbar-avatar" onClick={go("profile")} aria-label="Open profile">{account?.display_name.slice(0, 1).toUpperCase() || "M"}</button>
        <button className="button button-outline topbar-signout" onClick={signOut}><LogOut size={14} /> Sign out</button>
      </header>
      <main className="screen-content">
        {screen === "home" && account && <HomeScreen navigate={navigate} notify={notify} account={account} />}
        {screen === "explore" && <ExploreScreen search={search} setSearch={setSearch} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} onSelectCoach={selectCoachListing} />}
        {screen === "coach" && <CoachProfile navigate={navigate} notify={notify} coach={currentListing} course_id={course_id} favorite={favorites.includes(currentListing.display_name)} toggleFavorite={() => toggleFavorite(currentListing.display_name)} onChooseCourse={(selected_course_id) => { selectCourse(selected_course_id); navigate("booking"); }} />}
        {screen === "courses" && <CoursesScreen navigate={navigate} coach_id={coach_id} course_id={course_id} onSelectCourse={(selected_course_id) => { selectCourse(selected_course_id); navigate("booking"); }} />}
        {screen === "booking" && <BookingScreen coach_id={coach_id} course_id={course_id} booking_date={booking_date} setBookingDate={setBookingDate} start_time={start_time} setStartTime={setStartTime} bookingSelectionValid={bookingSelectionValid} setBookingSelectionValid={setBookingSelectionValid} service_mode={service_mode} setMode={setServiceMode} district={district} setDistrict={setDistrict} navigate={navigate} coach={currentListing} course={currentCourse} membership_level={membership_level} />}
        {screen === "checkout" && <CheckoutScreen booking_date={booking_date} start_time={start_time} service_mode={service_mode} package_type={package_type} setPackageChoice={setPackageChoice} membership_level={membership_level} setLevelId={setLevelId} payment_method={payment_method} setPaymentMethod={setPaymentMethod} navigate={navigate} course={currentCourse} coach={currentListing} />}
        {screen === "success" && <SuccessScreen booking_date={booking_date} start_time={start_time} navigate={navigate} course={currentCourse} coach={currentListing} />}
        {screen === "bookings" && <BookingsScreen tab={bookingTab} setTab={setBookingTab} navigate={navigate} previewBookings={previewBookings} onOpenBooking={(item) => openBookingDetail(item, "bookings")} onSubmitReview={submitBookingReview} />}
        {screen === "bookingDetail" && selectedBooking && <BookingDetailScreen item={selectedBooking} onBack={() => navigate(bookingDetailReturn)} onPayNow={() => { setCourseId(selectedBooking.booking.course_id); setCoachId(selectedBooking.booking.coach_id); setBookingDate(selectedBooking.booking.booking_date); setStartTime(selectedBooking.booking.start_time); setPackageChoice(selectedBooking.booking.package_id ? selectedBooking.member_package?.package_type || null : null); setPaymentMethod(selectedBooking.orders[0]?.payment_method || "PROMPTPAY"); navigate("checkout"); }} onSubmitReview={submitBookingReview} onCancel={cancelMemberBooking} />}
        {screen === "packages" && <PackagesScreen membership_level={membership_level} onChoose={(name) => { setSelectedPackage(name); navigate("packageDetail"); }} />}
        {screen === "packageDetail" && <PackageDetailScreen selected={selectedPackage} onBack={() => navigate("packages")} onChoose={(name) => { setSelectedPackage(name); if (name === "5+1" || name === "10+3" || name === "20+7") setPackageChoice(name); navigate("checkout"); }} />}
        {screen === "reviews" && <ReviewsScreen rating={rating} setRating={setRating} tags={reviewTags} toggleTag={toggleTag} notify={notify} />}
        {screen === "progress" && account && <ProgressScreen tab={metricTab} setTab={setMetricTab} navigate={navigate} account={account} previewBookings={previewBookings} onOpenBooking={(item) => openBookingDetail(item, "progress")} />}
        {screen === "profile" && account && <ProfileScreen tab={profileTab} setTab={setProfileTab} notify={notify} account={account} onSignOut={signOut} onSave={updateProfile} />}
        {screen === "messages" && account && <MemberMessages account={account} />}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {primaryNav.map(({ key, label, icon: Icon }) => <button key={key} className={screen === key ? "active" : ""} onClick={go(key)}><Icon size={19} /><span>{label}</span></button>)}
      </nav>
    </div>
    {toast && <div role="status" className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>;
}

function HomeScreen({ navigate, notify, account }: { navigate: (screen: Screen) => void; notify: (message: string) => void; account: PublicDemoAccount }) {
  return <div className="content-wrap">
    <div className="home-greeting"><div><p className="eyebrow">Your FitBooking home</p><h1>Welcome, {account.display_name.split(" ")[0]} <span className="sun-emoji">☀</span></h1><p className="page-detail">A little progress adds up. You’re doing great.</p></div><Pill className="gold-pill"><Award size={14} /> Member</Pill></div>
    <section className="week-banner">
      <div className="week-progress-copy"><span className="week-overline">YOUR WEEK</span><strong>3<span>/4</span></strong><span>workouts done</span><button onClick={() => navigate("progress")}>See your progress <ArrowRight size={14} /></button></div>
      <div className="week-progress-ring"><div><b>75%</b><span>weekly goal</span></div></div>
      <div className="week-mini-stats"><div><span className="mini-stat-icon coral"><Flame size={16} /></span><span><b>1,240</b><small>Calories</small></span></div><div><span className="mini-stat-icon blue"><Activity size={16} /></span><span><b>42 min</b><small>Active time</small></span></div><div><span className="mini-stat-icon lime"><ZapIcon /></span><span><b>5 days</b><small>Streak</small></span></div></div>
    </section>
    <section className="section-block">
      <div className="section-title"><div><h2>Your next session</h2><p>A good day to get stronger.</p></div><button className="text-link" onClick={() => navigate("bookings")}>All bookings <ArrowRight size={15} /></button></div>
      <button className="next-session-card" onClick={() => navigate("success")}><Photo id={coaches[0].image} alt="" /><span className="next-session-info"><span className="next-session-time"><CalendarDays size={14} /> Today · 09:10 AM</span><strong>Strength & Conditioning</strong><span>Coach Tan · Nimman Gym</span><span className="session-facts"><span><Clock3 size={13} /> 60 min</span><span><MapPin size={13} /> 1.2 km away</span></span></span><span className="next-session-arrow"><ChevronRight size={19} /></span></button>
    </section>
    <section className="section-block">
      <div className="section-title"><div><h2>Good people to train with</h2><p>Recommended coaches near you</p></div><button className="text-link" onClick={() => navigate("explore")}>See all <ArrowRight size={15} /></button></div>
      <div className="coach-grid coach-grid-3">{coaches.slice(0, 3).map((coach) => <CoachCard key={coach.name} coach={coach} onClick={() => navigate("coach")} favorite={false} onFavorite={() => notify(`${coach.short} added to favorites.`)} />)}</div>
    </section>
    <section className="home-bottom-grid">
      <div className="home-promo"><div><Pill className="pill-glass"><Sparkles size={12} /> MEMBER BENEFIT</Pill><h2>More sessions.<br />More of what moves you.</h2><button className="button button-light" onClick={() => navigate("packages")}>Find your package <ArrowRight size={15} /></button></div><div className="promo-sun" /></div>
      <div className="small-membership-card"><div className="membership-medal"><Trophy size={20} /></div><div><span>Your membership</span><h3>Gold Member</h3><p>2,150 ฿ to reach Platinum</p><div className="membership-track"><i /></div></div><button className="icon-button" onClick={() => navigate("packages")} aria-label="View membership"><ChevronRight size={18} /></button></div>
    </section>
  </div>;
}

function ZapIcon() { return <Sparkles size={15} />; }

function ExploreScreen({
  search, setSearch, favorites, toggleFavorite, navigate, onSelectCoach
}: {
  search: string; setSearch: (value: string) => void; favorites: string[];
  toggleFavorite: (name: string) => void; navigate: (screen: Screen) => void;
  onSelectCoach: (coach_id: number, course_id: number) => void;
}) {
  type ExploreFilterFields = {
    district: string;
    course_id: string;
    difficulty: string;
    service_mode: string;
    coach_level: string;
    gym_id: string;
  };
  const emptyFilters: ExploreFilterFields = { district: "", course_id: "", difficulty: "", service_mode: "", coach_level: "", gym_id: "" };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<ExploreFilterFields>(emptyFilters);
  const [activeFilters, setActiveFilters] = useState<ExploreFilterFields>(emptyFilters);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const filterControls: { key: keyof ExploreFilterFields; label: string; options: [string, string][] }[] = [
    { key: "district", label: "District", options: [["NIMMAN", "Nimman"], ["OLD_CITY", "Old City"], ["CENTRAL", "Central"], ["MAE_RIM", "Mae Rim"], ["HANG_DONG", "Hang Dong"]] },
    { key: "course_id", label: "Course", options: preview_courses.filter((course) => course.is_active === 1).map((course) => [String(course.course_id), course.course_name] as [string, string]) },
    { key: "difficulty", label: "Difficulty", options: [["BEGINNER", "Beginner"], ["INTERMEDIATE", "Intermediate"], ["ADVANCED", "Advanced"]] },
    { key: "service_mode", label: "Service mode", options: [["GYM", "Gym"], ["HOME", "Home"], ["BOTH", "Gym and home"]] },
    { key: "coach_level", label: "Coach level", options: [["BEGINNER", "Beginner"], ["INTERMEDIATE", "Intermediate"], ["ADVANCED", "Advanced"], ["MASTER", "Master"]] },
    { key: "gym_id", label: "Gym", options: Array.from(new Map(preview_coach_listings.filter((entry) => entry.gym.is_active === 1).map((entry) => [String(entry.gym.gym_id), entry.gym.gym_name] as [string, string]))) }
  ];
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;
  const visibleListings = preview_coach_listings.filter((listing) => {
    if (listing.coach.status !== "ACTIVE" || listing.coach_service.is_active !== 1 || listing.gym.is_active !== 1 || listing.course.is_active !== 1 || listing.coach_course.is_active !== 1) return false;
    const offered_courses = preview_coach_courses.filter((item) => item.coach_id === listing.coach.coach_id && item.is_active === 1);
    const matchesSearch = `${listing.display_name} ${offered_courses.map((item) => preview_courses.find((course) => course.course_id === item.course_id)?.course_name || "").join(" ")} ${listing.ui.location_label} ${listing.coach.coach_level}`.toLowerCase().includes(search.toLowerCase());
    const { district, course_id, difficulty, service_mode, coach_level, gym_id } = activeFilters;
    return matchesSearch &&
      (!district || listing.coach_service.service_area === district || listing.gym.district === district) &&
      (!course_id || offered_courses.some((item) => item.course_id === Number(course_id))) &&
      (!difficulty || offered_courses.some((item) => (!course_id || item.course_id === Number(course_id)) && preview_courses.find((course) => course.course_id === item.course_id)?.difficulty === difficulty)) &&
      (!service_mode || listing.coach.service_mode === service_mode) &&
      (!coach_level || listing.coach.coach_level === coach_level) &&
      (!gym_id || listing.gym.gym_id === Number(gym_id));
  });
  const filterLabel = (key: keyof ExploreFilterFields, value: string) =>
    filterControls.find((control) => control.key === key)?.options.find(([option]) => option === value)?.[1] || value;
  const changeActiveFilter = (key: keyof ExploreFilterFields, value: string) =>
    setActiveFilters((current) => ({ ...current, [key]: current[key] === value ? "" : value }));
  return <div className="content-wrap">
    <PageHeading eyebrow="Find your fit" title="The right coach changes everything." detail="Good people, smart training, and a plan that feels like yours." />
    <div className="search-bar"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, specialty, or location" aria-label="Search coaches" /><button className="filter-button" aria-expanded={filtersOpen} onClick={() => { setDraftFilters(activeFilters); setFiltersOpen((open) => !open); }}><SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button></div>
    {activeFilterCount > 0 && <div className="active-filter-chips" aria-label="Active filters">{(Object.keys(activeFilters) as (keyof ExploreFilterFields)[]).filter((key) => activeFilters[key]).map((key) => <button key={key} onClick={() => changeActiveFilter(key, activeFilters[key])}>{filterControls.find((control) => control.key === key)?.label}: {filterLabel(key, activeFilters[key])}<X size={13} /></button>)}</div>}
    {filtersOpen && <section className="explore-filter-panel" aria-label="Coach filters">{filterControls.map(({ key, label, options }) => <label className="select-field" key={key} htmlFor={`explore-filter-${key}`}>{label}<select id={`explore-filter-${key}`} value={draftFilters[key]} onChange={(event) => setDraftFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">All</option>{options.map(([value, name]) => <option value={value} key={value}>{name}</option>)}</select></label>)}<div className="explore-filter-actions"><button className="text-link" onClick={() => { setDraftFilters(emptyFilters); setActiveFilters(emptyFilters); setFiltersApplied(true); }}>Clear all</button><button className="button button-primary" onClick={() => { setActiveFilters(draftFilters); setFiltersApplied(true); setFiltersOpen(false); }}>Apply filters</button></div></section>}
    <div className="explore-location-row"><span><MapPin size={15} /> In Chiang Mai</span><span className="result-count">{visibleListings.length} coaches {filtersApplied ? "matching your filters" : "to explore"}</span></div>
    {visibleListings.length ? <div className="coach-grid">{visibleListings.map((listing) => {
      const selected_course = activeFilters.course_id
        ? preview_courses.find((item) => item.course_id === Number(activeFilters.course_id)) || listing.course
        : listing.course;
      const selected_coach_course = preview_coach_courses.find((item) => item.coach_id === listing.coach.coach_id && item.course_id === selected_course.course_id) || listing.coach_course;
      const coachCard = {
        name: listing.display_name,
        short: listing.display_name,
        title: selected_course.course_name,
        rating: listing.ui.avg_rating.toFixed(1),
        reviews: listing.ui.review_count,
        area: listing.ui.location_label,
        price: selected_coach_course.price_per_session,
        level: listing.coach.coach_level,
        years: listing.coach.years_experience || 0,
        tags: [selected_course.course_name],
        image: listing.ui.image
      };
      return <CoachCard key={listing.coach.coach_id} coach={coachCard} onClick={() => { onSelectCoach(listing.coach.coach_id, selected_course.course_id); navigate("coach"); }} favorite={favorites.includes(listing.display_name)} onFavorite={() => toggleFavorite(listing.display_name)} />;
    })}</div> : <div className="empty-state"><Search size={25} /><h3>No coaches found</h3><p>Try another name, course, or filter combination.</p><button className="text-link" onClick={() => { setSearch(""); setActiveFilters(emptyFilters); setDraftFilters(emptyFilters); setFiltersApplied(true); }}>Clear search and filters</button></div>}
    <section className="browse-band"><div><p className="eyebrow">TRAIN YOUR WAY</p><h2>A good workout starts with a good match.</h2><p>Explore by goal, not just by gym.</p></div><div className="browse-categories">{["Get stronger", "Move better", "Build a habit"].map((item, index) => <button key={item} onClick={() => { const next = { ...emptyFilters, course_id: index === 0 ? "1" : index === 1 ? "3" : "" }; setActiveFilters(next); setDraftFilters(next); setFiltersApplied(true); }}><span>{["01", "02", "03"][index]}</span>{item}<ArrowUpRight size={16} /></button>)}</div></section>
  </div>;
}

function CoachProfile({ navigate, notify, favorite, toggleFavorite, coach, course_id, onChooseCourse }: {
  navigate: (screen: Screen) => void;
  notify: (message: string) => void;
  favorite: boolean;
  toggleFavorite: () => void;
  coach: (typeof preview_coach_listings)[number];
  course_id: number;
  onChooseCourse: (course_id: number) => void;
}) {
  const offered_courses = preview_coach_courses.filter((item) => item.coach_id === coach.coach.coach_id && item.is_active === 1);
  const selected_course = preview_courses.find((item) => item.course_id === course_id) || coach.course;
  const selected_coach_course = offered_courses.find((item) => item.course_id === selected_course.course_id) || coach.coach_course;
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("explore")}><ArrowLeft size={16} /> Back to coaches</button>
    <section className="coach-profile-hero"><Photo id={coach.ui.image} alt={`${coach.display_name} training`} /><div className="profile-image-shade" /><div className="coach-profile-hero-copy"><Pill className="verified verified-light"><ShieldCheck size={13} /> Verified coach</Pill><h1>{coach.display_name}</h1><p>{selected_course.course_name} Specialist</p><div className="profile-hero-stats"><span><Star size={15} fill="currentColor" /> <b>{coach.ui.avg_rating.toFixed(1)}</b> ({coach.ui.review_count} reviews)</span><span><MapPin size={15} /> {coach.ui.location_label}</span><span><HomePinIcon /> {labels.service_mode[coach.coach.service_mode]}</span></div></div><button className="icon-button profile-favorite" onClick={toggleFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"}><Heart size={20} fill={favorite ? "currentColor" : "none"} /></button></section>
    <div className="coach-profile-columns"><div className="profile-main-column">
      <section className="profile-section"><div className="section-title"><div><h2>About {coach.display_name}</h2><p>How we can work together</p></div><Pill>{coach.coach.years_experience ?? 0} years experience</Pill></div><p className="body-copy">{coach.coach.bio || "A coach who builds a practical plan around your goals and experience."}</p><button className="text-link" onClick={() => notify("This is a local member-side design preview.")}>Read more <ArrowRight size={14} /></button></section>
      <section className="profile-section"><h2>Specialties</h2><div className="tag-row"><Pill><Dumbbell size={13} /> {coach.course.course_name}</Pill></div></section>
      <section className="profile-section"><div className="section-title"><div><h2>Training with {coach.display_name}</h2><p>Choose a session to see available times.</p></div><button className="text-link" onClick={() => navigate("courses")}>All courses <ArrowRight size={14} /></button></div>{offered_courses.map((coach_course) => {
        const course = preview_courses.find((item) => item.course_id === coach_course.course_id);
        if (!course || course.is_active !== 1) return null;
        return <CourseCard key={course.course_id} course={{ name: course.course_name, description: course.description || "", duration: course.default_duration, price: coach_course.price_per_session, level: labels.difficulty[course.difficulty], image: coach.ui.image, kind: course.difficulty }} onClick={() => onChooseCourse(course.course_id)} />;
      })}</section>
      <section className="profile-section"><div className="section-title"><h2>Kind words</h2><button className="text-link" onClick={() => navigate("reviews")}>All reviews <ArrowRight size={14} /></button></div><div className="quote-card"><div className="stars">★★★★★</div><p>“Clear guidance and a session shaped around the member’s goals.”</p><span>Member feedback · Preview data</span></div></section>
    </div><aside className="coach-booking-card"><p className="eyebrow">START YOUR SESSION</p><div className="coach-price">฿{selected_coach_course.price_per_session.toLocaleString()}<small> / session</small></div><p>{selected_course.default_duration} minutes · one-to-one coaching</p><div className="coach-availability"><span className="availability-dot" /> Availability based on the coach schedule</div><div className="coach-service-pills"><Pill><House size={13} /> {labels.service_mode[coach.coach.service_mode]}</Pill><Pill><MapPin size={13} /> {labels.district[coach.gym.district]}</Pill></div><PrimaryButton onClick={() => navigate("courses")}>Choose a session <ArrowRight size={16} /></PrimaryButton><p className="secure-note"><ShieldCheck size={13} /> Preview schedule only.</p></aside></div>
  </div>;
}

function HomePinIcon() { return <House size={14} />; }

function CoursesScreen({ navigate, coach_id, course_id, onSelectCourse }: {
  navigate: (screen: Screen) => void;
  coach_id: number;
  course_id: number;
  onSelectCourse: (course_id: number) => void;
}) {
  const [active, setActive] = useState("All sessions");
  const kinds = ["All sessions", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const offered_courses = preview_coach_courses.filter((item) => item.coach_id === coach_id && item.is_active === 1);
  const shown = preview_courses.filter((course) => course.is_active === 1 &&
    offered_courses.some((item) => item.course_id === course.course_id) &&
    (active === "All sessions" || course.difficulty === active));
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("coach")}><ArrowLeft size={16} /> Coach Tan</button>
    <PageHeading eyebrow="TRAIN WITH TAN" title="Choose your kind of strong." detail="Find a session that fits the way you want to move." />
    <div className="filter-row course-type-tabs">{kinds.map((kind) => <button key={kind} className={`filter-chip ${active === kind ? "selected" : ""}`} onClick={() => setActive(kind)}>{kind === "All sessions" ? kind : labels.difficulty[kind as keyof typeof labels.difficulty]}</button>)}</div>
    <div className="course-list">{shown.map((course) => <CourseCard key={course.course_id} course={{ name: course.course_name, description: course.description || "", duration: course.default_duration, price: offered_courses.find((item) => item.course_id === course.course_id)?.price_per_session || 0, level: labels.difficulty[course.difficulty], image: preview_coach_listings.find((listing) => listing.coach.coach_id === coach_id)?.ui.image || preview_coach_listings[0].ui.image, kind: course.difficulty }} onClick={() => onSelectCourse(course.course_id)} />)}</div>
    <div className="info-callout"><ShieldCheck size={18} /><span><b>Every session is personal.</b><small>Your coach will tailor each workout around your goals and experience.</small></span></div>
  </div>;
}

function BookingScreen({
  coach_id, course_id, booking_date, setBookingDate, start_time, setStartTime, bookingSelectionValid, setBookingSelectionValid,
  service_mode, setMode, district, setDistrict, navigate, coach, course, membership_level
}: {
  coach_id: number; course_id: number; booking_date: string; setBookingDate: (value: string) => void;
  start_time: string; setStartTime: (value: string) => void; bookingSelectionValid: boolean;
  setBookingSelectionValid: (value: boolean) => void; service_mode: "GYM" | "HOME";
  setMode: (value: "GYM" | "HOME") => void; district: string; setDistrict: (value: string) => void;
  navigate: (screen: Screen) => void;
  coach: (typeof preview_coach_listings)[number];
  course: (typeof preview_courses)[number];
  membership_level: MembershipLevel;
}) {
  const coach_course = preview_coach_courses.find((item) => item.coach_id === coach_id && item.course_id === course_id);
  const supportsGym = coach.coach.service_mode !== "HOME" &&
    coach.coach_service.gym_id === coach.gym.gym_id && coach.gym.is_active === 1;
  const supportsHome = coach.coach.service_mode !== "GYM" && coach.coach_service.is_home_service === 1;
  const districts = coach.coach_service.service_area
    ? [coach.coach_service.service_area]
    : Object.keys(labels.district) as (keyof typeof labels.district)[];
  const validPlace = service_mode === "GYM"
    ? supportsGym
    : supportsHome && districts.includes(district as keyof typeof labels.district);
  const validCourse = course.is_active === 1 && coach_course?.is_active === 1 &&
    coach_course.coach_id === coach_id && coach_course.course_id === course_id;
  const canContinue = bookingSelectionValid && validCourse && validPlace;

  useEffect(() => {
    if (service_mode === "GYM" && !supportsGym && supportsHome) {
      setMode("HOME");
      if (coach.coach_service.service_area) setDistrict(coach.coach_service.service_area);
    } else if (service_mode === "HOME" && !supportsHome && supportsGym) {
      setMode("GYM");
    }
  }, [coach.coach_service.service_area, service_mode, setDistrict, setMode, supportsGym, supportsHome]);

  useEffect(() => {
    if (supportsHome && coach.coach_service.service_area && district !== coach.coach_service.service_area) {
      setDistrict(coach.coach_service.service_area);
    }
  }, [coach.coach_service.service_area, district, setDistrict, supportsHome]);

  const validationMessage = !booking_date || !start_time || !bookingSelectionValid
    ? "Choose an available day and start time to continue."
    : !validCourse
      ? "This course is not currently offered by the selected trainer."
      : !validPlace
        ? "Choose a service option supported by this trainer."
        : "";
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("courses")}><ArrowLeft size={16} /> Back to sessions</button>
    <PageHeading eyebrow="BOOK A SESSION" title="Make some time for you." detail="Choose when and where you’d like to train." />
    <div className="booking-layout"><div className="booking-options">
      <section className="booking-course-summary"><Photo id={coach.ui.image} alt="" /><span><small>TRAIN WITH</small><b>{coach.display_name}</b><span>{course.course_name} · {course.default_duration} minutes</span></span><Pill>{labels.coach_level[coach.coach.coach_level]}</Pill></section>
      <MemberBookingPicker
        coach_id={coach_id}
        course_id={course_id}
        booking_date={booking_date}
        start_time={start_time}
        break_interval={coach.coach.break_interval}
        onChange={(fields) => {
          if ("booking_date" in fields) setBookingDate(fields.booking_date || "");
          if ("start_time" in fields) setStartTime(fields.start_time || "");
        }}
        onValidationChange={setBookingSelectionValid}
      />
      {/* TODO(after trainer page done): redesign place selection. Keep its current interaction until then. */}
      <section className="form-section">
        <div className="form-section-title"><span className="step-number">3</span><div><h2>Choose a place</h2><p>Train where it works for you.</p></div></div>
        <div className="mode-toggle">
          <button type="button" className={service_mode === "GYM" ? "selected" : ""} aria-pressed={service_mode === "GYM"} disabled={!supportsGym} onClick={() => setMode("GYM")}><Dumbbell size={16} />Gym</button>
          <button type="button" className={service_mode === "HOME" ? "selected" : ""} aria-pressed={service_mode === "HOME"} disabled={!supportsHome} onClick={() => setMode("HOME")}><House size={16} />At home</button>
        </div>
        {service_mode === "GYM"
          ? <div className="location-select"><MapPin size={16} /><span><b>{coach.gym.gym_name}</b><small>{labels.district[coach.gym.district]} · {coach.gym.address}</small></span></div>
          : <div className="select-field"><label htmlFor="district">Your neighborhood</label><select id="district" value={district} onChange={(event) => setDistrict(event.target.value)}>{districts.map((area) => <option key={area} value={area}>{labels.district[area]}</option>)}</select></div>}
      </section>
    </div>
    <aside className="booking-summary">
      <p className="eyebrow">YOUR SESSION</p>
      <div className="summary-coach"><Photo id={coach.ui.image} alt="" /><span><b>{coach.display_name}</b><small>{course.course_name}</small><small><Star size={12} fill="currentColor" /> {coach.ui.avg_rating} · {coach.ui.review_count} reviews</small></span></div>
      <div className="summary-divider" />
      <div className="summary-line"><span><CalendarDays size={15} /> {booking_date ? formatBookingDate(booking_date) : "Choose a date"}</span></div>
      <div className="summary-line"><span><Clock3 size={15} /> {start_time ? `${formatSqlTime(start_time)} – ${formatSqlTime(addMinutesToSqlTime(start_time, course.default_duration))}` : "Choose a time"}</span></div>
      <div className="summary-line"><span><MapPin size={15} /> {service_mode === "GYM" ? coach.gym.gym_name : `At home · ${labels.district[district as keyof typeof labels.district] || district}`}</span></div>
      <div className="summary-divider" />
      <div className="summary-line"><span>{course.default_duration} min session</span><b>฿{(coach_course?.price_per_session || 0).toLocaleString()}</b></div>
      <div className="summary-line subdued"><span>Trainer buffer · {coach.coach.break_interval} min</span><b>{course.default_duration + coach.coach.break_interval} min reserved</b></div>
      <div className="summary-line subdued"><span>{membership_level.level_name} · {membership_level.discount_rate * 100}%</span><b>−฿{Math.round((coach_course?.price_per_session || 0) * membership_level.discount_rate).toLocaleString()}</b></div>
      <div className="summary-total"><span>Final amount</span><b>฿{Math.round((coach_course?.price_per_session || 0) * (1 - membership_level.discount_rate)).toLocaleString()}</b></div>
      <PrimaryButton disabled={!canContinue} onClick={() => navigate("checkout")}>Continue to checkout <ArrowRight size={16} /></PrimaryButton>
      {!canContinue && <p className="booking-validation-note" role="status">{validationMessage}</p>}
      <p className="secure-note"><ShieldCheck size={13} /> Preview only · no booking or charge is created.</p>
    </aside>
  </div>
  </div>;
}

function CheckoutScreen({
  booking_date, start_time, service_mode, package_type, setPackageChoice, membership_level,
  setLevelId, payment_method, setPaymentMethod, navigate, course, coach
}: {
  booking_date: string; start_time: string; service_mode: "GYM" | "HOME"; package_type: PackageType | null;
  setPackageChoice: (value: PackageType | null) => void; membership_level: MembershipLevel;
  setLevelId: (value: number) => void; payment_method: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void; navigate: (screen: Screen) => void;
  course: (typeof preview_courses)[number];
  coach: (typeof preview_coach_listings)[number];
}) {
  const coach_course = preview_coach_courses.find((item) => item.coach_id === coach.coach.coach_id && item.course_id === course.course_id) || coach.coach_course;
  const methods: { name: string; value: PaymentMethod; detail: string; icon: string }[] = [
    { name: "PromptPay", value: "PROMPTPAY", detail: "Scan to pay", icon: "◉" },
    { name: "Credit / Debit Card", value: "CARD", detail: "Visa, Mastercard", icon: "▣" },
    { name: "Cash", value: "CASH", detail: "Pay in person", icon: "฿" },
    { name: "Package credit", value: "PACKAGE_CREDIT", detail: "Use a remaining session", icon: "◉" }
  ];
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("booking")}><ArrowLeft size={16} /> Back to time selection</button>
    <PageHeading eyebrow="ONE LAST STEP" title="Your time is waiting." detail="Review your session and choose how you’d like to pay." />
    <div className="checkout-layout"><div className="checkout-main">
      <section className="checkout-card"><div className="summary-coach"><Photo id={coach.ui.image} alt="" /><span><b>{coach.display_name}</b><small>{course.course_name}</small><small><Star size={12} fill="currentColor" /> {coach.ui.avg_rating} · ฿{coach_course.price_per_session}</small></span><Pill className="verified-pill"><ShieldCheck size={13} /> Verified</Pill></div><div className="checkout-detail-row"><span><CalendarDays size={15} /> {formatBookingDate(booking_date)} · {formatSqlTime(start_time)}</span><span><MapPin size={15} /> {service_mode === "GYM" ? "Nimman Gym" : "At home"}</span></div></section>
      {package_type === null && <section className="checkout-card"><div className="section-title"><div><h2>Member discount</h2><p>Your membership makes every session go further.</p></div><Pill className="gold-pill"><Award size={13} /> Member</Pill></div><div className="membership-choice-row"><span className="membership-medal"><Trophy size={18} /></span><span><b>{membership_level.level_name}</b><small>{membership_level.discount_rate * 100}% off this session</small></span><strong>− ฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</strong></div><div className="tier-selector">{preview_membership_levels.map((item) => <button key={item.level_id} className={`tier-option ${membership_level.level_id === item.level_id ? "selected" : ""}`} onClick={() => setLevelId(item.level_id)}>{item.level_name.replace(" Member", "")}</button>)}</div></section>}
      <section className="checkout-card"><div className="section-title"><div><h2>Session package</h2><p>Package types follow the FitBooking plan options.</p></div><button className="text-link" onClick={() => navigate("packages")}>Compare plans <ArrowRight size={14} /></button></div><div className="package-choices">{([{ name: "Single session", type: null, price: "฿720", detail: "Flexible, one at a time" }, { name: "5+1 Sessions", type: "5+1", price: "฿3,400", detail: "5 paid + 1 bonus · 180-day validity" }, { name: "10+3 Sessions", type: "10+3", price: "฿8,970", detail: "10 paid + 3 bonus · Best value" }, { name: "20+7 Sessions", type: "20+7", price: "฿17,550", detail: "20 paid + 7 bonus · 180-day validity" }] as { name: string; type: PackageType | null; price: string; detail: string }[]).map(({ name, type, price, detail }) => <button key={type || "single-session"} className={`package-choice ${package_type === type ? "selected" : ""}`} onClick={() => setPackageChoice(type)}><span className="radio-dot" /><span><b>{name}</b><small>{detail}</small></span><strong>{price}</strong></button>)}</div></section>
      <section className="checkout-card"><div className="section-title"><div><h2>Payment method</h2><p>Choose how you’d like to complete your order.</p></div></div><div className="payment-method-list">{methods.map((method) => <button key={method.value} className={`payment-option ${payment_method === method.value ? "selected" : ""}`} onClick={() => setPaymentMethod(method.value)}><span className="radio-dot" /><span className="payment-method-icon">{method.icon}</span><span><b>{method.name}</b><small>{method.detail}</small></span><ChevronRight size={16} /></button>)}</div></section>
    </div><aside className="checkout-total-card"><p className="eyebrow">ORDER SUMMARY</p><div className="summary-line"><span>{course.course_name}</span><b>฿{coach_course.price_per_session}</b></div>{package_type === null ? <div className="summary-line subdued"><span>{membership_level.level_name} · {membership_level.discount_rate * 100}%</span><b>−฿{Math.round(coach_course.price_per_session * membership_level.discount_rate)}</b></div> : <div className="summary-line subdued"><span>{labels.package_type[package_type]} package</span><b>No membership discount</b></div>}<div className="summary-divider" /><div className="summary-total"><span>Total due today</span><b>{package_type === null ? `฿${Math.round(coach_course.price_per_session * (1 - membership_level.discount_rate))}` : package_type === "5+1" ? "฿3,400" : package_type === "20+7" ? "฿17,550" : "฿8,970"}</b></div><PrimaryButton onClick={() => navigate("success")}>Confirm booking <ArrowRight size={16} /></PrimaryButton><p className="secure-note"><ShieldCheck size={13} /> Preview checkout · no real payment</p><button className="text-link checkout-help" onClick={() => navigate("profile")}><CircleHelp size={14} /> Need a hand?</button></aside></div>
  </div>;
}

function SuccessScreen({ booking_date, start_time, navigate, course, coach }: { booking_date: string; start_time: string; navigate: (screen: Screen) => void; course: (typeof preview_courses)[number]; coach: (typeof preview_coach_listings)[number] }) {
  return <div className="content-wrap success-wrap"><div className="success-top"><span className="success-mark"><Check size={32} /></span><p className="eyebrow">IT’S HAPPENING</p><h1>You’re booked, Alex.</h1><p>This is a sample confirmation for the design preview. No booking has been created or saved.</p></div>
    <div className="success-ticket"><div className="ticket-heading"><div><span>YOUR SESSION</span><h2>{course.course_name}</h2></div><Pill className="booking-status preview-pill">Preview only</Pill></div><div className="ticket-coach"><Photo id={coach.ui.image} alt="" /><span><b>{coach.display_name}</b><small>Personal trainer · {labels.coach_level[coach.coach.coach_level]}</small></span><div className="stars">★★★★★ <small>{coach.ui.avg_rating}</small></div></div><div className="ticket-details"><div><CalendarDays size={17} /><span>{formatBookingDate(booking_date)}<small>{course.default_duration} minutes · Chiang Mai</small></span></div><div><Clock3 size={17} /><span>{formatSqlTime(start_time)}<small>Arrive 10 minutes early</small></span></div><div><MapPin size={17} /><span>Nimman Fitness Club<small>Chiang Mai · 1.2 km away</small></span></div></div><div className="ticket-qr"><div className="fake-qr" aria-label="Illustrative check-in QR code"><QrCode size={76} strokeWidth={1.3} /></div><span><b>Illustrative check-in pass</b><small>This preview code cannot be used at the gym.</small></span></div><div className="ticket-actions"><PrimaryButton onClick={() => navigate("bookings")}>View my bookings <ArrowRight size={15} /></PrimaryButton><button className="button button-outline" onClick={() => navigate("home")}>Back to home</button></div></div>
    <button className="text-link success-detail-link" onClick={() => navigate("profile")}>Add to calendar <Plus size={14} /></button>
  </div>;
}

type ReviewFields = Pick<ReviewCoach, "rating_professional" | "rating_communication" | "rating_punctuality" | "rating_effectiveness" | "comment">;

function ReviewForm({ item, onSubmit }: { item: MemberPreviewBooking; onSubmit: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void }) {
  const [rating_professional, setRatingProfessional] = useState(0);
  const [rating_communication, setRatingCommunication] = useState(0);
  const [rating_punctuality, setRatingPunctuality] = useState(0);
  const [rating_effectiveness, setRatingEffectiveness] = useState(0);
  const [comment, setComment] = useState("");
  const ratings = [
    ["rating_professional", "Professionalism", rating_professional, setRatingProfessional],
    ["rating_communication", "Communication", rating_communication, setRatingCommunication],
    ["rating_punctuality", "Punctuality", rating_punctuality, setRatingPunctuality],
    ["rating_effectiveness", "Effectiveness", rating_effectiveness, setRatingEffectiveness]
  ] as const;
  const avg_rating = (rating_professional + rating_communication + rating_punctuality + rating_effectiveness) / 4;
  const canSubmit = ratings.every(([, , value]) => value > 0);
  return <form className="booking-review-form" onSubmit={(event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(item, { rating_professional, rating_communication, rating_punctuality, rating_effectiveness, comment: comment.trim() || null });
  }}>
    <h3>Share your session review</h3>
    {ratings.map(([field, label, value, setValue]) => <div className="review-rating-row" key={field}><span>{label}</span><div role="group" aria-label={field}>{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${label}: ${star} star${star === 1 ? "" : "s"}`} aria-pressed={value === star} onClick={() => setValue(star)}><Star size={17} fill={value >= star ? "currentColor" : "none"} /></button>)}</div></div>)}
    <div className="review-average-preview"><span>Average rating preview</span><b>{canSubmit ? avg_rating.toFixed(2) : "Rate all four categories"}</b></div>
    <label className="review-comment-block">Comment (optional)<textarea name="comment" value={comment} maxLength={1000} onChange={(event) => setComment(event.target.value)} placeholder="Share anything helpful with your coach." /><span>{comment.length} / 1000</span></label>
    <button className="button button-primary" type="submit" disabled={!canSubmit}>Submit review</button>
  </form>;
}

function WrittenReview({ review_coach }: { review_coach: ReviewCoach }) {
  return <div className="booking-written-review"><div><Star size={15} fill="currentColor" /><b>{review_coach.avg_rating.toFixed(2)}</b><span>Average rating</span></div><p>{review_coach.comment || "No written comment."}</p><small>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(review_coach.created_at.replace(" ", "T")))}</small></div>;
}

function BookingsScreen({ tab, setTab, navigate, previewBookings, onOpenBooking, onSubmitReview }: {
  tab: string;
  setTab: (value: string) => void;
  navigate: (screen: Screen) => void;
  previewBookings: MemberPreviewBooking[];
  onOpenBooking: (item: MemberPreviewBooking) => void;
  onSubmitReview: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void;
}) {
  const [reviewDraft, setReviewDraft] = useState<{ booking_id: number; location: "past" | "reviews" } | null>(null);
  const today = dateNow();
  const memberBookings = previewBookings.filter(({ booking }) => booking.member_id === 1);
  const upcoming = memberBookings.filter(({ booking }) => ["PENDING", "CONFIRMED"].includes(booking.status) && booking.booking_date >= today).sort((left, right) => `${left.booking.booking_date} ${left.booking.start_time}`.localeCompare(`${right.booking.booking_date} ${right.booking.start_time}`));
  const past = memberBookings.filter(({ booking }) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)).sort((left, right) => `${right.booking.booking_date} ${right.booking.start_time}`.localeCompare(`${left.booking.booking_date} ${left.booking.start_time}`));
  const visible = tab === "Upcoming" ? upcoming : past;
  const renderBooking = (item: MemberPreviewBooking) => {
    const { booking, course } = item;
    const isReviewing = reviewDraft?.booking_id === booking.booking_id && reviewDraft.location === "past";
    const amount = item.orders[0]?.final_amount ?? booking.price;
    const place = booking.service_mode === "GYM" ? item.gym?.gym_name || "Gym" : booking.service_address || labels.district[booking.service_district || "NIMMAN"];
    return <article className="booking-history-card booking-history-sql-card" key={booking.booking_id}>
      <button className="booking-card-open" onClick={() => onOpenBooking(item)} aria-label={`View details for ${course.course_name}, ${formatBookingDate(booking.booking_date)}`}>
        <span className={`history-status-dot ${bookingStatusClasses[booking.status]}`} />
        <Photo id={item.ui.coach_image} alt="" />
        <span className="history-main"><span className={`booking-status ${bookingStatusClasses[booking.status]}`}>{labels.booking_status[booking.status]}</span><b>{course.course_name}</b><span>{formatBookingDate(booking.booking_date)} · {formatSqlTime(booking.start_time)}–{formatSqlTime(booking.end_time)}</span><small>{item.display_name} · {place}</small></span>
        <span className="history-card-end"><b>฿{amount.toLocaleString()}</b><ChevronRight size={18} /></span>
      </button>
      {booking.status === "PENDING" && <button className="button button-outline booking-card-pay" onClick={() => onOpenBooking(item)}>View payment details</button>}
      {booking.status === "COMPLETED" && !item.review_coach && !isReviewing && <button className="button button-outline booking-card-review" onClick={() => setReviewDraft({ booking_id: booking.booking_id, location: "past" })}><Star size={14} /> Leave review</button>}
      {isReviewing && <ReviewForm item={item} onSubmit={(review_item, reviewFields) => { onSubmitReview(review_item, reviewFields); setReviewDraft(null); }} />}
      {booking.status === "COMPLETED" && item.review_coach && <WrittenReview review_coach={item.review_coach} />}
    </article>;
  };
  const awaitingReview = past.filter(({ booking, review_coach }) => booking.status === "COMPLETED" && !review_coach);
  const writtenReviews = past.filter(({ booking, review_coach }) => booking.status === "COMPLETED" && review_coach);
  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="YOUR TRAINING, YOUR TIME" title="My bookings" detail="Every session is another step toward feeling good." action={<PrimaryButton onClick={() => navigate("explore")}><Plus size={16} /> Book a session</PrimaryButton>} />
    <div className="booking-tabs">{["Upcoming", "Past"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}<span>{item === "Upcoming" ? upcoming.length : past.length}</span></button>)}</div>
    <div className="booking-history-list">{visible.length ? visible.map(renderBooking) : <div className="empty-state"><CalendarDays size={26} /><h3>{tab === "Upcoming" ? "Nothing booked just yet" : "Your past sessions will appear here"}</h3><p>{tab === "Upcoming" ? "Find a coach and choose a time that works for you." : "Completed and cancelled sessions stay available here."}</p><button className="text-link" onClick={() => navigate("explore")}>Find your next session <ArrowRight size={14} /></button></div>}</div>
    <section className="booking-reviews-section"><div className="section-title"><div><h2>Session reviews</h2><p>Share feedback or revisit what you’ve written.</p></div></div>
      <div className="booking-review-list">{awaitingReview.map((item) => <article className="booking-review-row" key={item.booking.booking_id}><span><b>{item.course.course_name}</b><small>{item.display_name} · {formatBookingDate(item.booking.booking_date)}</small></span>{reviewDraft?.booking_id === item.booking.booking_id && reviewDraft.location === "reviews" ? <ReviewForm item={item} onSubmit={(review_item, reviewFields) => { onSubmitReview(review_item, reviewFields); setReviewDraft(null); }} /> : <button className="text-link" onClick={() => setReviewDraft({ booking_id: item.booking.booking_id, location: "reviews" })}><Star size={14} /> Leave review</button>}</article>)}
        {writtenReviews.map((item) => <article className="booking-review-row" key={item.booking.booking_id}><span><b>{item.course.course_name}</b><small>{item.display_name} · {formatBookingDate(item.booking.booking_date)}</small></span>{item.review_coach && <WrittenReview review_coach={item.review_coach} />}</article>)}
        {!awaitingReview.length && !writtenReviews.length && <div className="booking-review-empty">Completed sessions eligible for review will appear here.</div>}
      </div>
    </section>
    <div className="booking-help-strip"><CircleHelp size={17} /><span>Plans change. Need to adjust your session?</span><button className="text-link" onClick={() => navigate("profile")}>Get support</button></div>
  </div>;
}

function BookingDetailScreen({ item, onBack, onPayNow, onSubmitReview, onCancel }: {
  item: MemberPreviewBooking;
  onBack: () => void;
  onPayNow: () => void;
  onSubmitReview: (item: MemberPreviewBooking, reviewFields: ReviewFields) => void;
  onCancel: (item: MemberPreviewBooking, cancel_reason: string) => void;
}) {
  const { booking } = item;
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  useEffect(() => {
    if (booking.status !== "PENDING" || !booking.expires_at) return;
    const update = () => setRemainingSeconds(Math.max(0, Math.floor((new Date(booking.expires_at as string).getTime() - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [booking.expires_at, booking.status]);
  const order = item.orders[0];
  const discount = order?.discount || 0;
  const final_amount = order?.final_amount ?? Math.max(0, booking.price - discount);
  const placeText = booking.service_mode === "GYM"
    ? `${item.gym?.gym_name || "Gym"} · ${item.gym?.address || ""} · ${item.gym ? labels.district[item.gym.district] : ""}`
    : `${booking.service_address || "Home service"} · ${labels.district[booking.service_district || "NIMMAN"]}`;
  const formattedRemaining = remainingSeconds === null ? "" : `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  return <div className="content-wrap narrow-wrap booking-detail-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to sessions</button>
    <section className="booking-detail-header"><Photo id={item.ui.coach_image} alt="" /><div><span className="eyebrow">YOUR TRAINING SESSION</span><h1>{item.display_name}</h1><div><Pill>{labels.coach_level[item.coach.coach_level]}</Pill><span className={`booking-status ${bookingStatusClasses[booking.status]}`}>{labels.booking_status[booking.status]}</span></div></div></section>
    <div className="booking-detail-grid"><section className="booking-detail-card"><h2>Session</h2><dl><div><dt>Course</dt><dd>{item.course.course_name}</dd></div><div><dt>Date</dt><dd>{formatBookingDate(booking.booking_date)}</dd></div><div><dt>Time</dt><dd>{formatSqlTime(booking.start_time)} – {formatSqlTime(booking.end_time)}</dd></div><div><dt>Duration</dt><dd>{booking.duration_minutes} minutes</dd></div><div><dt>Break</dt><dd>{booking.break_minutes} minutes</dd></div><div><dt>Service mode</dt><dd>{labels.service_mode[booking.service_mode]}</dd></div></dl></section>
      <section className="booking-detail-card"><h2>Place</h2><p>{placeText}</p>{booking.service_mode === "HOME" && booking.service_address && <p>{booking.service_address}</p>}</section>
      <section className="booking-detail-card"><h2>Payment</h2><dl><div><dt>Price</dt><dd>฿{booking.price.toLocaleString()}</dd></div><div><dt>Discount</dt><dd>−฿{discount.toLocaleString()}</dd></div><div><dt>Final amount</dt><dd>฿{final_amount.toLocaleString()}</dd></div><div><dt>Payment method</dt><dd>{order?.payment_method ? labels.payment_method[order.payment_method] : "Not selected"}</dd></div><div><dt>Payment status</dt><dd>{order ? labels.payment_status[order.payment_status] : "Unpaid"}</dd></div><div><dt>Payment time</dt><dd>{order?.payment_time || "Not paid"}</dd></div>{booking.package_id !== null && item.member_package && <><div><dt>Package</dt><dd>{labels.package_type[item.member_package.package_type]}</dd></div><div><dt>Remaining sessions</dt><dd>{item.member_package.remaining_sessions}</dd></div></>}</dl></section>
      <section className="booking-detail-card"><h2>Status information</h2>{booking.status === "PENDING" && <p>Payment expires {booking.expires_at || "soon"}{remainingSeconds !== null && <> · {formattedRemaining} remaining</>}{remainingSeconds === 0 && " · Payment window expired"}</p>}{booking.status === "CANCELLED" && <dl><div><dt>Cancelled by</dt><dd>{booking.cancelled_by || "Not recorded"}</dd></div><div><dt>Reason</dt><dd>{booking.cancel_reason || "Not provided"}</dd></div><div><dt>Cancelled at</dt><dd>{booking.cancelled_at || "Not recorded"}</dd></div></dl>}{booking.status === "COMPLETED" && <p>Completed {booking.completed_at || "as recorded in this preview"}.</p>}{booking.status === "CONFIRMED" && <p>Your coach has confirmed this session.</p>}{booking.status === "NO_SHOW" && <p>This session is marked as a no-show.</p>}</section></div>
    {booking.status === "COMPLETED" && <section className="booking-detail-card booking-detail-review"><h2>Review</h2>{item.review_coach ? <WrittenReview review_coach={item.review_coach} /> : <ReviewForm item={item} onSubmit={onSubmitReview} />}</section>}
    <div className="booking-detail-actions">{booking.status === "PENDING" && <PrimaryButton onClick={onPayNow}>Pay now <ArrowRight size={15} /></PrimaryButton>}{["PENDING", "CONFIRMED"].includes(booking.status) && <button className="button button-outline" onClick={() => setCancelDialogOpen(true)}>Cancel session</button>}{booking.status === "COMPLETED" && !item.review_coach && <span>Leave your review above to help your coach.</span>}</div>
    {cancelDialogOpen && <div className="dialog-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title" className="cancel-booking-dialog"><button className="icon-button dialog-close" aria-label="Close cancellation dialog" onClick={() => setCancelDialogOpen(false)}><X size={18} /></button><h2 id="cancel-booking-title">Before you cancel</h2><p>{toBusinessDateTime(booking.booking_date, booking.start_time).getTime() - Date.now() >= 24 * 60 * 60 * 1000 ? "This session is more than 24 hours away. Cancelling now is free; a payment refund or package session return is reflected in this preview." : "This session starts within 24 hours. You can still cancel, but the payment is non-refundable and package credit is not returned."}</p><div className="cancel-dialog-actions"><button className="button button-outline" onClick={() => setCancelDialogOpen(false)}>Keep session</button><button className="button button-primary" onClick={() => { onCancel(item, "Cancelled by member"); setCancelDialogOpen(false); }}>Confirm cancellation</button></div></section></div>}
  </div>;
}

function PackagesScreen({ membership_level, onChoose }: { membership_level: MembershipLevel; onChoose: (name: PackageType) => void }) {
  const plans: { packageType: PackageType; sessions: string; price: string; each: string; saving: string; popular: boolean }[] = [
    { packageType: "5+1", sessions: "5+1 Sessions", price: "฿3,400", each: "฿680 / paid session", saving: "Save 5%", popular: false },
    { packageType: "10+3", sessions: "10+3 Sessions", price: "฿8,970", each: "฿690 / session", saving: "Save 14%", popular: true },
    { packageType: "20+7", sessions: "20+7 Sessions", price: "฿17,550", each: "฿650 / session", saving: "Save 20%", popular: false }
  ];
  return <div className="content-wrap narrow-wrap"><div className="packages-hero"><div><Pill className="pill-glass"><Sparkles size={13} /> A little more momentum</Pill><h1>More sessions.<br />More of what moves you.</h1><p>Make room for the progress you came for.</p></div><div className="package-hero-person"><span>YOUR NEXT CHAPTER</span><Activity size={68} strokeWidth={1.1} /></div></div>
    <div className="section-title package-section-title"><div><h2>Session packages</h2><p>One-on-one time with a coach you choose.</p></div><span className="package-validity"><Clock3 size={14} /> 180 days to use</span></div>
    <div className="package-plan-grid">{plans.map((plan) => <article key={plan.packageType} className={`package-plan ${plan.popular ? "popular" : ""}`}><span className="popular-ribbon" hidden={!plan.popular}>MOST LOVED</span><span className="plan-session-icon"><Dumbbell size={20} /></span><span className="plan-session-count">{plan.sessions}</span><span className="plan-price">{plan.price}</span><span className="plan-each">{plan.each}</span><Pill className="savings-pill">{plan.saving}</Pill><button className={`button ${plan.popular ? "button-primary" : "button-outline"}`} onClick={() => onChoose(plan.packageType)}>View package <ArrowRight size={14} /></button></article>)}</div>
    <section className="membership-progress-card"><div className="membership-medal"><Trophy size={24} /></div><div className="membership-progress-copy"><p className="eyebrow">YOUR MEMBERSHIP</p><h2>{membership_level.level_name}</h2><p>Keep showing up. The next tier is within reach.</p><div className="membership-track"><i /></div><small>฿2,150 until Platinum <span>3 / 5</span></small></div><div className="membership-discount"><b>{membership_level.discount_rate * 100}%</b><span>session discount</span></div></section>
    <div className="package-footnote"><ShieldCheck size={15} /><span>Unused sessions stay on your account. Review the package terms at checkout.</span></div>
  </div>;
}

function ReviewsScreen({
  rating, setRating, tags, toggleTag, notify
}: {
  rating: number; setRating: (value: number) => void; tags: string[]; toggleTag: (value: string) => void; notify: (message: string) => void;
}) {
  const positive = ["Motivating", "Professional", "Friendly", "Knowledgeable", "On time"];
  return <div className="content-wrap narrow-wrap"><button className="back-link" onClick={() => notify("Showing your completed sessions.")}><ArrowLeft size={16} /> Your completed sessions</button><PageHeading eyebrow="YOUR VOICE MATTERS" title="How did training with Tan feel?" detail="Your words help great coaches keep doing what they do." />
    <section className="review-form-card"><div className="review-coach-summary"><Photo id={coaches[0].image} alt="" /><span><b>Coach Tan</b><small>Strength & Conditioning</small></span><span className="review-session-date">Apr 09 · 09:10 AM</span></div><div className="review-rating-block"><h2>How was your session?</h2><p>Tap a star to leave an overall rating.</p><div className="interactive-stars" role="group" aria-label="Rate your session">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setRating(star)} aria-label={`${star} star${star > 1 ? "s" : ""}`}><Star size={29} fill={rating >= star ? "currentColor" : "none"} /></button>)}</div><span className="rating-caption">{["", "Not for me", "Could be better", "It was good", "Really enjoyed it", "Loved it"][rating]}</span></div><div className="review-tag-block"><h3>What stood out?</h3><p>Pick all that feel right.</p><div className="tag-row">{positive.map((tag) => <button key={tag} className={`review-tag ${tags.includes(tag) ? "selected" : ""}`} onClick={() => toggleTag(tag)}>{tags.includes(tag) && <Check size={13} />}{tag}</button>)}</div></div><div className="review-comment-block"><label htmlFor="review-note">Anything else you’d like to share?</label><textarea id="review-note" maxLength={500} placeholder="A few words can mean a lot to your coach…" /><span>0 / 500</span></div><PrimaryButton className="review-submit" onClick={() => notify("Thanks for sharing. Your review is saved in this preview.")}>Share your review <ArrowRight size={15} /></PrimaryButton></section>
    <section className="coach-reviews-block"><div className="section-title"><div><h2>Kind words for Tan</h2><p>Notes from people who’ve trained together.</p></div><div className="review-overall"><Star size={15} fill="currentColor" /><b>4.9</b> <span>128 reviews</span></div></div><div className="quote-card"><div className="stars">★★★★★</div><h3>A coach who really listens.</h3><p>“The first trainer who understood my goals and built a plan I actually look forward to.”</p><span>Nattakarn S. · Apr 05, 2026</span></div></section>
  </div>;
}

function ProgressScreen({ tab, setTab, navigate, account, previewBookings, onOpenBooking }: {
  tab: string;
  setTab: (value: string) => void;
  navigate: (screen: Screen) => void;
  account: PublicDemoAccount;
  previewBookings: MemberPreviewBooking[];
  onOpenBooking: (item: MemberPreviewBooking) => void;
}) {
  const [goalDone, setGoalDone] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(dateNow());
  const [planDate, setPlanDate] = useState(dateNow());
  const monday = dateOffset(weekAnchor, 1 - weekdayForDate(weekAnchor));
  const weekDates = Array.from({ length: 7 }, (_, index) => dateOffset(monday, index));
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];
  const completedThisWeek = previewBookings.filter(({ booking }) => booking.member_id === 1 && booking.status === "COMPLETED" && booking.booking_date >= weekStart && booking.booking_date <= weekEnd);
  const planBookings = previewBookings.filter(({ booking }) => booking.member_id === 1 && ["PENDING", "CONFIRMED"].includes(booking.status) && booking.booking_date >= dateNow() && booking.booking_date <= dateOffset(dateNow(), 30)).sort((left, right) => `${left.booking.booking_date} ${left.booking.start_time}`.localeCompare(`${right.booking.booking_date} ${right.booking.start_time}`));
  const firstWeekday = weekdayForDate(dateNow()) - 1;
  const planDays = Array.from({ length: Math.ceil((firstWeekday + 31) / 7) * 7 }, (_, index) => {
    const planDateValue = dateOffset(dateNow(), index - firstWeekday);
    return planDateValue >= dateNow() && planDateValue <= dateOffset(dateNow(), 30) ? planDateValue : "";
  });
  const planAgenda = planBookings.filter(({ booking }) => booking.booking_date === planDate);
  const timeRows = Array.from({ length: 16 }, (_, index) => index + 6);
  const weekLabel = `${formatBookingDate(weekStart)} – ${formatBookingDate(weekEnd)}`;
  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="SMALL STEPS, BIG FEELING" title="Look how far you’ve come." detail="Your effort, your pace, your progress." />
    <div className="progress-member-strip"><div className="member-avatar large">{account.display_name.slice(0, 1).toUpperCase()}</div><span><b>{account.display_name}</b><small><Pill className="gold-pill"><Award size={12} /> Member</Pill></small></span><span className="progress-updated">Updated today</span></div>
    <div className="progress-tabs">{["Overview", "Metrics", "Goals"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "Overview" && <><section className="metric-section"><div className="section-title"><div><h2>Your body, your baseline</h2><p>Last updated after your check-in.</p></div><button className="text-link" onClick={() => setTab("Metrics")}>View all <ArrowRight size={14} /></button></div><div className="body-metric-grid"><div><span>Weight</span><b>68 <small>kg</small></b><small>−1.2 kg this month</small></div><div><span>Body fat</span><b>12<small>%</small></b><small>Steady this month</small></div><div><span>BMI</span><b>22.1</b><small>Healthy range</small></div></div></section>
      <section className="metric-section"><div className="section-title"><div><h2>Weekly activity</h2><p>Completed training by day and hour.</p></div><Pill>{completedThisWeek.length} completed sessions</Pill></div><div className="progress-week-toolbar"><button className="icon-button" aria-label="Previous week" onClick={() => setWeekAnchor(dateOffset(weekAnchor, -7))}><ChevronLeft size={18} /></button><b>{weekLabel}</b><button className="icon-button" aria-label="Next week" onClick={() => setWeekAnchor(dateOffset(weekAnchor, 7))}><ChevronRight size={18} /></button></div><div className="progress-week-grid" role="table" aria-label="Weekly completed session timetable"><div className="progress-week-head" role="row"><span role="columnheader">Time</span>{weekDates.map((day) => <span role="columnheader" key={day}>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${day}T12:00:00`))}<small>{Number(day.slice(-2))}</small></span>)}</div>{timeRows.map((hour) => <div className="progress-week-row" role="row" key={hour}><span className="progress-week-hour" role="rowheader">{String(hour).padStart(2, "0")}:00</span>{weekDates.map((day) => {
        const sessions = completedThisWeek.filter(({ booking }) => booking.booking_date === day && Number(booking.start_time.slice(0, 2)) === hour);
        return <div className="progress-week-cell" role="cell" key={`${day}-${hour}`}>{sessions.map((item) => <button className="progress-timetable-session" key={item.booking.booking_id} onClick={() => onOpenBooking(item)}><b>{formatSqlTime(item.booking.start_time)}–{formatSqlTime(item.booking.end_time)}</b><span>{item.course.course_name}</span><small>{item.display_name}</small></button>)}</div>;
      })}</div>)}</div>{!completedThisWeek.length && <p className="progress-grid-empty">No completed sessions in this week yet.</p>}</section>
      <section className="metric-section my-plan-section"><div className="section-title"><div><h2>My plan</h2><p>Upcoming bookings for the next 30 days.</p></div><Pill>{planBookings.length} sessions</Pill></div><div className="my-plan-calendar"><div className="my-plan-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div><div className="my-plan-days">{planDays.map((day, index) => {
        const sessionCount = day ? planBookings.filter(({ booking }) => booking.booking_date === day).length : 0;
        return day ? <button className={`my-plan-day ${day === planDate ? "selected" : ""} ${sessionCount ? "has-plan-session" : ""}`} key={day} onClick={() => setPlanDate(day)} aria-pressed={day === planDate}><span>{Number(day.slice(-2))}</span>{sessionCount > 0 && <i aria-label={`${sessionCount} sessions`} />}</button> : <span className="my-plan-day-empty" key={`blank-${index}`} />;
      })}</div></div><div className="my-plan-agenda"><h3>{formatBookingDate(planDate)}</h3>{planAgenda.length ? planAgenda.map((item) => {
        const amount = item.orders[0]?.final_amount ?? item.booking.price;
        const place = item.booking.service_mode === "GYM"
          ? `${item.gym?.gym_name || "Gym"} · ${item.gym ? labels.district[item.gym.district] : ""}`
          : `${item.booking.service_address || "Home service"} · ${labels.district[item.booking.service_district || "NIMMAN"]}`;
        return <button className="my-plan-session" key={item.booking.booking_id} onClick={() => onOpenBooking(item)}><span className="my-plan-session-time">{formatSqlTime(item.booking.start_time)} – {formatSqlTime(item.booking.end_time)}</span><span><b>{item.course.course_name}</b><small>{item.display_name} · {place}</small><small>{item.booking.duration_minutes} min · {labels.service_mode[item.booking.service_mode]} · {labels.booking_status[item.booking.status]} · {item.booking.package_id ? `Package #${item.booking.package_id}` : "Single session"}</small></span><strong>฿{item.booking.price.toLocaleString()} · ฿{amount.toLocaleString()} total</strong><ChevronRight size={17} /></button>;
      }) : <div className="my-plan-empty">No sessions planned for this day. Choose another date or book a session.</div>}</div></section>
      <section className="metric-section"><div className="section-title"><div><h2>Training goals</h2><p>Keep your next step in sight.</p></div><button className="text-link" onClick={() => setTab("Goals")}>All goals <ArrowRight size={14} /></button></div><div className="goal-card"><span className="goal-icon"><Target size={20} /></span><div><b>Build muscle</b><p>Strength & Conditioning plan</p><div className="goal-progress"><i /></div><small>{goalDone ? "Goal complete · nice work!" : "7 of 10 sessions"} <b>{goalDone ? "100%" : "70%"}</b></small></div><button className="icon-button" onClick={() => setGoalDone(!goalDone)} aria-label={goalDone ? "Reset demo goal" : "Complete demo goal"}>{goalDone ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}</button></div></section></>}
    {tab === "Metrics" && <section className="metric-section"><div className="section-title"><div><h2>Body metrics</h2><p>Your latest check-in compared with last month.</p></div><Pill>April 2026</Pill></div><div className="body-metric-grid metrics-detail">{[["Weight", "68 kg", "−1.2 kg"], ["Body fat", "12%", "−0.8%"], ["BMI", "22.1", "Healthy"], ["Sessions", "12", "+3 this month"], ["Active time", "8.5 hrs", "+1.2 hrs"], ["Coach rating", "4.9", "128 reviews"]].map(([name, value, note]) => <div key={name}><span>{name}</span><b>{value}</b><small>{note}</small></div>)}</div></section>}
    {tab === "Goals" && <section className="metric-section"><div className="section-title"><div><h2>Your training goals</h2><p>Progress that’s yours to define.</p></div><button className="text-link" onClick={() => navigate("profile")}><Plus size={15} /> Add a goal</button></div>{[["Build muscle", "7 of 10 sessions", "70%"], ["Move more each week", "3 of 4 sessions", "75%"], ["Feel more flexible", "4 of 8 sessions", "50%"]].map(([goal, sub, percent]) => <div className="goal-card goal-card-spaced" key={goal}><span className="goal-icon"><Target size={20} /></span><div><b>{goal}</b><p>{sub}</p><div className="goal-progress"><i style={{ width: percent }} /></div><small>{percent} complete</small></div><button className="icon-button" onClick={() => setGoalDone(!goalDone)}><MoreHorizontal size={18} /></button></div>)}</section>}
    <div className="training-areas"><p className="eyebrow">YOU’VE BEEN MOVING</p><div className="tag-row">{["Strength", "HIIT", "Mobility", "Yoga"].map((area) => <Pill key={area}><Dumbbell size={13} /> {area}</Pill>)}</div></div>
  </div>;
}

function ProfileScreen({ tab, setTab, notify, account, onSignOut, onSave }: {
  tab: string;
  setTab: (value: string) => void;
  notify: (message: string) => void;
  account: PublicDemoAccount;
  onSignOut: () => void;
  onSave: (changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date" | "gender" | "height_cm" | "weight_kg" | "fitness_goal">>) => Promise<void>;
}) {
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState(account.display_name);
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone);
  const [birthDate, setBirthDate] = useState(account.birth_date || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">(account.gender || "");
  const [heightCm, setHeightCm] = useState(account.height_cm ? String(account.height_cm) : "");
  const [weightKg, setWeightKg] = useState(account.weight_kg ? String(account.weight_kg) : "");
  const [fitnessGoal, setFitnessGoal] = useState(account.fitness_goal || "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const tabs = ["Personal information", "Membership", "Notifications", "Payment methods", "Payment history", "Help & support"];

  const handleSavePersonal = async () => {
    setFormError("");
    const name = displayName.trim();
    if (!name || name.length < 2) {
      setFormError("Full name is required (at least 2 characters).");
      return;
    }
    const emailTrim = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    const phoneTrim = phone.trim();
    if (!/^(\+?[0-9\s\-()]{8,20})$/.test(phoneTrim)) {
      setFormError("Please enter a valid phone number (at least 8 digits).");
      return;
    }

    let h: number | null = null;
    if (heightCm) {
      const parsedH = Number(heightCm);
      if (!Number.isFinite(parsedH) || parsedH < 40 || parsedH > 260) {
        setFormError("Height must be a valid number between 40 and 260 cm.");
        return;
      }
      h = parsedH;
    }

    let w: number | null = null;
    if (weightKg) {
      const parsedW = Number(weightKg);
      if (!Number.isFinite(parsedW) || parsedW < 20 || parsedW > 350) {
        setFormError("Weight must be a valid number between 20 and 350 kg.");
        return;
      }
      w = parsedW;
    }

    setSaving(true);
    try {
      const changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date" | "gender" | "height_cm" | "weight_kg" | "fitness_goal">> = {};
      if (name !== account.display_name) changes.display_name = name;
      if (emailTrim !== account.email) changes.email = emailTrim;
      if (phoneTrim !== account.phone) changes.phone = phoneTrim;
      if ((birthDate || null) !== (account.birth_date || null)) changes.birth_date = birthDate || null;
      const g = gender ? (gender as "MALE" | "FEMALE" | "OTHER") : null;
      if (g !== (account.gender || null)) changes.gender = g;
      if (h !== account.height_cm) changes.height_cm = h;
      if (w !== account.weight_kg) changes.weight_kg = w;
      const goal = fitnessGoal.trim() || null;
      if (goal !== (account.fitness_goal || null)) changes.fitness_goal = goal;

      if (Object.keys(changes).length === 0) {
        notify("No changes to save.");
        return;
      }

      await onSave(changes);
    } catch (err: any) {
      setFormError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="A LITTLE MORE ABOUT YOU" title="Your profile" detail="Keep your details and preferences up to date." />
    <section className="profile-summary-card">
      <div className="member-avatar large">{account.display_name.slice(0, 1).toUpperCase()}</div>
      <div>
        <h2>{account.display_name}</h2>
        <span className="profile-email">{account.email}</span>
        <Pill className="gold-pill"><Award size={12} /> {account.level_code || "MEMBER"}</Pill>
      </div>
      <button className="text-link" onClick={() => setTab("Personal information")}>Edit profile <ArrowRight size={14} /></button>
    </section>
    <div className="profile-settings-layout">
      <nav className="settings-menu">{tabs.map((item, index) => {
        const icons = [UserRound, Award, Bell, CreditCard, Wallet, CircleHelp];
        const Icon = icons[index];
        return <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}><Icon size={17} />{item}<ChevronRight size={15} /></button>;
      })}<button className="settings-signout" onClick={onSignOut}><LogOut size={17} /> Sign out</button></nav>
      <section className="settings-detail-panel">
        <div className="section-title">
          <div>
            <h2>{tab}</h2>
            <p>Manage your FitBooking preferences.</p>
          </div>
          <button className="icon-button" aria-label="More settings"><MoreHorizontal size={19} /></button>
        </div>
        {tab === "Personal information" && (
          <div className="settings-form">
            <label className="settings-field">
              Username (read-only)
              <input value={account.username} readOnly disabled className="input-readonly" />
              <small className="field-hint">The username is permanent and cannot be modified via API.</small>
            </label>
            <div className="admin-form-grid">
              <label className="settings-field">
                Full name <span className="req-star">*</span>
                <input value={displayName} onChange={(e) => { setDisplayName(e.target.value); setFormError(""); }} maxLength={100} />
              </label>
              <label className="settings-field">
                Email address <span className="req-star">*</span>
                <input value={email} type="email" onChange={(e) => { setEmail(e.target.value); setFormError(""); }} maxLength={100} />
              </label>
            </div>
            <div className="admin-form-grid">
              <label className="settings-field">
                Phone number <span className="req-star">*</span>
                <input value={phone} onChange={(e) => { setPhone(e.target.value); setFormError(""); }} maxLength={20} />
              </label>
              <label className="settings-field">
                Gender
                <select value={gender} onChange={(e) => { setGender(e.target.value as any); setFormError(""); }}>
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>
            <div className="admin-form-grid">
              <label className="settings-field">
                Date of birth
                <input value={birthDate} type="date" onChange={(e) => { setBirthDate(e.target.value); setFormError(""); }} />
              </label>
              <label className="settings-field">
                Height (cm)
                <input value={heightCm} type="number" min="40" max="260" step="0.1" placeholder="e.g. 165.0" onChange={(e) => { setHeightCm(e.target.value); setFormError(""); }} />
              </label>
            </div>
            <div className="admin-form-grid">
              <label className="settings-field">
                Weight (kg)
                <input value={weightKg} type="number" min="20" max="350" step="0.1" placeholder="e.g. 58.0" onChange={(e) => { setWeightKg(e.target.value); setFormError(""); }} />
              </label>
              <label className="settings-field">
                Fitness goal
                <input value={fitnessGoal} maxLength={200} placeholder="What are you working toward?" onChange={(e) => { setFitnessGoal(e.target.value); setFormError(""); }} />
              </label>
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <PrimaryButton onClick={handleSavePersonal} disabled={saving}>
              {saving ? "Saving changes…" : "Save changes"} <Check size={15} />
            </PrimaryButton>
          </div>
        )}
        {tab === "Membership" && (
          <div className="setting-membership">
            <span className="membership-medal"><Trophy size={22} /></span>
            <div>
              <Pill className="gold-pill">{account.level_code || "GOLD"} MEMBER</Pill>
              <h3>{account.level_name || "Gold Member"}</h3>
              <p>{Math.round((account.discount_rate || 0.1) * 100)}% off sessions · ฿{(account.total_spend || 7850).toLocaleString()} spent to date</p>
              <div className="membership-track"><i /></div>
              <small>Tier discount applied automatically on booking checkout</small>
              <button className="text-link" onClick={() => notify("Membership tiers shown in the Packages screen.")}>
                View membership benefits <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
        {tab === "Notifications" && <div className="notification-setting"><div><b>Session reminders</b><p>Get a note before your next training session.</p></div><button className={`toggle-switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)} aria-pressed={notifications} aria-label="Toggle session reminders"><i /></button></div>}
        {tab === "Payment methods" && <div className="saved-payment"><span className="payment-method-icon">◉</span><div><b>PromptPay</b><small>Connected · ending 4821</small></div><button className="text-link" onClick={() => notify("Payment method controls are a visual preview.")}>Manage</button></div>}
        {tab === "Payment history" && <div className="payment-history-list">{[["Apr 09, 2026", "Strength & Conditioning", "฿720"], ["Apr 02, 2026", "5 session package", "฿3,400"], ["Mar 26, 2026", "Mobility & Flexibility", "฿585"]].map(([day, item, amount]) => <div key={day}><span><b>{item}</b><small>{day} · Paid</small></span><strong>{amount}</strong></div>)}</div>}
        {tab === "Help & support" && <div className="help-panel"><span className="help-round"><MessageCircle size={20} /></span><h3>We’re here to help.</h3><p>Questions about your session, coach, or membership? Our Chiang Mai support team is happy to help.</p><button className="button button-outline" onClick={() => notify("Support chat opened in this preview.")}>Start a conversation <ArrowRight size={14} /></button></div>}
      </section>
    </div>
  </div>;
}

function AdminScreen({ navigate, notify }: { navigate: (screen: Screen) => void; notify: (message: string) => void }) {
  const [active, setActive] = useState("Overview");
  const items = [["Overview", House], ["Users", UsersRound], ["Coaches", Dumbbell], ["Gyms & Courses", MapPin], ["Bookings", CalendarDays], ["KPI Rules", Target], ["Audit Log", ShieldCheck], ["Settings", Settings]] as const;
  const shortcutIcons = [Dumbbell, MapPin, Activity, Target, ShieldCheck] as const;
  return <div className="admin-portal"><header className="admin-topline"><Brand /><span>Chiang Mai, Thailand</span><button className="icon-button" onClick={() => notify("Admin notifications are clear.")}><Bell size={17} /></button></header><div className="admin-layout"><aside className="admin-sidebar"><p className="side-label">WORKSPACE</p>{items.map(([item, Icon]) => <button key={item} className={`side-link ${active === item ? "active" : ""}`} onClick={() => setActive(item)}><Icon size={16} />{item}</button>)}<div className="admin-user"><span className="member-avatar">AD</span><span><b>Admin FitBooking</b><small>Administrator</small></span><ChevronDown size={14} /></div></aside><div className="admin-main"><div className="admin-heading"><div><p className="eyebrow">FITBOOKING / ADMIN</p><h1>{active === "Overview" ? "A healthier week starts here." : active}</h1><p>Tuesday, April 16, 2026 · A snapshot of what’s moving.</p></div><button className="button button-primary" onClick={() => notify("Coach form opened in this preview.")}><Plus size={15} /> Add a coach</button></div>
      <div className="admin-stat-grid">{[["Total users", "1,248", "+12.4%", UsersRound], ["Active coaches", "48", "+8.2%", Dumbbell], ["Total bookings", "892", "+18.1%", CalendarDays], ["This month", "฿186.4K", "+12.8%", Wallet]].map(([label, value, change, Icon]) => <div className="admin-stat" key={label as string}><span>{label as string}</span><strong>{value as string}</strong><small><TrendingUp size={12} /> {change as string} this month</small><div className="admin-stat-icon"><Icon size={18} /></div></div>)}</div>
      <div className="admin-dashboard-grid"><section className="admin-panel chart-panel"><div className="section-title"><div><h2>Bookings over time</h2><p>A steady month of showing up.</p></div><select aria-label="Chart date range"><option>Last 7 days</option><option>Last 30 days</option><option>This year</option></select></div><div className="admin-chart"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-bars">{[38, 53, 47, 68, 56, 79, 69, 88, 72, 96, 83, 100].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{["Apr 05", "Apr 07", "Apr 09", "Apr 11", "Apr 13", "Apr 15"][Math.floor(index / 2)]}</small></div>)}</div></div></section>
      <section className="admin-panel quick-actions-panel"><div className="section-title"><div><h2>Quick actions</h2><p>Manage the moving parts.</p></div><MoreHorizontal size={17} /></div><div className="admin-shortcut-list">{["Manage coaches", "Manage gyms", "Manage courses", "KPI rules", "View audit log"].map((item, index) => { const Icon = shortcutIcons[index]; return <button key={item} onClick={() => { setActive(item === "Manage coaches" ? "Coaches" : item); notify(`${item} preview opened.`); }}><span><Icon size={14} /></span>{item}<ArrowUpRight size={13} /></button>; })}</div></section>
      <section className="admin-panel recent-panel"><div className="section-title"><div><h2>Recent activity</h2><p>Good things are happening.</p></div><button className="text-link" onClick={() => setActive("Audit Log")}>View all <ArrowRight size={14} /></button></div><div className="recent-activity-list">{[["New booking", "Strength & Conditioning · Coach Tan", "2m"], ["Coach registered", "Ploy S. · Advanced", "18m"], ["Payment received", "฿3,400 · 5-session package", "42m"], ["Profile updated", "Alex Morgan · Gold Member", "1h"]].map(([title, detail, time]) => <div key={title}><span className="activity-success"><Check size={13} /></span><span><b>{title}</b><small>{detail}</small></span><time>{time}</time></div>)}</div></section>
      <section className="admin-panel kpi-panel"><div className="section-title"><div><h2>Coach performance</h2><p>This month’s pulse.</p></div><button className="text-link" onClick={() => setActive("KPI Rules")}>KPI rules <ArrowRight size={14} /></button></div><div className="coach-kpi-row">{[["Hours", "76.5", "80", "95%"], ["Rating", "4.9", "4.8", "100%"], ["Retention", "82%", "75%", "100%"]].map(([label, current, target, percent]) => <div key={label}><span>{label}</span><b>{current}<small> / {target}</small></b><div className="kpi-mini-track"><i style={{ width: percent }} /></div></div>)}</div><div className="admin-kpi-coach"><Photo id={coaches[0].image} alt="" /><span><b>Tan Chaiyaporn</b><small>Advanced · 24 sessions completed</small></span><Pill className="confirmed-pill">On track</Pill></div></section></div>
      <div className="admin-preview-footer"><span>UI preview only · Demo data</span><button className="text-link" onClick={() => navigate("home")}>Back to member app <ArrowRight size={14} /></button></div>
    </div></div></div>;
}
