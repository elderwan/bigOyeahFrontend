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
  MemberMessages, PackageDetailScreen, RoleWorkspace, SignInScreen, SignUpScreen
} from "@/components/fitbooking-workspaces";

export type Screen =
  | "welcome" | "home" | "explore" | "coach" | "courses" | "booking"
  | "checkout" | "success" | "bookings" | "packages" | "reviews"
  | "packageDetail" | "progress" | "profile" | "signin" | "signup"
  | "trainerHome" | "trainerSchedule" | "trainerMessages" | "messages" | "trainerClients"
  | "trainerProgress" | "admin" | "adminBookings" | "adminMembers"
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
  "bookings", "packages", "packageDetail", "reviews", "progress", "profile", "messages"
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

const bookings = [
  { date: "Tue, Apr 16", time: "09:10 AM", title: "Strength & Conditioning", coach: "Coach Tan", place: "Nimman Gym", status: "Upcoming", price: 800, image: coaches[0].image },
  { date: "Thu, Apr 18", time: "05:00 PM", title: "Yoga", coach: "Coach May", place: "Old City", status: "Upcoming", price: 660, image: coaches[1].image },
  { date: "Sat, Apr 20", time: "10:30 AM", title: "HIIT", coach: "Coach Jeff", place: "Central", status: "Pending", price: 750, image: coaches[2].image },
  { date: "Mon, Apr 08", time: "06:00 AM", title: "Mobility & Flexibility", coach: "Coach Ploy", place: "Hang Dong", status: "Past", price: 650, image: coaches[3].image }
];

function imageUrl(id: string, width = 720) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
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
  const [filter, setFilter] = useState("All coaches");
  const [bookingTab, setBookingTab] = useState("Upcoming");
  const [bookingDate, setBookingDate] = useState("Tue, Apr 16");
  const [bookingTime, setBookingTime] = useState("09:10 AM");
  const [serviceMode, setServiceMode] = useState("Gym");
  const [district, setDistrict] = useState("NIMMAN");
  const [payment, setPayment] = useState("PromptPay");
  const [packageChoice, setPackageChoice] = useState("5+1");
  const [membership, setMembership] = useState("Gold Member");
  const [rating, setRating] = useState(5);
  const [reviewTags, setReviewTags] = useState<string[]>(["Motivating", "Professional"]);
  const [metricTab, setMetricTab] = useState("Overview");
  const [profileTab, setProfileTab] = useState("Personal information");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);

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
    try {
      setAccount(readDemoSession());
    } catch (issue) {
      setToast(issue instanceof Error ? issue.message : "The saved browser profile could not be read.");
      setScreen("signin");
    } finally {
      setAuthReady(true);
    }
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
    const target: Screen = nextAccount.role === "ADMIN" ? "admin" : nextAccount.role === "COACH" ? "trainerHome" : "home";
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
  };
  const updateProfile = (changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date">>) => {
    if (!account) return;
    try {
      const updated = updateDemoMember(account.user_id, changes);
      saveDemoSession(updated);
      setAccount(updated);
      notify("Your profile details are saved in this browser.");
    } catch (issue) {
      notify(issue instanceof Error ? issue.message : "Your profile could not be saved in this browser.");
    }
  };
  const toggleFavorite = (name: string) => setFavorites((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch = `${coach.short} ${coach.title} ${coach.area} ${coach.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All coaches" || coach.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())) || coach.area.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const toggleTag = (tag: string) => setReviewTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);

  if (!authReady) return <main className="auth-loading"><Brand /><p>Opening your FitBooking preview…</p></main>;
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
        {screen === "explore" && <ExploreScreen search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} coaches={filteredCoaches} favorites={favorites} toggleFavorite={toggleFavorite} navigate={navigate} />}
        {screen === "coach" && <CoachProfile navigate={navigate} notify={notify} favorite={favorites.includes(coaches[0].name)} toggleFavorite={() => toggleFavorite(coaches[0].name)} />}
        {screen === "courses" && <CoursesScreen navigate={navigate} />}
        {screen === "booking" && <BookingScreen date={bookingDate} setDate={setBookingDate} time={bookingTime} setTime={setBookingTime} mode={serviceMode} setMode={setServiceMode} district={district} setDistrict={setDistrict} navigate={navigate} />}
        {screen === "checkout" && <CheckoutScreen date={bookingDate} time={bookingTime} mode={serviceMode} packageChoice={packageChoice} setPackageChoice={setPackageChoice} membership={membership} setMembership={setMembership} payment={payment} setPayment={setPayment} navigate={navigate} />}
        {screen === "success" && <SuccessScreen date={bookingDate} time={bookingTime} navigate={navigate} />}
        {screen === "bookings" && <BookingsScreen tab={bookingTab} setTab={setBookingTab} navigate={navigate} />}
        {screen === "packages" && <PackagesScreen membership={membership} setMembership={setMembership} notify={notify} onChoose={(name) => { setSelectedPackage(name); navigate("packageDetail"); }} />}
        {screen === "packageDetail" && <PackageDetailScreen selected={selectedPackage} onBack={() => navigate("packages")} onChoose={(name) => { setSelectedPackage(name); setPackageChoice(name); navigate("checkout"); }} />}
        {screen === "reviews" && <ReviewsScreen rating={rating} setRating={setRating} tags={reviewTags} toggleTag={toggleTag} notify={notify} />}
        {screen === "progress" && account && <ProgressScreen tab={metricTab} setTab={setMetricTab} navigate={navigate} account={account} />}
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
  search, setSearch, filter, setFilter, coaches: visibleCoaches, favorites, toggleFavorite, navigate
}: {
  search: string; setSearch: (value: string) => void; filter: string; setFilter: (value: string) => void;
  coaches: typeof coaches; favorites: string[]; toggleFavorite: (name: string) => void; navigate: (screen: Screen) => void;
}) {
  const filters = ["All coaches", "Strength", "HIIT", "Mobility", "Nimman", "Old City"];
  return <div className="content-wrap">
    <PageHeading eyebrow="Find your fit" title="The right coach changes everything." detail="Good people, smart training, and a plan that feels like yours." />
    <div className="search-bar"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, specialty, or location" aria-label="Search coaches" /><button className="filter-button" onClick={() => setFilter(filter === "All coaches" ? "Strength" : "All coaches")}><SlidersHorizontal size={16} /> Filters</button></div>
    <div className="filter-row">{filters.map((item) => <button key={item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="explore-location-row"><span><MapPin size={15} /> In Chiang Mai</span><button onClick={() => setFilter("Nimman")}>Change location <ChevronDown size={14} /></button><span className="result-count">{visibleCoaches.length} coaches</span></div>
    {visibleCoaches.length ? <div className="coach-grid">{visibleCoaches.map((coach) => <CoachCard key={coach.name} coach={coach} onClick={() => navigate("coach")} favorite={favorites.includes(coach.name)} onFavorite={() => toggleFavorite(coach.name)} />)}</div> : <div className="empty-state"><Search size={25} /><h3>No coaches found</h3><p>Try another name, specialty, or neighborhood.</p><button className="text-link" onClick={() => { setSearch(""); setFilter("All coaches"); }}>Clear search</button></div>}
    <section className="browse-band"><div><p className="eyebrow">TRAIN YOUR WAY</p><h2>A good workout starts with a good match.</h2><p>Explore by goal, not just by gym.</p></div><div className="browse-categories">{["Get stronger", "Move better", "Build a habit"].map((item, index) => <button key={item} onClick={() => setFilter(index === 0 ? "Strength" : index === 1 ? "Mobility" : "All coaches")}><span>{["01", "02", "03"][index]}</span>{item}<ArrowUpRight size={16} /></button>)}</div></section>
  </div>;
}

function CoachProfile({ navigate, notify, favorite, toggleFavorite }: { navigate: (screen: Screen) => void; notify: (message: string) => void; favorite: boolean; toggleFavorite: () => void }) {
  const coach = coaches[0];
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("explore")}><ArrowLeft size={16} /> Back to coaches</button>
    <section className="coach-profile-hero"><Photo id={coach.image} alt="Coach Tan training" /><div className="profile-image-shade" /><div className="coach-profile-hero-copy"><Pill className="verified verified-light"><ShieldCheck size={13} /> Verified coach</Pill><h1>Tan Chaiyaporn</h1><p>Strength & Conditioning Specialist</p><div className="profile-hero-stats"><span><Star size={15} fill="currentColor" /> <b>4.9</b> (128 reviews)</span><span><MapPin size={15} /> Nimman, Old City, Central</span><span><HomePinIcon /> Gym / Home</span></div></div><button className="icon-button profile-favorite" onClick={toggleFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"}><Heart size={20} fill={favorite ? "currentColor" : "none"} /></button></section>
    <div className="coach-profile-columns"><div className="profile-main-column">
      <section className="profile-section"><div className="section-title"><div><h2>About Tan</h2><p>How we can work together</p></div><Pill>6 years experience</Pill></div><p className="body-copy">I’m a certified personal trainer who believes strong bodies are built one good session at a time. I focus on building strength, improving mobility, and finding an approach that feels sustainable for you.</p><button className="text-link" onClick={() => notify("Tan's full profile is part of this design preview.")}>Read more <ArrowRight size={14} /></button></section>
      <section className="profile-section"><h2>Specialties</h2><div className="tag-row">{coach.tags.map((tag) => <Pill key={tag}><Dumbbell size={13} /> {tag}</Pill>)}</div></section>
      <section className="profile-section"><div className="section-title"><div><h2>Training with Tan</h2><p>Choose a session to see available times.</p></div><button className="text-link" onClick={() => navigate("courses")}>All courses <ArrowRight size={14} /></button></div>{courses.slice(0, 2).map((course) => <CourseCard key={course.name} course={course} onClick={() => navigate("booking")} />)}</section>
      <section className="profile-section"><div className="section-title"><h2>Kind words</h2><button className="text-link" onClick={() => navigate("reviews")}>All reviews <ArrowRight size={14} /></button></div><div className="quote-card"><div className="stars">★★★★★</div><p>“Coach Tan keeps every session challenging but encouraging. I’m stronger than I thought I could be.”</p><span>Nattakarn S. · April 05, 2026</span></div></section>
    </div><aside className="coach-booking-card"><p className="eyebrow">START YOUR SESSION</p><div className="coach-price">฿{coach.price.toLocaleString()}<small> / session</small></div><p>60 minutes · one-to-one coaching</p><div className="coach-availability"><span className="availability-dot" /> Next opening <strong>Today, 09:10</strong></div><div className="coach-service-pills"><Pill><House size={13} /> Gym</Pill><Pill><MapPin size={13} /> At home</Pill></div><PrimaryButton onClick={() => navigate("courses")}>Choose a session <ArrowRight size={16} /></PrimaryButton><p className="secure-note"><ShieldCheck size={13} /> Your schedule stays yours.</p></aside></div>
  </div>;
}

function HomePinIcon() { return <House size={14} />; }

function CoursesScreen({ navigate }: { navigate: (screen: Screen) => void }) {
  const [active, setActive] = useState("All sessions");
  const kinds = ["All sessions", "Strength", "Cardio", "Mobility"];
  const shown = courses.filter((course) => active === "All sessions" || course.kind === active);
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("coach")}><ArrowLeft size={16} /> Coach Tan</button>
    <PageHeading eyebrow="TRAIN WITH TAN" title="Choose your kind of strong." detail="Find a session that fits the way you want to move." />
    <div className="filter-row course-type-tabs">{kinds.map((kind) => <button key={kind} className={`filter-chip ${active === kind ? "selected" : ""}`} onClick={() => setActive(kind)}>{kind}</button>)}</div>
    <div className="course-list">{shown.map((course) => <CourseCard key={course.name} course={course} onClick={() => navigate("booking")} />)}</div>
    <div className="info-callout"><ShieldCheck size={18} /><span><b>Every session is personal.</b><small>Your coach will tailor each workout around your goals and experience.</small></span></div>
  </div>;
}

function BookingScreen({
  date, setDate, time, setTime, mode, setMode, district, setDistrict, navigate
}: {
  date: string; setDate: (value: string) => void; time: string; setTime: (value: string) => void;
  mode: string; setMode: (value: string) => void; district: string; setDistrict: (value: string) => void; navigate: (screen: Screen) => void;
}) {
  const dates = [["Mon, Apr 15", "15"], ["Tue, Apr 16", "16"], ["Wed, Apr 17", "17"], ["Thu, Apr 18", "18"], ["Fri, Apr 19", "19"]];
  const times = ["08:00 AM", "09:10 AM", "10:30 AM", "01:00 PM", "03:20 PM", "05:00 PM"];
  const districts = ["NIMMAN", "OLD CITY", "CENTRAL", "MAE RIM", "HANG DONG"];
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("courses")}><ArrowLeft size={16} /> Back to sessions</button>
    <PageHeading eyebrow="BOOK A SESSION" title="Make some time for you." detail="Choose when and where you’d like to train." />
    <div className="booking-layout"><div className="booking-options">
      <section className="form-section"><div className="form-section-title"><span className="step-number">1</span><div><h2>Pick a day</h2><p>April 2026</p></div><button className="icon-button" aria-label="Next month"><ChevronRight size={18} /></button></div><div className="date-picker">{dates.map(([label, day]) => <button key={day} className={`date-option ${date === label ? "selected" : ""}`} onClick={() => setDate(label)}><small>{label.split(",")[0]}</small><b>{day}</b><i /></button>)}</div></section>
      <section className="form-section"><div className="form-section-title"><span className="step-number">2</span><div><h2>Find a time</h2><p>All times are Chiang Mai time.</p></div></div><div className="time-grid">{times.map((slot) => <button key={slot} className={`time-option ${time === slot ? "selected" : ""} ${slot === "08:00 AM" ? "time-unavailable" : ""}`} disabled={slot === "08:00 AM"} onClick={() => setTime(slot)}>{slot}</button>)}</div></section>
      <section className="form-section"><div className="form-section-title"><span className="step-number">3</span><div><h2>Choose a place</h2><p>Train where it works for you.</p></div></div><div className="mode-toggle">{["Gym", "At home"].map((item) => <button key={item} className={mode === item ? "selected" : ""} onClick={() => setMode(item)}>{item === "Gym" ? <Dumbbell size={16} /> : <House size={16} />}{item}</button>)}</div>{mode === "Gym" ? <button className="location-select"><MapPin size={16} /><span><b>Nimman Fitness Club</b><small>Nimman · Open until 10:00 PM</small></span><ChevronDown size={16} /></button> : <div className="select-field"><label htmlFor="district">Your neighborhood</label><select id="district" value={district} onChange={(event) => setDistrict(event.target.value)}>{districts.map((area) => <option key={area}>{area}</option>)}</select></div>}</section>
    </div><aside className="booking-summary"><p className="eyebrow">YOUR SESSION</p><div className="summary-coach"><Photo id={coaches[0].image} alt="" /><span><b>Coach Tan</b><small>Strength & Conditioning</small><small><Star size={12} fill="currentColor" /> 4.9 · 128 reviews</small></span></div><div className="summary-divider" /><div className="summary-line"><span><CalendarDays size={15} /> {date}</span><b>{time}</b></div><div className="summary-line"><span><MapPin size={15} /> {mode === "Gym" ? "Nimman Gym" : `At home · ${district}`}</span></div><div className="summary-divider" /><div className="summary-line"><span>60 min session</span><b>฿800</b></div><div className="summary-line subdued"><span>Gold member discount</span><b>−10%</b></div><div className="summary-total"><span>Session total</span><b>฿720</b></div><PrimaryButton onClick={() => navigate("checkout")}>Continue to checkout <ArrowRight size={16} /></PrimaryButton><p className="secure-note"><ShieldCheck size={13} /> You won’t be charged yet.</p></aside></div>
  </div>;
}

function CheckoutScreen({
  date, time, mode, packageChoice, setPackageChoice, membership, setMembership, payment, setPayment, navigate
}: {
  date: string; time: string; mode: string; packageChoice: string; setPackageChoice: (value: string) => void;
  membership: string; setMembership: (value: string) => void; payment: string; setPayment: (value: string) => void; navigate: (screen: Screen) => void;
}) {
  const methods = [{ name: "PromptPay", detail: "Scan to pay", icon: "◉" }, { name: "Credit / Debit Card", detail: "Visa, Mastercard", icon: "▣" }, { name: "TrueMoney Wallet", detail: "Fast and easy", icon: "◉" }];
  return <div className="content-wrap narrow-wrap">
    <button className="back-link" onClick={() => navigate("booking")}><ArrowLeft size={16} /> Back to time selection</button>
    <PageHeading eyebrow="ONE LAST STEP" title="Your time is waiting." detail="Review your session and choose how you’d like to pay." />
    <div className="checkout-layout"><div className="checkout-main">
      <section className="checkout-card"><div className="summary-coach"><Photo id={coaches[0].image} alt="" /><span><b>Coach Tan</b><small>Strength & Conditioning</small><small><Star size={12} fill="currentColor" /> 4.9 · 800 ฿</small></span><Pill className="verified-pill"><ShieldCheck size={13} /> Verified</Pill></div><div className="checkout-detail-row"><span><CalendarDays size={15} /> {date} · {time}</span><span><MapPin size={15} /> {mode === "Gym" ? "Nimman Gym" : "At home"}</span></div></section>
      <section className="checkout-card"><div className="section-title"><div><h2>Member discount</h2><p>Your membership makes every session go further.</p></div><Pill className="gold-pill"><Award size={13} /> Member</Pill></div><div className="membership-choice-row"><span className="membership-medal"><Trophy size={18} /></span><span><b>{membership}</b><small>10% off every session</small></span><strong>− ฿80</strong></div><div className="tier-selector">{["Gold Member", "Silver Member", "Bronze Member"].map((tier) => <button key={tier} className={`tier-option ${membership === tier ? "selected" : ""}`} onClick={() => setMembership(tier)}>{tier.replace(" Member", "")}</button>)}</div></section>
      <section className="checkout-card"><div className="section-title"><div><h2>Session package</h2><p>Package types follow the FitBooking plan options.</p></div><button className="text-link" onClick={() => navigate("packages")}>Compare plans <ArrowRight size={14} /></button></div><div className="package-choices">{[["Single session", "single", "฿720", "Flexible, one at a time"], ["5+1 Sessions", "5+1", "฿3,400", "5 paid + 1 bonus · 180-day validity"], ["10+3 Sessions", "10+3", "฿8,970", "10 paid + 3 bonus · Best value"], ["20+7 Sessions", "20+7", "฿17,550", "20 paid + 7 bonus · 180-day validity"]].map(([name, type, price, detail]) => <button key={type} className={`package-choice ${packageChoice === type ? "selected" : ""}`} onClick={() => setPackageChoice(type)}><span className="radio-dot" /><span><b>{name}</b><small>{detail}</small></span><strong>{price}</strong></button>)}</div></section>
      <section className="checkout-card"><div className="section-title"><div><h2>Payment method</h2><p>Choose how you’d like to complete your order.</p></div></div><div className="payment-method-list">{methods.map((method) => <button key={method.name} className={`payment-option ${payment === method.name ? "selected" : ""}`} onClick={() => setPayment(method.name)}><span className="radio-dot" /><span className="payment-method-icon">{method.icon}</span><span><b>{method.name}</b><small>{method.detail}</small></span><ChevronRight size={16} /></button>)}</div></section>
    </div><aside className="checkout-total-card"><p className="eyebrow">ORDER SUMMARY</p><div className="summary-line"><span>Strength & Conditioning</span><b>฿800</b></div><div className="summary-line subdued"><span>Gold member · 10%</span><b>−฿80</b></div>{packageChoice !== "single" && <div className="summary-line subdued"><span>{packageChoice} package selected</span><b>Included</b></div>}<div className="summary-divider" /><div className="summary-total"><span>Total due today</span><b>{packageChoice === "single" ? "฿720" : packageChoice === "5+1" ? "฿3,400" : packageChoice === "20+7" ? "฿17,550" : "฿8,970"}</b></div><PrimaryButton onClick={() => navigate("success")}>Confirm booking <ArrowRight size={16} /></PrimaryButton><p className="secure-note"><ShieldCheck size={13} /> Secure demo checkout · no real payment</p><button className="text-link checkout-help" onClick={() => navigate("profile")}><CircleHelp size={14} /> Need a hand?</button></aside></div>
  </div>;
}

function SuccessScreen({ date, time, navigate }: { date: string; time: string; navigate: (screen: Screen) => void }) {
  return <div className="content-wrap success-wrap"><div className="success-top"><span className="success-mark"><Check size={32} /></span><p className="eyebrow">IT’S HAPPENING</p><h1>You’re booked, Alex.</h1><p>This is a sample confirmation for the design preview. No booking has been created or saved.</p></div>
    <div className="success-ticket"><div className="ticket-heading"><div><span>YOUR SESSION</span><h2>Strength & Conditioning</h2></div><Pill className="booking-status preview-pill">Preview only</Pill></div><div className="ticket-coach"><Photo id={coaches[0].image} alt="" /><span><b>Coach Tan</b><small>Personal trainer · ADVANCED</small></span><div className="stars">★★★★★ <small>4.9</small></div></div><div className="ticket-details"><div><CalendarDays size={17} /><span>{date}<small>Tuesday · 60 minutes</small></span></div><div><Clock3 size={17} /><span>{time}<small>Arrive 10 minutes early</small></span></div><div><MapPin size={17} /><span>Nimman Fitness Club<small>Chiang Mai · 1.2 km away</small></span></div></div><div className="ticket-qr"><div className="fake-qr" aria-label="Illustrative check-in QR code"><QrCode size={76} strokeWidth={1.3} /></div><span><b>Illustrative check-in pass</b><small>This preview code cannot be used at the gym.</small></span></div><div className="ticket-actions"><PrimaryButton onClick={() => navigate("bookings")}>View my bookings <ArrowRight size={15} /></PrimaryButton><button className="button button-outline" onClick={() => navigate("home")}>Back to home</button></div></div>
    <button className="text-link success-detail-link" onClick={() => navigate("profile")}>Add to calendar <Plus size={14} /></button>
  </div>;
}

function BookingsScreen({ tab, setTab, navigate }: { tab: string; setTab: (value: string) => void; navigate: (screen: Screen) => void }) {
  const tabs = ["Upcoming", "Pending", "Past", "Cancelled"];
  const visible = bookings.filter((booking) => tab === "Upcoming" ? booking.status === "Upcoming" : tab === "Pending" ? booking.status === "Pending" : tab === "Past" ? booking.status === "Past" : false);
  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="YOUR TRAINING, YOUR TIME" title="My bookings" detail="Every session is another step toward feeling good." action={<PrimaryButton onClick={() => navigate("explore")}><Plus size={16} /> Book a session</PrimaryButton>} />
    <div className="booking-tabs">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}{item === "Upcoming" && <span>2</span>}</button>)}</div>
    <div className="booking-history-list">{visible.length ? visible.map((booking) => <article className="booking-history-card" key={booking.date}><div className={`history-status-dot ${booking.status.toLowerCase()}`} /><Photo id={booking.image} alt="" /><div className="history-main"><span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span><h3>{booking.title}</h3><p>{booking.date} · {booking.time}</p><span className="history-coach">{booking.coach} <span>·</span> {booking.place}</span></div><div className="history-card-end"><b>฿{booking.price.toLocaleString()}</b><button className="icon-button" onClick={() => navigate("success")} aria-label="View session details"><ChevronRight size={18} /></button></div></article>) : <div className="empty-state"><CalendarDays size={26} /><h3>Nothing here just yet</h3><p>Your {tab.toLowerCase()} sessions will show up here.</p><button className="text-link" onClick={() => navigate("explore")}>Find your next session <ArrowRight size={14} /></button></div>}</div>
    <div className="booking-help-strip"><CircleHelp size={17} /><span>Plans change. Need to adjust your session?</span><button className="text-link" onClick={() => navigate("profile")}>Get support</button></div>
  </div>;
}

function PackagesScreen({ membership, setMembership, notify, onChoose }: { membership: string; setMembership: (value: string) => void; notify: (message: string) => void; onChoose: (name: string) => void }) {
  const plans = [
    { packageType: "5+1", sessions: "5+1 Sessions", price: "฿3,400", each: "฿680 / paid session", saving: "Save 5%", popular: false },
    { packageType: "10+3", sessions: "10+3 Sessions", price: "฿8,970", each: "฿690 / session", saving: "Save 14%", popular: true },
    { packageType: "20+7", sessions: "20+7 Sessions", price: "฿17,550", each: "฿650 / session", saving: "Save 20%", popular: false }
  ];
  return <div className="content-wrap narrow-wrap"><div className="packages-hero"><div><Pill className="pill-glass"><Sparkles size={13} /> A little more momentum</Pill><h1>More sessions.<br />More of what moves you.</h1><p>Make room for the progress you came for.</p></div><div className="package-hero-person"><span>YOUR NEXT CHAPTER</span><Activity size={68} strokeWidth={1.1} /></div></div>
    <div className="section-title package-section-title"><div><h2>Session packages</h2><p>One-on-one time with a coach you choose.</p></div><span className="package-validity"><Clock3 size={14} /> 180 days to use</span></div>
    <div className="package-plan-grid">{plans.map((plan) => <article key={plan.packageType} className={`package-plan ${plan.popular ? "popular" : ""}`}><span className="popular-ribbon" hidden={!plan.popular}>MOST LOVED</span><span className="plan-session-icon"><Dumbbell size={20} /></span><span className="plan-session-count">{plan.sessions}</span><span className="plan-price">{plan.price}</span><span className="plan-each">{plan.each}</span><Pill className="savings-pill">{plan.saving}</Pill><button className={`button ${plan.popular ? "button-primary" : "button-outline"}`} onClick={() => { setMembership("Gold Member"); onChoose(plan.packageType); }}>View package <ArrowRight size={14} /></button></article>)}</div>
    <section className="membership-progress-card"><div className="membership-medal"><Trophy size={24} /></div><div className="membership-progress-copy"><p className="eyebrow">YOUR MEMBERSHIP</p><h2>{membership}</h2><p>Keep showing up. The next tier is within reach.</p><div className="membership-track"><i /></div><small>฿2,150 until Platinum <span>3 / 5</span></small></div><div className="membership-discount"><b>10%</b><span>session discount</span></div></section>
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

function ProgressScreen({ tab, setTab, navigate, account }: { tab: string; setTab: (value: string) => void; navigate: (screen: Screen) => void; account: PublicDemoAccount }) {
  const [goalDone, setGoalDone] = useState(false);
  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="SMALL STEPS, BIG FEELING" title="Look how far you’ve come." detail="Your effort, your pace, your progress." action={<button className="button button-outline" onClick={() => navigate("bookings")}><CalendarDays size={15} /> Log a workout</button>} />
    <div className="progress-member-strip"><div className="member-avatar large">{account.display_name.slice(0, 1).toUpperCase()}</div><span><b>{account.display_name}</b><small><Pill className="gold-pill"><Award size={12} /> Member</Pill></small></span><span className="progress-updated">Updated today</span></div>
    <div className="progress-tabs">{["Overview", "Metrics", "Goals"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "Overview" && <><section className="metric-section"><div className="section-title"><div><h2>Your body, your baseline</h2><p>Last updated after your check-in.</p></div><button className="text-link" onClick={() => setTab("Metrics")}>View all <ArrowRight size={14} /></button></div><div className="body-metric-grid"><div><span>Weight</span><b>68 <small>kg</small></b><small>−1.2 kg this month</small></div><div><span>Body fat</span><b>12<small>%</small></b><small>Steady this month</small></div><div><span>BMI</span><b>22.1</b><small>Healthy range</small></div></div></section>
      <section className="metric-section"><div className="section-title"><div><h2>Weekly activity</h2><p>Minutes you’ve moved this week.</p></div><Pill>3 of 4 sessions</Pill></div><div className="activity-chart">{[["M", 36], ["T", 70], ["W", 92], ["T", 52], ["F", 28], ["S", 78], ["S", 38]].map(([day, value], index) => <div className="activity-day" key={`${day}-${index}`}><span>{value}%</span><i style={{ height: `${value}%` }} /><small>{day}</small></div>)}</div></section>
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
  onSave: (changes: Partial<Pick<PublicDemoAccount, "display_name" | "email" | "phone" | "birth_date">>) => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState(account.display_name);
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone);
  const [birthDate, setBirthDate] = useState(account.birth_date || "");
  const tabs = ["Personal information", "Membership", "Notifications", "Payment methods", "Payment history", "Help & support"];
  return <div className="content-wrap narrow-wrap"><PageHeading eyebrow="A LITTLE MORE ABOUT YOU" title="Your profile" detail="Keep your details and preferences up to date." />
    <section className="profile-summary-card"><div className="member-avatar large">{account.display_name.slice(0, 1).toUpperCase()}</div><div><h2>{account.display_name}</h2><span className="profile-email">{account.email}</span><Pill className="gold-pill"><Award size={12} /> Member</Pill></div><button className="text-link" onClick={() => setTab("Personal information")}>Edit profile <ArrowRight size={14} /></button></section>
    <div className="profile-settings-layout"><nav className="settings-menu">{tabs.map((item, index) => {
      const icons = [UserRound, Award, Bell, CreditCard, Wallet, CircleHelp];
      const Icon = icons[index];
      return <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}><Icon size={17} />{item}<ChevronRight size={15} /></button>;
    })}<button className="settings-signout" onClick={onSignOut}><LogOut size={17} /> Sign out</button></nav>
      <section className="settings-detail-panel"><div className="section-title"><div><h2>{tab}</h2><p>Manage your FitBooking preferences.</p></div><button className="icon-button" aria-label="More settings"><MoreHorizontal size={19} /></button></div>
        {tab === "Personal information" && <div className="settings-form"><label className="settings-field">Username<input value={account.username} readOnly /></label><label className="settings-field">Full name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} /></label><label className="settings-field">Email address<input value={email} type="email" onChange={(event) => setEmail(event.target.value)} maxLength={100} /></label><label className="settings-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} /></label><label className="settings-field">Date of birth<input value={birthDate} type="date" onChange={(event) => setBirthDate(event.target.value)} /></label><PrimaryButton onClick={() => onSave({ display_name: displayName, email: email.trim().toLowerCase(), phone: phone.trim(), birth_date: birthDate || null })}>Save changes <Check size={15} /></PrimaryButton></div>}
        {tab === "Membership" && <div className="setting-membership"><span className="membership-medal"><Trophy size={22} /></span><div><Pill className="gold-pill">GOLD MEMBER</Pill><h3>Every session gets you closer.</h3><p>10% off sessions · 7 package sessions remaining</p><div className="membership-track"><i /></div><small>฿2,150 to your next tier</small><button className="text-link" onClick={() => notify("Membership tiers shown in the Packages screen.")}>View membership benefits <ArrowRight size={14} /></button></div></div>}
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
