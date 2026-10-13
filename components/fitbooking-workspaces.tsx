"use client";

import {
  Activity, ArrowLeft, ArrowRight, Award, BarChart3, BookOpen, Building2,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardList,
  Clock3, Dumbbell, Filter, LogOut, MapPin, MessageCircle, MoreHorizontal,
  Pencil,
  Plus, RefreshCw, Search, Send, ShieldCheck, SlidersHorizontal, Star,
  TrendingUp, UsersRound, Wallet, X, type LucideIcon
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import {
  DEMO_MESSAGES_KEY, DemoRole, PublicDemoAccount
} from "@/lib/demo-auth";
import {
  AdminBookingItem,
  AdminCoachItem,
  AdminCourseItem,
  AdminKpiRecordItem,
  AdminKpiRuleItem,
  AdminLocationItem,
  AdminMemberItem,
  AdminPackageItem,
  initialAdminBookings,
  initialAdminCoaches,
  initialAdminCourses,
  initialAdminKpiRecords,
  initialAdminKpiRules,
  initialAdminLocations,
  initialAdminMembers,
  initialAdminPackages
} from "@/lib/admin-data";
import type {
  BookingStatus,
  CancelledBy,
  CoachLevel,
  CoachServiceMode,
  CourseDifficulty,
  District,
  PackageType
} from "@/lib/database";

type Navigate = (screen: string) => void;

export function SignInScreen({
  onSignIn,
  onNavigate
}: {
  onSignIn: (identifier: string, password: string, role: DemoRole) => Promise<void>;
  onNavigate: Navigate;
}) {
  const [role, setRole] = useState<DemoRole>("MEMBER");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const fillDemo = (demoRole: DemoRole) => {
    setRole(demoRole);
    setIdentifier(demoRole === "MEMBER" ? "alex" : demoRole === "COACH" ? "coach.tan" : "FB-ADMIN-001");
    setPassword(demoRole === "MEMBER" ? "FitBooking123!" : demoRole === "COACH" ? "Coach@123" : "Admin@123");
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSignIn(identifier, password, role);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We couldn’t sign you in. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-layout">
    <section className="auth-brand-panel">
      <button className="brand-button" onClick={() => onNavigate("welcome")}><Brand /></button>
      <div className="auth-brand-copy">
        <span className="auth-coordinate">18° 47′ N · 98° 59′ E</span>
        <h1>A good place<br />to get stronger.</h1>
        <p>Find your coach, make a plan, and keep showing up at your own pace.</p>
      </div>
      <span className="auth-brand-foot">Made for Chiang Mai.</span>
    </section>
    <section className="auth-main">
      <div className="auth-card">
        <button className="back-link" onClick={() => onNavigate("welcome")}><ArrowLeft size={15} /> Back to FitBooking</button>
        <p className="eyebrow">YOUR TRAINING STARTS HERE</p>
        <h2>Welcome back.</h2>
        <p className="auth-intro">Sign in to pick up where you left off.</p>
        <div className="auth-role-tabs" aria-label="Choose account type">
          {(["MEMBER", "COACH", "ADMIN"] as const).map((item) =>
            <button type="button" className={role === item ? "selected" : ""} key={item} onClick={() => { setRole(item); setError(""); }}>
              {item === "MEMBER" ? "Member" : item === "COACH" ? "Trainer" : "Admin"}
            </button>
          )}
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label className="settings-field" htmlFor="signin-identifier">{role === "ADMIN" ? "Admin ID or email" : "Username or email"}
            <input id="signin-identifier" autoComplete="username" required value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={role === "ADMIN" ? "FB-ADMIN-001" : "Your username or email"} />
          </label>
          <label className="settings-field" htmlFor="signin-password">Password
            <input id="signin-password" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          </label>
          <button className="text-link auth-forgot" type="button" onClick={() => setError("Password recovery needs a real account service; no email or API is connected in this frontend preview.")}>Forgot password?</button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary auth-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <div className="auth-divider"><span>OR TRY A DEMO PROFILE</span></div>
        <div className="auth-demo-list">
          <button type="button" onClick={() => fillDemo("MEMBER")}><span className="demo-role-mark"><UsersRound size={15} /></span><span><b>Member preview</b><small>alex · FitBooking123!</small></span><ChevronRight size={16} /></button>
          <button type="button" onClick={() => fillDemo("COACH")}><span className="demo-role-mark"><Dumbbell size={15} /></span><span><b>Trainer preview</b><small>coach.tan · Coach@123</small></span><ChevronRight size={16} /></button>
          <button type="button" onClick={() => fillDemo("ADMIN")}><span className="demo-role-mark"><ShieldCheck size={15} /></span><span><b>Admin preview</b><small>FB-ADMIN-001 · Admin@123</small></span><ChevronRight size={16} /></button>
        </div>
        <p className="auth-notice">Preview only: these accounts and profiles stay in this browser. This is not production authentication and does not secure server data.</p>
        <p className="auth-switch">New to FitBooking? <button className="text-link" onClick={() => onNavigate("signup")}>Create a member account</button></p>
      </div>
    </section>
  </main>;
}

export function SignUpScreen({
  onRegister,
  onNavigate
}: {
  onRegister: (details: {
    username: string;
    display_name: string;
    email: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    birth_date: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    fitness_goal: string | null;
    password: string;
  }) => Promise<void>;
  onNavigate: Navigate;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== String(form.get("confirmPassword") || "")) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const numberValue = (key: string) => {
        const value = Number(form.get(key));
        return Number.isFinite(value) && value > 0 ? value : null;
      };
      const genderValue = String(form.get("gender") || "");
      await onRegister({
        username: String(form.get("username") || ""),
        display_name: String(form.get("display_name") || ""),
        email: String(form.get("email") || ""),
        phone: String(form.get("phone") || ""),
        gender: ["MALE", "FEMALE", "OTHER"].includes(genderValue) ? genderValue as "MALE" | "FEMALE" | "OTHER" : null,
        birth_date: String(form.get("birth_date") || "") || null,
        height_cm: numberValue("height_cm"),
        weight_kg: numberValue("weight_kg"),
        fitness_goal: String(form.get("fitness_goal") || "") || null,
        password
      });
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "We couldn’t create this local demo profile.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-layout auth-signup-layout">
    <section className="auth-brand-panel">
      <button className="brand-button" onClick={() => onNavigate("welcome")}><Brand /></button>
      <div className="auth-brand-copy"><span className="auth-coordinate">MADE FOR CHIANG MAI</span><h1>Start where<br />you are.</h1><p>Build a training routine that fits your goals and the life you already have.</p></div>
      <span className="auth-brand-foot">Your city. Your pace.</span>
    </section>
    <section className="auth-main">
      <div className="auth-card auth-card-wide">
        <button className="back-link" onClick={() => onNavigate("signin")}><ArrowLeft size={15} /> Back to sign in</button>
        <p className="eyebrow">A FITBOOKING MEMBER ACCOUNT</p><h2>Make room for progress.</h2>
        <p className="auth-intro">Your profile is saved only in this browser for the frontend preview.</p>
        <form className="auth-form signup-form" onSubmit={submit}>
          <label className="settings-field">Username<input name="username" autoComplete="username" required minLength={3} maxLength={50} /></label>
          <label className="settings-field">Full name<input name="display_name" autoComplete="name" required maxLength={100} /></label>
          <label className="settings-field">Email address<input name="email" autoComplete="email" type="email" required maxLength={100} /></label>
          <label className="settings-field">Phone number<input name="phone" autoComplete="tel" type="tel" required maxLength={20} /></label>
          <label className="settings-field">Password<input name="password" autoComplete="new-password" type="password" required minLength={8} /></label>
          <label className="settings-field">Confirm password<input name="confirmPassword" autoComplete="new-password" type="password" required minLength={8} /></label>
          <label className="settings-field">Gender<select name="gender" defaultValue=""><option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label>
          <label className="settings-field">Date of birth<input name="birth_date" type="date" /></label>
          <label className="settings-field">Height (cm)<input name="height_cm" type="number" min="1" max="300" step="0.1" /></label>
          <label className="settings-field">Weight (kg)<input name="weight_kg" type="number" min="1" max="500" step="0.1" /></label>
          <label className="settings-field signup-goal-field">Fitness goal<input name="fitness_goal" maxLength={200} placeholder="What would you like to work toward?" /></label>
          <p className="form-role-note"><CheckCircle2 size={15} /> New sign-ups create member profiles. Trainer and admin access is restricted to demo accounts.</p>
          {error && <p className="form-error signup-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit signup-submit" type="submit" disabled={busy}>{busy ? "Creating profile…" : "Create member account"} <ArrowRight size={16} /></button>
        </form>
        <p className="auth-notice">Demo only. No API, email verification, or production account security is connected.</p>
      </div>
    </section>
  </main>;
}

function Brand() {
  return <span className="brand"><Image className="brand-logo" src="/fitbooking-kettlebell.png" width={34} height={30} alt="" /><span>FitBooking<span className="brand-period">.</span></span></span>;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`pill ${className}`}>{children}</span>;
}

export function RoleWorkspace({
  role,
  screen,
  account,
  navigate,
  onSignOut
}: {
  role: "COACH" | "ADMIN";
  screen: string;
  account: PublicDemoAccount;
  navigate: Navigate;
  onSignOut: () => void;
}) {
  return role === "COACH"
    ? <TrainerWorkspace screen={screen === "trainerMessages" ? "messages" : screen} account={account} navigate={navigate} onSignOut={onSignOut} />
    : <AdminWorkspace screen={screen} account={account} navigate={navigate} onSignOut={onSignOut} />;
}

function WorkspaceHeader({ name, role, onSignOut }: { name: string; role: string; onSignOut: () => void }) {
  return <header className="workspace-topbar"><Brand /><div className="workspace-user"><span className="workspace-user-avatar">{name.slice(0, 1).toUpperCase()}</span><span><b>{name}</b><small>{role}</small></span><button className="button button-outline" onClick={onSignOut}><LogOut size={15} /> Sign out</button></div></header>;
}

const trainerNav = [
  ["trainerHome", "Overview", Activity],
  ["trainerSchedule", "Schedule", CalendarDays],
  ["trainerMessages", "Messages", MessageCircle],
  ["trainerClients", "Clients", UsersRound],
  ["trainerProgress", "Progress", Award]
] as const;

function TrainerWorkspace({ screen, account, navigate, onSignOut }: { screen: string; account: PublicDemoAccount; navigate: Navigate; onSignOut: () => void }) {
  return <main className="workspace-shell">
    <WorkspaceHeader name={account.display_name} role="Verified trainer" onSignOut={onSignOut} />
    <div className="workspace-body">
      <aside className="workspace-sidebar"><p className="workspace-sidebar-label">TRAINER SPACE</p>{trainerNav.map(([key, label, Icon]) => <button key={key} className={screen === key || (key === "trainerMessages" && screen === "messages") ? "active" : ""} onClick={() => navigate(key)}><Icon size={17} />{label}{key === "trainerMessages" && <i>2</i>}</button>)}<p className="workspace-sidebar-note">Schedule and messages here are saved as a local preview.</p></aside>
      <section className="workspace-main">
        {screen === "trainerHome" && <TrainerOverview account={account} navigate={navigate} />}
        {screen === "trainerSchedule" && <TrainerSchedule />}
        {screen === "messages" && <Conversation account={account} role="COACH" />}
        {screen === "trainerClients" && <TrainerClients />}
        {screen === "trainerProgress" && <TrainerProgress />}
      </section>
    </div>
    <WorkspaceMobileNav items={trainerNav} active={screen === "messages" ? "trainerMessages" : screen} navigate={navigate} />
  </main>;
}

function TrainerOverview({ account, navigate }: { account: PublicDemoAccount; navigate: Navigate }) {
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">TUESDAY · CHIANG MAI</p><h1>Good morning, {account.display_name.split(" ")[0]}.</h1><p>Your day, your people, and the progress you’re building together.</p></div><button className="button button-primary" onClick={() => navigate("trainerSchedule")}><CalendarDays size={16} /> View schedule</button></div>
    <div className="workspace-stat-row">{[["Sessions today", "4", "2 more to go", CalendarDays], ["Active members", "18", "3 new this month", UsersRound], ["Hours coached", "26.5", "This week", Clock3]].map(([label, value, note, Icon]) => <article className="workspace-stat" key={label as string}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label as string}</small><b>{value as string}</b><span>{note as string}</span></article>)}</div>
    <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Up next</h2><p>Your Tuesday training schedule</p></div><button className="text-link" onClick={() => navigate("trainerSchedule")}>Full schedule <ArrowRight size={14} /></button></div><TrainerSessionRows compact /></section>
      <section className="workspace-panel"><div className="section-title"><div><h2>Member check-in</h2><p>Last note from your clients</p></div><MessageCircle size={18} /></div><div className="trainer-note"><span className="member-avatar">NT</span><div><b>Nattakarn S.</b><p>“I’m ready to work on my deadlift form today.”</p><small>Strength & Conditioning · 9:10 AM</small></div></div><button className="button button-outline workspace-full-button" onClick={() => navigate("messages")}>Open messages <ArrowRight size={14} /></button></section></div>
    <section className="workspace-panel workspace-week-panel"><div className="section-title"><div><h2>This week at a glance</h2><p>Keep the rhythm steady, not rushed.</p></div><span className="pill">12 of 16 sessions</span></div><div className="trainer-week-bars">{[["Mon", 55], ["Tue", 83], ["Wed", 42], ["Thu", 68], ["Fri", 49], ["Sat", 92], ["Sun", 22]].map(([day, height]) => <div key={day as string}><span>{height}%</span><i style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></section>
  </div>;
}

const demoSessions = [
  { member: "Nattakarn S.", initials: "NS", course: "Strength & Conditioning", time: "09:10 AM", length: "60 min", location: "Nimman Fitness Club", status: "Confirmed" },
  { member: "Mali P.", initials: "MP", course: "Mobility & Flexibility", time: "11:30 AM", length: "60 min", location: "Old City Studio", status: "Confirmed" },
  { member: "Krit S.", initials: "KS", course: "Strength Foundations", time: "02:00 PM", length: "45 min", location: "Central Fitness", status: "Pending" },
  { member: "Pimchanok R.", initials: "PR", course: "One-to-one HIIT", time: "04:30 PM", length: "45 min", location: "At home · Nimman", status: "Confirmed" }
];

function TrainerSchedule() {
  const [day, setDay] = useState("Tue, Apr 16");
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState("");
  const days = ["Mon, Apr 15", "Tue, Apr 16", "Wed, Apr 17", "Thu, Apr 18", "Fri, Apr 19"];
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">YOUR WORK WEEK</p><h1>Schedule</h1><p>Sessions stay clear, so you can give each member your attention.</p></div><button className="button button-primary" onClick={() => setSelectedSession(selectedSession ? "" : "Availability") }><Plus size={15} /> Add availability</button></div>
    <div className="trainer-calendar-toolbar"><div className="trainer-day-tabs">{days.map((item) => <button key={item} className={day === item ? "active" : ""} onClick={() => setDay(item)}><small>{item.split(",")[0]}</small><b>{item.split(" ")[2]}</b></button>)}</div><span><MapPin size={15} /> Chiang Mai time · GMT+7</span></div>
    {selectedSession === "Availability" && <div className="availability-editor"><div><b>Availability preview</b><small>Choose a demo slot to mark your calendar as open.</small></div>{["08:00 AM", "10:00 AM", "01:00 PM", "03:00 PM"].map((time) => <button key={time} onClick={(event) => { event.currentTarget.classList.toggle("selected"); }}>{time}</button>)}</div>}
    <section className="workspace-panel schedule-panel"><div className="section-title"><div><h2>{day}</h2><p>{day === "Tue, Apr 16" ? "Four sessions planned" : "Sample schedule · adjust your day"}</p></div><span className="pill">Local preview</span></div><TrainerSessionRows completed={completed} onToggleComplete={(member) => setCompleted((current) => current.includes(member) ? current.filter((item) => item !== member) : [...current, member])} onDetails={setSelectedSession} /></section>
    {selectedSession && selectedSession !== "Availability" && <div className="workspace-detail-panel"><div className="section-title"><div><h2>Session notes</h2><p>{selectedSession} · member details in this preview</p></div><button className="text-link" onClick={() => setSelectedSession("")}>Close</button></div><p>Review the member’s focus before the session. This area is local demo content only; it does not update any booking record.</p><button className="button button-outline" onClick={() => setSelectedSession("")}>Done</button></div>}
  </div>;
}

function TrainerSessionRows({ compact = false, completed = [], onToggleComplete, onDetails }: { compact?: boolean; completed?: string[]; onToggleComplete?: (member: string) => void; onDetails?: (member: string) => void }) {
  return <div className="trainer-session-list">{(compact ? demoSessions.slice(0, 3) : demoSessions).map((session) => {
    const done = completed.includes(session.member);
    return <article key={session.member} className={`trainer-session-row ${done ? "is-complete" : ""}`}><div className="session-time-block"><b>{session.time}</b><span>{session.length}</span></div><i className="session-time-line" /><span className="trainer-member-avatar">{session.initials}</span><div className="trainer-session-copy"><b>{session.member}</b><span>{session.course}</span><small><MapPin size={12} /> {session.location}</small></div><span className={`booking-status ${done ? "completed" : session.status.toLowerCase()}`}>{done ? "Completed" : session.status}</span>{onDetails && <button className="icon-button" onClick={() => onDetails(session.member)} aria-label={`View ${session.member} details`}><ChevronRight size={17} /></button>}{onToggleComplete && <button className="session-complete-button" onClick={() => onToggleComplete(session.member)} aria-label={done ? "Undo completion" : "Mark session complete"}>{done ? <CheckCircle2 size={17} /> : <Check size={17} />}</button>}</article>;
  })}</div>;
}

function TrainerClients() {
  const [query, setQuery] = useState("");
  const [activeMember, setActiveMember] = useState("");
  const clients = [
    ["Nattakarn S.", "Strength & Conditioning", "12 sessions", "photo-1534528741775-53994a69daeb"],
    ["Mali P.", "Mobility & Flexibility", "8 sessions", "photo-1544005313-94ddf0286df2"],
    ["Krit S.", "Strength Foundations", "5 sessions", "photo-1500648767791-00dcc994a43e"]
  ];
  const visible = clients.filter(([name, course]) => `${name} ${course}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">PEOPLE YOU TRAIN WITH</p><h1>Your members</h1><p>Keep every plan personal and easy to follow.</p></div><span className="pill"><UsersRound size={14} /> 18 active members</span></div><label className="search-bar trainer-client-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members or training type" /></label><div className="workspace-panel trainer-clients-panel">{visible.map(([name, course, sessions, image]) => <article className="trainer-client-row" key={name}><span className="trainer-client-photo" aria-hidden="true" style={{ backgroundImage: `url("https://images.unsplash.com/${image}?auto=format&fit=crop&w=100&q=80")` }} /><span><b>{name}</b><small>{course}</small></span><span>{sessions}</span><button className="button button-outline" onClick={() => setActiveMember(activeMember === name ? "" : name)}>Member notes</button><button className="icon-button" onClick={() => setActiveMember(activeMember === name ? "" : name)} aria-label={`View ${name}`}><ChevronRight size={17} /></button>{activeMember === name && <p className="client-demo-note">Training focus: steady strength progress, good movement quality, and a plan that fits their week. Demo note only.</p>}</article>)}{!visible.length && <div className="empty-state"><UsersRound size={23} /><h3>No members match</h3><p>Try a different name or training type.</p></div>}</div></div>;
}

function TrainerProgress() {
  const [period, setPeriod] = useState("This week");
  return <div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">YOUR PRACTICE</p><h1>Coaching progress</h1><p>A read on how your training time is taking shape.</p></div><select className="workspace-select" value={period} onChange={(event) => setPeriod(event.target.value)}><option>This week</option><option>This month</option><option>This year</option></select></div><div className="workspace-stat-row">{[["Completed sessions", "12", "of 16 planned", CheckCircle2], ["Member rating", "4.9", "from 128 notes", Star], ["Coaching hours", "26.5", period, Clock3]].map(([label, value, note, Icon]) => <article className="workspace-stat" key={label as string}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label as string}</small><b>{value as string}</b><span>{note as string}</span></article>)}</div><div className="workspace-panel"><div className="section-title"><div><h2>Member momentum</h2><p>Sample progress summaries, not live health data.</p></div><Activity size={17} /></div>{[["Nattakarn S.", "Strength", "7 / 10 sessions", 72], ["Mali P.", "Mobility", "5 / 8 sessions", 63], ["Krit S.", "Foundations", "3 / 6 sessions", 50]].map(([name, focus, count, percent]) => <div className="member-progress-row" key={name as string}><span className="trainer-member-avatar">{String(name).slice(0, 2).toUpperCase()}</span><span><b>{name as string}</b><small>{focus as string} · {count as string}</small></span><div className="goal-progress"><i style={{ width: `${percent}%` }} /></div><b>{percent}%</b></div>)}</div></div>;
}

interface DemoMessage {
  sender: "MEMBER" | "COACH";
  author: string;
  text: string;
  created_at: string;
}

function Conversation({ account, role }: { account: PublicDemoAccount; role: "MEMBER" | "COACH" }) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DEMO_MESSAGES_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        setMessages(parsed.filter((item): item is DemoMessage =>
          typeof item === "object" && item !== null &&
          typeof (item as DemoMessage).text === "string" &&
          ["MEMBER", "COACH"].includes((item as DemoMessage).sender)
        ));
      } else {
        setMessages([{
          sender: role === "MEMBER" ? "COACH" : "MEMBER",
          author: role === "MEMBER" ? "Coach Tan" : "Alex Morgan",
          text: "Looking forward to our next session. Is there anything you’d like to focus on?",
          created_at: new Date().toISOString()
        }]);
      }
    } catch {
      setError("Saved demo messages could not be read. Clear this site's local storage to reset the preview chat.");
    }
  }, [role]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const next = [...messages, { sender: role, author: account.display_name, text, created_at: new Date().toISOString() } as DemoMessage];
    try {
      window.localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(next));
      setMessages(next);
      setDraft("");
      setError("");
    } catch {
      setError("This message could not be saved in the browser. Check your storage settings and try again.");
    }
  };

  return <div className="workspace-content message-page"><div className="workspace-heading"><div><p className="eyebrow">ONE-TO-ONE SUPPORT</p><h1>Messages</h1><p>Keep the conversation going between sessions.</p></div><span className="pill"><span className="availability-dot" /> Demo conversation</span></div><section className="workspace-panel conversation-panel"><header><span className="trainer-member-avatar">{role === "MEMBER" ? "TT" : "AM"}</span><span><b>{role === "MEMBER" ? "Coach Tan" : "Alex Morgan"}</b><small>{role === "MEMBER" ? "Strength & Conditioning" : "Member · Gold"}</small></span><span className="conversation-online">Local preview</span></header><div className="conversation-messages" aria-live="polite">{messages.map((message, index) => <div key={`${message.created_at}-${index}`} className={`message-row ${message.sender === role ? "message-own" : ""}`}><span className="message-bubble"><small>{message.author}</small><span>{message.text}</span><time>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></span></div>)}{!messages.length && <div className="empty-state"><MessageCircle size={24} /><h3>Start a conversation</h3><p>Send your trainer a note about your next session.</p></div>}</div><form className="conversation-compose" onSubmit={send}><label className="sr-only" htmlFor="demo-message">Message</label><input id="demo-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Write a message…" /><button className="button button-primary" type="submit" disabled={!draft.trim()}><Send size={15} /> Send</button></form>{error && <p className="form-error" role="alert">{error}</p>}<p className="auth-notice">Preview chat only. Messages are saved to this browser and are visible to any demo profile on this device.</p></section></div>;
}

export function MemberMessages({ account }: { account: PublicDemoAccount }) {
  return <Conversation account={account} role="MEMBER" />;
}

const packageDetails = {
  "5+1": { label: "5+1 Sessions", price: "฿3,400", each: "฿680 / paid session", saving: "Save 5%", sessions: 6, details: ["5 paid sessions + 1 bonus session", "Choose your own verified coach", "Valid for 180 days", "Reschedule according to booking terms"] },
  "10+3": { label: "10+3 Sessions", price: "฿8,970", each: "฿690 / session", saving: "Save 14%", sessions: 13, details: ["10 paid sessions + 3 bonus sessions", "Choose your own verified coach", "Valid for 180 days", "Best for building a steady routine"] },
  "20+7": { label: "20+7 Sessions", price: "฿17,550", each: "฿650 / session", saving: "Save 20%", sessions: 27, details: ["20 paid sessions + 7 bonus sessions", "Choose your own verified coach", "Valid for 180 days", "Lowest price per session"] }
} as const;

export function PackageDetailScreen({ selected, onBack, onChoose }: { selected: string; onBack: () => void; onChoose: (packageName: string) => void }) {
  const plan = packageDetails[selected as keyof typeof packageDetails] || packageDetails["10+3"];
  return <div className="content-wrap narrow-wrap package-detail-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to packages</button><section className="package-detail-hero"><div><span className="package-detail-mark"><Dumbbell size={20} /></span><p className="eyebrow">YOUR NEXT TRAINING CHAPTER</p><h1>{plan.label}</h1><p>More time with a coach you trust, and a plan that has room to work.</p><span className="pill savings-pill">{plan.saving}</span></div><div className="package-detail-price"><b>{plan.price}</b><span>{plan.each}</span><small>Local preview · no payment</small></div></section><div className="package-detail-grid"><section className="workspace-panel"><div className="section-title"><div><h2>What’s included</h2><p>Clear details before you choose.</p></div><CheckCircle2 size={19} /></div>{plan.details.map((detail) => <div className="package-detail-included" key={detail}><span><Check size={14} /></span>{detail}</div>)}</section><aside className="package-detail-aside"><p className="eyebrow">A GOOD FIT IF</p><h2>You want a routine that has room to grow.</h2><p>Use your sessions one at a time, at your pace. Choose your coach and training focus during booking.</p><div className="package-detail-count"><Dumbbell size={17} /><span><b>{plan.sessions} sessions</b><small>One-to-one coaching</small></span></div><button className="button button-primary" onClick={() => onChoose(selected)}>Choose this package <ArrowRight size={15} /></button></aside></div><section className="package-compare"><div className="section-title"><div><h2>Compare packages</h2><p>Pick the amount of coaching that feels right.</p></div></div><div className="package-compare-options">{Object.entries(packageDetails).map(([name, option]) => <button className={name === selected ? "selected" : ""} key={name} onClick={() => onChoose(name)}><span><b>{option.label}</b><small>{option.each}</small></span><strong>{option.price}</strong><span>{name === selected ? "Selected" : "View details"} <ChevronRight size={14} /></span></button>)}</div></section><p className="auth-notice">Package details and prices are sample interface content. No order or payment is created.</p></div>;
}

const adminNav: readonly (readonly [string, string, LucideIcon])[] = [
  ["admin", "Overview", Activity],
  ["adminBookings", "Bookings", CalendarDays],
  ["adminMembers", "Members", UsersRound],
  ["adminTrainers", "Trainers", Dumbbell],
  ["adminLocations", "Locations", Building2],
  ["adminCourses", "Courses", BookOpen],
  ["adminPackages", "Packages", Wallet],
  ["adminKpi", "KPI", TrendingUp],
  ["adminReports", "Reports", Award],
  ["adminAudit", "Audit log", ClipboardList],
  ["adminSettings", "Settings", ShieldCheck]
];

type AdminStatus = "Active" | "Pending" | "Paused" | "Available" | "Draft" | "On leave" | "Needs review" | "Confirmed" | "Completed" | "Achieved" | "At risk";
type AdminDetailType = "member" | "coach" | "package" | "location" | "course" | "booking";
type AdminRow = { id: string; name: string; detail: string; extra: string; status: AdminStatus };
type AdminModalKind = "trainer" | "member" | "location" | "course" | "package" | "booking" | "kpi" | "workflow" | "filters" | "auditFilters" | "report";

function AdminWorkspace({ screen, account, navigate, onSignOut }: { screen: string; account: PublicDemoAccount; navigate: Navigate; onSignOut: () => void }) {
  const activeSection = adminNav.find(([key]) => key === screen)?.[1] || "Overview";
  const [active, setActive] = useState(activeSection);
  useEffect(() => setActive(activeSection), [activeSection]);
  return <main className="workspace-shell admin-workspace">
    <WorkspaceHeader name={account.display_name} role="Administrator" onSignOut={onSignOut} />
    <div className="workspace-body"><aside className="workspace-sidebar"><p className="workspace-sidebar-label">MANAGEMENT</p>{adminNav.map(([key, item, Icon]) => <button key={key} className={active === item ? "active" : ""} onClick={() => { setActive(item); navigate(key); }}><Icon size={17} />{item}</button>)}<p className="workspace-sidebar-note">Workflow controls are interactive local previews only.</p></aside>
      <AdminContent active={active} />
    </div>
    <WorkspaceMobileNav items={adminNav} active={screen} navigate={navigate} />
  </main>;
}

function AdminContent({ active }: { active: string }) {
  const [bookings, setBookings] = useState<AdminBookingItem[]>(initialAdminBookings);
  const [members, setMembers] = useState<AdminMemberItem[]>(initialAdminMembers);
  const [coaches, setCoaches] = useState<AdminCoachItem[]>(initialAdminCoaches);
  const [locations, setLocations] = useState<AdminLocationItem[]>(initialAdminLocations);
  const [courses, setCourses] = useState<AdminCourseItem[]>(initialAdminCourses);
  const [packages, setPackages] = useState<AdminPackageItem[]>(initialAdminPackages);
  const [rules, setRules] = useState<AdminKpiRuleItem[]>(initialAdminKpiRules);
  const [kpiRecords, setKpiRecords] = useState<AdminKpiRecordItem[]>(initialAdminKpiRecords);

  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<{ type: AdminDetailType; id: string } | null>(null);
  const [modal, setModal] = useState<AdminModalKind | null>(null);
  const [editTarget, setEditTarget] = useState<{ kind: AdminModalKind; id: string } | null>(null);
  const [kpiMonth, setKpiMonth] = useState("April 2026");
  const [editingRule, setEditingRule] = useState("");

  useEffect(() => {
    setQuery("");
    setDetail(null);
    setModal(null);
    setEditTarget(null);
  }, [active]);

  const openDetail = (type: AdminDetailType, id: string) => setDetail({ type, id });
  const openEditor = (kind: AdminModalKind, id: string) => {
    setDetail(null);
    setEditTarget({ kind, id });
    setModal(kind);
  };
  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
  };

  const handleToggleBooking = (id: string) => {
    setBookings((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      const nextStatus: BookingStatus = b.status === "CONFIRMED" ? "COMPLETED" : b.status === "PENDING" ? "CONFIRMED" : "CONFIRMED";
      return { ...b, status: nextStatus };
    }));
    setNotice("Booking status updated in this preview.");
  };

  const handleToggleMember = (id: string) => {
    setMembers((prev) => prev.map((m) => {
      if (m.id !== id) return m;
      return { ...m, status: m.status === "ACTIVE" ? "DISABLED" : "ACTIVE" };
    }));
    setNotice("Member account status updated.");
  };

  const handleToggleCoach = (id: string) => {
    setCoaches((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const next = c.status === "ACTIVE" ? "ON_LEAVE" : "ACTIVE";
      return { ...c, status: next };
    }));
    setNotice("Trainer status updated.");
  };

  const handleToggleLocation = (id: string) => {
    setLocations((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      return { ...l, is_active: l.is_active === 1 ? 0 : 1 };
    }));
    setNotice("Location active status toggled.");
  };

  const handleToggleCourse = (id: string) => {
    setCourses((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return { ...c, is_active: c.is_active === 1 ? 0 : 1 };
    }));
    setNotice("Course catalogue status updated.");
  };

  const handleTogglePackage = (id: string) => {
    setPackages((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return { ...p, status: p.status === "Available" ? "Paused" : "Available" };
    }));
    setNotice("Package catalogue status updated.");
  };

  const recalculateKpiSnapshots = () => {
    setKpiRecords((prev) => prev.map((rec) => {
      const rule = rules.find((r) => r.level === rec.level);
      if (!rule) return rec;
      const achieved = (rec.hours >= rule.hours) && (rec.rating >= rule.rating) && (rec.retention >= rule.retention);
      return {
        ...rec,
        target_hours: rule.hours,
        target_rating: rule.rating,
        target_retention: rule.retention,
        achieved
      };
    }));
    setNotice("Monthly coach KPI snapshots recalculated against current kpi_rule targets.");
  };

  // Mapped display rows
  const bookingRows: AdminRow[] = bookings.map((b) => ({
    id: b.id,
    name: `${b.member_name} · ${b.coach_name}`,
    detail: `${b.course_name} · ${b.booking_date} · ${b.start_time}`,
    extra: `${b.service_mode === "GYM" ? (b.gym_name || "Gym") : `Home (${b.service_district || ""})`} · ฿${b.price.toLocaleString()}`,
    status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "PENDING" ? "Pending" : b.status === "COMPLETED" ? "Completed" : "Paused"
  }));

  const memberRows: AdminRow[] = members.map((m) => ({
    id: m.id,
    name: m.display_name,
    detail: `${m.email} · ${m.phone}`,
    extra: `${m.level_code} member · ฿${m.total_spend.toLocaleString()} spend · ${m.remaining_sessions} sessions left`,
    status: m.status === "ACTIVE" ? "Active" : "Paused"
  }));

  const coachRows: AdminRow[] = coaches.map((c) => ({
    id: c.id,
    name: c.display_name,
    detail: `Coach no. ${c.coach_no} · ${c.courses_taught}`,
    extra: `${c.coach_level} · ⭐ ${c.rating.toFixed(1)} · ${c.years_experience} yrs · ${c.service_mode}`,
    status: c.status === "ACTIVE" ? "Active" : c.status === "ON_LEAVE" ? "On leave" : "Needs review"
  }));

  const locationRows: AdminRow[] = locations.map((l) => ({
    id: l.id,
    name: l.gym_name,
    detail: `${l.district} · ${l.opening_time}–${l.closing_time}`,
    extra: `${l.facilities}`,
    status: l.is_active === 1 ? "Active" : "Paused"
  }));

  const courseRows: AdminRow[] = courses.map((c) => ({
    id: c.id,
    name: c.course_name,
    detail: `${c.difficulty} · ${c.default_duration} minutes`,
    extra: `Equipment: ${c.equipment}`,
    status: c.is_active === 1 ? "Available" : "Draft"
  }));

  const heading = active === "Overview" ? "The whole operation, at a glance." : active === "KPI" ? "Coach performance, made actionable." : `${active} management`;
  const description = active === "Overview" ? "Keep each part of the Chiang Mai training community moving." : active === "KPI" ? "Review monthly snapshots against the rules that keep the coaching team growing." : "Review records, make careful changes, and keep the operation easy to understand.";
  const actionLabel = active === "Overview" ? "Add trainer" : active === "Locations" ? "Add location" : active === "Courses" ? "Add course" : active === "Packages" ? "Add package" : active === "Members" ? "Add member" : active === "Trainers" ? "Add trainer" : active === "Bookings" ? "Create booking" : active === "Reports" ? "Build report" : active === "Audit log" ? "Add audit filter" : active === "Settings" ? "Add setting" : "New workflow";
  const actionKind = active === "Overview" || active === "Trainers" ? "trainer" : active === "Locations" ? "location" : active === "Courses" ? "course" : active === "Packages" ? "package" : active === "Members" ? "member" : active === "Bookings" ? "booking" : active === "Reports" ? "report" : active === "Audit log" ? "auditFilters" : active === "KPI" ? "workflow" : "workflow";

  const renderDirectory = (rows: AdminRow[], type: AdminDetailType, placeholder: string, actionText: string, editKind: AdminModalKind, onToggleRow: (id: string) => void) => {
    const visibleRows = rows.filter((row) => `${row.name} ${row.detail} ${row.extra} ${row.status}`.toLowerCase().includes(query.toLowerCase()));
    return <>
      <AdminFilters query={query} setQuery={setQuery} placeholder={placeholder} onOpenFilters={() => setModal("filters")} />
      <AdminTable
        rows={visibleRows}
        onOpen={(id) => openDetail(type, id)}
        onEdit={(id) => openEditor(editKind, id)}
        action={(id) => onToggleRow(id)}
        actionText={actionText}
      />
    </>;
  };

  return <section className="workspace-main admin-main-workspace"><div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">FITBOOKING MANAGEMENT</p><h1>{heading}</h1><p>{description}</p></div><button className="button button-primary" onClick={() => { setEditTarget(null); setModal(actionKind); }}><Plus size={15} /> {actionLabel}</button></div>
    {notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
    {active === "Overview" && <AdminOverview
      membersCount={members.filter((m) => m.status === "ACTIVE").length}
      coachesCount={coaches.filter((c) => c.status === "ACTIVE").length}
      bookingsCount={bookings.length}
      packagesCount={packages.filter((p) => p.status === "Available").length}
      onNavigate={(section) => setNotice(`${section} management opened from the overview.`)}
      onOpen={openDetail}
      onAddTrainer={() => { setEditTarget(null); setModal("trainer"); }}
    />}
    {active === "Bookings" && renderDirectory(bookingRows, "booking", "Search member, trainer, or session", "Update status", "booking", handleToggleBooking)}
    {active === "Members" && renderDirectory(memberRows, "member", "Search name, email, or membership", "Toggle status", "member", handleToggleMember)}
    {active === "Trainers" && renderDirectory(coachRows, "coach", "Search trainer, coach number, or specialty", "Change status", "trainer", handleToggleCoach)}
    {active === "Locations" && renderDirectory(locationRows, "location", "Search location, district, or facility", "Toggle", "location", handleToggleLocation)}
    {active === "Courses" && renderDirectory(courseRows, "course", "Search course, difficulty, or equipment", "Toggle", "course", handleToggleCourse)}
    {active === "Packages" && <AdminPackageList packages={packages} onOpen={(id) => openDetail("package", id)} onEdit={(id) => openEditor("package", id)} onToggle={handleTogglePackage} />}
    {active === "KPI" && <section className="admin-kpi-stack"><div className="admin-kpi-toolbar"><div><span className="eyebrow">MONTHLY SNAPSHOT</span><b>{kpiMonth}</b><small>Values are preview data based on coach_kpi_record and kpi_rule.</small></div><div><select className="workspace-select" value={kpiMonth} onChange={(event) => setKpiMonth(event.target.value)}><option>April 2026</option><option>March 2026</option><option>February 2026</option></select><button className="button button-outline" onClick={recalculateKpiSnapshots}><RefreshCw size={14} /> Recalculate</button></div></div>
      <div className="workspace-stat-row admin-overview-stats">
        <AdminMiniStat icon={CheckCircle2} label="Achieved" value={`${kpiRecords.filter((r) => r.achieved).length} / ${kpiRecords.length}`} note="coaches on target" />
        <AdminMiniStat icon={TrendingUp} label="Average hours" value={(kpiRecords.reduce((acc, r) => acc + r.hours, 0) / (kpiRecords.length || 1)).toFixed(1)} note="per active coach" />
        <AdminMiniStat icon={Star} label="Average rating" value={(kpiRecords.reduce((acc, r) => acc + r.rating, 0) / (kpiRecords.length || 1)).toFixed(2)} note="from completed reviews" />
        <AdminMiniStat icon={Activity} label="At risk" value={kpiRecords.filter((r) => !r.achieved).length.toString()} note="needs follow-up" />
      </div>
      <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>KPI rules</h2><p>Source of truth for kpi_rule thresholds.</p></div><SlidersHorizontal size={18} /></div><div className="admin-kpi-rule-list">{rules.map((rule) => <div className="admin-kpi-rule-row" key={rule.level}><b>{rule.level}</b>{editingRule === rule.level ? <><input aria-label={`${rule.level} monthly hours`} type="number" value={rule.hours} onChange={(event) => setRules((val) => val.map((item) => item.level === rule.level ? { ...item, hours: Number(event.target.value) } : item))} /><input aria-label={`${rule.level} rating`} type="number" step="0.1" value={rule.rating} onChange={(event) => setRules((val) => val.map((item) => item.level === rule.level ? { ...item, rating: Number(event.target.value) } : item))} /><input aria-label={`${rule.level} retention`} type="number" value={rule.retention} onChange={(event) => setRules((val) => val.map((item) => item.level === rule.level ? { ...item, retention: Number(event.target.value) } : item))} /><button className="text-link" onClick={() => { setEditingRule(""); setNotice(`${rule.level} KPI rule saved.`); }}>Save</button></> : <><span>{rule.hours} hrs / mo</span><span>{rule.rating.toFixed(1)} rating</span><span>{rule.retention}% retention</span><button className="icon-button" aria-label={`Edit ${rule.level} KPI rule`} onClick={() => setEditingRule(rule.level)}><Pencil size={15} /></button></>}</div>)}</div></section>
        <section className="workspace-panel"><div className="section-title"><div><h2>Coach snapshot</h2><p>Monthly records from coach_kpi_record.</p></div><button className="text-link" onClick={() => setNotice("All KPI records opened in this preview.")}>View all <ArrowRight size={14} /></button></div>{kpiRecords.map((record) => <div className="admin-kpi-record" key={record.id}><button className="admin-kpi-record-main" onClick={() => openDetail("coach", record.id)}><span className="trainer-member-avatar">{record.coach.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{record.coach}</b><small>{record.level} · {record.hours} hrs · {record.rating.toFixed(1)} rating</small></span><Pill className={record.achieved ? "confirmed-pill" : "gold-pill"}>{record.achieved ? "Achieved" : "At risk"}</Pill><ChevronRight size={15} /></button><button className="icon-button" aria-label={`Edit KPI snapshot for ${record.coach}`} onClick={() => openEditor("kpi", record.id)}><Pencil size={15} /></button></div>)}</section>
      </div>
    </section>}
    {active === "Reports" && <AdminReports onBuild={() => setModal("report")} />}
    {active === "Audit log" && <AdminAudit onFilter={() => setModal("auditFilters")} />}
    {active === "Settings" && <AdminSettings status={{}} onToggle={(id, value) => setNotice(`Setting ${id} set to ${value}.`)} />}
    </div>
    {detail && <AdminDetailDrawer
      detail={detail}
      bookings={bookings}
      members={members}
      coaches={coaches}
      locations={locations}
      courses={courses}
      packages={packages}
      onClose={() => setDetail(null)}
      onEdit={openEditor}
      onNotice={setNotice}
      onToggleBooking={handleToggleBooking}
      onToggleMember={handleToggleMember}
      onToggleCoach={handleToggleCoach}
      onToggleLocation={handleToggleLocation}
      onToggleCourse={handleToggleCourse}
      onTogglePackage={handleTogglePackage}
    />}
    {modal && <AdminFormDrawer
      key={`${modal}-${editTarget?.id || "new"}`}
      kind={modal}
      active={active}
      editTarget={editTarget}
      bookings={bookings}
      members={members}
      coaches={coaches}
      locations={locations}
      courses={courses}
      packages={packages}
      kpiRecords={kpiRecords}
      onSaveBooking={(item) => setBookings((prev) => prev.some((b) => b.id === item.id) ? prev.map((b) => b.id === item.id ? item : b) : [item, ...prev])}
      onSaveMember={(item) => setMembers((prev) => prev.some((m) => m.id === item.id) ? prev.map((m) => m.id === item.id ? item : m) : [item, ...prev])}
      onSaveCoach={(item) => setCoaches((prev) => prev.some((c) => c.id === item.id) ? prev.map((c) => c.id === item.id ? item : c) : [item, ...prev])}
      onSaveLocation={(item) => setLocations((prev) => prev.some((l) => l.id === item.id) ? prev.map((l) => l.id === item.id ? item : l) : [item, ...prev])}
      onSaveCourse={(item) => setCourses((prev) => prev.some((c) => c.id === item.id) ? prev.map((c) => c.id === item.id ? item : c) : [item, ...prev])}
      onSavePackage={(item) => setPackages((prev) => prev.some((p) => p.id === item.id) ? prev.map((p) => p.id === item.id ? item : p) : [item, ...prev])}
      onSaveKpiRecord={(item) => setKpiRecords((prev) => prev.map((k) => k.id === item.id ? item : k))}
      onRecalculateKpi={recalculateKpiSnapshots}
      onClose={closeModal}
      onSave={(message) => { closeModal(); setNotice(message); }}
    />}
  </section>;
}

function AdminOverview({
  membersCount,
  coachesCount,
  bookingsCount,
  packagesCount,
  onNavigate,
  onOpen,
  onAddTrainer
}: {
  membersCount: number;
  coachesCount: number;
  bookingsCount: number;
  packagesCount: number;
  onNavigate: (section: string) => void;
  onOpen: (type: AdminDetailType, id: string) => void;
  onAddTrainer: () => void;
}) {
  const stats = [
    ["Active members", membersCount.toString(), "Verified client accounts", UsersRound],
    ["Verified trainers", coachesCount.toString(), "Active coaching roster", Dumbbell],
    ["Total bookings", bookingsCount.toString(), "Sessions scheduled", CalendarDays],
    ["Package plans", packagesCount.toString(), "Active catalogue options", Wallet]
  ] as const;

  return <>
    <div className="workspace-stat-row admin-overview-stats">{stats.map(([label, value, note, Icon]) => <article className="workspace-stat" key={label}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label}</small><b>{value}</b><span>{note}</span></article>)}</div>
    <div className="workspace-columns">
      <section className="workspace-panel">
        <div className="section-title"><div><h2>Needs attention</h2><p>Workflow items ready for review</p></div><span className="pill">4 open</span></div>
        <div className="admin-task-row"><span className="admin-task-icon"><Clock3 size={15} /></span><span><b>Coach verification</b><small>Ploy Rattanakorn · documents to review</small></span><button className="button button-outline" onClick={() => onOpen("coach", "coach-ploy")}>Review</button></div>
        <div className="admin-task-row"><span className="admin-task-icon"><CalendarDays size={15} /></span><span><b>Booking request</b><small>Krit S. · Apr 20 at 10:30 AM</small></span><button className="button button-outline" onClick={() => onNavigate("Bookings")}>Confirm</button></div>
        <div className="admin-task-row"><span className="admin-task-icon"><UsersRound size={15} /></span><span><b>Member profile</b><small>Complete account contact details</small></span><button className="button button-outline" onClick={() => onOpen("member", "member-krit")}>Open</button></div>
      </section>
      <section className="workspace-panel">
        <div className="section-title"><div><h2>Recent activity</h2><p>Across the FitBooking community</p></div><Activity size={18} /></div>
        {[["New booking", "Strength & Conditioning · Coach Tan", "2m"], ["Trainer joined", "Ploy R. · Verification pending", "18m"], ["Package selected", "13-session plan · Alex Morgan", "42m"]].map(([title, detail, time]) => <div className="admin-activity-row" key={title}><CheckCircle2 size={16} /><span><b>{title}</b><small>{detail}</small></span><time>{time}</time></div>)}
      </section>
    </div>
    <section className="workspace-panel workflow-panel">
      <div className="section-title"><div><h2>Workflow shortcuts</h2><p>Move directly to the work queue you need.</p></div><button className="button button-outline" onClick={onAddTrainer}><Plus size={14} /> Add trainer</button></div>
      <div className="admin-shortcut-grid">{[["Bookings", CalendarDays], ["Members", UsersRound], ["Trainers", Dumbbell], ["Locations", Building2], ["Courses", BookOpen], ["KPI", TrendingUp]].map(([label, Icon]) => <button key={label as string} onClick={() => onNavigate(label as string)}><Icon size={19} /><b>{label as string}</b><small>Review records and update details</small><ChevronRight size={15} /></button>)}</div>
    </section>
  </>;
}

function AdminMiniStat({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return <article className="workspace-stat"><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label}</small><b>{value}</b><span>{note}</span></article>;
}

function AdminPackageList({
  packages,
  onOpen,
  onEdit,
  onToggle
}: {
  packages: AdminPackageItem[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return <section className="workspace-panel admin-package-list">
    <div className="section-title"><div><h2>Member packages</h2><p>Configure the 5+1, 10+3, and 20+7 catalogue plans from member_package rules.</p></div><span className="pill"><Wallet size={13} /> 180-day validity</span></div>
    {packages.map((item) => (
      <div className="admin-catalog-row" key={item.id}>
        <span className="admin-task-icon"><Wallet size={16} /></span>
        <span>
          <b>{item.name}</b>
          <small>{item.total_sessions} sessions ({item.paid_sessions} paid + {item.bonus_sessions} bonus) · ฿{item.price.toLocaleString()}</small>
          <small>{item.validity_days} days validity · ฿{Math.round(item.price / (item.paid_sessions || 1))} per paid session</small>
        </span>
        <Pill className={item.status === "Available" ? "confirmed-pill" : "gold-pill"}>{item.status}</Pill>
        <button className="button button-outline" onClick={() => onOpen(item.id)}>Details</button>
        <button className="button button-outline" onClick={() => onEdit(item.id)}><Pencil size={13} /> Edit</button>
        <button className="icon-button" aria-label={`Toggle ${item.name}`} onClick={() => onToggle(item.id)}><MoreHorizontal size={17} /></button>
      </div>
    ))}
  </section>;
}

function AdminReports({ onBuild }: { onBuild: () => void }) {
  return <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Bookings over time</h2><p>Sample weekly session volume.</p></div><div className="admin-report-controls"><select className="workspace-select"><option>Last 7 days</option><option>Last 30 days</option><option>This quarter</option></select><button className="icon-button" aria-label="Configure report" onClick={onBuild}><SlidersHorizontal size={16} /></button></div></div><div className="trainer-week-bars admin-report-bars">{[["M", 35], ["T", 68], ["W", 49], ["T", 77], ["F", 58], ["S", 92], ["S", 25]].map(([day, height], index) => <div key={`${day}-${index}`}><span>{height}%</span><i style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></section><section className="workspace-panel"><div className="section-title"><div><h2>Platform health</h2><p>Signals worth checking this week.</p></div><BarChart3 size={18} /></div><div className="admin-activity-row"><CheckCircle2 size={17} /><span><b>Bookings confirmed</b><small>86% of requests</small></span></div><div className="admin-activity-row"><Star size={17} /><span><b>Average trainer rating</b><small>4.8 / 5.0</small></span></div><div className="admin-activity-row"><TrendingUp size={17} /><span><b>Member retention</b><small>54% returning within 30 days</small></span></div></section></div>;
}

function AdminAudit({ onFilter }: { onFilter: () => void }) {
  const events = [["Admin FitBooking", "Updated KPI rule", "kpi_rule · ADVANCED", "2 min ago"], ["System", "Generated monthly snapshot", "coach_kpi_record · April 2026", "18 min ago"], ["Admin FitBooking", "Paused location", "gym · Hang Dong Training Room", "42 min ago"], ["Coach Tan", "Completed booking", "booking · #24016", "1 hr ago"]];
  return <section className="workspace-panel admin-audit-panel"><div className="section-title"><div><h2>Audit log</h2><p>Important changes from audit_log, newest first.</p></div><button className="button button-outline" onClick={onFilter}><Filter size={14} /> Filter events</button></div><div className="admin-audit-list">{events.map(([actor, action, entity, time]) => <div className="admin-audit-row" key={`${actor}-${time}`}><span className="admin-audit-mark"><ClipboardList size={15} /></span><span><b>{action}</b><small>{actor} · {entity}</small></span><time>{time}</time><button className="icon-button" aria-label={`Open ${action} event`}><MoreHorizontal size={16} /></button></div>)}</div><p className="auth-notice">Audit entries are illustrative. The final API should keep entity type, entity id, actor, detail JSON, and created_at together.</p></section>;
}

function AdminSettings({ status, onToggle }: { status: Record<string, AdminStatus>; onToggle: (id: string, value: AdminStatus) => void }) {
  const settings = [["Trainer verification review", "Admin approval required"], ["Member booking reminders", "Send 24 hours before a session"], ["Package catalogue", "Active member packages"], ["Audit logging", "Keep a trace of important changes"]] as const;
  return <div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Platform settings</h2><p>Controls shown here are local demo preferences.</p></div><ShieldCheck size={18} /></div>{settings.map(([label, detail]) => { const value = status[label] || "Active"; return <div className="notification-setting" key={label}><div><b>{label}</b><p>{detail}</p></div><button className={`toggle-switch ${value === "Active" ? "on" : ""}`} aria-label={`Toggle ${label}`} aria-pressed={value === "Active"} onClick={() => onToggle(label, value === "Active" ? "Paused" : "Active")}><i /></button></div>; })}</section><section className="workspace-panel admin-policy-panel"><div className="section-title"><div><h2>Data handling notes</h2><p>Aligned with the database documentation.</p></div><ShieldCheck size={18} /></div><div className="admin-policy-row"><Check size={15} /><span>Business records use status-based soft deletion.</span></div><div className="admin-policy-row"><Check size={15} /><span>Dynamic coach schedule table names stay backend-owned.</span></div><div className="admin-policy-row"><Check size={15} /><span>Financial values display in Thai baht with two decimals in the API.</span></div></section></div>;
}

function AdminDetailDrawer({
  detail,
  bookings,
  members,
  coaches,
  locations,
  courses,
  packages,
  onClose,
  onEdit,
  onNotice,
  onToggleBooking,
  onToggleMember,
  onToggleCoach,
  onToggleLocation,
  onToggleCourse,
  onTogglePackage
}: {
  detail: { type: AdminDetailType; id: string };
  bookings: AdminBookingItem[];
  members: AdminMemberItem[];
  coaches: AdminCoachItem[];
  locations: AdminLocationItem[];
  courses: AdminCourseItem[];
  packages: AdminPackageItem[];
  onClose: () => void;
  onEdit: (kind: AdminModalKind, id: string) => void;
  onNotice: (message: string) => void;
  onToggleBooking: (id: string) => void;
  onToggleMember: (id: string) => void;
  onToggleCoach: (id: string) => void;
  onToggleLocation: (id: string) => void;
  onToggleCourse: (id: string) => void;
  onTogglePackage: (id: string) => void;
}) {
  const b = bookings.find((item) => item.id === detail.id);
  const m = members.find((item) => item.id === detail.id);
  const c = coaches.find((item) => item.id === detail.id);
  const l = locations.find((item) => item.id === detail.id);
  const cr = courses.find((item) => item.id === detail.id);
  const p = packages.find((item) => item.id === detail.id);

  const title = detail.type === "booking" ? (b ? `${b.member_name} · ${b.coach_name}` : "Booking detail")
    : detail.type === "member" ? (m ? m.display_name : "Member detail")
    : detail.type === "coach" ? (c ? c.display_name : "Coach detail")
    : detail.type === "location" ? (l ? l.gym_name : "Location detail")
    : detail.type === "course" ? (cr ? cr.course_name : "Course detail")
    : (p ? p.name : "Package detail");

  const subtitle = detail.type === "booking" ? (b ? `Booking #${b.booking_id} · ${b.course_name}` : "")
    : detail.type === "member" ? (m ? `${m.email} · ${m.phone}` : "")
    : detail.type === "coach" ? (c ? `Coach no. ${c.coach_no} · ${c.coach_level}` : "")
    : detail.type === "location" ? (l ? `${l.district} · ${l.address}` : "")
    : detail.type === "course" ? (cr ? `${cr.difficulty} · ${cr.default_duration} minutes` : "")
    : (p ? `${p.total_sessions} sessions · ฿${p.price.toLocaleString()}` : "");

  const statusLabel = detail.type === "booking" ? (b?.status || "CONFIRMED")
    : detail.type === "member" ? (m?.status || "ACTIVE")
    : detail.type === "coach" ? (c?.status || "ACTIVE")
    : detail.type === "location" ? (l?.is_active === 1 ? "Active" : "Paused")
    : detail.type === "course" ? (cr?.is_active === 1 ? "Available" : "Draft")
    : (p?.status || "Available");

  const editKind: AdminModalKind = detail.type === "coach" ? "trainer" : detail.type;

  return <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}><aside className="admin-detail-drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{detail.type.toUpperCase()} DETAIL</span><h2>{title}</h2><p>{subtitle}</p></div><div className="admin-drawer-header-actions"><button className="button button-outline" onClick={() => onEdit(editKind, detail.id)}><Pencil size={13} /> Edit</button><button className="icon-button" aria-label="Close detail" onClick={onClose}><X size={19} /></button></div></header><div className="admin-detail-status"><Pill className={statusLabel === "Active" || statusLabel === "Available" || statusLabel === "CONFIRMED" || statusLabel === "COMPLETED" ? "confirmed-pill" : "gold-pill"}>{statusLabel}</Pill><span>Preview record · editable by administrators.</span></div>
    {detail.type === "booking" && b && <>
      <AdminDetailSection title="Session information">
        <AdminDetailLine label="Booking ID" value={`#${b.booking_id}`} />
        <AdminDetailLine label="Member" value={b.member_name} />
        <AdminDetailLine label="Coach" value={b.coach_name} />
        <AdminDetailLine label="Course" value={b.course_name} />
        <AdminDetailLine label="Date & Time" value={`${b.booking_date} · ${b.start_time} - ${b.end_time} (${b.duration_minutes} min)`} />
        <AdminDetailLine label="Break buffer" value={`${b.break_minutes} minutes`} />
      </AdminDetailSection>
      <AdminDetailSection title="Location & Payment">
        <AdminDetailLine label="Service mode" value={b.service_mode} />
        <AdminDetailLine label="Location" value={b.service_mode === "GYM" ? (b.gym_name || "Gym facility") : `Home: ${b.service_address || ""} (${b.service_district || ""})`} />
        <AdminDetailLine label="Price" value={`฿${b.price.toLocaleString()}`} />
        <AdminDetailLine label="Package credit" value={b.package_name || "None / Direct booking"} />
        {b.status === "CANCELLED" && <>
          <AdminDetailLine label="Cancelled by" value={b.cancelled_by || "ADMIN"} />
          <AdminDetailLine label="Cancel reason" value={b.cancel_reason || "None specified"} />
        </>}
      </AdminDetailSection>
      <AdminDetailSection title="Quick actions">
        <button className="button button-outline drawer-action" onClick={() => { onToggleBooking(b.id); onNotice(`Booking #${b.booking_id} status updated.`); }}>
          {b.status === "CONFIRMED" ? "Mark session completed" : "Confirm booking"}
        </button>
      </AdminDetailSection>
    </>}

    {detail.type === "member" && m && <>
      <AdminDetailSection title="Account details">
        <AdminDetailLine label="Display name" value={m.display_name} />
        <AdminDetailLine label="Username" value={m.username} />
        <AdminDetailLine label="Email" value={m.email} />
        <AdminDetailLine label="Phone" value={m.phone} />
        <AdminDetailLine label="Membership" value={`${m.level_code} · ฿${m.total_spend.toLocaleString()} total spend`} />
        <AdminDetailLine label="Package balance" value={`${m.remaining_sessions} sessions left`} />
      </AdminDetailSection>
      <AdminDetailSection title="Fitness Profile">
        <AdminDetailLine label="Gender & Age" value={`${m.gender || "Not specified"} · Birthdate: ${m.birth_date || "—"}`} />
        <AdminDetailLine label="Body metrics" value={`Height: ${m.height_cm ? `${m.height_cm} cm` : "—"} · Weight: ${m.weight_kg ? `${m.weight_kg} kg` : "—"}`} />
        <AdminDetailLine label="Fitness goal" value={m.fitness_goal || "None stated"} />
      </AdminDetailSection>
      <AdminDetailSection title="Account controls">
        <button className="button button-outline drawer-action" onClick={() => { onToggleMember(m.id); onNotice(`Member ${m.display_name} status toggled.`); }}>
          {m.status === "ACTIVE" ? "Disable account" : "Activate account"}
        </button>
      </AdminDetailSection>
    </>}

    {detail.type === "coach" && c && <>
      <AdminDetailSection title="Coach Profile">
        <AdminDetailLine label="Coach number" value={c.coach_no} />
        <AdminDetailLine label="Coach level" value={c.coach_level} />
        <AdminDetailLine label="Experience" value={`${c.years_experience} years · Rating: ⭐ ${c.rating.toFixed(1)}`} />
        <AdminDetailLine label="Service mode" value={`${c.service_mode} · ${c.break_interval}-min break buffer`} />
        <AdminDetailLine label="Locations" value={c.assigned_locations} />
        <AdminDetailLine label="Courses taught" value={c.courses_taught} />
        <AdminDetailLine label="Certifications" value={c.certifications || "None specified"} />
        <AdminDetailLine label="Bio" value={c.bio || "No biography"} />
      </AdminDetailSection>
      <AdminDetailSection title="Roster actions">
        <button className="button button-outline drawer-action" onClick={() => { onToggleCoach(c.id); onNotice(`Coach ${c.display_name} status updated.`); }}>
          {c.status === "ACTIVE" ? "Set to On leave" : "Set to Active"}
        </button>
      </AdminDetailSection>
    </>}

    {detail.type === "location" && l && <>
      <AdminDetailSection title="Facility details">
        <AdminDetailLine label="District" value={l.district} />
        <AdminDetailLine label="Address" value={l.address} />
        <AdminDetailLine label="Hours" value={`${l.opening_time} – ${l.closing_time}`} />
        <AdminDetailLine label="Phone" value={l.phone} />
        <AdminDetailLine label="Facilities" value={l.facilities} />
        <AdminDetailLine label="Coordinates" value={`${l.latitude}, ${l.longitude}`} />
        <AdminDetailLine label="Features" value={l.features} />
      </AdminDetailSection>
      <AdminDetailSection title="Facility actions">
        <button className="button button-outline drawer-action" onClick={() => { onToggleLocation(l.id); onNotice(`Location ${l.gym_name} status toggled.`); }}>
          {l.is_active === 1 ? "Pause location" : "Activate location"}
        </button>
      </AdminDetailSection>
    </>}

    {detail.type === "course" && cr && <>
      <AdminDetailSection title="Course catalogue">
        <AdminDetailLine label="Difficulty" value={cr.difficulty} />
        <AdminDetailLine label="Default duration" value={`${cr.default_duration} minutes`} />
        <AdminDetailLine label="Equipment" value={cr.equipment} />
        <AdminDetailLine label="Assigned coaches" value={cr.assigned_coaches} />
        <AdminDetailLine label="Description" value={cr.description} />
      </AdminDetailSection>
      <AdminDetailSection title="Catalogue actions">
        <button className="button button-outline drawer-action" onClick={() => { onToggleCourse(cr.id); onNotice(`Course ${cr.course_name} catalogue status changed.`); }}>
          {cr.is_active === 1 ? "Deactivate course" : "Publish course"}
        </button>
      </AdminDetailSection>
    </>}

    {detail.type === "package" && p && <>
      <AdminDetailSection title="Package Plan">
        <AdminDetailLine label="Package type" value={p.package_type} />
        <AdminDetailLine label="Sessions" value={`${p.total_sessions} total (${p.paid_sessions} paid + ${p.bonus_sessions} bonus)`} />
        <AdminDetailLine label="Price" value={`฿${p.price.toLocaleString()}`} />
        <AdminDetailLine label="Validity" value={`${p.validity_days} days`} />
        <AdminDetailLine label="Description" value={p.description} />
        <AdminDetailLine label="Terms" value={p.terms} />
      </AdminDetailSection>
      <AdminDetailSection title="Package actions">
        <button className="button button-outline drawer-action" onClick={() => { onTogglePackage(p.id); onNotice(`Package ${p.name} status updated.`); }}>
          {p.status === "Available" ? "Pause package" : "Make available"}
        </button>
      </AdminDetailSection>
    </>}
  </aside></div>;
}

function AdminDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-detail-section"><h3>{title}</h3>{children}</section>;
}

function AdminDetailLine({ label, value }: { label: string; value: string }) {
  return <div className="admin-detail-line"><span>{label}</span><b>{value}</b></div>;
}

function AdminFilters({ query, setQuery, placeholder, onOpenFilters }: { query: string; setQuery: (value: string) => void; placeholder: string; onOpenFilters: () => void }) {
  return <div className="admin-filter-row"><label className="search-bar"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label><select className="workspace-select"><option>All statuses</option><option>Active</option><option>Pending</option><option>Paused</option><option>Needs review</option></select><button className="button button-outline" onClick={onOpenFilters}><SlidersHorizontal size={14} /> Filters</button></div>;
}

function AdminTable({
  rows,
  onOpen,
  onEdit,
  action,
  actionText
}: {
  rows: AdminRow[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  action: (id: string) => void;
  actionText: string;
}) {
  return <div className="workspace-panel admin-table-wrap">
    <table className="admin-table">
      <thead><tr><th>Record</th><th>Details</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td><button className="admin-table-record" onClick={() => onOpen(row.id)}><b>{row.name}</b><span>Open details</span></button></td>
            <td>{row.detail}<small>{row.extra}</small></td>
            <td><span className={`booking-status ${row.status.toLowerCase().replaceAll(" ", "-")}`}>{row.status}</span></td>
            <td>
              <button className="button button-outline" onClick={() => onEdit(row.id)}><Pencil size={13} /> Edit</button>
              <button className="button button-outline" onClick={() => action(row.id)}>{row.status === "Confirmed" ? "Complete" : actionText}</button>
              <button className="icon-button" aria-label={`More actions for ${row.name}`} onClick={() => onOpen(row.id)}><MoreHorizontal size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {!rows.length && <div className="empty-state"><Search size={23} /><h3>No records found</h3><p>Try clearing your search and checking again.</p></div>}
    <p className="auth-notice">Modifications are saved to active preview state in this session.</p>
  </div>;
}

function AdminFormDrawer({
  kind,
  active,
  editTarget,
  bookings,
  members,
  coaches,
  locations,
  courses,
  packages,
  kpiRecords,
  onSaveBooking,
  onSaveMember,
  onSaveCoach,
  onSaveLocation,
  onSaveCourse,
  onSavePackage,
  onSaveKpiRecord,
  onRecalculateKpi,
  onClose,
  onSave
}: {
  kind: AdminModalKind;
  active: string;
  editTarget: { kind: AdminModalKind; id: string } | null;
  bookings: AdminBookingItem[];
  members: AdminMemberItem[];
  coaches: AdminCoachItem[];
  locations: AdminLocationItem[];
  courses: AdminCourseItem[];
  packages: AdminPackageItem[];
  kpiRecords: AdminKpiRecordItem[];
  onSaveBooking: (item: AdminBookingItem) => void;
  onSaveMember: (item: AdminMemberItem) => void;
  onSaveCoach: (item: AdminCoachItem) => void;
  onSaveLocation: (item: AdminLocationItem) => void;
  onSaveCourse: (item: AdminCourseItem) => void;
  onSavePackage: (item: AdminPackageItem) => void;
  onSaveKpiRecord: (item: AdminKpiRecordItem) => void;
  onRecalculateKpi?: () => void;
  onClose: () => void;
  onSave: (message: string) => void;
}) {
  const isEdit = Boolean(editTarget && editTarget.id);

  const targetItem = isEdit ? (
    kind === "booking" ? bookings.find((b) => b.id === editTarget!.id) :
    kind === "member" ? members.find((m) => m.id === editTarget!.id) :
    kind === "trainer" ? coaches.find((c) => c.id === editTarget!.id) :
    kind === "location" ? locations.find((l) => l.id === editTarget!.id) :
    kind === "course" ? courses.find((c) => c.id === editTarget!.id) :
    kind === "package" ? packages.find((p) => p.id === editTarget!.id) :
    kind === "kpi" ? kpiRecords.find((k) => k.id === editTarget!.id) :
    null
  ) : null;

  const metadata: Record<AdminModalKind, { eyebrow: string; title: string; description: string }> = {
    trainer: {
      eyebrow: isEdit ? "EDIT COACH" : "COACH PROFILE",
      title: isEdit ? `Edit coach: ${(targetItem as AdminCoachItem)?.display_name || ""}` : "Add trainer",
      description: isEdit ? "Update trainer credentials, level, status, service locations, and break intervals." : "Create the profile, service coverage, courses, and recurring availability that the admin will review."
    },
    member: {
      eyebrow: isEdit ? "EDIT MEMBER" : "MEMBER ACCOUNT",
      title: isEdit ? `Edit member: ${(targetItem as AdminMemberItem)?.display_name || ""}` : "Add member",
      description: isEdit ? "Update member profile, membership tier, contact details, or fitness profile metrics." : "Preview the member account and fitness profile information collected by FitBooking."
    },
    location: {
      eyebrow: isEdit ? "EDIT LOCATION" : "GYM / LOCATION",
      title: isEdit ? `Edit location: ${(targetItem as AdminLocationItem)?.gym_name || ""}` : "Add location",
      description: isEdit ? "Update location name, hours, facilities, coordinates, and operating status." : "Set the place details used by gym bookings and coach service assignments."
    },
    course: {
      eyebrow: isEdit ? "EDIT COURSE" : "COURSE CATALOGUE",
      title: isEdit ? `Edit course: ${(targetItem as AdminCourseItem)?.course_name || ""}` : "Add course",
      description: isEdit ? "Update course name, duration, difficulty, equipment, and catalogue visibility." : "Describe the training course before assigning coaches and coach-specific prices."
    },
    package: {
      eyebrow: isEdit ? "EDIT PACKAGE" : "MEMBER PACKAGE",
      title: isEdit ? `Edit package: ${(targetItem as AdminPackageItem)?.name || ""}` : "Add package",
      description: isEdit ? "Update package sessions, pricing, validity period, and terms." : "Show the package terms, price, validity, and session balance rules."
    },
    booking: {
      eyebrow: isEdit ? "EDIT BOOKING" : "BOOKING WORKFLOW",
      title: isEdit ? `Edit booking #${(targetItem as AdminBookingItem)?.booking_id || ""}` : "Create booking",
      description: isEdit ? "Update booking schedule, location, price, and booking status (Confirmed, Completed, Cancelled)." : "Preview the booking information an admin sees when creating or assisting with a reservation."
    },
    kpi: {
      eyebrow: "COACH KPI SNAPSHOT",
      title: isEdit ? `Edit KPI: ${(targetItem as AdminKpiRecordItem)?.coach || ""}` : "Update KPI",
      description: "Adjust or override monthly coached hours, session count, client ratings, or target attainment."
    },
    workflow: {
      eyebrow: "ADMIN WORKFLOW",
      title: active === "KPI" ? "Recalculate KPI snapshot" : "New workflow",
      description: active === "KPI" ? "Recalculate monthly achievement status against current kpi_rule requirements." : "Define who owns the work, when it starts, and which records it touches."
    },
    filters: { eyebrow: "LIST FILTERS", title: "Filter records", description: "Choose the dimensions shown in this management list." },
    auditFilters: { eyebrow: "AUDIT LOG", title: "Filter audit events", description: "Narrow the audit trail by actor, action, entity, or time range." },
    report: { eyebrow: "REPORT BUILDER", title: "Build report", description: "Choose the report range and the operational measures to include." }
  };

  const info = metadata[kind];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    if (kind === "booking") {
      const existing = targetItem as AdminBookingItem | null;
      const dur = Number(fd.get("duration_minutes")) || 60;
      const brk = Number(String(fd.get("break_minutes")).replace(/\D/g, "")) as (10 | 20 | 30) || 10;
      const startTime = String(fd.get("start_time") || "08:00");
      let endTime = String(fd.get("end_time") || "");
      if (!endTime && startTime) {
        const [sh, sm] = startTime.split(":").map(Number);
        const totalMinutes = (sh || 0) * 60 + (sm || 0) + dur;
        const eh = Math.floor(totalMinutes / 60) % 24;
        const em = totalMinutes % 60;
        endTime = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
      }

      const item: AdminBookingItem = {
        id: existing ? existing.id : `booking-${Date.now().toString().slice(-5)}`,
        booking_id: existing ? existing.booking_id : Math.floor(24000 + Math.random() * 1000),
        member_name: String(fd.get("member_name") || existing?.member_name || "Alex Morgan"),
        coach_name: String(fd.get("coach_name") || existing?.coach_name || "Tan Chaiyaporn"),
        course_name: String(fd.get("course_name") || existing?.course_name || "Strength & Conditioning"),
        service_mode: (fd.get("service_mode") as "GYM" | "HOME") || "GYM",
        gym_name: fd.get("service_mode") === "GYM" ? String(fd.get("gym_name") || "Nimman Fitness Club") : null,
        service_district: fd.get("service_mode") === "HOME" ? ((fd.get("service_district") as District) || "NIMMAN") : null,
        service_address: fd.get("service_mode") === "HOME" ? String(fd.get("service_address") || "") : null,
        booking_date: String(fd.get("booking_date") || "2026-04-22"),
        start_time: startTime,
        end_time: endTime || "09:00",
        duration_minutes: dur,
        break_minutes: brk,
        price: Number(fd.get("price")) || 800,
        status: (fd.get("status") as BookingStatus) || "CONFIRMED",
        cancelled_by: fd.get("status") === "CANCELLED" ? ((fd.get("cancelled_by") as CancelledBy) || "ADMIN") : null,
        cancel_reason: fd.get("status") === "CANCELLED" ? String(fd.get("cancel_reason") || "Cancelled by admin") : null,
        package_name: String(fd.get("package_name") || "") || null
      };
      onSaveBooking(item);
      onSave(existing ? `Booking #${item.booking_id} updated successfully.` : `Booking #${item.booking_id} created successfully.`);
      return;
    }

    if (kind === "member") {
      const existing = targetItem as AdminMemberItem | null;
      const item: AdminMemberItem = {
        id: existing ? existing.id : `member-${Date.now().toString().slice(-4)}`,
        user_id: existing ? existing.user_id : Math.floor(100 + Math.random() * 900),
        member_id: existing ? existing.member_id : Math.floor(100 + Math.random() * 900),
        display_name: String(fd.get("display_name") || existing?.display_name || "New Member"),
        username: String(fd.get("username") || existing?.username || "new.member"),
        email: String(fd.get("email") || existing?.email || "member@example.com"),
        phone: String(fd.get("phone") || existing?.phone || "+66 80 000 0000"),
        status: (fd.get("status") as "ACTIVE" | "DISABLED") || "ACTIVE",
        level_code: (fd.get("level_code") as "BRONZE" | "SILVER" | "GOLD") || "BRONZE",
        total_spend: Number(fd.get("total_spend")) || 0,
        remaining_sessions: Number(fd.get("remaining_sessions")) || 0,
        gender: (fd.get("gender") as "MALE" | "FEMALE" | "OTHER") || null,
        birth_date: String(fd.get("birth_date") || "") || null,
        height_cm: Number(fd.get("height_cm")) || null,
        weight_kg: Number(fd.get("weight_kg")) || null,
        fitness_goal: String(fd.get("fitness_goal") || "") || null
      };
      onSaveMember(item);
      onSave(existing ? `Member ${item.display_name} updated successfully.` : `Member ${item.display_name} created successfully.`);
      return;
    }

    if (kind === "trainer") {
      const existing = targetItem as AdminCoachItem | null;
      const brk = Number(String(fd.get("break_interval")).replace(/\D/g, "")) as (10 | 20 | 30) || 10;
      const item: AdminCoachItem = {
        id: existing ? existing.id : `coach-${Date.now().toString().slice(-4)}`,
        coach_id: existing ? existing.coach_id : Math.floor(10 + Math.random() * 90),
        coach_no: String(fd.get("coach_no") || existing?.coach_no || "1005"),
        user_id: existing ? existing.user_id : Math.floor(100 + Math.random() * 900),
        display_name: String(fd.get("display_name") || existing?.display_name || "New Coach"),
        username: String(fd.get("username") || existing?.username || "new.coach"),
        email: String(fd.get("email") || existing?.email || "coach@fitbooking.local"),
        phone: String(fd.get("phone") || existing?.phone || "+66 81 000 0000"),
        coach_level: (fd.get("coach_level") as CoachLevel) || "ADVANCED",
        status: (fd.get("status") as "ACTIVE" | "ON_LEAVE" | "RESIGNED") || "ACTIVE",
        service_mode: (fd.get("service_mode") as CoachServiceMode) || "BOTH",
        break_interval: brk,
        years_experience: Number(fd.get("years_experience")) || 1,
        certifications: String(fd.get("certifications") || ""),
        bio: String(fd.get("bio") || ""),
        assigned_locations: String(fd.get("assigned_locations") || ""),
        courses_taught: String(fd.get("courses_taught") || ""),
        hired_at: String(fd.get("hired_at") || "2024-01-01"),
        rating: Number(fd.get("rating")) || 4.8
      };
      onSaveCoach(item);
      onSave(existing ? `Coach ${item.display_name} updated successfully.` : `Coach ${item.display_name} added successfully.`);
      return;
    }

    if (kind === "location") {
      const existing = targetItem as AdminLocationItem | null;
      const item: AdminLocationItem = {
        id: existing ? existing.id : `gym-${Date.now().toString().slice(-4)}`,
        gym_id: existing ? existing.gym_id : Math.floor(10 + Math.random() * 90),
        gym_name: String(fd.get("gym_name") || existing?.gym_name || "New Gym"),
        address: String(fd.get("address") || existing?.address || "Chiang Mai"),
        district: (fd.get("district") as District) || "NIMMAN",
        phone: String(fd.get("phone") || existing?.phone || "053-000-000"),
        facilities: String(fd.get("facilities") || existing?.facilities || ""),
        opening_time: String(fd.get("opening_time") || "06:00"),
        closing_time: String(fd.get("closing_time") || "22:00"),
        latitude: Number(fd.get("latitude")) || 18.7961,
        longitude: Number(fd.get("longitude")) || 98.9675,
        is_active: fd.get("is_active") === "Paused" ? 0 : 1,
        features: String(fd.get("features") || existing?.features || "")
      };
      onSaveLocation(item);
      onSave(existing ? `Location ${item.gym_name} updated successfully.` : `Location ${item.gym_name} created successfully.`);
      return;
    }

    if (kind === "course") {
      const existing = targetItem as AdminCourseItem | null;
      const item: AdminCourseItem = {
        id: existing ? existing.id : `course-${Date.now().toString().slice(-4)}`,
        course_id: existing ? existing.course_id : Math.floor(10 + Math.random() * 90),
        course_name: String(fd.get("course_name") || existing?.course_name || "New Course"),
        description: String(fd.get("description") || existing?.description || ""),
        difficulty: (fd.get("difficulty") as CourseDifficulty) || "INTERMEDIATE",
        default_duration: Number(fd.get("default_duration")) || 60,
        equipment: String(fd.get("equipment") || existing?.equipment || ""),
        is_active: fd.get("is_active") === "Draft" || fd.get("is_active") === "Paused" ? 0 : 1,
        assigned_coaches: String(fd.get("assigned_coaches") || existing?.assigned_coaches || "")
      };
      onSaveCourse(item);
      onSave(existing ? `Course ${item.course_name} updated successfully.` : `Course ${item.course_name} created successfully.`);
      return;
    }

    if (kind === "package") {
      const existing = targetItem as AdminPackageItem | null;
      const item: AdminPackageItem = {
        id: existing ? existing.id : `package-${Date.now().toString().slice(-4)}`,
        package_type: (fd.get("package_type") as PackageType) || "10+3",
        name: String(fd.get("name") || existing?.name || "New Package"),
        paid_sessions: Number(fd.get("paid_sessions")) || 10,
        bonus_sessions: Number(fd.get("bonus_sessions")) || 3,
        total_sessions: Number(fd.get("total_sessions")) || 13,
        price: Number(fd.get("price")) || 8970,
        validity_days: Number(fd.get("validity_days")) || 180,
        description: String(fd.get("description") || existing?.description || ""),
        terms: String(fd.get("terms") || existing?.terms || ""),
        status: (fd.get("status") as "Available" | "Paused") || "Available"
      };
      onSavePackage(item);
      onSave(existing ? `Package ${item.name} updated successfully.` : `Package ${item.name} added successfully.`);
      return;
    }

    if (kind === "kpi") {
      const existing = targetItem as AdminKpiRecordItem | null;
      if (!existing) return;
      const item: AdminKpiRecordItem = {
        id: existing.id,
        coach_id: existing.coach_id,
        coach: existing.coach,
        level: (fd.get("level") as CoachLevel) || existing.level,
        hours: Number(fd.get("hours")) || existing.hours,
        sessions: Number(fd.get("sessions")) || existing.sessions,
        rating: Number(fd.get("rating")) || existing.rating,
        retention: Number(fd.get("retention")) || existing.retention,
        target_hours: Number(fd.get("target_hours")) || existing.target_hours,
        target_rating: Number(fd.get("target_rating")) || existing.target_rating,
        target_retention: Number(fd.get("target_retention")) || existing.target_retention,
        achieved: fd.get("achieved") === "Achieved"
      };
      onSaveKpiRecord(item);
      onSave(`KPI record for ${item.coach} updated successfully.`);
      return;
    }

    if (kind === "workflow") {
      if (active === "KPI" && onRecalculateKpi) {
        onRecalculateKpi();
        onSave("KPI snapshots recalculated based on current kpi_rule thresholds.");
      } else {
        onSave("Workflow saved locally.");
      }
      return;
    }

    onSave(`${info.title} preview saved locally.`);
  };

  return <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}><aside className="admin-form-drawer" role="dialog" aria-modal="true" aria-label={info.title} onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{info.eyebrow}</span><h2>{info.title}</h2><p>{info.description}</p></div><button className="icon-button" aria-label="Close form" onClick={onClose}><X size={19} /></button></header>
    <form className="admin-form" onSubmit={handleSubmit}>
      <AdminFormFields kind={kind} targetItem={targetItem} />
      <div className="admin-form-note"><ShieldCheck size={14} /><span>Preview modifications are reactive and update the local admin management state immediately.</span></div>
      <footer>
        <button type="button" className="button button-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="button button-primary">{isEdit ? "Save changes" : kind === "filters" || kind === "auditFilters" ? "Apply filters" : kind === "workflow" ? "Run workflow" : kind === "report" ? "Generate preview" : "Create record"}</button>
      </footer>
    </form>
  </aside></div>;
}

function AdminFormFields({ kind, targetItem }: { kind: AdminModalKind; targetItem?: any }) {
  if (kind === "booking") {
    const b = targetItem as AdminBookingItem | undefined;
    return <>
      <AdminFormSection title="Booking session">
        <AdminFormField name="member_name" label="Member name" value={b?.member_name || ""} placeholder="e.g. Alex Morgan" />
        <AdminFormField name="coach_name" label="Coach name" value={b?.coach_name || ""} placeholder="e.g. Tan Chaiyaporn" />
        <AdminFormField name="course_name" label="Course" value={b?.course_name || ""} placeholder="e.g. Strength & Conditioning" />
        <div className="admin-form-grid">
          <AdminFormField name="booking_date" label="Booking date" type="date" value={b?.booking_date || "2026-04-22"} />
          <AdminFormField name="start_time" label="Start time" type="time" value={b?.start_time || "08:00"} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="duration_minutes" label="Duration (minutes)" type="number" value={b?.duration_minutes ?? 60} />
          <AdminFormField name="break_minutes" label="Break interval" type="select" options={["10 minutes", "20 minutes", "30 minutes"]} value={b ? `${b.break_minutes} minutes` : "10 minutes"} />
        </div>
      </AdminFormSection>
      <AdminFormSection title="Service & Location">
        <AdminFormField name="service_mode" label="Service mode" type="select" options={["GYM", "HOME"]} value={b?.service_mode || "GYM"} />
        <AdminFormField name="gym_name" label="Gym location (if GYM)" value={b?.gym_name || "Nimman Fitness Club"} placeholder="e.g. Nimman Fitness Club" />
        <div className="admin-form-grid">
          <AdminFormField name="service_district" label="Service district (if HOME)" type="select" options={["NIMMAN", "OLD_CITY", "CENTRAL", "MAE_RIM", "HANG_DONG"]} value={b?.service_district || "NIMMAN"} />
          <AdminFormField name="service_address" label="Service address (if HOME)" value={b?.service_address || ""} placeholder="Street address in Chiang Mai" />
        </div>
      </AdminFormSection>
      <AdminFormSection title="Payment & Status">
        <div className="admin-form-grid">
          <AdminFormField name="price" label="Price (THB)" type="number" value={b?.price ?? 800} />
          <AdminFormField name="package_name" label="Package credit" value={b?.package_name || ""} placeholder="e.g. 10+3 Sessions (or empty for cash/card)" />
        </div>
        <AdminFormField name="status" label="Booking status" type="select" options={["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]} value={b?.status || "CONFIRMED"} />
        <div className="admin-form-grid">
          <AdminFormField name="cancelled_by" label="Cancelled by (if CANCELLED)" type="select" options={["ADMIN", "MEMBER", "COACH", "SYSTEM"]} value={b?.cancelled_by || "ADMIN"} />
          <AdminFormField name="cancel_reason" label="Cancel reason (if CANCELLED)" value={b?.cancel_reason || ""} placeholder="Reason for cancellation" />
        </div>
      </AdminFormSection>
    </>;
  }

  if (kind === "member") {
    const m = targetItem as AdminMemberItem | undefined;
    return <>
      <AdminFormSection title="Account details">
        <AdminFormField name="display_name" label="Display name" value={m?.display_name || ""} placeholder="Alex Morgan" />
        <AdminFormField name="username" label="Username" value={m?.username || ""} placeholder="alex.morgan" />
        <AdminFormField name="email" label="Email address" value={m?.email || ""} placeholder="alex.morgan@example.com" />
        <AdminFormField name="phone" label="Phone number" value={m?.phone || ""} placeholder="+66 82 345 6789" />
        <AdminFormField name="status" label="Account status" type="select" options={["ACTIVE", "DISABLED"]} value={m?.status || "ACTIVE"} />
      </AdminFormSection>
      <AdminFormSection title="Membership & Spend">
        <div className="admin-form-grid">
          <AdminFormField name="level_code" label="Membership level" type="select" options={["BRONZE", "SILVER", "GOLD"]} value={m?.level_code || "BRONZE"} />
          <AdminFormField name="total_spend" label="Total spend (THB)" type="number" value={m?.total_spend ?? 0} />
        </div>
        <AdminFormField name="remaining_sessions" label="Remaining package sessions" type="number" value={m?.remaining_sessions ?? 0} />
      </AdminFormSection>
      <AdminFormSection title="Fitness Profile">
        <div className="admin-form-grid">
          <AdminFormField name="gender" label="Gender" type="select" options={["MALE", "FEMALE", "OTHER"]} value={m?.gender || "MALE"} />
          <AdminFormField name="birth_date" label="Date of birth" type="date" value={m?.birth_date || ""} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="height_cm" label="Height (cm)" type="number" value={m?.height_cm ?? 170} />
          <AdminFormField name="weight_kg" label="Weight (kg)" type="number" value={m?.weight_kg ?? 68} />
        </div>
        <AdminFormField name="fitness_goal" label="Fitness goal" value={m?.fitness_goal || ""} placeholder="Build strength and stay consistent" multiline />
      </AdminFormSection>
    </>;
  }

  if (kind === "trainer") {
    const c = targetItem as AdminCoachItem | undefined;
    return <>
      <AdminFormSection title="Account & Identity">
        <AdminFormField name="display_name" label="Full name" value={c?.display_name || ""} placeholder="Ploy Rattanakorn" />
        <div className="admin-form-grid">
          <AdminFormField name="coach_no" label="Coach number (4-8 digits)" value={c?.coach_no || "1004"} placeholder="1004" />
          <AdminFormField name="coach_level" label="Coach level" type="select" options={["BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"]} value={c?.coach_level || "ADVANCED"} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="email" label="Email address" value={c?.email || ""} placeholder="ploy@fitbooking.local" />
          <AdminFormField name="phone" label="Phone number" value={c?.phone || ""} placeholder="+66 81 234 5678" />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="status" label="Working status" type="select" options={["ACTIVE", "ON_LEAVE", "RESIGNED"]} value={c?.status || "ACTIVE"} />
          <AdminFormField name="years_experience" label="Years of experience" type="number" value={c?.years_experience ?? 5} />
        </div>
      </AdminFormSection>
      <AdminFormSection title="Service settings">
        <div className="admin-form-grid">
          <AdminFormField name="service_mode" label="Service mode" type="select" options={["GYM", "HOME", "BOTH"]} value={c?.service_mode || "BOTH"} />
          <AdminFormField name="break_interval" label="Break interval" type="select" options={["10 minutes", "20 minutes", "30 minutes"]} value={c ? `${c.break_interval} minutes` : "10 minutes"} />
        </div>
        <AdminFormField name="assigned_locations" label="Assigned locations" value={c?.assigned_locations || ""} placeholder="Nimman Fitness Club, Old City Studio" />
        <AdminFormField name="courses_taught" label="Courses taught" value={c?.courses_taught || ""} placeholder="Strength & Conditioning, Mobility" />
        <div className="admin-form-grid">
          <AdminFormField name="hired_at" label="Hire date" type="date" value={c?.hired_at || "2023-01-01"} />
          <AdminFormField name="rating" label="Coach rating (1-5)" type="number" step="0.1" value={c?.rating ?? 4.8} />
        </div>
        <AdminFormField name="certifications" label="Certifications" value={c?.certifications || ""} placeholder="ACE CPT, First Aid & CPR" />
        <AdminFormField name="bio" label="Bio" value={c?.bio || ""} placeholder="A short introduction for members" multiline />
      </AdminFormSection>
    </>;
  }

  if (kind === "location") {
    const l = targetItem as AdminLocationItem | undefined;
    return <>
      <AdminFormSection title="Location Profile">
        <AdminFormField name="gym_name" label="Location name" value={l?.gym_name || ""} placeholder="Nimman Fitness Club" />
        <div className="admin-form-grid">
          <AdminFormField name="district" label="District" type="select" options={["NIMMAN", "OLD_CITY", "CENTRAL", "MAE_RIM", "HANG_DONG"]} value={l?.district || "NIMMAN"} />
          <AdminFormField name="phone" label="Phone number" value={l?.phone || ""} placeholder="+66 52 123 456" />
        </div>
        <AdminFormField name="address" label="Address" value={l?.address || ""} placeholder="Nimman Road, Chiang Mai" multiline />
        <AdminFormField name="facilities" label="Facilities" value={l?.facilities || ""} placeholder="Racks, barbells, mats, changing rooms" multiline />
      </AdminFormSection>
      <AdminFormSection title="Opening hours and map">
        <div className="admin-form-grid">
          <AdminFormField name="opening_time" label="Opening time" type="time" value={l?.opening_time || "06:00"} />
          <AdminFormField name="closing_time" label="Closing time" type="time" value={l?.closing_time || "22:00"} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="latitude" label="Latitude" type="number" step="0.0001" value={l?.latitude ?? 18.7961} />
          <AdminFormField name="longitude" label="Longitude" type="number" step="0.0001" value={l?.longitude ?? 98.9793} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="is_active" label="Location status" type="select" options={["Active", "Paused"]} value={l?.is_active === 0 ? "Paused" : "Active"} />
          <AdminFormField name="features" label="Features / Notes" value={l?.features || ""} placeholder="8 coaches · Strength, HIIT, Mobility" />
        </div>
      </AdminFormSection>
    </>;
  }

  if (kind === "course") {
    const cr = targetItem as AdminCourseItem | undefined;
    return <>
      <AdminFormSection title="Course catalogue">
        <AdminFormField name="course_name" label="Course name" value={cr?.course_name || ""} placeholder="Strength & Conditioning" />
        <div className="admin-form-grid">
          <AdminFormField name="difficulty" label="Difficulty" type="select" options={["BEGINNER", "INTERMEDIATE", "ADVANCED"]} value={cr?.difficulty || "INTERMEDIATE"} />
          <AdminFormField name="default_duration" label="Default duration (minutes, multiple of 10)" type="number" value={cr?.default_duration ?? 60} />
        </div>
        <AdminFormField name="equipment" label="Equipment" value={cr?.equipment || ""} placeholder="Racks, barbells, benches" />
        <AdminFormField name="description" label="Description" value={cr?.description || ""} placeholder="Build strength. Improve performance." multiline />
      </AdminFormSection>
      <AdminFormSection title="Coach assignments & Status">
        <AdminFormField name="assigned_coaches" label="Assigned coaches" value={cr?.assigned_coaches || ""} placeholder="Coach Tan, Coach May" />
        <AdminFormField name="is_active" label="Catalogue status" type="select" options={["Active", "Draft", "Paused"]} value={cr ? (cr.is_active === 1 ? "Active" : "Draft") : "Active"} />
      </AdminFormSection>
    </>;
  }

  if (kind === "package") {
    const p = targetItem as AdminPackageItem | undefined;
    return <>
      <AdminFormSection title="Package terms">
        <AdminFormField name="name" label="Package name" value={p?.name || ""} placeholder="10+3 Sessions" />
        <div className="admin-form-grid">
          <AdminFormField name="package_type" label="Package type" type="select" options={["5+1", "10+3", "20+7"]} value={p?.package_type || "10+3"} />
          <AdminFormField name="price" label="Price (THB)" type="number" value={p?.price ?? 8970} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="paid_sessions" label="Paid sessions" type="number" value={p?.paid_sessions ?? 10} />
          <AdminFormField name="bonus_sessions" label="Bonus sessions" type="number" value={p?.bonus_sessions ?? 3} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="total_sessions" label="Total sessions" type="number" value={p?.total_sessions ?? 13} />
          <AdminFormField name="validity_days" label="Validity (days)" type="number" value={p?.validity_days ?? 180} />
        </div>
        <AdminFormField name="status" label="Package status" type="select" options={["Available", "Paused"]} value={p?.status || "Available"} />
      </AdminFormSection>
      <AdminFormSection title="Member-facing copy">
        <AdminFormField name="description" label="Short description" value={p?.description || ""} placeholder="A steady rhythm for building a routine." multiline />
        <AdminFormField name="terms" label="Terms and notes" value={p?.terms || ""} placeholder="Unused sessions remain on the account until expiry." multiline />
      </AdminFormSection>
    </>;
  }

  if (kind === "kpi") {
    const k = targetItem as AdminKpiRecordItem | undefined;
    return <>
      <AdminFormSection title="Coach KPI Performance">
        <div className="admin-form-grid">
          <AdminFormField name="coach" label="Coach name" value={k?.coach || ""} placeholder="Coach Tan" />
          <AdminFormField name="level" label="Coach level" type="select" options={["BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"]} value={k?.level || "ADVANCED"} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="hours" label="Actual coaching hours" type="number" step="0.5" value={k?.hours ?? 80} />
          <AdminFormField name="sessions" label="Completed sessions" type="number" value={k?.sessions ?? 60} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="rating" label="Average rating (1.0 - 5.0)" type="number" step="0.05" value={k?.rating ?? 4.8} />
          <AdminFormField name="retention" label="Retention rate (%)" type="number" step="1" value={k?.retention ?? 50} />
        </div>
      </AdminFormSection>
      <AdminFormSection title="Target thresholds & Achievement">
        <div className="admin-form-grid">
          <AdminFormField name="target_hours" label="Target hours" type="number" value={k?.target_hours ?? 80} />
          <AdminFormField name="target_rating" label="Target rating" type="number" step="0.1" value={k?.target_rating ?? 4.4} />
        </div>
        <div className="admin-form-grid">
          <AdminFormField name="target_retention" label="Target retention (%)" type="number" value={k?.target_retention ?? 50} />
          <AdminFormField name="achieved" label="Performance outcome" type="select" options={["Achieved", "At risk"]} value={k?.achieved ? "Achieved" : "At risk"} />
        </div>
      </AdminFormSection>
    </>;
  }

  if (kind === "workflow") return <><AdminFormSection title="Workflow definition"><AdminFormField label="Workflow name" placeholder="Monthly coach KPI review" /><AdminFormField label="Purpose" placeholder="Review coaches who are below their level thresholds." multiline /><AdminFormField label="Trigger" type="select" options={["On demand", "Daily", "Weekly", "Monthly"]} value="Monthly" /><AdminFormField label="Owner" type="select" options={["Admin FitBooking", "Operations team", "System scheduler"]} value="Admin FitBooking" /><AdminFormField label="Scope" placeholder="coach_kpi_record · kpi_rule" /></AdminFormSection><AdminFormSection title="Steps"><AdminFormField label="Step 1" placeholder="Select records for the month" /><AdminFormField label="Step 2" placeholder="Compare actuals with thresholds" /><AdminFormField label="Step 3" placeholder="Create follow-up tasks and audit event" /><AdminFormField label="Internal notes" placeholder="Add context for the next admin." multiline /></AdminFormSection></>;
  if (kind === "filters" || kind === "auditFilters") return <><AdminFormSection title="Filter dimensions"><AdminFormField label="Status" type="select" options={["All statuses", "Active", "Pending", "Paused", "Completed", "Needs review"]} value="All statuses" /><AdminFormField label="Date from" type="date" /><AdminFormField label="Date to" type="date" /><AdminFormField label={kind === "auditFilters" ? "Actor" : "District / category"} placeholder={kind === "auditFilters" ? "Admin FitBooking or System" : "NIMMAN or Strength"} /><AdminFormField label={kind === "auditFilters" ? "Entity type" : "Saved view name"} placeholder={kind === "auditFilters" ? "booking, gym, course, kpi_rule" : "This week's active records"} /></AdminFormSection></>;
  return <><AdminFormSection title="Report setup"><AdminFormField label="Report name" placeholder="Weekly operations pulse" /><AdminFormField label="Date range" type="select" options={["Last 7 days", "Last 30 days", "This quarter", "Custom range"]} value="Last 7 days" /><div className="admin-form-grid"><AdminFormField label="From" type="date" /><AdminFormField label="To" type="date" /></div><AdminFormField label="Group by" type="select" options={["Day", "Coach", "Location", "Course", "Membership level"]} value="Day" /></AdminFormSection><AdminFormSection title="Measures"><AdminFormField label="Include metrics" placeholder="Bookings, revenue, retention, coach rating, package sales" multiline /><AdminFormField label="Audience" type="select" options={["Admin only", "Operations team", "Export-ready view"]} value="Admin only" /><AdminFormField label="Notes" placeholder="What should this report help the team decide?" multiline /></AdminFormSection></>;
}

function AdminFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-form-section"><h3>{title}</h3>{children}</section>;
}

function AdminFormField({
  name,
  label,
  placeholder,
  type = "text",
  value = "",
  options = [],
  multiline = false,
  step
}: {
  name?: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "password" | "date" | "time" | "select";
  value?: string | number;
  options?: string[];
  multiline?: boolean;
  step?: string;
}) {
  return <label className="admin-form-field">
    <span>{label}</span>
    {type === "select" ? (
      <select name={name} defaultValue={String(value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    ) : multiline ? (
      <textarea name={name} defaultValue={String(value)} placeholder={placeholder} rows={3} />
    ) : (
      <input name={name} type={type} step={step} defaultValue={value} placeholder={placeholder} />
    )}
  </label>;
}

function WorkspaceMobileNav({ items, active, navigate }: { items: readonly (readonly [string, string, LucideIcon])[]; active: string; navigate: Navigate }) {
  return <nav className="workspace-mobile-nav" aria-label="Workspace navigation">{items.map(([key, label, Icon]) => <button key={key} className={active === key ? "active" : ""} onClick={() => navigate(key)}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
