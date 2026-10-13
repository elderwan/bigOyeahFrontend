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
type AdminDetailType = "member" | "coach" | "package" | "location" | "course";
type AdminRow = { id: string; name: string; detail: string; extra: string; status: AdminStatus };
type AdminModalKind = "trainer" | "member" | "location" | "course" | "package" | "booking" | "kpi" | "workflow" | "filters" | "auditFilters" | "report";

const adminMembers: AdminRow[] = [
  { id: "member-alex", name: "Alex Morgan", detail: "alex.morgan@example.com", extra: "Gold member · ฿22,150 spend", status: "Active" },
  { id: "member-nattakarn", name: "Nattakarn S.", detail: "nattakarn@example.com", extra: "Silver member · 8 sessions left", status: "Active" },
  { id: "member-mali", name: "Mali P.", detail: "mali@example.com", extra: "Bronze member · 3 sessions left", status: "Active" },
  { id: "member-krit", name: "Krit S.", detail: "krit@example.com", extra: "Bronze member · profile incomplete", status: "Pending" }
];

const adminCoaches: AdminRow[] = [
  { id: "coach-tan", name: "Tan Chaiyaporn", detail: "Coach no. 1001 · Strength & Conditioning", extra: "Advanced · 4.9 rating · 6 years", status: "Active" },
  { id: "coach-may", name: "May Suthida", detail: "Coach no. 1002 · Mobility & Wellness", extra: "Intermediate · 4.8 rating · 4 years", status: "Active" },
  { id: "coach-jeff", name: "Jeff Nopparat", detail: "Coach no. 1003 · Functional Fitness", extra: "Master · 4.9 rating · 9 years", status: "Active" },
  { id: "coach-ploy", name: "Ploy Rattanakorn", detail: "Coach no. 1004 · Yoga & Mobility", extra: "Advanced · documents to review", status: "Needs review" }
];

const adminBookings: AdminRow[] = [
  { id: "booking-24016", name: "Nattakarn S. · Coach Tan", detail: "Strength & Conditioning · Apr 16 · 09:10", extra: "Nimman Fitness Club · ฿800", status: "Confirmed" },
  { id: "booking-24018", name: "Mali P. · Coach May", detail: "Mobility & Flexibility · Apr 18 · 17:00", extra: "Old City Studio · ฿750", status: "Pending" },
  { id: "booking-24020", name: "Krit S. · Coach Jeff", detail: "HIIT · Apr 20 · 10:30", extra: "Central Fitness · ฿750", status: "Confirmed" },
  { id: "booking-24021", name: "Alex Morgan · Coach Tan", detail: "Strength & Conditioning · Apr 22 · 08:00", extra: "Home service · ฿800", status: "Completed" }
];

const adminLocations: AdminRow[] = [
  { id: "gym-nimman", name: "Nimman Fitness Club", detail: "NIMMAN · 06:00–22:00", extra: "8 coaches · Strength, HIIT, Mobility", status: "Active" },
  { id: "gym-old-city", name: "Old City Studio", detail: "OLD CITY · 07:00–21:00", extra: "5 coaches · Mobility, Yoga", status: "Active" },
  { id: "gym-central", name: "Central Fitness", detail: "CENTRAL · 06:00–23:00", extra: "11 coaches · Full equipment floor", status: "Active" },
  { id: "gym-hang-dong", name: "Hang Dong Training Room", detail: "HANG DONG · 08:00–20:00", extra: "2 coaches · Small group setup", status: "Paused" }
];

const adminCourses: AdminRow[] = [
  { id: "course-strength", name: "Strength & Conditioning", detail: "INTERMEDIATE · 60 minutes", extra: "3 coaches · Equipment: racks, barbells", status: "Available" },
  { id: "course-hiit", name: "HIIT", detail: "BEGINNER · 45 minutes", extra: "4 coaches · Equipment: mats, kettlebells", status: "Available" },
  { id: "course-mobility", name: "Mobility & Flexibility", detail: "BEGINNER · 60 minutes", extra: "3 coaches · Equipment: bands, blocks", status: "Available" },
  { id: "course-power", name: "Power Foundations", detail: "ADVANCED · 50 minutes", extra: "1 coach · Draft catalogue entry", status: "Draft" }
];

const adminPackages: AdminRow[] = [
  { id: "package-5-1", name: "5+1 Sessions", detail: "6 total sessions · ฿3,400", extra: "180 days · ฿680 per paid session", status: "Available" },
  { id: "package-10-3", name: "10+3 Sessions", detail: "13 total sessions · ฿8,970", extra: "180 days · ฿690 per session", status: "Available" },
  { id: "package-20-7", name: "20+7 Sessions", detail: "27 total sessions · ฿17,550", extra: "180 days · ฿650 per session", status: "Available" }
];

const adminKpiRules = [
  { level: "BEGINNER", hours: 40, rating: 4, retention: 30 },
  { level: "INTERMEDIATE", hours: 60, rating: 4.2, retention: 40 },
  { level: "ADVANCED", hours: 80, rating: 4.4, retention: 50 },
  { level: "MASTER", hours: 100, rating: 4.6, retention: 60 }
];

const adminKpiRecords = [
  { id: "coach-tan", coach: "Tan Chaiyaporn", level: "ADVANCED", hours: 92.5, sessions: 74, rating: 4.9, retention: 68, achieved: true },
  { id: "coach-may", coach: "May Suthida", level: "INTERMEDIATE", hours: 58.5, sessions: 47, rating: 4.8, retention: 45, achieved: false },
  { id: "coach-jeff", coach: "Jeff Nopparat", level: "MASTER", hours: 108, sessions: 81, rating: 4.9, retention: 72, achieved: true },
  { id: "coach-ploy", coach: "Ploy Rattanakorn", level: "ADVANCED", hours: 76, sessions: 61, rating: 4.3, retention: 41, achieved: false }
];

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
  const [status, setStatus] = useState<Record<string, AdminStatus>>({});
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [detail, setDetail] = useState<{ type: AdminDetailType; id: string } | null>(null);
  const [modal, setModal] = useState<AdminModalKind | null>(null);
  const [editTarget, setEditTarget] = useState<{ kind: AdminModalKind; id: string } | null>(null);
  const [kpiMonth, setKpiMonth] = useState("April 2026");
  const [editingRule, setEditingRule] = useState("");
  const [rules, setRules] = useState(adminKpiRules);

  useEffect(() => {
    setQuery("");
    setDetail(null);
    setModal(null);
    setEditTarget(null);
  }, [active]);

  const updateStatus = (id: string, current: AdminStatus, next?: AdminStatus) => {
    const fallback: AdminStatus = current === "Active" ? "Paused" : current === "Paused" ? "Active" : current === "Available" ? "Paused" : current === "Confirmed" ? "Completed" : "Active";
    setStatus((value) => ({ ...value, [id]: next || fallback }));
  };
  const currentStatus = (row: AdminRow) => status[row.id] || row.status;
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
  const heading = active === "Overview" ? "The whole operation, at a glance." : active === "KPI" ? "Coach performance, made actionable." : `${active} management`;
  const description = active === "Overview" ? "Keep each part of the Chiang Mai training community moving." : active === "KPI" ? "Review monthly snapshots against the rules that keep the coaching team growing." : "Review records, make careful changes, and keep the operation easy to understand.";
  const actionLabel = active === "Overview" ? "Add trainer" : active === "Locations" ? "Add location" : active === "Courses" ? "Add course" : active === "Packages" ? "Add package" : active === "Members" ? "Add member" : active === "Trainers" ? "Add trainer" : active === "Bookings" ? "Create booking" : active === "Reports" ? "Build report" : active === "Audit log" ? "Add audit filter" : active === "Settings" ? "Add setting" : "New workflow";
  const actionKind = active === "Overview" || active === "Trainers" ? "trainer" : active === "Locations" ? "location" : active === "Courses" ? "course" : active === "Packages" ? "package" : active === "Members" ? "member" : active === "Bookings" ? "booking" : active === "Reports" ? "report" : active === "Audit log" ? "auditFilters" : active === "KPI" ? "workflow" : "workflow";

  const renderDirectory = (rows: AdminRow[], type: AdminDetailType, placeholder: string, actionText: string, editKind: AdminModalKind) => {
    const visibleRows = rows.filter((row) => `${row.name} ${row.detail} ${row.extra} ${currentStatus(row)}`.toLowerCase().includes(query.toLowerCase()));
    return <><AdminFilters query={query} setQuery={setQuery} placeholder={placeholder} onOpenFilters={() => setModal("filters")} /><AdminTable rows={visibleRows} onOpen={(id) => openDetail(type, id)} onEdit={(id) => openEditor(editKind, id)} action={(id, current) => updateStatus(id, current)} actionText={actionText} status={status} /></>;
  };

  return <section className="workspace-main admin-main-workspace"><div className="workspace-content"><div className="workspace-heading"><div><p className="eyebrow">FITBOOKING MANAGEMENT</p><h1>{heading}</h1><p>{description}</p></div><button className="button button-primary" onClick={() => setModal(actionKind)}><Plus size={15} /> {actionLabel}</button></div>
    {notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
    {active === "Overview" && <AdminOverview onNavigate={(section) => setNotice(`${section} management opened from the overview.`)} onOpen={openDetail} onAddTrainer={() => setModal("trainer")} />}
    {active === "Bookings" && renderDirectory(adminBookings, "member", "Search member, trainer, or session", "Update", "booking")}
    {active === "Members" && renderDirectory(adminMembers, "member", "Search name, email, or membership", "Pause", "member")}
    {active === "Trainers" && renderDirectory(adminCoaches, "coach", "Search trainer, coach number, or specialty", "Change status", "trainer")}
    {active === "Locations" && renderDirectory(adminLocations, "location", "Search location, district, or facility", "Toggle", "location")}
    {active === "Courses" && renderDirectory(adminCourses, "course", "Search course, difficulty, or equipment", "Toggle", "course")}
    {active === "Packages" && <AdminPackageList status={status} onOpen={(id) => openDetail("package", id)} onEdit={(id) => openEditor("package", id)} onToggle={(id, current) => updateStatus(id, current)} />}
    {active === "KPI" && <section className="admin-kpi-stack"><div className="admin-kpi-toolbar"><div><span className="eyebrow">MONTHLY SNAPSHOT</span><b>{kpiMonth}</b><small>Values are local preview data until the KPI job is connected.</small></div><div><select className="workspace-select" value={kpiMonth} onChange={(event) => setKpiMonth(event.target.value)}><option>April 2026</option><option>March 2026</option><option>February 2026</option></select><button className="button button-outline" onClick={() => setModal("workflow")}><RefreshCw size={14} /> Recalculate</button></div></div><div className="workspace-stat-row admin-overview-stats"><AdminMiniStat icon={CheckCircle2} label="Achieved" value="31 / 48" note="coaches on target" /><AdminMiniStat icon={TrendingUp} label="Average hours" value="78.4" note="per active coach" /><AdminMiniStat icon={Star} label="Average rating" value="4.72" note="from completed reviews" /><AdminMiniStat icon={Activity} label="At risk" value="7" note="needs a follow-up" /></div><div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>KPI rules</h2><p>Source of truth for kpi_rule thresholds.</p></div><SlidersHorizontal size={18} /></div><div className="admin-kpi-rule-list">{rules.map((rule) => <div className="admin-kpi-rule-row" key={rule.level}><b>{rule.level}</b>{editingRule === rule.level ? <><input aria-label={`${rule.level} monthly hours`} type="number" value={rule.hours} onChange={(event) => setRules((value) => value.map((item) => item.level === rule.level ? { ...item, hours: Number(event.target.value) } : item))} /><input aria-label={`${rule.level} rating`} type="number" step="0.1" value={rule.rating} onChange={(event) => setRules((value) => value.map((item) => item.level === rule.level ? { ...item, rating: Number(event.target.value) } : item))} /><input aria-label={`${rule.level} retention`} type="number" value={rule.retention} onChange={(event) => setRules((value) => value.map((item) => item.level === rule.level ? { ...item, retention: Number(event.target.value) } : item))} /><button className="text-link" onClick={() => { setEditingRule(""); setNotice(`${rule.level} KPI rule saved in this preview.`); }}>Save</button></> : <><span>{rule.hours} hrs / month</span><span>{rule.rating.toFixed(1)} rating</span><span>{rule.retention}% retention</span><button className="icon-button" aria-label={`Edit ${rule.level} KPI rule`} onClick={() => setEditingRule(rule.level)}><Pencil size={15} /></button></>}</div>)}</div></section><section className="workspace-panel"><div className="section-title"><div><h2>Coach snapshot</h2><p>Monthly records from coach_kpi_record.</p></div><button className="text-link" onClick={() => setNotice("All KPI records opened in this preview.")}>View all <ArrowRight size={14} /></button></div>{adminKpiRecords.map((record) => <div className="admin-kpi-record" key={record.id}><button className="admin-kpi-record-main" onClick={() => openDetail("coach", record.id)}><span className="trainer-member-avatar">{record.coach.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{record.coach}</b><small>{record.level} · {record.hours} hrs · {record.rating.toFixed(1)} rating</small></span><Pill className={record.achieved ? "confirmed-pill" : "gold-pill"}>{record.achieved ? "Achieved" : "At risk"}</Pill><ChevronRight size={15} /></button><button className="icon-button" aria-label={`Edit KPI snapshot for ${record.coach}`} onClick={() => openEditor("kpi", record.id)}><Pencil size={15} /></button></div>)}</section></div></section>}
    {active === "Reports" && <AdminReports onBuild={() => setModal("report")} />}
    {active === "Audit log" && <AdminAudit onFilter={() => setModal("auditFilters")} />}
    {active === "Settings" && <AdminSettings status={status} onToggle={(id, value) => setStatus((current) => ({ ...current, [id]: value }))} />}
    </div>{detail && <AdminDetailDrawer detail={detail} onClose={() => setDetail(null)} onEdit={openEditor} onNotice={setNotice} status={status} onToggle={(id, current) => updateStatus(id, current)} />}{modal && <AdminFormDrawer kind={modal} active={active} editTarget={editTarget} onClose={closeModal} onSave={(message) => { closeModal(); setNotice(message); }} />}
  </section>;
}

function AdminOverview({ onNavigate, onOpen, onAddTrainer }: { onNavigate: (section: string) => void; onOpen: (type: AdminDetailType, id: string) => void; onAddTrainer: () => void }) {
  const stats = [["Active members", "1,248", "+12 this month", UsersRound], ["Verified trainers", "48", "3 need review", Dumbbell], ["Bookings today", "36", "8 pending", CalendarDays], ["Package sales", "฿186.4K", "This month", Wallet]] as const;
  return <><div className="workspace-stat-row admin-overview-stats">{stats.map(([label, value, note, Icon]) => <article className="workspace-stat" key={label}><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label}</small><b>{value}</b><span>{note}</span></article>)}</div><div className="workspace-columns"><section className="workspace-panel"><div className="section-title"><div><h2>Needs attention</h2><p>Workflow items ready for review</p></div><span className="pill">4 open</span></div><div className="admin-task-row"><span className="admin-task-icon"><Clock3 size={15} /></span><span><b>Coach verification</b><small>Ploy Rattanakorn · documents to review</small></span><button className="button button-outline" onClick={() => onOpen("coach", "coach-ploy")}>Review</button></div><div className="admin-task-row"><span className="admin-task-icon"><CalendarDays size={15} /></span><span><b>Booking request</b><small>Krit S. · Apr 20 at 10:30 AM</small></span><button className="button button-outline" onClick={() => onNavigate("Bookings")}>Confirm</button></div><div className="admin-task-row"><span className="admin-task-icon"><UsersRound size={15} /></span><span><b>Member profile</b><small>Complete account contact details</small></span><button className="button button-outline" onClick={() => onOpen("member", "member-krit")}>Open</button></div></section><section className="workspace-panel"><div className="section-title"><div><h2>Recent activity</h2><p>Across the FitBooking community</p></div><Activity size={18} /></div>{[["New booking", "Strength & Conditioning · Coach Tan", "2m"], ["Trainer joined", "Ploy R. · Verification pending", "18m"], ["Package selected", "13-session plan · Alex Morgan", "42m"]].map(([title, detail, time]) => <div className="admin-activity-row" key={title}><CheckCircle2 size={16} /><span><b>{title}</b><small>{detail}</small></span><time>{time}</time></div>)}</section></div><section className="workspace-panel workflow-panel"><div className="section-title"><div><h2>Workflow shortcuts</h2><p>Move directly to the work queue you need.</p></div><button className="button button-outline" onClick={onAddTrainer}><Plus size={14} /> Add trainer</button></div><div className="admin-shortcut-grid">{[["Members", UsersRound], ["Trainers", Dumbbell], ["Locations", Building2], ["Courses", BookOpen], ["KPI", TrendingUp]].map(([label, Icon]) => <button key={label as string} onClick={() => onNavigate(label as string)}><Icon size={19} /><b>{label as string}</b><small>Review records and update demo status</small><ChevronRight size={15} /></button>)}</div></section></>;
}

function AdminMiniStat({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return <article className="workspace-stat"><span className="workspace-stat-icon"><Icon size={18} /></span><small>{label}</small><b>{value}</b><span>{note}</span></article>;
}

function AdminPackageList({ status, onOpen, onEdit, onToggle }: { status: Record<string, AdminStatus>; onOpen: (id: string) => void; onEdit: (id: string) => void; onToggle: (id: string, current: AdminStatus) => void }) {
  return <section className="workspace-panel admin-package-list"><div className="section-title"><div><h2>Member packages</h2><p>Configure the 5+1, 10+3, and 20+7 catalogue plans.</p></div><span className="pill"><Wallet size={13} /> 180-day validity</span></div>{adminPackages.map((item) => { const current = status[item.id] || item.status; return <div className="admin-catalog-row" key={item.id}><span className="admin-task-icon"><Wallet size={16} /></span><span><b>{item.name}</b><small>{item.detail}</small><small>{item.extra}</small></span><Pill className={current === "Available" ? "confirmed-pill" : "gold-pill"}>{current}</Pill><button className="button button-outline" onClick={() => onOpen(item.id)}>Details</button><button className="button button-outline" onClick={() => onEdit(item.id)}><Pencil size={13} /> Edit</button><button className="icon-button" aria-label={`Toggle ${item.name}`} onClick={() => onToggle(item.id, current)}><MoreHorizontal size={17} /></button></div>; })}</section>;
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

function AdminDetailDrawer({ detail, onClose, onEdit, onNotice, status, onToggle }: { detail: { type: AdminDetailType; id: string }; onClose: () => void; onEdit: (kind: AdminModalKind, id: string) => void; onNotice: (message: string) => void; status: Record<string, AdminStatus>; onToggle: (id: string, current: AdminStatus) => void }) {
  const item = detail.type === "member" ? adminMembers.find((row) => row.id === detail.id) : detail.type === "coach" ? adminCoaches.find((row) => row.id === detail.id) : detail.type === "location" ? adminLocations.find((row) => row.id === detail.id) : detail.type === "course" ? adminCourses.find((row) => row.id === detail.id) : adminPackages.find((row) => row.id === detail.id);
  if (!item) return null;
  const current = status[item.id] || item.status;
  const labels: Record<AdminDetailType, string> = { member: "Member detail", coach: "Coach detail", package: "Package detail", location: "Location detail", course: "Course detail" };
  const editKind: AdminModalKind = detail.type === "coach" ? "trainer" : detail.type;
  return <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}><aside className="admin-detail-drawer" role="dialog" aria-modal="true" aria-label={labels[detail.type]} onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{labels[detail.type]}</span><h2>{item.name}</h2><p>{item.detail}</p></div><div className="admin-drawer-header-actions"><button className="button button-outline" onClick={() => onEdit(editKind, detail.id)}><Pencil size={13} /> Edit</button><button className="icon-button" aria-label="Close detail" onClick={onClose}><X size={19} /></button></div></header><div className="admin-detail-status"><Pill className={current === "Active" || current === "Available" || current === "Completed" ? "confirmed-pill" : "gold-pill"}>{current}</Pill><span>Local preview · changes are not saved to the backend.</span></div>{detail.type === "member" && <><AdminDetailSection title="Account"><AdminDetailLine label="Email" value={item.detail} /><AdminDetailLine label="Membership" value={item.extra.split(" · ")[0]} /><AdminDetailLine label="Spend / balance" value="฿22,150 total spend · 7 package sessions remaining" /><AdminDetailLine label="Profile" value="Fitness profile available · last updated today" /></AdminDetailSection><AdminDetailSection title="Recent activity"><AdminDetailLine label="Last booking" value="Strength & Conditioning · Apr 09, 09:10" /><AdminDetailLine label="Next booking" value="Strength & Conditioning · Apr 22, 08:00" /></AdminDetailSection></>}{detail.type === "coach" && <><AdminDetailSection title="Coach profile"><AdminDetailLine label="Identity" value={item.detail} /><AdminDetailLine label="Level / experience" value={item.extra} /><AdminDetailLine label="Service mode" value="GYM + HOME · 10-minute break interval" /><AdminDetailLine label="Schedule registry" value="Generated through backend schedule service · 60 days ahead" /></AdminDetailSection><AdminDetailSection title="KPI readiness">  <AdminDetailLine label="April snapshot" value={detail.id === "coach-tan" ? "92.5 hrs · 4.9 rating · 68% retention · Achieved" : detail.id === "coach-jeff" ? "108 hrs · 4.9 rating · 72% retention · Achieved" : detail.id === "coach-may" ? "58.5 hrs · 4.8 rating · 45% retention · At risk" : "76 hrs · 4.3 rating · 41% retention · At risk"} /><AdminDetailLine label="Courses" value="Strength & Conditioning · HIIT · Mobility" /></AdminDetailSection></>}{detail.type === "location" && <><AdminDetailSection title="Location profile"><AdminDetailLine label="Hours" value={item.detail.split(" · ")[1] || "06:00–22:00"} /><AdminDetailLine label="Facilities" value={item.extra.split(" · ")[1] || "Training floor and changing rooms"} /><AdminDetailLine label="Service relationship" value="Coach assignments are managed through coach_service." /><AdminDetailLine label="Bookings this month" value="126 sessions · 88% utilisation" /></AdminDetailSection><AdminDetailSection title="Operational action"><button className="button button-outline drawer-action" onClick={() => { onToggle(item.id, current); onNotice(`${item.name} status changed in this preview.`); }}>Toggle availability</button></AdminDetailSection></>}{detail.type === "course" && <><AdminDetailSection title="Course catalogue"><AdminDetailLine label="Difficulty / duration" value={item.detail.replace(" · ", " · ")} /><AdminDetailLine label="Coach assignments" value={item.extra.split(" · ")[0]} /><AdminDetailLine label="Equipment" value={item.extra.split(" · ")[1] || "Mats, bands, free weights"} /><AdminDetailLine label="Booking rule" value="Coach-specific pricing comes from coach_course.price_per_session." /></AdminDetailSection><AdminDetailSection title="Catalogue action"><button className="button button-outline drawer-action" onClick={() => { onToggle(item.id, current); onNotice(`${item.name} catalogue status changed in this preview.`); }}>Toggle catalogue status</button></AdminDetailSection></>}{detail.type === "package" && <><AdminDetailSection title="Package terms"><AdminDetailLine label="Sessions" value={item.detail} /><AdminDetailLine label="Validity / price" value={item.extra} /><AdminDetailLine label="Database status" value="ACTIVE, EXHAUSTED, EXPIRED, or CANCELLED" /><AdminDetailLine label="Purchase flow" value="Order is created first, then payment updates member total spend and membership level." /></AdminDetailSection><AdminDetailSection title="Package action"><button className="button button-outline drawer-action" onClick={() => { onToggle(item.id, current); onNotice(`${item.name} status changed in this preview.`); }}>Toggle package availability</button></AdminDetailSection></>}</aside></div>;
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

function AdminTable({ rows, onOpen, onEdit, action, actionText, status }: { rows: AdminRow[]; onOpen: (id: string) => void; onEdit: (id: string) => void; action: (id: string, current: AdminStatus) => void; actionText: string; status: Record<string, AdminStatus> }) {
  return <div className="workspace-panel admin-table-wrap"><table className="admin-table"><thead><tr><th>Record</th><th>Details</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((row) => { const current = status[row.id] || row.status; return <tr key={row.id}><td><button className="admin-table-record" onClick={() => onOpen(row.id)}><b>{row.name}</b><span>Open details</span></button></td><td>{row.detail}<small>{row.extra}</small></td><td><span className={`booking-status ${current.toLowerCase().replaceAll(" ", "-")}`}>{current}</span></td><td><button className="button button-outline" onClick={() => onEdit(row.id)}><Pencil size={13} /> Edit</button><button className="button button-outline" onClick={() => action(row.id, current)}>{current === "Confirmed" ? "Complete" : actionText}</button><button className="icon-button" aria-label={`More actions for ${row.name}`} onClick={() => onOpen(row.id)}><MoreHorizontal size={16} /></button></td></tr>; })}</tbody></table>{!rows.length && <div className="empty-state"><Search size={23} /><h3>No records found</h3><p>Try clearing your search and checking again.</p></div>}<p className="auth-notice">Any status changes are temporary browser-only previews.</p></div>;
}

function AdminFormDrawer({ kind, active, onClose, onSave }: { kind: AdminModalKind; active: string; onClose: () => void; onSave: (message: string) => void }) {
  const metadata: Record<AdminModalKind, { eyebrow: string; title: string; description: string }> = {
    trainer: { eyebrow: "COACH PROFILE", title: "Add trainer", description: "Create the profile, service coverage, courses, and recurring availability that the admin will review." },
    member: { eyebrow: "MEMBER ACCOUNT", title: "Add member", description: "Preview the member account and fitness profile information collected by FitBooking." },
    location: { eyebrow: "GYM / LOCATION", title: "Add location", description: "Set the place details used by gym bookings and coach service assignments." },
    course: { eyebrow: "COURSE CATALOGUE", title: "Add course", description: "Describe the training course before assigning coaches and coach-specific prices." },
    package: { eyebrow: "MEMBER PACKAGE", title: "Add package", description: "Show the package terms, price, validity, and session balance rules." },
    booking: { eyebrow: "BOOKING WORKFLOW", title: "Create booking", description: "Preview the booking information an admin sees when creating or assisting with a reservation." },
    workflow: { eyebrow: "ADMIN WORKFLOW", title: active === "KPI" ? "Recalculate KPI snapshot" : "New workflow", description: "Define who owns the work, when it starts, and which records it touches." },
    filters: { eyebrow: "LIST FILTERS", title: "Filter records", description: "Choose the dimensions shown in this management list." },
    auditFilters: { eyebrow: "AUDIT LOG", title: "Filter audit events", description: "Narrow the audit trail by actor, action, entity, or time range." },
    report: { eyebrow: "REPORT BUILDER", title: "Build report", description: "Choose the report range and the operational measures to include." }
  };
  const info = metadata[kind];
  const closeAfterSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(`${info.title} preview saved locally. No backend request was made.`);
  };
  return <div className="admin-drawer-backdrop" role="presentation" onClick={onClose}><aside className="admin-form-drawer" role="dialog" aria-modal="true" aria-label={info.title} onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{info.eyebrow}</span><h2>{info.title}</h2><p>{info.description}</p></div><button className="icon-button" aria-label="Close form" onClick={onClose}><X size={19} /></button></header><form className="admin-form" onSubmit={closeAfterSave}><AdminFormFields kind={kind} /><div className="admin-form-note"><ShieldCheck size={14} /><span>Preview only. Fields are shown to agree on the design before API wiring.</span></div><footer><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{kind === "filters" || kind === "auditFilters" ? "Apply filters" : kind === "workflow" ? "Save workflow" : kind === "report" ? "Generate preview" : "Save draft"}</button></footer></form></aside></div>;
}

function AdminFormFields({ kind }: { kind: AdminModalKind }) {
  if (kind === "trainer") return <><AdminFormSection title="Account"><AdminFormField label="Full name" placeholder="Ploy Rattanakorn" /><AdminFormField label="Username" placeholder="coach.ploy" /><AdminFormField label="Email address" placeholder="ploy@fitbooking.local" /><AdminFormField label="Phone number" placeholder="+66 81 234 5678" /><AdminFormField label="Temporary password" placeholder="Set an initial password" type="password" /></AdminFormSection><AdminFormSection title="Coach profile"><AdminFormField label="Coach number" placeholder="1004" /><AdminFormField label="Coach level" type="select" options={["BEGINNER", "INTERMEDIATE", "ADVANCED", "MASTER"]} value="ADVANCED" /><AdminFormField label="Years of experience" placeholder="5" type="number" /><AdminFormField label="Service mode" type="select" options={["GYM", "HOME", "BOTH"]} value="BOTH" /><AdminFormField label="Break interval" type="select" options={["10 minutes", "20 minutes", "30 minutes"]} value="10 minutes" /><AdminFormField label="Certifications" placeholder="ACE CPT, First Aid" /><AdminFormField label="Bio" placeholder="A short introduction for members" multiline /></AdminFormSection><AdminFormSection title="Services and availability"><AdminFormField label="Assigned locations" placeholder="Nimman Fitness Club, Old City Studio" /><AdminFormField label="Courses taught" placeholder="Strength & Conditioning, Mobility" /><AdminFormField label="Weekly availability" placeholder="Mon–Fri · 08:00–17:00" /><AdminFormField label="Hire date" type="date" /></AdminFormSection></>;
  if (kind === "member") return <><AdminFormSection title="Account"><AdminFormField label="Display name" placeholder="Alex Morgan" /><AdminFormField label="Username" placeholder="alex.morgan" /><AdminFormField label="Email address" placeholder="alex.morgan@example.com" /><AdminFormField label="Phone number" placeholder="+66 82 345 6789" /><AdminFormField label="Password" type="password" placeholder="Set a temporary password" /></AdminFormSection><AdminFormSection title="Member profile"><AdminFormField label="Membership level" type="select" options={["BRONZE", "SILVER", "GOLD"]} value="BRONZE" /><AdminFormField label="Gender" type="select" options={["Prefer not to say", "MALE", "FEMALE", "OTHER"]} value="Prefer not to say" /><AdminFormField label="Date of birth" type="date" /><div className="admin-form-grid"><AdminFormField label="Height (cm)" placeholder="170" type="number" /><AdminFormField label="Weight (kg)" placeholder="68" type="number" /></div><AdminFormField label="Fitness goal" placeholder="Build strength and stay consistent" multiline /></AdminFormSection></>;
  if (kind === "location") return <><AdminFormSection title="Location profile"><AdminFormField label="Location name" placeholder="Nimman Fitness Club" /><AdminFormField label="Address" placeholder="Nimman Road, Chiang Mai" multiline /><AdminFormField label="District" type="select" options={["NIMMAN", "OLD_CITY", "CENTRAL", "MAE_RIM", "HANG_DONG"]} value="NIMMAN" /><AdminFormField label="Phone number" placeholder="+66 52 123 456" /><AdminFormField label="Facilities" placeholder="Racks, barbells, mats, changing rooms" multiline /></AdminFormSection><AdminFormSection title="Opening hours and map"><div className="admin-form-grid"><AdminFormField label="Opening time" type="time" value="06:00" /><AdminFormField label="Closing time" type="time" value="22:00" /></div><div className="admin-form-grid"><AdminFormField label="Latitude" placeholder="18.7961" type="number" /><AdminFormField label="Longitude" placeholder="98.9793" type="number" /></div><AdminFormField label="Location status" type="select" options={["Active", "Paused"]} value="Active" /></AdminFormSection></>;
  if (kind === "course") return <><AdminFormSection title="Course catalogue"><AdminFormField label="Course name" placeholder="Strength & Conditioning" /><AdminFormField label="Description" placeholder="Build strength. Improve performance." multiline /><AdminFormField label="Difficulty" type="select" options={["BEGINNER", "INTERMEDIATE", "ADVANCED"]} value="INTERMEDIATE" /><AdminFormField label="Default duration (minutes)" placeholder="60" type="number" /><AdminFormField label="Equipment" placeholder="Racks, barbells, benches" multiline /><AdminFormField label="Catalogue status" type="select" options={["Active", "Draft"]} value="Active" /></AdminFormSection><AdminFormSection title="Coach assignments"><AdminFormField label="Assigned coaches" placeholder="Coach Tan, Coach May" /><AdminFormField label="Default note for booking" placeholder="Arrive 10 minutes early" multiline /></AdminFormSection></>;
  if (kind === "package") return <><AdminFormSection title="Package terms"><AdminFormField label="Package type" type="select" options={["5+1", "10+3", "20+7"]} value="10+3" /><div className="admin-form-grid"><AdminFormField label="Paid sessions" placeholder="10" type="number" /><AdminFormField label="Bonus sessions" placeholder="3" type="number" /></div><AdminFormField label="Total sessions" placeholder="13" type="number" /><AdminFormField label="Price (THB)" placeholder="8970.00" type="number" /><AdminFormField label="Validity (days)" placeholder="180" type="number" /><AdminFormField label="Package status" type="select" options={["Active", "Paused"]} value="Active" /></AdminFormSection><AdminFormSection title="Member-facing copy"><AdminFormField label="Short description" placeholder="A steady rhythm for building a routine." multiline /><AdminFormField label="Terms and notes" placeholder="Unused sessions remain on the account until expiry." multiline /></AdminFormSection></>;
  if (kind === "booking") return <><AdminFormSection title="Session"><AdminFormField label="Member" placeholder="Alex Morgan" /><AdminFormField label="Coach" placeholder="Tan Chaiyaporn · 1001" /><AdminFormField label="Course" placeholder="Strength & Conditioning" /><div className="admin-form-grid"><AdminFormField label="Booking date" type="date" value="2026-04-22" /><AdminFormField label="Start time" type="time" value="08:00" /></div><AdminFormField label="Duration (minutes)" placeholder="60" type="number" /><AdminFormField label="Break interval" type="select" options={["10 minutes", "20 minutes", "30 minutes"]} value="10 minutes" /></AdminFormSection><AdminFormSection title="Service and payment"><AdminFormField label="Service mode" type="select" options={["GYM", "HOME"]} value="GYM" /><AdminFormField label="Location or service district" placeholder="Nimman Fitness Club" /><AdminFormField label="Member package" placeholder="10+3 package · 7 sessions remaining" /><AdminFormField label="Price (THB)" placeholder="800.00" type="number" /><AdminFormField label="Booking status" type="select" options={["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]} value="PENDING" /></AdminFormSection></>;
  if (kind === "workflow") return <><AdminFormSection title="Workflow definition"><AdminFormField label="Workflow name" placeholder="Monthly coach KPI review" /><AdminFormField label="Purpose" placeholder="Review coaches who are below their level thresholds." multiline /><AdminFormField label="Trigger" type="select" options={["On demand", "Daily", "Weekly", "Monthly"]} value="Monthly" /><AdminFormField label="Owner" type="select" options={["Admin FitBooking", "Operations team", "System scheduler"]} value="Admin FitBooking" /><AdminFormField label="Scope" placeholder="coach_kpi_record · kpi_rule" /></AdminFormSection><AdminFormSection title="Steps"><AdminFormField label="Step 1" placeholder="Select records for the month" /><AdminFormField label="Step 2" placeholder="Compare actuals with thresholds" /><AdminFormField label="Step 3" placeholder="Create follow-up tasks and audit event" /><AdminFormField label="Internal notes" placeholder="Add context for the next admin." multiline /></AdminFormSection></>;
  if (kind === "filters" || kind === "auditFilters") return <><AdminFormSection title="Filter dimensions"><AdminFormField label="Status" type="select" options={["All statuses", "Active", "Pending", "Paused", "Completed", "Needs review"]} value="All statuses" /><AdminFormField label="Date from" type="date" /><AdminFormField label="Date to" type="date" /><AdminFormField label={kind === "auditFilters" ? "Actor" : "District / category"} placeholder={kind === "auditFilters" ? "Admin FitBooking or System" : "NIMMAN or Strength"} /><AdminFormField label={kind === "auditFilters" ? "Entity type" : "Saved view name"} placeholder={kind === "auditFilters" ? "booking, gym, course, kpi_rule" : "This week's active records"} /></AdminFormSection></>;
  return <><AdminFormSection title="Report setup"><AdminFormField label="Report name" placeholder="Weekly operations pulse" /><AdminFormField label="Date range" type="select" options={["Last 7 days", "Last 30 days", "This quarter", "Custom range"]} value="Last 7 days" /><div className="admin-form-grid"><AdminFormField label="From" type="date" /><AdminFormField label="To" type="date" /></div><AdminFormField label="Group by" type="select" options={["Day", "Coach", "Location", "Course", "Membership level"]} value="Day" /></AdminFormSection><AdminFormSection title="Measures"><AdminFormField label="Include metrics" placeholder="Bookings, revenue, retention, coach rating, package sales" multiline /><AdminFormField label="Audience" type="select" options={["Admin only", "Operations team", "Export-ready view"]} value="Admin only" /><AdminFormField label="Notes" placeholder="What should this report help the team decide?" multiline /></AdminFormSection></>;
}

function AdminFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-form-section"><h3>{title}</h3>{children}</section>;
}

function AdminFormField({ label, placeholder, type = "text", value = "", options = [], multiline = false }: { label: string; placeholder?: string; type?: "text" | "number" | "password" | "date" | "time" | "select"; value?: string; options?: string[]; multiline?: boolean }) {
  return <label className="admin-form-field"><span>{label}</span>{type === "select" ? <select defaultValue={value}>{options.map((option) => <option key={option}>{option}</option>)}</select> : multiline ? <textarea defaultValue={value} placeholder={placeholder} rows={3} /> : <input type={type} defaultValue={value} placeholder={placeholder} />}</label>;
}

function WorkspaceMobileNav({ items, active, navigate }: { items: readonly (readonly [string, string, LucideIcon])[]; active: string; navigate: Navigate }) {
  return <nav className="workspace-mobile-nav" aria-label="Workspace navigation">{items.map(([key, label, Icon]) => <button key={key} className={active === key ? "active" : ""} onClick={() => navigate(key)}><Icon size={18} /><span>{label}</span></button>)}</nav>;
}
